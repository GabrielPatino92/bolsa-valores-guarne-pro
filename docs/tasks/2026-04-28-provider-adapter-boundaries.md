# Task plan ? Provider adapter boundaries

- **Date**: 2026-04-28
- **Related Spec**: `docs/specs/2026-04-28-provider-adapter-boundaries.md`
- **Issue**: #17

## Task 1 ? Add provider module
- Create PostgreSQL-backed provider repository
- Expose provider catalog routes under `/api/v1/providers`
- Verification: route returns catalog data from DB

## Task 2 ? Add integration contracts and registry
- Define contracts for market data, account data, and execution
- Register provider-specific stubs behind a capability registry
- Verification: registry resolves supported adapters and rejects unsupported combinations

## Task 3 ? Update API contract
- Document provider endpoints and capability schemas in OpenAPI
- Verification: `/docs/json` includes provider routes and schemas

## Task 4 ? Correct stale integration docs
- Rewrite `docs/CREDENTIALS.md`
- Rewrite `docs/IMPLEMENTATION_GUIDE.md`
- Verification: docs point to Fastify, Vite, PostgreSQL on 5433, and provider adapters behind backend boundaries

## Task 5 ? Verify narrow runtime surface
- Run `npm run ai:doctor`
- Run `corepack pnpm --filter @guarne/api run build`
- Run `corepack pnpm --filter @guarne/api run test`
- Verification: all pass with provider catalog coverage
