import { createStubMethod } from '../shared/create-stub-method.js';

export function createBinanceMarketDataAdapter() {
  return {
    providerName: 'binance',
    capability: 'marketData',
    async getSymbols() {
      return createStubMethod('binance', 'marketData', 'getSymbols')();
    },
    async getCandles() {
      return createStubMethod('binance', 'marketData', 'getCandles')();
    }
  };
}
