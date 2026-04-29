# Primer adapter real de Binance Spot market data v?a REST p?blica

- **Date**: 2026-04-28
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue**: #19

## Problem

The provider registry is now in place, but Binance market data was still a stub. Without one real adapter, the architecture remained unproven for symbols, candles, and provider-aware HTTP access.

## Decision

Implement the first real market-data slice using Binance Spot public REST endpoints.

- `GET /api/v3/exchangeInfo` for symbol discovery
- `GET /api/v3/klines` for historical candles
- provider-aware backend routes under `/api/v1/market-data/*`
- no websocket yet
- no persistence/cache yet

## Scope implemented

- real `getSymbols()` for Binance
- real `getCandles()` for Binance
- provider-aware market data routes:
  - `GET /api/v1/market-data/symbols`
  - `GET /api/v1/market-data/candles`
- validation for `symbol`, `timeframe`, `limit`, `startTime`, `endTime`
- mapping Binance kline arrays to normalized candle objects
- OpenAPI update to `0.4.0`

## Intentional non-goals

- no websocket streaming
- no Timescale/PostgreSQL candle persistence
- no frontend integration yet
- no synthetic aggregation for unsupported Binance intervals

## Acceptance criteria

- [x] Binance market data adapter is real, not stub, behind the registry
- [x] backend exposes provider-aware symbols/candles routes
- [x] only Binance-supported timeframes are accepted
- [x] kline arrays are mapped to normalized candle objects
- [x] OpenAPI documents symbols/candles routes and errors
- [x] tests cover mapping and validation boundaries
