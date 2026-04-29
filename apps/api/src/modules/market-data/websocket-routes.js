import { ZodError } from 'zod';
import { AppError } from '../../shared/errors/app-error.js';
import { marketDataStreamQuerySchema } from './schemas.js';
import { createMarketDataRealtimeService } from './realtime-service.js';

function sendJson(socket, payload) {
  try {
    socket.send(JSON.stringify(payload));
  } catch {}
}

function closeSocket(socket, code, reason) {
  try {
    socket.close(code, reason);
  } catch {}
}

function toSocketErrorPayload(error) {
  if (error instanceof ZodError) {
    return {
      type: 'error',
      code: 'validation_error',
      message: 'Request validation failed',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    };
  }

  if (error instanceof AppError) {
    return {
      type: 'error',
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    };
  }

  return {
    type: 'error',
    code: 'internal_error',
    message: 'Unexpected websocket subscription error'
  };
}

export async function marketDataRealtimeRoutes(app) {
  const realtimeService = createMarketDataRealtimeService({
    providerRegistry: app.providerRegistry,
    marketDataRepository: app.marketDataRepository,
    resyncCandleLimit: app.config.marketDataRealtimeResyncCandleLimit
  });

  app.addHook('onClose', async () => {
    await realtimeService.close();
  });

  app.get('/ws/market-data', { websocket: true }, (socket, request) => {
    let unsubscribe = null;
    let isClosed = false;

    const cleanup = async () => {
      if (isClosed) {
        return;
      }

      isClosed = true;

      if (unsubscribe) {
        await unsubscribe();
        unsubscribe = null;
      }
    };

    socket.on('message', () => {});
    socket.once('close', () => {
      void cleanup();
    });
    socket.once('error', () => {
      void cleanup();
    });

    void (async () => {
      try {
        const query = marketDataStreamQuerySchema.parse(request.query ?? {});
        unsubscribe = await realtimeService.subscribeKlines({
          ...query,
          send(payload) {
            sendJson(socket, payload);
          }
        });

        if (isClosed && unsubscribe) {
          await unsubscribe();
          unsubscribe = null;
        }
      } catch (error) {
        request.log?.error?.(error);
        sendJson(socket, toSocketErrorPayload(error));
        closeSocket(
          socket,
          error instanceof ZodError || error instanceof AppError ? 1008 : 1011,
          'market-data subscription failed'
        );
      }
    })();
  });
}
