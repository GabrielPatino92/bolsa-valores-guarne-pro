function assertMethod(adapter, methodName, providerName) {
  if (typeof adapter?.[methodName] !== 'function') {
    throw new Error(
      `Execution adapter for ${providerName} must implement ${methodName}()`
    );
  }
}

export function assertExecutionAdapter(adapter, providerName) {
  assertMethod(adapter, 'placeOrder', providerName);
  assertMethod(adapter, 'cancelOrder', providerName);
  return Object.freeze(adapter);
}
