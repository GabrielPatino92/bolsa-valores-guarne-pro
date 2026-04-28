import { createStubMethod } from '../shared/create-stub-method.js';

export function createOkxMarketDataAdapter() {
  return {
    providerName: 'okx',
    capability: 'marketData',
    async getSymbols() {
      return createStubMethod('okx', 'marketData', 'getSymbols')();
    },
    async getCandles() {
      return createStubMethod('okx', 'marketData', 'getCandles')();
    }
  };
}
