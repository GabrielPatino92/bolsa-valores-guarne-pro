# Provider adapter boundaries for Guarne Pro

- **Date**: 2026-04-28
- **Owner**: Senior Architect + HITL
- **Status**: implemented
- **Issue**: #17

## Problem

The repo already has a provider catalog in PostgreSQL, but before this issue there was no backend boundary separating:

1. provider catalog metadata
2. user/provider credentials and connections
3. provider-specific operational adapters

That gap would have pushed the project toward direct Binance/OKX/IBKR conditionals inside auth, backtesting, or dashboard code.

## Decision

Adopt a **capability-first provider registry** in the backend.

- `modules/providers/*` owns the provider catalog HTTP surface.
- `integrations/providers/contracts/*` defines capability contracts.
- `integrations/providers/providers/*` hosts provider-specific adapter stubs.
- `integrations/providers/registry.js` resolves adapters by `providerName + capability`.

## Scope implemented in this issue

- `GET /api/v1/providers`
- `GET /api/v1/providers/:providerName`
- provider repository against PostgreSQL `providers`
- capability registry for:
  - `marketData`
  - `accountData`
  - `orderExecution`
  - `paperTrading`
  - `websocket`
- initial adapter stubs for Binance, OKX, Coinbase, and IBKR

## Intentional non-goals

- no real SDK integrations yet
- no credential persistence yet
- no websocket streaming yet
- no direct frontend calls to provider SDKs

## Risks

- provider capability flags are currently sourced from the registry, not the database
- `packages/shared/src/types/timeframes.ts` still carries transitional provider mapping helpers
- legacy docs outside this issue may still mention obsolete Nest/Next patterns

## Acceptance criteria

- [x] provider catalog no longer hangs off `auth`
- [x] backend exposes a dedicated `providers` module
- [x] a registry resolves adapters by provider + capability
- [x] provider-specific stubs live behind contracts
- [x] OpenAPI documents the provider catalog endpoints
- [x] legacy integration docs are corrected or explicitly redirected
