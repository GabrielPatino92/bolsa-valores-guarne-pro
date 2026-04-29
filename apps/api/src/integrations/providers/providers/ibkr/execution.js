import { createStubMethod } from '../shared/create-stub-method.js';

export function createIbkrExecutionAdapter() {
  return {
    providerName: 'ibkr',
    capability: 'orderExecution',
    async placeOrder() {
      return createStubMethod('ibkr', 'orderExecution', 'placeOrder')();
    },
    async cancelOrder() {
      return createStubMethod('ibkr', 'orderExecution', 'cancelOrder')();
    }
  };
}
