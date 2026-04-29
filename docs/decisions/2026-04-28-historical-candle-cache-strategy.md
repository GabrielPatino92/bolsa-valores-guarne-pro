# Decision — Historical candle cache strategy

- **Date**: 2026-04-28
- **Issue**: #20

## Decision

Use Timescale/PostgreSQL as the first persistence layer for historical candles and treat the provider adapter as an upstream refill source.

## Rationale

- repeated backtesting requests need deterministic historical reads
- Timescale is already part of local infra and fits OHLCV time-series storage
- adding Redis before durable storage would create two cache problems at once
- websocket streaming belongs to the next issue, not this one

## Operational notes

- DB-first reads are only used for closed historical windows
- recent/open windows still refresh from the provider and upsert the result
- coverage rows track which ranges were already hydrated without exposing cache metadata in the HTTP contract
