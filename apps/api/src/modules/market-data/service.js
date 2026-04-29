function isHistoricalCacheWindow({ startTime, endTime, now, cacheHotWindowMs }) {
  return (
    startTime !== undefined &&
    endTime !== undefined &&
    Number(endTime) < now - cacheHotWindowMs
  );
}

function toCoverageRange(candles) {
  if (!Array.isArray(candles) || candles.length === 0) {
    return null;
  }

  return {
    startTime: candles[0].timestamp,
    endTime: candles[candles.length - 1].timestamp
  };
}

function buildCandlesResponse({ provider, symbol, timeframe, candles }) {
  return {
    provider,
    symbol,
    timeframe,
    count: candles.length,
    candles
  };
}

export function createMarketDataService({
  providerRegistry,
  marketDataRepository,
  cacheHotWindowMs = 5 * 60 * 1000,
  nowProvider = () => Date.now()
}) {
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
      const shouldPreferCache = isHistoricalCacheWindow({
        startTime,
        endTime,
        now: nowProvider(),
        cacheHotWindowMs
      });

      if (shouldPreferCache) {
        const hasCoverage = await marketDataRepository.hasCoverage({
          providerName: provider,
          symbol,
          timeframe,
          startTime,
          endTime
        });

        if (hasCoverage) {
          const cachedCandles = await marketDataRepository.listCandlesByRange({
            providerName: provider,
            symbol,
            timeframe,
            startTime,
            endTime,
            limit
          });

          if (cachedCandles.length > 0) {
            return buildCandlesResponse({
              provider,
              symbol,
              timeframe,
              candles: cachedCandles
            });
          }
        }
      }

      const upstreamCandles = await adapter.getCandles({
        symbol,
        timeframe,
        limit,
        startTime,
        endTime
      });

      if (upstreamCandles.length > 0) {
        await marketDataRepository.upsertCandles({
          providerName: provider,
          symbol,
          timeframe,
          candles: upstreamCandles
        });

        const coverageRange = toCoverageRange(upstreamCandles);

        if (coverageRange) {
          await marketDataRepository.mergeCoverage({
            providerName: provider,
            symbol,
            timeframe,
            startTime: coverageRange.startTime,
            endTime: coverageRange.endTime
          });
        }
      }

      if (shouldPreferCache) {
        const persistedCandles = await marketDataRepository.listCandlesByRange({
          providerName: provider,
          symbol,
          timeframe,
          startTime,
          endTime,
          limit
        });

        if (persistedCandles.length > 0) {
          return buildCandlesResponse({
            provider,
            symbol,
            timeframe,
            candles: persistedCandles
          });
        }
      }

      return buildCandlesResponse({
        provider,
        symbol,
        timeframe,
        candles: upstreamCandles
      });
    }
  };
}
