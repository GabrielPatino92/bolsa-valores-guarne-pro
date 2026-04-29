# Task Plan ? Streaming realtime de Binance kline con resincronizaci?n backend-owned

- **Date**: 2026-04-28
- **Related Spec**: `docs/specs/2026-04-28-binance-realtime-websocket-resync.md`
- **Issue**: #21

## Objetivo
Implementar el primer slice realtime con Binance Spot WebSocket y resync apoyado en la capa hist?rica ya existente.

## Tasks completadas
1. **A?adir contrato websocket**
   - `apps/api/src/integrations/providers/contracts/websocket-adapter.js`
2. **Implementar adapter websocket Binance**
   - `apps/api/src/integrations/providers/providers/binance/websocket.js`
3. **Extender registry**
   - `apps/api/src/integrations/providers/registry.js`
4. **Crear servicio realtime**
   - `apps/api/src/modules/market-data/realtime-service.js`
5. **Exponer ruta websocket backend**
   - `apps/api/src/modules/market-data/websocket-routes.js`
6. **Integrar persistencia realtime**
   - reuse de `market-data/repository.js`
7. **A?adir tests**
   - `apps/api/test/app.smoke.test.js`
8. **Documentar operaci?n**
   - `docs/CREDENTIALS.md`
   - `docs/IMPLEMENTATION_GUIDE.md`

## Verificaci?n
- `npm run ai:doctor`
- `corepack pnpm --filter @guarne/api run build`
- `corepack pnpm --filter @guarne/api run test`
- smoke manual posterior sugerido:
  - `GET /health`
  - conectar a `ws://localhost:4000/ws/market-data?provider=binance&symbol=BTCUSDT&timeframe=1m`

## Resultado esperado
Backend controla upstream y downstream websocket sin exponer detalles de Binance al frontend y puede reconciliar gaps cortos con resync de las ?ltimas velas.
