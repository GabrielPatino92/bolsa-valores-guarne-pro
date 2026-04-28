import { createStubMethod } from '../shared/create-stub-method.js';

export function createIbkrAccountAdapter() {
  return {
    providerName: 'ibkr',
    capability: 'accountData',
    async getBalances() {
      return createStubMethod('ibkr', 'accountData', 'getBalances')();
    },
    async getPositions() {
      return createStubMethod('ibkr', 'accountData', 'getPositions')();
    }
  };
}
