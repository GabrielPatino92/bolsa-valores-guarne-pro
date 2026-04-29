import WebSocket from 'ws';
import { AppError } from '../../../../shared/errors/app-error.js';
import { assertSupportedBinanceTimeframe } from './intervals.js';

const DEFAULT_BASE_URL = 'wss://data-stream.binance.vision';
const DEFAULT_RECONNECT_DELAY_MS = 2000;

function buildStreamUrl(baseUrl, symbol, interval) {
  const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${sanitizedBaseUrl}/ws/${symbol.toLowerCase()}@kline_${interval}`;
}

function toReason(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return value.toString('utf8');
  }

  return value ? String(value) : null;
}

function mapKlineMessage(payload, { symbol, timeframe }) {
  const message = payload?.data ?? payload;
  const kline = message?.k;

  if (!kline) {
    return null;
  }

  return {
    provider: 'binance',
    symbol,
    timeframe,
    candle: {
      symbol,
      timeframe,
      timestamp: Number(kline.t),
      open: Number(kline.o),
      high: Number(kline.h),
      low: Number(kline.l),
      close: Number(kline.c),
      volume: Number(kline.v)
    },
    isClosed: Boolean(kline.x),
    eventTime: Number(message.E),
    closeTime: Number(kline.T)
  };
}

function toAppError(error, { symbol, timeframe, url }) {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError('Binance websocket stream failed', {
    statusCode: 502,
    code: 'provider_websocket_error',
    details: {
      providerName: 'binance',
      symbol,
      timeframe,
      url,
      reason: error instanceof Error ? error.message : String(error)
    }
  });
}

export function createBinanceWebsocketAdapter({
  baseUrl = DEFAULT_BASE_URL,
  reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
  WebSocketImpl = WebSocket
} = {}) {
  return {
    providerName: 'binance',
    capability: 'websocket',

    subscribeKlines({ symbol, timeframe, onKline, onStatus, onError }) {
      const interval = assertSupportedBinanceTimeframe(timeframe);
      const targetUrl = buildStreamUrl(baseUrl, symbol, interval);
      let socket = null;
      let reconnectTimer = null;
      let isClosedByClient = false;
      let hasConnectedOnce = false;

      const emitStatus = (state, details = {}) => {
        onStatus?.({ state, provider: 'binance', symbol, timeframe, ...details });
      };

      const emitError = (error) => {
        onError?.(toAppError(error, { symbol, timeframe, url: targetUrl }));
      };

      const scheduleReconnect = () => {
        if (isClosedByClient || reconnectTimer) {
          return;
        }

        emitStatus('reconnecting', { delayMs: reconnectDelayMs });
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, reconnectDelayMs);
      };

      const connect = () => {
        emitStatus(hasConnectedOnce ? 'reconnecting' : 'connecting', { url: targetUrl });
        socket = new WebSocketImpl(targetUrl);

        socket.on('open', () => {
          emitStatus(hasConnectedOnce ? 'reconnected' : 'connected', { url: targetUrl });
          hasConnectedOnce = true;
        });

        socket.on('message', (raw) => {
          try {
            const parsed = JSON.parse(raw.toString());
            const event = mapKlineMessage(parsed, { symbol, timeframe });

            if (event) {
              onKline?.(event);
            }
          } catch (error) {
            emitError(error);
          }
        });

        socket.on('ping', (data) => {
          try {
            socket.pong(data);
          } catch {}
        });

        socket.on('error', (error) => {
          emitError(error);
        });

        socket.on('close', (code, reason) => {
          emitStatus(isClosedByClient ? 'closed' : 'disconnected', {
            code,
            reason: toReason(reason)
          });
          socket = null;

          if (!isClosedByClient) {
            scheduleReconnect();
          }
        });
      };

      connect();

      const stop = () => {
        isClosedByClient = true;

        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }

        if (socket && socket.readyState < WebSocketImpl.CLOSING) {
          socket.close(1000, 'client unsubscribe');
        }
      };

      return {
        unsubscribe: stop,
        close: stop
      };
    }
  };
}
