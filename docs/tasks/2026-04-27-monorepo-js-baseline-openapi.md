# Task Plan — Baseline arquitectónico del monorepo JS con OpenAPI

- **Date**: 2026-04-27
- **Related Spec**: `docs/specs/2026-04-27-monorepo-js-baseline-openapi.md`
- **Issue**: #11

## Objetivo

Formalizar y aterrizar la arquitectura base del repo canónico antes de iniciar scaffolding o implementación de negocio.

## Tasks

1. Crear artefacto formal de arquitectura
   - Files: `docs/specs/2026-04-27-monorepo-js-baseline-openapi.md`, `docs/decisions/2026-04-27-js-monorepo-baseline.md`
   - Verification: la spec cubre problema, contexto, goals, non-goals, diseño, riesgos y criterios de aceptación

2. Documentar la decisión de mantener monorepo con pnpm + turbo
   - Files: spec/ADR + `README.md`
   - Verification: se explica por qué se mantiene `pnpm`, `turbo` y el backend inicial como modular monolith

3. Documentar la decisión JavaScript-first sin TypeScript
   - Files: spec/ADR + `README.md`
   - Verification: quedan explícitas las compensaciones con validación, OpenAPI, tests y linting

4. Definir límites del frontend (`apps/web`)
   - Files: spec/ADR
   - Verification: responsabilidades, estructura mínima y stack objetivo documentados

5. Definir límites del backend (`apps/api`)
   - Files: spec/ADR
   - Verification: responsabilidades, Node.js, PostgreSQL, JWT, validación y errores documentados

6. Definir política OpenAPI-first
   - Files: spec/ADR + `README.md`
   - Verification: OpenAPI = contrato, Swagger = exploración, Redocly = lint/docs

7. Definir frontera de integraciones externas
   - Files: spec/ADR
   - Verification: adapters por proveedor y aislamiento de credenciales/errores/rate limits documentados

8. Vincular el baseline con el bootstrap cognitivo
   - Files: `AGENTS.md`, `docs/ai/sdd-orchestrator.md`
   - Verification: el flujo SDD y el gate HITL quedan alineados con la arquitectura base

## Riesgos / Notes

- El repo aún contiene artefactos legacy de Next/Nest/TypeScript
- No se debe empezar scaffolding fuerte antes de cerrar este baseline
- Sin TypeScript, la disciplina de validación y contrato no es opcional
