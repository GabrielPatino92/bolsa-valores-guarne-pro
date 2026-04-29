# Credenciales y endpoints actuales ? Guarne Pro

## Estado real del stack (2026-04-28)

Este documento reemplaza la gu?a legacy de NestJS/Next.js.

### Verificado en esta sesi?n
- **Backend API**: Fastify en `http://localhost:4000`
- **Swagger/OpenAPI**: `http://localhost:4000/docs`
- **Health**: `http://localhost:4000/health`
- **PostgreSQL del repo**: `localhost:5433`
- **Docker engine**: activo
- **Postgres del repo**: contenedor `guarne-postgres`

### No verificado en esta sesi?n
- Grafana
- Prometheus
- MinIO
- Redis
- UI frontend completa m?s all? del scaffold Vite

## API backend (Fastify)

### URLs principales
- Base prefix: `http://localhost:4000/api/v1`
- Docs: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`
- WebSocket market data: `ws://localhost:4000/ws/market-data?provider=binance&symbol=BTCUSDT&timeframe=1m`

### Endpoints disponibles hoy
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/users/me`
- `GET /api/v1/providers`
- `GET /api/v1/providers/:providerName`
- `GET /api/v1/market-data/symbols?provider=binance`
- `GET /api/v1/market-data/candles?provider=binance&symbol=BTCUSDT&timeframe=1m`
- `WS /ws/market-data?provider=binance&symbol=BTCUSDT&timeframe=1m`


### WebSocket messages
El backend emite mensajes JSON normalizados del dominio:
- `status`
- `snapshot`
- `kline`
- `error`

Ejemplo de conexi?n desde navegador:
```js
const socket = new WebSocket(
  'ws://localhost:4000/ws/market-data?provider=binance&symbol=BTCUSDT&timeframe=1m'
);

socket.addEventListener('message', (event) => {
  console.log(JSON.parse(event.data));
});
```

### Ejemplo de registro
```http
POST http://localhost:4000/api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "username": "miusuario",
  "fullName": "Nombre Completo",
  "password": "MiPassword123!@#"
}
```

### Ejemplo de login
```http
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "MiPassword123!@#"
}
```

## Frontend web (Vite)

La app oficial ahora es **React + Vite + JavaScript**.

### Ruta esperada en desarrollo
- `http://localhost:5173`

### Estado actual
- Home, login, dashboard y backtesting son placeholders controlados.
- El frontend todav?a no consume el cat?logo de proveedores de forma real.
- El frontend ya puede apuntar a `VITE_WS_URL=ws://localhost:4000` para el stream de market data.
- Las integraciones con brokers quedan detr?s del backend (`issue #17`).

## PostgreSQL

### Conexi?n correcta del repo
```bash
docker exec -it guarne-postgres psql -U guarne_dev -d guarne_trading
```

```text
Host: localhost
Port: 5433
Database: guarne_trading
Username: guarne_dev
Password: guarne_dev_pass_2024
```

### Nota importante
`5432` est? ocupado por otro proyecto (`timescaledb`).
**No** reutilizarlo para este repo.

## Docker Compose

### Servicios definidos por el compose
- `postgres`
- `redis`
- `minio`
- `prometheus`
- `grafana`

### Comandos ?tiles
```bash
docker compose -f infra/docker-compose.dev.yml ps
docker compose -f infra/docker-compose.dev.yml up -d postgres
docker compose -f infra/docker-compose.dev.yml logs -f postgres
```

## Seguridad / alcance

- Las credenciales aqu? listadas son solo para desarrollo local.
- El cat?logo de proveedores ya tiene market data REST y websocket para Binance.
- Los dem?s adapters siguen siendo stubs hasta nuevos issues.
