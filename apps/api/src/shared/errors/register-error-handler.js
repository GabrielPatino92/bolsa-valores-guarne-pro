import { ZodError } from 'zod';
import { AppError } from './app-error.js';

export function registerErrorHandler(app) {
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: 'not_found',
        message: `Route ${request.method} ${request.url} was not found`
      }
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (request.log) {
      request.log.error(error);
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'validation_error',
          message: 'Request validation failed',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null
        }
      });
    }

    if (error?.code === '23505') {
      return reply.status(409).send({
        error: {
          code: 'conflict',
          message: 'The requested resource already exists'
        }
      });
    }

    if (error?.statusCode === 401 || String(error?.code || '').startsWith('FST_JWT')) {
      return reply.status(401).send({
        error: {
          code: 'unauthorized',
          message: 'Authentication failed'
        }
      });
    }

    return reply.status(500).send({
      error: {
        code: 'internal_error',
        message: 'Unexpected server error'
      }
    });
  });
}
