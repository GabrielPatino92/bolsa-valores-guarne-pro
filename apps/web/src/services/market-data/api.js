import { httpClient } from '../http/client.js';

export async function getMarketSymbols({ provider = 'binance' } = {}) {
  const response = await httpClient.get('/market-data/symbols', {
    params: { provider }
  });

  return response.data;
}

export async function getMarketCandles({
  provider = 'binance',
  symbol,
  timeframe,
  limit = 100
} = {}) {
  const response = await httpClient.get('/market-data/candles', {
    params: {
      provider,
      symbol,
      timeframe,
      limit
    }
  });

  return response.data;
}
