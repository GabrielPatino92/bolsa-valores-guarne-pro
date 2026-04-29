function assertMethod(adapter, methodName, providerName) {
  if (typeof adapter?.[methodName] !== 'function') {
    throw new Error(
      `Websocket adapter for ${providerName} must implement ${methodName}()`
    );
  }
}

export function assertWebsocketAdapter(adapter, providerName) {
  assertMethod(adapter, 'subscribeKlines', providerName);
  return Object.freeze(adapter);
}
