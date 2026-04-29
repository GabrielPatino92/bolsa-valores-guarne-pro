# Streaming realtime de Binance kline con resincronizaci?n backend-owned

- **Fecha**: 2026-04-28
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue relacionado**: #21

## Problema
El repo ya ten?a REST real de Binance (#19) y persistencia hist?rica Timescale (#20), pero no ten?a un contrato websocket real ni una estrategia de reconexi?n/resync. Sin eso, el frontend no pod?a recibir velas vivas de forma estable y la bandera `websocket` del registry era aspiracional.

## Decisi?n
Implementar el primer slice realtime con estas reglas:
- Binance Spot WebSocket como upstream
- backend como due?o de la conexi?n upstream
- backend expone su propio websocket a clientes internos/frontend
- resincronizaci?n con REST + DB despu?s de reconexiones
- mensajes del dominio normalizados (`status`, `snapshot`, `kline`, `error`)
- sin Redis en esta fase

## Alcance implementado
- contrato websocket de provider
- adapter websocket real de Binance para klines
- servicio de orquestaci?n realtime en backend
- ruta websocket backend `/ws/market-data`
- resincronizaci?n usando hist?rico reciente por REST + DB
- persistencia/upsert de vela viva y cerrada

## L?mites intencionales
- solo Binance
- solo klines
- un s?mbolo + timeframe por suscripci?n cliente
- sin order book, ticker o trades
- sin AsyncAPI todav?a
- sin integraci?n final del frontend en esta fase

## Protocolo de mensajes
### `status`
```json
{ "type": "status", "provider": "binance", "symbol": "BTCUSDT", "timeframe": "1m", "state": "connected" }
```

### `snapshot`
```json
{ "type": "snapshot", "provider": "binance", "symbol": "BTCUSDT", "timeframe": "1m", "count": 5, "candles": [] }
```

### `kline`
```json
{ "type": "kline", "provider": "binance", "symbol": "BTCUSDT", "timeframe": "1m", "candle": {}, "isClosed": false }
```

### `error`
```json
{ "type": "error", "code": "provider_websocket_error", "message": "..." }
```

## Aceptaci?n
- [x] existe contrato websocket de provider
- [x] existe adapter websocket real de Binance para klines
- [x] backend expone una ruta websocket propia para market data
- [x] m?ltiples clientes locales pueden colgarse del mismo upstream stream
- [x] cada update de kline se normaliza al modelo del dominio
- [x] las velas realtime se upsertean en DB
- [x] al reconectar, el backend hace resync contra hist?rico reciente
- [x] el cliente recibe al menos eventos `status`, `snapshot`, `kline`, `error`
- [x] no se introduce Redis en esta fase
- [x] no se conecta el frontend final en esta fase
