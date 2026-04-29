# Gu?a de implementaci?n actual ? Guarne Pro

## Este documento sustituye la gu?a legacy

La versi?n anterior de este archivo describ?a una implementaci?n basada en **Next.js + TypeScript + Binance directo**.
Esa gu?a ya **no es la fuente de verdad** para este repositorio.

## Baseline vigente

- Monorepo con `pnpm` + `turbo`
- Frontend oficial: **React + Vite + JavaScript**
- Backend oficial: **Fastify + JavaScript**
- Base de datos: **PostgreSQL**
- Auth: **JWT access + refresh con persistencia y rotaci?n**
- Contrato: **OpenAPI-first**

## Regla cr?tica para integraciones

Las integraciones con brokers/plataformas **no** se implementan directamente en el frontend.

### Correcto
- `apps/api/src/modules/providers/*` para cat?logo HTTP
- `apps/api/src/integrations/providers/contracts/*` para contratos
- `apps/api/src/integrations/providers/providers/*` para c?digo espec?fico por proveedor
- `apps/api/src/integrations/providers/registry.js` para resoluci?n por capacidad

### Incorrecto
- llamadas directas a SDKs de Binance/OKX/IBKR desde React
- mezclar cat?logo de proveedores con `auth`
- hacer `switch(provider)` dispersos por el backend

## Estado actual de #17

Ya existe la frontera inicial para:
- cat?logo de proveedores
- resoluci?n de adapters por capacidad
- stubs de Binance, OKX, Coinbase e IBKR
- primer adapter real de market data para Binance Spot REST

### Capacidades modeladas
- `marketData`
- `accountData`
- `orderExecution`
- `paperTrading`
- `websocket`

## Orden recomendado de implementaci?n real

1. A?adir streaming websocket y resincronizaci?n
2. Dise?ar persistencia de credenciales/conexiones por usuario
3. Luego conectar dashboard o backtesting UI a esos adapters

## Referencias vivas

- `docs/specs/2026-04-27-monorepo-js-baseline-openapi.md`
- `docs/specs/2026-04-27-apps-api-node-postgres-jwt-openapi.md`
- `docs/specs/2026-04-28-auth-data-model-jwt-alignment.md`
- `docs/specs/2026-04-28-provider-adapter-boundaries.md`
- `docs/decisions/2026-04-28-provider-adapter-registry.md`
