# Bolsa de Valores Guarne Pro

Plataforma de trading en construcción con una arquitectura base aprobada para evolucionar de forma ordenada.

> **Estado actual**
>
> Este repositorio contiene artefactos legacy orientados a Next.js/NestJS/TypeScript, pero la **arquitectura aprobada a partir del 27 de abril de 2026** es:
>
> - monorepo con `pnpm` + `turbo`
> - `apps/web` con **React + Vite + JavaScript**
> - `apps/api` con **Node.js + PostgreSQL + JWT**
> - **OpenAPI-first** como contrato de API
> - adapters para brokers/plataformas de trading

## Arquitectura aprobada

### Baseline

- **Monorepo**: `pnpm workspaces` + `turbo`
- **Frontend target**: React + Vite + JavaScript
- **Backend target**: Node.js modular monolith
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh)
- **API contract**: OpenAPI-first
- **API exploration**: Swagger UI
- **API lint/docs**: Redocly

### Decisión importante

La implementación inicial será **JavaScript-first, sin TypeScript**.

Eso obliga a compensar con:

- validación explícita en límites de entrada/salida
- contratos OpenAPI mantenidos
- smoke tests y verificación dirigida
- manejo centralizado de errores
- límites de módulos claros

## Estructura del repo

```text
bolsa-valores-guarne-pro/
├── apps/
│   ├── web/         # Target: React + Vite + JavaScript
│   └── api/         # Target: Node.js + PostgreSQL + JWT
├── packages/        # Reuso real y justificado
├── infra/           # Docker, Postgres y soporte local
├── docs/            # Specs, tasks, decisiones y runbooks
├── scripts/         # Utilidades locales y verificación
├── AGENTS.md        # Contrato operativo para agentes
└── opencode.json    # Configuración de proyecto para OpenCode
```

## Workflow cognitivo / SDD

Este repo se opera con:

- **OpenCode**
- **Engram**
- **OpenClaw**
- **Spec-Driven Development**
- **Human in the Loop**

### Gate obligatorio antes de editar código

1. Explorer
2. Proposer
3. Spec Writer & Designer
4. Task Planner
5. **Aprobación humana explícita**
6. Implementer
7. Verifier
8. Archiver

Lee:

- [`AGENTS.md`](./AGENTS.md)
- [`docs/ai/sdd-orchestrator.md`](./docs/ai/sdd-orchestrator.md)

## Doctor del bootstrap

Para validar que el bootstrap cognitivo está instalado:

```bash
corepack pnpm run ai:doctor
# o, si solo quieres validar el bootstrap local
npm run ai:doctor
```

Debe devolver:

- `"ok": true`
- `"defaultAgent": "architect"`

## OpenAPI / Swagger

El contrato público del backend debe definirse en OpenAPI.

Principio:

- **OpenAPI** = contrato
- **Swagger UI** = exploración y prueba
- **Redocly** = lint y documentación

Scripts ya presentes en el repo:

```bash
corepack pnpm api:docs
corepack pnpm api:lint
corepack pnpm generate:sdk
```

## Documentos base de arquitectura

- [`docs/specs/2026-04-27-monorepo-js-baseline-openapi.md`](./docs/specs/2026-04-27-monorepo-js-baseline-openapi.md)
- [`docs/tasks/2026-04-27-monorepo-js-baseline-openapi.md`](./docs/tasks/2026-04-27-monorepo-js-baseline-openapi.md)
- [`docs/decisions/2026-04-27-js-monorepo-baseline.md`](./docs/decisions/2026-04-27-js-monorepo-baseline.md)

## Backlog guía

Issues base:

- [#11 arquitectura base](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/11)
- [#12 bootstrap cognitivo](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/12)
- [#13 frontend React + Vite](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/13)
- [#14 backend Node + PostgreSQL + JWT](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/14)
- [#15 seguridad, datos y JWT](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/15)
- [#16 runbook operativo](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/16)
- [#17 adapters de brokers](https://github.com/GabrielPatino92/bolsa-valores-guarne-pro/issues/17)

## Nota de transición

Si encuentras referencias a:

- Next.js
- NestJS
- TypeScript
- Clean Architecture previa

trátalas como **estado legacy o en transición**, no como baseline final aprobado para el nuevo rumbo del proyecto.
