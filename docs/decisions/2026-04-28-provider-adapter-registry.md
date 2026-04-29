# Decision ? Provider adapter registry

- **Date**: 2026-04-28
- **Status**: accepted
- **Issue**: #17

## Decision

Use a capability-first provider registry instead of wiring providers through auth or scattering `switch(provider)` logic across modules.

## Why

- keeps the provider catalog independent from authentication
- allows each provider to expose only the capabilities it actually supports
- makes future SDK adoption incremental
- keeps frontend integrations behind backend boundaries

## Immediate consequences

- provider catalog lives under `/api/v1/providers`
- provider-specific code lives under `apps/api/src/integrations/providers/providers/*`
- direct provider details (for example Binance-specific timeframe mapping) are transitional and should migrate out of shared domain models over time
