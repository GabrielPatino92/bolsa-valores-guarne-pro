# Decisión — Baseline JavaScript-first sobre monorepo pnpm/turbo

- **Date**: 2026-04-27
- **Status**: accepted
- **Related Issue**: #11

## Context

El repo canónico ya existe como monorepo y contiene artefactos legacy orientados a Next.js/NestJS/TypeScript. El usuario decidió que la nueva dirección del proyecto será JavaScript-first, manteniendo monorepo y reforzando contratos y validación.

## Decision

Se aprueba el siguiente baseline:

- mantener `pnpm` + `turbo`
- usar React + Vite + JavaScript para `apps/web`
- usar Node.js + PostgreSQL + JWT para `apps/api`
- usar OpenAPI-first como contrato público de la API
- usar Swagger UI como herramienta de inspección y Redocly como lint/documentación
- encapsular brokers y plataformas detrás de adapters

## Consequences

- el repo entra en una fase de transición desde artefactos legacy TypeScript a una base JavaScript-first
- sin TypeScript, la calidad dependerá más de validación, contratos, tests y límites de módulos
- el bootstrap cognitivo debe alinearse con esta arquitectura para evitar decisiones contradictorias
