---
name: guarne-monorepo-architecture
description: >
  Provides the approved architecture baseline and transition rules for Guarne Pro.
  Trigger: Use before changing `apps/web`, `apps/api`, shared packages, auth, PostgreSQL, or broker integration boundaries.
license: Apache-2.0
metadata:
  owner: bolsa-valores-guarne-pro
  version: "1.0"
---

## Approved baseline

- Monorepo remains on `pnpm` + `turbo`
- `apps/web` target: React + Vite + JavaScript
- `apps/api` target: Node.js modular monolith
- PostgreSQL is the primary database
- JWT is the baseline auth model
- OpenAPI is the API contract source of truth
- Swagger UI is for exploration
- Redocly is for lint/docs
- broker/platform providers must sit behind adapters

## Transition rule

The repository still contains legacy Next.js/NestJS/TypeScript implementation artifacts.

Unless explicitly approved:

- do not deepen the legacy stack
- do not add new TypeScript-first modules by inertia
- use architecture docs as the source of truth for future work

## Structure boundaries

- `apps/web` — UI/runtime for end users
- `apps/api` — HTTP API, auth, validation, orchestration, data access
- `packages/*` — shared reuse only when justified
- `infra/*` — local/dev infrastructure and environment support

## Quality compensations for no TypeScript

- strict request/response validation
- explicit contracts in OpenAPI
- centralized error handling
- smoke tests and targeted checks
- clear module boundaries
