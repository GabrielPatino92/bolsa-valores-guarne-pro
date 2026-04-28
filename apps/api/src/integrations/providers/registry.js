import { AppError } from '../../shared/errors/app-error.js';
import { assertAccountAdapter } from './contracts/account-adapter.js';
import { assertExecutionAdapter } from './contracts/execution-adapter.js';
import { assertMarketDataAdapter } from './contracts/market-data-adapter.js';
import { createBinanceMarketDataAdapter } from './providers/binance/market-data.js';
import { createCoinbaseMarketDataAdapter } from './providers/coinbase/market-data.js';
import { createIbkrAccountAdapter } from './providers/ibkr/account.js';
import { createIbkrExecutionAdapter } from './providers/ibkr/execution.js';
import { createOkxMarketDataAdapter } from './providers/okx/market-data.js';

export const PROVIDER_NAMES = ['binance', 'okx', 'coinbase', 'ibkr'];
export const PROVIDER_CAPABILITIES = [
  'marketData',
  'accountData',
  'orderExecution',
  'paperTrading',
  'websocket'
];

function buildCapabilityFlags(partial) {
  return {
    marketData: false,
    accountData: false,
    orderExecution: false,
    paperTrading: false,
    websocket: false,
    ...partial
  };
}

function buildDescriptor({
  name,
  capabilities,
  adapterStatus = 'stubbed',
  adapters = {}
}) {
  return {
    name,
    capabilities: buildCapabilityFlags(capabilities),
    adapterStatus,
    adapters: Object.freeze(adapters)
  };
}

function createDefaultDescriptors(options = {}) {
  const binanceMarketData = assertMarketDataAdapter(
    createBinanceMarketDataAdapter(options.binance ?? {}),
    'binance'
  );
  const okxMarketData = assertMarketDataAdapter(
    createOkxMarketDataAdapter(),
    'okx'
  );
  const coinbaseMarketData = assertMarketDataAdapter(
    createCoinbaseMarketDataAdapter(),
    'coinbase'
  );
  const ibkrAccount = assertAccountAdapter(createIbkrAccountAdapter(), 'ibkr');
  const ibkrExecution = assertExecutionAdapter(
    createIbkrExecutionAdapter(),
    'ibkr'
  );

  return [
    buildDescriptor({
      name: 'binance',
      capabilities: {
        marketData: true,
        accountData: true,
        orderExecution: true,
        paperTrading: true,
        websocket: true
      },
      adapters: {
        marketData: binanceMarketData
      }
    }),
    buildDescriptor({
      name: 'okx',
      capabilities: {
        marketData: true,
        accountData: true,
        orderExecution: true,
        paperTrading: true,
        websocket: true
      },
      adapters: {
        marketData: okxMarketData
      }
    }),
    buildDescriptor({
      name: 'coinbase',
      capabilities: {
        marketData: true,
        accountData: true,
        orderExecution: true,
        paperTrading: true,
        websocket: true
      },
      adapters: {
        marketData: coinbaseMarketData
      }
    }),
    buildDescriptor({
      name: 'ibkr',
      capabilities: {
        marketData: true,
        accountData: true,
        orderExecution: true,
        paperTrading: true,
        websocket: false
      },
      adapters: {
        accountData: ibkrAccount,
        orderExecution: ibkrExecution
      }
    })
  ];
}

export function createProviderRegistry(options = {}, descriptors = createDefaultDescriptors(options)) {
  const registry = new Map(descriptors.map((descriptor) => [descriptor.name, descriptor]));

  return {
    list() {
      return [...registry.values()].map((descriptor) => ({
        name: descriptor.name,
        capabilities: descriptor.capabilities,
        adapterStatus: descriptor.adapterStatus
      }));
    },

    describe(providerName) {
      const descriptor = registry.get(providerName);

      if (!descriptor) {
        return null;
      }

      return {
        name: descriptor.name,
        capabilities: descriptor.capabilities,
        adapterStatus: descriptor.adapterStatus
      };
    },

    resolveAdapter(providerName, capability) {
      const descriptor = registry.get(providerName);

      if (!descriptor) {
        throw new AppError(`Provider ${providerName} is not registered`, {
          statusCode: 404,
          code: 'provider_not_found'
        });
      }

      if (!PROVIDER_CAPABILITIES.includes(capability)) {
        throw new AppError(`Capability ${capability} is not supported by the registry`, {
          statusCode: 400,
          code: 'provider_capability_unknown',
          details: {
            providerName,
            capability
          }
        });
      }

      const adapter = descriptor.adapters[capability] ?? null;

      if (!adapter) {
        throw new AppError(
          `Provider ${providerName} does not expose the ${capability} adapter yet`,
          {
            statusCode: 501,
            code: 'provider_capability_not_supported',
            details: {
              providerName,
              capability
            }
          }
        );
      }

      return adapter;
    }
  };
}
