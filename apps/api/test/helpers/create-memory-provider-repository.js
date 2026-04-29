export function createMemoryProviderRepository(seed = []) {
  const providers = new Map();

  for (const provider of seed) {
    providers.set(provider.name, provider);
  }

  return {
    async listAll() {
      return [...providers.values()].sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
      );
    },

    async findByName(name) {
      return providers.get(name) ?? null;
    }
  };
}
