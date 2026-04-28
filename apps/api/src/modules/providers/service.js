import { AppError } from '../../shared/errors/app-error.js';

function emptyCapabilities() {
  return {
    marketData: false,
    accountData: false,
    orderExecution: false,
    paperTrading: false,
    websocket: false
  };
}

function mergeCatalogEntry(provider, registryEntry) {
  return {
    ...provider,
    capabilities: registryEntry?.capabilities ?? emptyCapabilities(),
    adapterStatus: registryEntry?.adapterStatus ?? 'catalog_only'
  };
}

export function createProvidersService({ providerRepository, providerRegistry }) {
  return {
    async listProviders() {
      const providers = await providerRepository.listAll();
      return {
        providers: providers.map((provider) =>
          mergeCatalogEntry(provider, providerRegistry.describe(provider.name))
        )
      };
    },

    async getProvider(providerName) {
      const provider = await providerRepository.findByName(providerName);

      if (!provider) {
        throw new AppError(`Provider ${providerName} was not found`, {
          statusCode: 404,
          code: 'provider_not_found'
        });
      }

      return {
        provider: mergeCatalogEntry(
          provider,
          providerRegistry.describe(provider.name)
        )
      };
    },

    resolveAdapter(providerName, capability) {
      return providerRegistry.resolveAdapter(providerName, capability);
    }
  };
}
