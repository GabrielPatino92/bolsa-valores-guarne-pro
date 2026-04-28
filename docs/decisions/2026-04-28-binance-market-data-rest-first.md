# Decision ? Binance market data starts with REST historical access

- **Date**: 2026-04-28
- **Status**: accepted
- **Issue**: #19

## Decision

Start the first real market-data adapter with Binance Spot public REST instead of combining REST, WebSocket, and persistence in one step.

## Why

- validates the provider registry with the smallest coherent slice
- historical candles are enough to unblock the next backtesting steps
- reduces complexity compared to immediate stream reconciliation

## Consequences

- timeframes are limited to native Binance intervals in this phase
- candle persistence is deferred to the next issue
- websocket remains a separate follow-up issue
