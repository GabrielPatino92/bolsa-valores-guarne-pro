# Conectar la UI de backtesting del frontend al market data real del backend

- **Fecha**: 2026-04-28
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue relacionado**: #22

## Problema
El frontend `apps/web` ya ten?a scaffold limpio y ruta `/backtesting`, pero segu?a siendo placeholder puro. Mientras tanto, el backend ya expon?a hist?rico REST y realtime websocket para market data.

## Decisi?n
Implementar la primera UI real de backtesting con estas reglas:
- provider fijo: `binance`
- hist?rico por REST
- realtime por websocket backend-owned
- estado local de feature
- timeframes locales temporales mientras `#24` siga abierto
- sin charting complejo todav?a

## Alcance implementado
- servicio frontend REST de market data
- servicio frontend websocket de market data
- hook local `useBacktestingMarketData`
- controles de s?mbolo/timeframe/refresh
- estado visible del stream
- tabla de velas recientes
- estados expl?citos de loading/error/empty

## L?mites intencionales
- sin charting avanzado
- sin store global
- sin auth compleja
- sin consumo directo de `packages/shared` mientras #24 siga abierto

## Aceptaci?n
- [x] `/backtesting` deja de ser placeholder puro
- [x] el frontend carga s?mbolos desde el backend
- [x] el frontend carga hist?rico de candles desde el backend
- [x] el frontend abre websocket hacia `/ws/market-data`
- [x] el usuario puede cambiar s?mbolo y timeframe
- [x] la UI solo ofrece timeframes soportados por el slice actual
- [x] la UI muestra estados expl?citos de loading/error/empty
- [x] la UI muestra estado del stream realtime
- [x] los mensajes `kline` actualizan la lista local de velas sin duplicados por timestamp
- [x] no se introduce charting complejo en esta fase
- [x] no se reintroduce arquitectura legacy de Next.js/TypeScript
- [x] existe validaci?n reproducible del flujo
