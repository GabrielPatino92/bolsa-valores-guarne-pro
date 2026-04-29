import { marketDataCandlesQuerySchema, marketDataSymbolsQuerySchema } from './schemas.js';
import { createMarketDataService } from './service.js';

export async function marketDataRoutes(app) {
  const marketDataService = createMarketDataService({
    providerRegistry: app.providerRegistry,
    marketDataRepository: app.marketDataRepository,
    cacheHotWindowMs: app.config.marketDataCacheHotWindowMs
  });

  app.get('/symbols', async (request) => {
    const query = marketDataSymbolsQuerySchema.parse(request.query ?? {});
    return marketDataService.getSymbols(query);
  });

  app.get('/candles', async (request) => {
    const query = marketDataCandlesQuerySchema.parse(request.query ?? {});
    return marketDataService.getCandles(query);
  });
}
