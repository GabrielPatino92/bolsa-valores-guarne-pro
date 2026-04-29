# Task Plan — Historical candle persistence/cache

- **Date**: 2026-04-28
- **Related Spec**: `docs/specs/2026-04-28-historical-candle-persistence-cache.md`
- **Issue**: #20

## Task 1 — Add Timescale candle storage schema
- Files: `infra/postgres/init.sql`, `apps/api/src/modules/market-data/repository.js`
- Verification: schema bootstrap creates `market_candles` and `market_candle_coverage`

## Task 2 — Add market-data repository
- Files: `apps/api/src/modules/market-data/repository.js`
- Verification: can upsert candles, query by range, and merge coverage

## Task 3 — Upgrade market-data service to read-through cache
- Files: `apps/api/src/modules/market-data/service.js`, `apps/api/src/modules/market-data/routes.js`, `apps/api/src/app/create-app.js`
- Verification: historical cache hits avoid upstream calls; recent windows still refresh

## Task 4 — Add test doubles and regression coverage
- Files: `apps/api/test/helpers/create-memory-market-data-repository.js`, `apps/api/test/app.smoke.test.js`
- Verification: cache hit, cache miss, and hot-window tests pass

## Task 5 — Document the persistence strategy
- Files: `docs/specs/2026-04-28-historical-candle-persistence-cache.md`, `docs/tasks/2026-04-28-historical-candle-persistence-cache.md`, `docs/decisions/2026-04-28-historical-candle-cache-strategy.md`
- Verification: docs explain why Timescale raw candles ship before Redis/websocket/aggregates
