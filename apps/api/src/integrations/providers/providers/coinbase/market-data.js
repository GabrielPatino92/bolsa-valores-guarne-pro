import { createStubMethod } from '../shared/create-stub-method.js';

export function createCoinbaseMarketDataAdapter() {
  return {
    providerName: 'coinbase',
    capability: 'marketData',
    async getSymbols() {
      return createStubMethod('coinbase', 'marketData', 'getSymbols')();
    },
    async getCandles() {
      return createStubMethod('coinbase', 'marketData', 'getCandles')();
    }
  };
}
