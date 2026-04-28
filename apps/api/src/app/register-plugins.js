import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { registerOpenApi } from '../openapi/register-openapi.js';

export async function registerPlugins(app, { env, specPath }) {
  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    }
  });

  await app.register(helmet, {
    contentSecurityPolicy: false
  });

  await app.register(rateLimit, {
    max: env.rateLimitMaxRequests,
    timeWindow: env.rateLimitWindowMs
  });

  await app.register(jwt, {
    secret: env.jwtSecret
  });

  app.decorate('authenticate', async function authenticate(request) {
    await request.jwtVerify();
  });

  await registerOpenApi(app, { specPath });
}
