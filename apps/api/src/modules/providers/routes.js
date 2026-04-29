import { createProvidersService } from './service.js';
import { providerNameSchema } from './schemas.js';

export async function providersRoutes(app) {
  const providersService = createProvidersService({
    providerRepository: app.providerRepository,
    providerRegistry: app.providerRegistry
  });

  app.get('/', async () => providersService.listProviders());

  app.get('/:providerName', async (request) => {
    const params = providerNameSchema.parse(request.params ?? {});
    return providersService.getProvider(params.providerName);
  });
}
