# Task Plan ? Integraci?n de backtesting frontend con market data real

- **Date**: 2026-04-28
- **Related Spec**: `docs/specs/2026-04-28-frontend-backtesting-market-data-integration.md`
- **Issue**: #22

## Objetivo
Conectar `/backtesting` al backend real usando hist?rico REST y websocket realtime, manteniendo el frontend JavaScript-first y sin meter charting prematuro.

## Tasks completadas
1. Crear servicio frontend REST de market data
2. Crear servicio frontend websocket de market data
3. Crear hook local `useBacktestingMarketData`
4. Definir timeframes locales del slice
5. Construir controles de s?mbolo/timeframe/refresh
6. Construir estado visible del stream
7. Construir tabla/lista de candles
8. Reemplazar el placeholder de `BacktestingPage`
9. Ajustar estilos m?nimos
10. A?adir pruebas frontend dirigidas
11. Dejar validaci?n manual reproducible

## Verificaci?n
- `corepack pnpm --filter @guarne/web run test`
- `corepack pnpm --filter @guarne/web run build`
- smoke manual sugerido:
  - abrir `/backtesting`
  - confirmar carga hist?rica
  - confirmar stream status y actualizaciones realtime

## Resultado esperado
El frontend valida end-to-end el flujo de market data sin saltarse el backend ni reintroducir arquitectura legacy.
