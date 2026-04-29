# Task Plan ? apps/web con React + Vite + JavaScript

- **Date**: 2026-04-27
- **Related Spec**: `docs/specs/2026-04-27-apps-web-vite-js-scaffold.md`
- **Issue**: #13

## Objetivo

Reemplazar la estructura legacy de Next.js/TypeScript dentro de `apps/web` por un scaffold limpio que respete el baseline aprobado del monorepo.

## Tasks

1. Retirar artefactos estructurales de Next en `apps/web`
2. Crear nuevo `package.json` con Vite, React, router y Vitest
3. Crear shell base en `src/app`
4. Crear p?ginas placeholder para inicio, login, dashboard y backtesting
5. Definir boundary m?nimo de servicios con `env` y `httpClient`
6. A?adir configuraci?n local de ESLint para JavaScript/JSX
7. A?adir smoke test del shell
8. Ajustar `turbo.json` para convivir con `VITE_*` y con inputs JS/JSX

## Verificaci?n

- `npm run ai:doctor`
- `corepack pnpm --filter web build`
- `corepack pnpm --filter web test`

## Riesgos / Notes

- Si no hay dependencias instaladas localmente, build y test quedar?n pendientes de validaci?n.
- Este issue no migra l?gica real del frontend anterior; solo crea una base sana para los siguientes issues.
