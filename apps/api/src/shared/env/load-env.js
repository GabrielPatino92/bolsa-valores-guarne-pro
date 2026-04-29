import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().optional(),
  API_PORT: z.coerce.number().int().positive().optional(),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z
    .string()
    .default('postgresql://guarne_dev:guarne_dev_pass_2024@localhost:5433/guarne_trading'),
  DATABASE_POOL_MIN: z.coerce.number().int().min(0).default(0),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  DATABASE_SSL: z.union([z.string(), z.boolean()]).default('false'),
  JWT_SECRET: z
    .string()
    .min(16)
    .default('change-this-super-secret-jwt-key-min-32-chars-for-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('change-this-refresh-token-secret-min-32-chars-for-production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  BINANCE_MARKET_DATA_BASE_URL: z.string().url().default('https://data-api.binance.vision'),
  BINANCE_MARKET_DATA_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  MARKET_DATA_CACHE_HOT_WINDOW_MS: z.coerce.number().int().positive().default(300000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_AUTHENTICATED_MAX: z.coerce.number().int().positive().default(1000)
});

let cachedEnv;

function normalizePrefix(prefix) {
  const sanitized = prefix.trim().replace(/\/$/, '');
  return sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function assertProductionSecrets(env) {
  if (env.nodeEnv !== 'production') {
    return;
  }

  const unsafeSecrets = [env.jwtSecret, env.jwtRefreshSecret].filter((secret) =>
    secret.startsWith('change-this-')
  );

  if (unsafeSecrets.length > 0) {
    throw new Error('Production secrets must be replaced before starting @guarne/api');
  }
}

export function loadEnv(source = process.env) {
  if (source === process.env && cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(source);
  const env = {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.API_PORT ?? parsed.PORT ?? 4000,
    apiPrefix: normalizePrefix(parsed.API_PREFIX),
    logLevel: parsed.LOG_LEVEL,
    databaseUrl: parsed.DATABASE_URL,
    databasePoolMin: parsed.DATABASE_POOL_MIN,
    databasePoolMax: parsed.DATABASE_POOL_MAX,
    databaseSsl: parseBoolean(parsed.DATABASE_SSL),
    jwtSecret: parsed.JWT_SECRET,
    jwtExpiresIn: parsed.JWT_EXPIRES_IN,
    jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: parsed.JWT_REFRESH_EXPIRES_IN,
    corsOrigins: parsed.CORS_ORIGINS.split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    binanceMarketDataBaseUrl: parsed.BINANCE_MARKET_DATA_BASE_URL,
    binanceMarketDataTimeoutMs: parsed.BINANCE_MARKET_DATA_TIMEOUT_MS,
    marketDataCacheHotWindowMs: parsed.MARKET_DATA_CACHE_HOT_WINDOW_MS,
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: parsed.RATE_LIMIT_MAX_REQUESTS,
    rateLimitAuthenticatedMax: parsed.RATE_LIMIT_AUTHENTICATED_MAX
  };

  assertProductionSecrets(env);

  if (source === process.env) {
    cachedEnv = env;
  }

  return env;
}
