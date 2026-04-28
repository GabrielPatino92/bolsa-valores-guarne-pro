import { AppError } from '../../../../shared/errors/app-error.js';
import { createBinanceMarketDataClient } from './client.js';

const BINANCE_TIMEFRAME_MAP = Object.freeze({
  '1s': '1s',
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M'
});

function resolveInterval(timeframe) {
  return BINANCE_TIMEFRAME_MAP[timeframe] ?? null;
}

function mapSymbol(entry) {
  return {
    symbol: entry.symbol,
    baseAsset: entry.baseAsset,
    quoteAsset: entry.quoteAsset,
    status: entry.status
  };
}

function mapCandle(kline, { symbol, timeframe }) {
  return {
    symbol,
    timeframe,
    timestamp: Number(kline[0]),
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5])
  };
}

function assertSupportedTimeframe(timeframe) {
  const interval = resolveInterval(timeframe);

  if (!interval) {
    throw new AppError(`Binance does not support timeframe ${timeframe}`, {
      statusCode: 400,
      code: 'provider_timeframe_unsupported',
      details: {
        providerName: 'binance',
        timeframe
      }
    });
  }

  return interval;
}

export function createBinanceMarketDataAdapter(options = {}) {
  const client = createBinanceMarketDataClient(options);

  return {
    providerName: 'binance',
    capability: 'marketData',

    async getSymbols() {
      const payload = await client.request('/api/v3/exchangeInfo');
      const symbols = Array.isArray(payload?.symbols) ? payload.symbols : [];

      return symbols
        .filter((entry) => entry?.status === 'TRADING' && entry?.isSpotTradingAllowed !== false)
        .map(mapSymbol);
    },

    async getCandles({ symbol, timeframe, limit = 500, startTime, endTime }) {
      const interval = assertSupportedTimeframe(timeframe);

      const payload = await client.request('/api/v3/klines', {
        symbol,
        interval,
        limit,
        startTime,
        endTime
      });

      if (!Array.isArray(payload)) {
        throw new AppError('Binance kline response was not an array', {
          statusCode: 502,
          code: 'provider_upstream_invalid_response',
          details: {
            providerName: 'binance',
            symbol,
            timeframe
          }
        });
      }

      return payload.map((entry) => mapCandle(entry, { symbol, timeframe }));
    }
  };
}
