import { AppError } from '../../../../shared/errors/app-error.js';
import { createBinanceMarketDataClient } from './client.js';
import { assertSupportedBinanceTimeframe } from './intervals.js';

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
      const interval = assertSupportedBinanceTimeframe(timeframe);

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
