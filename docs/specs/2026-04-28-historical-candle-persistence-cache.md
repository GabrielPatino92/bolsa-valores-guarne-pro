# Persistencia y refresh de velas históricas en Timescale

- **Date**: 2026-04-28
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue**: #20

## Problem

The first Binance REST slice proved the provider-aware market-data architecture, but all candle reads still depended on live upstream calls. Without persistence, repeated backtesting requests would duplicate provider traffic and historical runs would remain non-deterministic.

## Decision

Add a Timescale-backed read-through cache for historical candles.

- raw candle persistence in `market_candles`
- coverage tracking in `market_candle_coverage`
- DB-first reads only for closed historical windows
- provider refresh for open or near-real-time windows
- no Redis and no websocket in this phase

## Scope implemented

- schema bootstrap for `market_candles` and `market_candle_coverage`
- Timescale hypertable creation when available
- Postgres repository for candle upserts, reads, and coverage merging
- market-data service updated from passthrough to read-through caching
- hot-window config to keep recent requests provider-refreshed
- tests for cache hit, cache miss fill, and recent-window refresh semantics

## Non-goals

- no Redis cache layer yet
- no websocket streaming yet
- no continuous aggregates yet
- no synthetic timeframe aggregation yet

## Acceptance criteria

- [x] historical candles persist in PostgreSQL/Timescale
- [x] closed historical requests can resolve from DB when coverage exists
- [x] cache misses fetch upstream, upsert candles, and merge coverage
- [x] recent/open requests still refresh against the provider
- [x] the market-data HTTP contract stays compatible with issue #19
- [x] tests cover cache hit, cache fill, and refresh boundaries
