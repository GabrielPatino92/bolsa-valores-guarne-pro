import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createProviderRegistry } from '../src/integrations/providers/registry.js';
import { createBinanceMarketDataAdapter } from '../src/integrations/providers/providers/binance/market-data.js';
import { createMemoryMarketDataRepository } from './helpers/create-memory-market-data-repository.js';
import { createMemoryProviderRepository } from './helpers/create-memory-provider-repository.js';
import { createMemoryRefreshTokenRepository } from './helpers/create-memory-refresh-token-repository.js';
import { createMemoryUserRepository } from './helpers/create-memory-user-repository.js';
import WebSocket from 'ws';

const testEnv = {
  NODE_ENV: 'test',
  API_PORT: '4000',
  API_PREFIX: '/api/v1',
  DATABASE_URL: 'postgresql://guarne_dev:guarne_dev_pass_2024@localhost:5433/guarne_trading',
  JWT_SECRET: 'change-this-super-secret-jwt-key-min-32-chars-for-production',
  JWT_REFRESH_SECRET: 'change-this-refresh-token-secret-min-32-chars-for-production'
};

const providerSeed = [
  {
    id: 'provider-binance',
    name: 'binance',
    type: 'crypto',
    displayName: 'Binance',
    isActive: true,
    supportsTestnet: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'provider-ibkr',
    name: 'ibkr',
    type: 'stocks',
    displayName: 'Interactive Brokers',
    isActive: true,
    supportsTestnet: true,
    createdAt: new Date().toISOString()
  }
];

function createFakePool() {
  return {
    async query() {
      return { rows: [{ ok: 1 }], rowCount: 1 };
    },
    async end() {}
  };
}

function createTestApp(overrides = {}) {
  return createApp({
    env: testEnv,
    pool: createFakePool(),
    userRepository: overrides.userRepository ?? createMemoryUserRepository(),
    refreshTokenRepository:
      overrides.refreshTokenRepository ?? createMemoryRefreshTokenRepository(),
    providerRepository:
      overrides.providerRepository ?? createMemoryProviderRepository(providerSeed),
    marketDataRepository:
      overrides.marketDataRepository ?? createMemoryMarketDataRepository(),
    providerRegistry: overrides.providerRegistry ?? createProviderRegistry()
  });
}




function waitForOpen(ws, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out while opening websocket'));
    }, timeoutMs);

    const handleOpen = () => {
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const cleanup = () => {
      clearTimeout(timer);
      ws.off('open', handleOpen);
      ws.off('error', handleError);
    };

    ws.on('open', handleOpen);
    ws.on('error', handleError);
  });
}

function waitForJsonMessage(ws, predicate, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out while waiting for websocket message'));
    }, timeoutMs);

    const handler = (data) => {
      const payload = JSON.parse(data.toString());

      if (!predicate(payload)) {
        return;
      }

      cleanup();
      resolve(payload);
    };

    const cleanup = () => {
      clearTimeout(timer);
      ws.off('message', handler);
    };

    ws.on('message', handler);
  });
}

test('GET /health returns API readiness', async (t) => {
  const app = await createTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.checks.api, 'ok');
  assert.equal(body.checks.database, 'ok');
});

test('auth endpoints issue JWTs and protect /users/me', async (t) => {
  const app = await createTestApp();

  t.after(async () => {
    await app.close();
  });

  const registerResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: {
      email: 'trader@example.com',
      username: 'trader_example',
      fullName: 'Trader Example',
      password: 'StrongPass123'
    }
  });

  assert.equal(registerResponse.statusCode, 201);
  const registerBody = registerResponse.json();
  assert.ok(registerBody.accessToken);
  assert.ok(registerBody.refreshToken);
  assert.equal(registerBody.user.email, 'trader@example.com');
  assert.equal(registerBody.user.username, 'trader_example');

  const loginResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email: 'trader@example.com',
      password: 'StrongPass123'
    }
  });

  assert.equal(loginResponse.statusCode, 200);
  const loginBody = loginResponse.json();
  assert.ok(loginBody.accessToken);
  assert.ok(loginBody.refreshToken);

  const meResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users/me',
    headers: {
      authorization: `Bearer ${loginBody.accessToken}`
    }
  });

  assert.equal(meResponse.statusCode, 200);
  const meBody = meResponse.json();
  assert.equal(meBody.user.email, 'trader@example.com');
  assert.equal(meBody.user.username, 'trader_example');

  const refreshResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/refresh',
    payload: {
      refreshToken: loginBody.refreshToken
    }
  });

  assert.equal(refreshResponse.statusCode, 200);
  const refreshBody = refreshResponse.json();
  assert.ok(refreshBody.accessToken);
  assert.ok(refreshBody.refreshToken);
  assert.notEqual(refreshBody.refreshToken, loginBody.refreshToken);
});

test('provider catalog exposes capabilities and registry boundaries', async (t) => {
  const app = await createTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: '/api/v1/providers'
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.providers.length, 2);

  const binance = body.providers.find((provider) => provider.name === 'binance');
  const ibkr = body.providers.find((provider) => provider.name === 'ibkr');

  assert.equal(binance.capabilities.marketData, true);
  assert.equal(binance.capabilities.websocket, true);
  assert.equal(binance.adapterStatus, 'ready');
  assert.equal(ibkr.capabilities.accountData, true);
  assert.equal(ibkr.capabilities.orderExecution, true);

  const providerResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/providers/binance'
  });

  assert.equal(providerResponse.statusCode, 200);
  assert.equal(providerResponse.json().provider.name, 'binance');
});

test('market-data historical cache hits bypass upstream adapters', async (t) => {
  const marketDataRepository = createMemoryMarketDataRepository({
    candles: [
      {
        providerName: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1m',
        timestamp: 1710000000000,
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 100
      }
    ],
    coverages: [
      {
        providerName: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1m',
        startTime: 1710000000000,
        endTime: 1710000000000
      }
    ]
  });

  let upstreamCalls = 0;
  const providerRegistry = {
    resolveAdapter() {
      return {
        async getSymbols() {
          return [];
        },
        async getCandles() {
          upstreamCalls += 1;
          return [];
        }
      };
    }
  };

  const app = await createTestApp({ marketDataRepository, providerRegistry });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: '/api/v1/market-data/candles?provider=binance&symbol=BTCUSDT&timeframe=1m&limit=1&startTime=1710000000000&endTime=1710000000000'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(upstreamCalls, 0);
  assert.equal(response.json().candles[0].close, 1.5);
});

test('market-data cache miss hydrates repository and merges coverage', async (t) => {
  const marketDataRepository = createMemoryMarketDataRepository();
  let upstreamCalls = 0;
  const providerRegistry = {
    resolveAdapter() {
      return {
        async getSymbols() {
          return [];
        },
        async getCandles() {
          upstreamCalls += 1;
          return [
            {
              symbol: 'BTCUSDT',
              timeframe: '1m',
              timestamp: 1710000000000,
              open: 1,
              high: 2,
              low: 0.5,
              close: 1.5,
              volume: 100
            }
          ];
        }
      };
    }
  };

  const app = await createTestApp({ marketDataRepository, providerRegistry });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: '/api/v1/market-data/candles?provider=binance&symbol=BTCUSDT&timeframe=1m&limit=1&startTime=1710000000000&endTime=1710000000000'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(upstreamCalls, 1);
  assert.equal(response.json().candles.length, 1);

  const storedCandles = await marketDataRepository.listCandlesByRange({
    providerName: 'binance',
    symbol: 'BTCUSDT',
    timeframe: '1m',
    startTime: 1710000000000,
    endTime: 1710000000000,
    limit: 10
  });
  const hasCoverage = await marketDataRepository.hasCoverage({
    providerName: 'binance',
    symbol: 'BTCUSDT',
    timeframe: '1m',
    startTime: 1710000000000,
    endTime: 1710000000000
  });

  assert.equal(storedCandles.length, 1);
  assert.equal(hasCoverage, true);
});

test('market-data routes resolve provider-aware adapters and validate query bounds', async (t) => {
  const fakeMarketDataAdapter = {
    async getSymbols() {
      return [
        {
          symbol: 'BTCUSDT',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          status: 'TRADING'
        }
      ];
    },
    async getCandles({ symbol, timeframe, limit }) {
      return [
        {
          symbol,
          timeframe,
          timestamp: 1710000000000,
          open: 1,
          high: 2,
          low: 0.5,
          close: 1.5,
          volume: 100
        }
      ].slice(0, Math.min(limit, 1));
    }
  };

  const providerRegistry = {
    describe(providerName) {
      if (providerName !== 'binance') {
        return null;
      }

      return {
        name: 'binance',
        capabilities: {
          marketData: true,
          accountData: false,
          orderExecution: false,
          paperTrading: false,
          websocket: false
        },
        adapterStatus: 'ready'
      };
    },
    resolveAdapter(providerName, capability) {
      assert.equal(providerName, 'binance');
      assert.equal(capability, 'marketData');
      return fakeMarketDataAdapter;
    }
  };

  const app = await createTestApp({ providerRegistry });

  t.after(async () => {
    await app.close();
  });

  const symbolsResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/market-data/symbols?provider=binance'
  });

  assert.equal(symbolsResponse.statusCode, 200);
  const symbolsBody = symbolsResponse.json();
  assert.equal(symbolsBody.provider, 'binance');
  assert.equal(symbolsBody.count, 1);
  assert.equal(symbolsBody.symbols[0].symbol, 'BTCUSDT');

  const candlesResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/market-data/candles?provider=binance&symbol=btcusdt&timeframe=1m&limit=1'
  });

  assert.equal(candlesResponse.statusCode, 200);
  const candlesBody = candlesResponse.json();
  assert.equal(candlesBody.provider, 'binance');
  assert.equal(candlesBody.symbol, 'BTCUSDT');
  assert.equal(candlesBody.timeframe, '1m');
  assert.equal(candlesBody.count, 1);
  assert.equal(candlesBody.candles[0].close, 1.5);

  const invalidResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/market-data/candles?provider=binance&symbol=BTCUSDT&timeframe=1m&limit=1001'
  });

  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.json().error.code, 'validation_error');
});

test('recent market-data windows still refresh from upstream even with coverage', async (t) => {
  const now = Date.now();
  const startTime = now - 60_000;
  const endTime = now;
  const marketDataRepository = createMemoryMarketDataRepository({
    candles: [
      {
        providerName: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1m',
        timestamp: startTime,
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 100
      }
    ],
    coverages: [
      {
        providerName: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1m',
        startTime,
        endTime: startTime
      }
    ]
  });

  let upstreamCalls = 0;
  const providerRegistry = {
    resolveAdapter() {
      return {
        async getSymbols() {
          return [];
        },
        async getCandles() {
          upstreamCalls += 1;
          return [
            {
              symbol: 'BTCUSDT',
              timeframe: '1m',
              timestamp: startTime,
              open: 1,
              high: 2,
              low: 0.5,
              close: 2.25,
              volume: 150
            }
          ];
        }
      };
    }
  };

  const app = await createTestApp({ marketDataRepository, providerRegistry });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: `/api/v1/market-data/candles?provider=binance&symbol=BTCUSDT&timeframe=1m&limit=1&startTime=${startTime}&endTime=${endTime}`
  });

  assert.equal(response.statusCode, 200);
  assert.equal(upstreamCalls, 1);
  assert.equal(response.json().candles[0].close, 2.25);
});

test('binance market-data adapter maps exchangeInfo and klines responses', async () => {
  const payloads = {
    exchangeInfo: {
      symbols: [
        {
          symbol: 'BTCUSDT',
          status: 'TRADING',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          isSpotTradingAllowed: true
        },
        {
          symbol: 'FOOUSD',
          status: 'BREAK',
          baseAsset: 'FOO',
          quoteAsset: 'USD',
          isSpotTradingAllowed: true
        }
      ]
    },
    klines: [
      [1710000000000, '1.0', '2.0', '0.5', '1.5', '100.0'],
      [1710000060000, '1.5', '2.5', '1.2', '2.0', '110.0']
    ]
  };

  const fetchImpl = async (url) => {
    const target = new URL(url);

    if (target.pathname.endsWith('/exchangeInfo')) {
      return new Response(JSON.stringify(payloads.exchangeInfo), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (target.pathname.endsWith('/klines')) {
      return new Response(JSON.stringify(payloads.klines), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    throw new Error(`Unexpected URL in test: ${target}`);
  };

  const adapter = createBinanceMarketDataAdapter({
    baseUrl: 'https://data-api.binance.vision',
    fetchImpl,
    timeoutMs: 5000
  });

  const symbols = await adapter.getSymbols();
  assert.equal(symbols.length, 1);
  assert.equal(symbols[0].symbol, 'BTCUSDT');

  const candles = await adapter.getCandles({
    symbol: 'BTCUSDT',
    timeframe: '1m',
    limit: 2
  });

  assert.equal(candles.length, 2);
  assert.equal(candles[0].timeframe, '1m');
  assert.equal(candles[0].open, 1);
  assert.equal(candles[1].close, 2);

  await assert.rejects(
    () =>
      adapter.getCandles({
        symbol: 'BTCUSDT',
        timeframe: '2m',
        limit: 2
      }),
    /Binance does not support timeframe 2m/
  );
});


test('market-data websocket route multiplexes a single upstream stream and resyncs on reconnect', async (t) => {
  const marketDataRepository = createMemoryMarketDataRepository();
  let marketDataCalls = 0;
  let websocketSubscriptions = 0;
  let currentHandlers;

  const fakeMarketDataAdapter = {
    async getSymbols() {
      return [];
    },
    async getCandles() {
      marketDataCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 0));
      return [
        {
          symbol: 'BTCUSDT',
          timeframe: '1m',
          timestamp: 1710000000000,
          open: 1,
          high: 2,
          low: 0.5,
          close: marketDataCalls === 1 ? 1.5 : 1.75,
          volume: 100 + marketDataCalls
        }
      ];
    }
  };

  const fakeWebsocketAdapter = {
    subscribeKlines({ onKline, onStatus, onError }) {
      websocketSubscriptions += 1;
      currentHandlers = { onKline, onStatus, onError };
      queueMicrotask(() => {
        onStatus({ state: 'connected', url: 'wss://example.test/ws' });
      });
      return {
        close() {
          websocketSubscriptions -= 1;
        }
      };
    }
  };

  const providerRegistry = {
    resolveAdapter(providerName, capability) {
      assert.equal(providerName, 'binance');
      if (capability === 'marketData') {
        return fakeMarketDataAdapter;
      }
      if (capability === 'websocket') {
        return fakeWebsocketAdapter;
      }
      throw new Error(`Unexpected capability: ${capability}`);
    }
  };

  const app = await createTestApp({ marketDataRepository, providerRegistry });

  t.after(async () => {
    await app.close();
  });

  await app.ready();
  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.server.address();
  const streamUrl = `ws://127.0.0.1:${address.port}/ws/market-data?provider=binance&symbol=BTCUSDT&timeframe=1m`;

  const wsA = new WebSocket(streamUrl);
  const firstSnapshotPromise = waitForJsonMessage(wsA, (payload) => payload.type === 'snapshot');
  await waitForOpen(wsA);
  const firstSnapshot = await firstSnapshotPromise;
  assert.equal(firstSnapshot.provider, 'binance');
  assert.equal(firstSnapshot.candles.length, 1);
  assert.equal(marketDataCalls, 1);

  const wsB = new WebSocket(streamUrl);
  const secondSnapshotPromise = waitForJsonMessage(wsB, (payload) => payload.type === 'snapshot');
  await waitForOpen(wsB);
  const secondSnapshot = await secondSnapshotPromise;
  assert.equal(secondSnapshot.candles.length, 1);
  assert.equal(websocketSubscriptions, 1);
  assert.equal(marketDataCalls, 1);

  const wsAKlinePromise = waitForJsonMessage(wsA, (payload) => payload.type === 'kline');
  const wsBKlinePromise = waitForJsonMessage(wsB, (payload) => payload.type === 'kline');

  currentHandlers.onKline({
    provider: 'binance',
    symbol: 'BTCUSDT',
    timeframe: '1m',
    candle: {
      symbol: 'BTCUSDT',
      timeframe: '1m',
      timestamp: 1710000060000,
      open: 1.5,
      high: 2.5,
      low: 1.2,
      close: 2.0,
      volume: 111
    },
    isClosed: false,
    eventTime: 1710000060500,
    closeTime: 1710000119999
  });

  const wsAKline = await wsAKlinePromise;
  const wsBKline = await wsBKlinePromise;
  assert.equal(wsAKline.candle.close, 2.0);
  assert.equal(wsBKline.candle.close, 2.0);

  const reconnectSnapshotPromise = waitForJsonMessage(
    wsA,
    (payload) =>
      payload.type === 'snapshot' && payload.candles[0] && payload.candles[0].close === 1.75
  );
  currentHandlers.onStatus({ state: 'reconnected', url: 'wss://example.test/ws' });
  const reconnectSnapshot = await reconnectSnapshotPromise;
  assert.equal(reconnectSnapshot.candles[0].close, 1.75);
  assert.equal(marketDataCalls, 2);

  wsA.terminate();
  wsB.terminate();
  await app.server.closeAllConnections?.();
});

test('market-data websocket route rejects invalid subscriptions', async (t) => {
  const app = await createTestApp({
    providerRegistry: {
      resolveAdapter() {
        return {
          async getSymbols() {
            return [];
          },
          async getCandles() {
            return [];
          }
        };
      }
    }
  });

  t.after(async () => {
    await app.close();
  });

  await app.ready();
  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.server.address();
  const ws = new WebSocket(`ws://127.0.0.1:${address.port}/ws/market-data?provider=binance&symbol=BTCUSDT`);
  const errorPayloadPromise = waitForJsonMessage(ws, (payload) => payload.type === 'error');
  await waitForOpen(ws);
  const errorPayload = await errorPayloadPromise;

  assert.equal(errorPayload.code, 'validation_error');
  ws.terminate();
  await app.server.closeAllConnections?.();
});
