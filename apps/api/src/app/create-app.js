import Fastify from 'fastify';
import { registerPlugins } from './register-plugins.js';
import {
  createPgRefreshTokenRepository,
  createPgUserRepository
} from '../modules/auth/repository.js';
import { createPgPool } from '../infra/db/pool.js';
import { registerErrorHandler } from '../shared/errors/register-error-handler.js';
import { loadEnv } from '../shared/env/load-env.js';
import { healthRoutes } from '../modules/health/routes.js';
import { authRoutes } from '../modules/auth/routes.js';
import { usersRoutes } from '../modules/users/routes.js';

export async function createApp(options = {}) {
  const env = loadEnv({
    ...process.env,
    ...(options.env ?? {})
  });

  const app = Fastify({
    logger:
      env.nodeEnv === 'test'
        ? false
        : {
            level: env.logLevel
          }
  });

  const pool = options.pool ?? createPgPool(env);
  const userRepository =
    options.userRepository ?? createPgUserRepository({ pool });
  const refreshTokenRepository =
    options.refreshTokenRepository ??
    createPgRefreshTokenRepository({ pool });

  app.decorate('config', env);
  app.decorate('db', pool);
  app.decorate('userRepository', userRepository);
  app.decorate('refreshTokenRepository', refreshTokenRepository);

  registerErrorHandler(app);
  await registerPlugins(app, { env, specPath: options.specPath });

  await app.register(healthRoutes);
  await app.register(authRoutes, {
    prefix: `${env.apiPrefix}/auth`
  });
  await app.register(usersRoutes, {
    prefix: `${env.apiPrefix}/users`
  });

  app.addHook('onClose', async () => {
    if (!options.pool && typeof pool.end === 'function') {
      await pool.end();
    }
  });

  await app.ready();
  return app;
}
