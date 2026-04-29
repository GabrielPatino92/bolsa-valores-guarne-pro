import { AppError } from '../../shared/errors/app-error.js';

function makeStreamKey({ provider, symbol, timeframe }) {
  return `${provider}:${symbol}:${timeframe}`;
}

function buildStatusPayload({ provider, symbol, timeframe, state, details }) {
  return {
    type: 'status',
    provider,
    symbol,
    timeframe,
    state,
    ...(details ? { details } : {})
  };
}

function buildSnapshotPayload({ provider, symbol, timeframe, candles }) {
  return {
    type: 'snapshot',
    provider,
    symbol,
    timeframe,
    count: candles.length,
    candles
  };
}

function buildKlinePayload({ provider, symbol, timeframe, candle, isClosed, eventTime, closeTime }) {
  return {
    type: 'kline',
    provider,
    symbol,
    timeframe,
    candle,
    isClosed,
    eventTime,
    closeTime
  };
}

function buildErrorPayload(error, { provider, symbol, timeframe }) {
  const normalized =
    error instanceof AppError
      ? error
      : new AppError(error instanceof Error ? error.message : String(error), {
          statusCode: 500,
          code: 'internal_error'
        });

  return {
    type: 'error',
    provider,
    symbol,
    timeframe,
    code: normalized.code,
    message: normalized.message,
    ...(normalized.details ? { details: normalized.details } : {})
  };
}

export function createMarketDataRealtimeService({
  providerRegistry,
  marketDataRepository,
  resyncCandleLimit = 5
}) {
  const streams = new Map();
  let subscriberSequence = 0;

  function broadcast(stream, payload) {
    for (const subscriber of stream.subscribers.values()) {
      try {
        subscriber.send(payload);
      } catch {}
    }
  }

  async function persistCandles(stream, candles) {
    if (!Array.isArray(candles) || candles.length === 0) {
      return;
    }

    await marketDataRepository.upsertCandles({
      providerName: stream.provider,
      symbol: stream.symbol,
      timeframe: stream.timeframe,
      candles
    });
  }

  async function mergeCoverage(stream, candles) {
    if (!Array.isArray(candles) || candles.length === 0) {
      return;
    }

    await marketDataRepository.mergeCoverage({
      providerName: stream.provider,
      symbol: stream.symbol,
      timeframe: stream.timeframe,
      startTime: candles[0].timestamp,
      endTime: candles[candles.length - 1].timestamp
    });
  }

  async function listSnapshot(stream) {
    return marketDataRepository.listLatestCandles({
      providerName: stream.provider,
      symbol: stream.symbol,
      timeframe: stream.timeframe,
      limit: stream.resyncCandleLimit
    });
  }

  async function resyncRecentCandles(stream) {
    if (stream.resyncPromise) {
      return stream.resyncPromise;
    }

    stream.resyncPromise = (async () => {
      const candles = await stream.marketDataAdapter.getCandles({
        symbol: stream.symbol,
        timeframe: stream.timeframe,
        limit: stream.resyncCandleLimit
      });

      if (candles.length > 0) {
        await persistCandles(stream, candles);
        await mergeCoverage(stream, candles);
      }

      return candles;
    })().finally(() => {
      stream.resyncPromise = null;
    });

    return stream.resyncPromise;
  }

  async function primeStream(stream) {
    if (stream.hasPrimed) {
      return;
    }

    if (stream.primePromise) {
      return stream.primePromise;
    }

    stream.primePromise = (async () => {
      await resyncRecentCandles(stream);
      stream.hasPrimed = true;
    })().finally(() => {
      stream.primePromise = null;
    });

    return stream.primePromise;
  }

  async function emitSnapshot(stream, targetSubscriber = null) {
    let candles = await listSnapshot(stream);

    if (candles.length === 0) {
      await resyncRecentCandles(stream);
      candles = await listSnapshot(stream);
    }

    if (candles.length === 0) {
      return;
    }

    const payload = buildSnapshotPayload({
      provider: stream.provider,
      symbol: stream.symbol,
      timeframe: stream.timeframe,
      candles
    });

    if (targetSubscriber) {
      targetSubscriber.send(payload);
      return;
    }

    broadcast(stream, payload);
  }

  async function ensureStream(stream) {
    if (stream.subscription) {
      return;
    }

    stream.subscription = stream.websocketAdapter.subscribeKlines({
      symbol: stream.symbol,
      timeframe: stream.timeframe,
      onStatus: async ({ state, ...details }) => {
        stream.state = state;
        broadcast(
          stream,
          buildStatusPayload({
            provider: stream.provider,
            symbol: stream.symbol,
            timeframe: stream.timeframe,
            state,
            details
          })
        );

        if (state === 'reconnected') {
          try {
            await resyncRecentCandles(stream);
            await emitSnapshot(stream);
          } catch (error) {
            broadcast(
              stream,
              buildErrorPayload(error, {
                provider: stream.provider,
                symbol: stream.symbol,
                timeframe: stream.timeframe
              })
            );
          }
        }
      },
      onKline: async (event) => {
        try {
          await persistCandles(stream, [event.candle]);

          if (event.isClosed) {
            await mergeCoverage(stream, [event.candle]);
          }

          broadcast(
            stream,
            buildKlinePayload({
              provider: stream.provider,
              symbol: stream.symbol,
              timeframe: stream.timeframe,
              candle: event.candle,
              isClosed: event.isClosed,
              eventTime: event.eventTime,
              closeTime: event.closeTime
            })
          );
        } catch (error) {
          broadcast(
            stream,
            buildErrorPayload(error, {
              provider: stream.provider,
              symbol: stream.symbol,
              timeframe: stream.timeframe
            })
          );
        }
      },
      onError: (error) => {
        broadcast(
          stream,
          buildErrorPayload(error, {
            provider: stream.provider,
            symbol: stream.symbol,
            timeframe: stream.timeframe
          })
        );
      }
    });
  }

  async function stopStream(stream) {
    await stream.subscription?.close?.();
    stream.subscription = null;
    streams.delete(stream.key);
  }

  return {
    async subscribeKlines({ provider, symbol, timeframe, send }) {
      const key = makeStreamKey({ provider, symbol, timeframe });
      let stream = streams.get(key);

      if (!stream) {
        stream = {
          key,
          provider,
          symbol,
          timeframe,
          state: 'idle',
          subscribers: new Map(),
          resyncCandleLimit,
          marketDataAdapter: providerRegistry.resolveAdapter(provider, 'marketData'),
          websocketAdapter: providerRegistry.resolveAdapter(provider, 'websocket'),
          subscription: null,
          resyncPromise: null,
          primePromise: null,
          hasPrimed: false
        };
        streams.set(key, stream);
      }

      const subscriberId = `${key}:${++subscriberSequence}`;
      const subscriber = { send };
      stream.subscribers.set(subscriberId, subscriber);

      await ensureStream(stream);
      subscriber.send(
        buildStatusPayload({
          provider,
          symbol,
          timeframe,
          state: stream.state
        })
      );

      try {
        await primeStream(stream);
      } catch (error) {
        subscriber.send(
          buildErrorPayload(error, {
            provider,
            symbol,
            timeframe
          })
        );
      }

      await emitSnapshot(stream, subscriber);

      return async () => {
        stream.subscribers.delete(subscriberId);

        if (stream.subscribers.size === 0) {
          await stopStream(stream);
        }
      };
    },

    async close() {
      await Promise.all([...streams.values()].map((stream) => stopStream(stream)));
    }
  };
}
