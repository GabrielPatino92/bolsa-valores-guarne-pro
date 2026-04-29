import { AppError } from '../../../../shared/errors/app-error.js';

export const BINANCE_TIMEFRAME_MAP = Object.freeze({
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

export function resolveBinanceInterval(timeframe) {
  return BINANCE_TIMEFRAME_MAP[timeframe] ?? null;
}

export function assertSupportedBinanceTimeframe(timeframe) {
  const interval = resolveBinanceInterval(timeframe);

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
