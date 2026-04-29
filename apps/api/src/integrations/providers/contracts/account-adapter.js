function assertMethod(adapter, methodName, providerName) {
  if (typeof adapter?.[methodName] !== 'function') {
    throw new Error(
      `Account adapter for ${providerName} must implement ${methodName}()`
    );
  }
}

export function assertAccountAdapter(adapter, providerName) {
  assertMethod(adapter, 'getBalances', providerName);
  assertMethod(adapter, 'getPositions', providerName);
  return Object.freeze(adapter);
}
