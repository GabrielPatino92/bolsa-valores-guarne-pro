import { env } from '../env.js';

function buildWebSocketUrl({ provider, symbol, timeframe }) {
  const base = env.wsUrl.endsWith('/') ? env.wsUrl : `${env.wsUrl}/`;
  const url = new URL('ws/market-data', base);
  url.searchParams.set('provider', provider);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('timeframe', timeframe);
  return url.toString();
}

function normalizeSocketError(errorLike) {
  if (errorLike instanceof Error) {
    return errorLike;
  }

  return new Error('WebSocket connection failed');
}

export function connectMarketDataStream({
  provider,
  symbol,
  timeframe,
  onMessage,
  onError,
  createSocket = (url) => new WebSocket(url)
}) {
  const socket = createSocket(buildWebSocketUrl({ provider, symbol, timeframe }));
  let isClosedManually = false;

  socket.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessage?.(payload);
    } catch (error) {
      onError?.(normalizeSocketError(error));
    }
  });

  socket.addEventListener('error', (event) => {
    onError?.(normalizeSocketError(event?.error));
  });

  socket.addEventListener('close', (event) => {
    if (isClosedManually) {
      return;
    }

    onMessage?.({
      type: 'status',
      state: 'disconnected',
      details: {
        code: event.code,
        reason: event.reason || null
      }
    });
  });

  return {
    close() {
      isClosedManually = true;
      socket.close(1000, 'frontend cleanup');
    }
  };
}
