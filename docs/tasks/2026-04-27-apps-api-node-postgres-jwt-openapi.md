# Task Plan - `apps/api` Node.js + PostgreSQL + JWT + OpenAPI

- **Fecha**: 2026-04-27
- **Issue**: #14

## Tareas

1. Retirar artefactos estructurales de NestJS/TypeScript.
2. Crear `package.json` JavaScript-first para `apps/api`.
3. Crear bootstrap HTTP con Fastify.
4. Crear módulo `health`.
5. Crear infraestructura PostgreSQL base con `pg`.
6. Crear módulo `auth` con hashing y JWT.
7. Crear endpoint autenticado de prueba (`GET /users/me`).
8. Integrar OpenAPI-first y Swagger UI.
9. Añadir manejo centralizado de errores.
10. Ajustar envs mínimos entre backend y frontend scaffold.
11. Verificar con `ai:doctor`, `pnpm --filter api build` y `pnpm --filter api test`.

## Verificación

- `npm run ai:doctor`
- `corepack pnpm --filter api build`
- `corepack pnpm --filter api test`
- Smoke tests de `/health`, `/api/v1/auth/*` y `/api/v1/users/me`
