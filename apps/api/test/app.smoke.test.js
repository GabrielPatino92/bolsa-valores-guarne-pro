import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createMemoryRefreshTokenRepository } from './helpers/create-memory-refresh-token-repository.js';
import { createMemoryUserRepository } from './helpers/create-memory-user-repository.js';

const testEnv = {
  NODE_ENV: 'test',
  API_PORT: '4000',
  API_PREFIX: '/api/v1',
  DATABASE_URL: 'postgresql://guarne_dev:guarne_dev_pass_2024@localhost:5433/guarne_trading',
  JWT_SECRET: 'change-this-super-secret-jwt-key-min-32-chars-for-production',
  JWT_REFRESH_SECRET: 'change-this-refresh-token-secret-min-32-chars-for-production'
};

function createFakePool() {
  return {
    async query() {
      return { rows: [{ ok: 1 }] };
    },
    async end() {}
  };
}

test('GET /health returns API readiness', async (t) => {
  const app = await createApp({
    env: testEnv,
    pool: createFakePool(),
    userRepository: createMemoryUserRepository(),
    refreshTokenRepository: createMemoryRefreshTokenRepository()
  });

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
  const app = await createApp({
    env: testEnv,
    pool: createFakePool(),
    userRepository: createMemoryUserRepository(),
    refreshTokenRepository: createMemoryRefreshTokenRepository()
  });

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
