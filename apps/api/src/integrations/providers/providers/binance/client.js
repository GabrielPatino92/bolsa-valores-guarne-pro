import { AppError } from '../../../../shared/errors/app-error.js';

const DEFAULT_BASE_URL = 'https://data-api.binance.vision';
const DEFAULT_TIMEOUT_MS = 10000;

async function parseUpstreamBody(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function buildErrorDetails(body, status, url) {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return {
      upstreamStatus: status,
      upstreamCode: body.code ?? null,
      upstreamMessage: body.msg ?? body.message ?? null,
      url
    };
  }

  return {
    upstreamStatus: status,
    upstreamMessage: typeof body === 'string' ? body : null,
    url
  };
}

export function createBinanceMarketDataClient({
  baseUrl = DEFAULT_BASE_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required for Binance market data client');
  }

  return {
    async request(pathname, searchParams = {}) {
      const url = new URL(pathname, baseUrl);

      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }

      let response;

      try {
        response = await fetchImpl(url, {
          method: 'GET',
          headers: {
            accept: 'application/json'
          },
          signal: AbortSignal.timeout(timeoutMs)
        });
      } catch (error) {
        throw new AppError('Binance market data request failed', {
          statusCode: 502,
          code: 'provider_upstream_error',
          details: {
            providerName: 'binance',
            reason: error instanceof Error ? error.message : String(error),
            url: url.toString()
          }
        });
      }

      const body = await parseUpstreamBody(response);

      if (!response.ok) {
        throw new AppError('Binance market data request failed', {
          statusCode: 502,
          code: 'provider_upstream_error',
          details: {
            providerName: 'binance',
            ...buildErrorDetails(body, response.status, url.toString())
          }
        });
      }

      return body;
    }
  };
}
