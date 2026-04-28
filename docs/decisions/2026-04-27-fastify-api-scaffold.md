# Decisión - `apps/api` migra a Fastify JavaScript-first

- **Fecha**: 2026-04-27
- **Contexto**: issue #14

## Decisión

`apps/api` deja de usar NestJS + TypeScript como base estructural y adopta un scaffold en **Fastify + JavaScript + pg + JWT + OpenAPI-first**.

## Motivos

1. Alinearse con el baseline aprobado del repo.
2. Evitar una migración híbrida Nest/Node puro/TS/JS.
3. Mantener un backend modular con menos magia de framework.
4. Compensar la ausencia de TypeScript con contratos, validación y pruebas.

## Consecuencias

- El backend arranca sin transpilar.
- `specs/openapi.yaml` pasa a ser el contrato base.
- El detalle de migraciones, modelo relacional y refresh-token persistence queda para el issue #15.
