# Scaffold limpio de `apps/api` con Node.js, PostgreSQL, JWT y OpenAPI

- **Fecha**: 2026-04-27
- **Issue**: #14
- **Status**: approved

## Problema

`apps/api` estaba anclado a NestJS + TypeScript y eso chocaba con el baseline aprobado del repo: JavaScript-first, Node.js, PostgreSQL, JWT y OpenAPI-first.

## Objetivo

Sustituir la base estructural de `apps/api` por un scaffold limpio y verificable en JavaScript que deje preparado el terreno para auth, datos e integraciones futuras.

## Decisiones

- Se mantiene `apps/api` como backend oficial del monorepo.
- Se elimina la dependencia estructural de NestJS y TypeScript.
- El servidor HTTP usa **Fastify**.
- La persistencia base usa **pg** con pool.
- La validación de request usa **Zod**.
- La autenticación usa **JWT** con access token + refresh token mínimos.
- El contrato se define en `specs/openapi.yaml` y se expone vía Swagger UI.
- La arquitectura inicial es **modular monolith**.

## Estructura objetivo

```text
apps/api/
├── package.json
├── src/
│   ├── server.js
│   ├── app/
│   ├── infra/
│   ├── modules/
│   ├── openapi/
│   └── shared/
└── test/
```

## Acceptance Criteria

- [x] `apps/api` ya no depende estructuralmente de NestJS.
- [x] El scaffold nuevo corre como backend Node.js JavaScript-first.
- [x] Existe estructura modular mínima (`app`, `modules`, `infra`, `shared`).
- [x] Existe pool PostgreSQL base con `pg`.
- [x] Existe módulo auth mínimo con JWT.
- [x] Existe endpoint `GET /health`.
- [x] Existe validación de entrada con Zod.
- [x] Existe contrato OpenAPI base en `specs/openapi.yaml`.
- [x] Queda preparado el terreno para #15 y #17.
