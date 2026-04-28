# Task plan ? Binance Spot market data via REST

- **Date**: 2026-04-28
- **Related Spec**: `docs/specs/2026-04-28-binance-spot-market-data-rest.md`
- **Issue**: #19

## Task 1 ? Add market-data module
- Create provider-aware routes and service
- Verification: `GET /api/v1/market-data/*` exists in OpenAPI/runtime

## Task 2 ? Implement Binance REST client + adapter
- Add encapsulated client around public REST endpoints
- Implement `getSymbols()` and `getCandles()`
- Verification: unit tests for symbol filtering, candle mapping, and unsupported timeframes

## Task 3 ? Register module in the Fastify app
- Wire module through `createApp`
- Verification: app inject can hit market-data routes

## Task 4 ? Document contract and env surface
- Update OpenAPI and env examples
- Verification: `/docs/json` exposes `0.4.0` and market-data paths

## Task 5 ? Verify narrow surface
- Run `npm run ai:doctor`
- Run `corepack pnpm --filter @guarne/api run build`
- Run `corepack pnpm --filter @guarne/api run test`
