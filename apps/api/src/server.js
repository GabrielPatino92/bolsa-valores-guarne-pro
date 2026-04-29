import { createApp } from './app/create-app.js';

const app = await createApp();

async function start() {
  try {
    await app.listen({
      host: app.config.host,
      port: app.config.port
    });
  } catch (error) {
    app.log.error(error, 'Failed to start @guarne/api');
    process.exit(1);
  }
}

await start();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    app.log.info({ signal }, 'Shutting down @guarne/api');
    await app.close();
    process.exit(0);
  });
}
