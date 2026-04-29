import { pingDatabase } from '../../infra/db/pool.js';

export async function healthRoutes(app) {
  app.get('/health', async () => {
    let databaseStatus = 'ok';

    try {
      await pingDatabase(app.db);
    } catch (error) {
      databaseStatus = 'degraded';
    }

    return {
      service: '@guarne/api',
      status: databaseStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        database: databaseStatus
      }
    };
  });
}
