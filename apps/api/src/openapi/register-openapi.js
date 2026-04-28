import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const defaultSpecPath = resolve(
  currentDirectory,
  '../../../../specs/openapi.yaml'
);

export async function registerOpenApi(app, { specPath } = {}) {
  await app.register(swagger, {
    mode: 'static',
    specification: {
      path: specPath ?? defaultSpecPath
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });
}
