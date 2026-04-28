export function createMarketDataService({ providerRegistry }) {
  return {
    async getSymbols({ provider }) {
      const adapter = providerRegistry.resolveAdapter(provider, 'marketData');
      const symbols = await adapter.getSymbols();

      return {
        provider,
        count: symbols.length,
        symbols
      };
    },

    async getCandles({ provider, symbol, timeframe, limit, startTime, endTime }) {
      const adapter = providerRegistry.resolveAdapter(provider, 'marketData');
      const candles = await adapter.getCandles({
        symbol,
        timeframe,
        limit,
        startTime,
        endTime
      });

      return {
        provider,
        symbol,
        timeframe,
        count: candles.length,
        candles
      };
    }
  };
}
