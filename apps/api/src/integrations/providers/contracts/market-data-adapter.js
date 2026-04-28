function assertMethod(adapter, methodName, providerName) {
  if (typeof adapter?.[methodName] !== 'function') {
    throw new Error(
      `Market data adapter for ${providerName} must implement ${methodName}()`
    );
  }
}

export function assertMarketDataAdapter(adapter, providerName) {
  assertMethod(adapter, 'getSymbols', providerName);
  assertMethod(adapter, 'getCandles', providerName);
  return Object.freeze(adapter);
}
