# Bolsa Valores Guarne Pro — Agent Operating Manual

This repository is operated with a Spec-Driven Development (SDD) workflow and a strict human-in-the-loop gate.

## Non-negotiable rules

1. **Concepts first, code second.** Explain models, tradeoffs, and boundaries before implementation.
2. **No vibe coding.** If a request skips design, stop and force a short design pass.
3. **Human approval is mandatory before code edits.** Explorer, Proposer, Spec Writer & Designer, and Task Planner must happen first.
4. **Architectural truth beats repo inertia.** This repo currently contains legacy TypeScript-oriented scaffolding, but the approved baseline moving forward is JavaScript-first.
5. **Use lazy skill loading.** Read only the relevant skill or doc for the active phase.

## Approved baseline (2026-04-27)

- Monorepo stays on `pnpm` + `turbo`
- Frontend target: `apps/web` with **React + Vite + JavaScript**
- Backend target: `apps/api` with **Node.js + PostgreSQL + JWT**
- API contract target: **OpenAPI-first**, with Swagger UI for exploration and Redocly for lint/docs
- External broker/platform integrations must sit behind adapters

## Important transition note

The repository still contains legacy Next.js/NestJS/TypeScript artifacts under `apps/web` and `apps/api`.

Until migration issues are executed:

- treat those artifacts as **legacy reference state**
- do **not** extend them by inertia
- prefer the approved baseline and current architecture docs

## Project map

- `apps/web` — current frontend app area; target baseline is React + Vite + JavaScript
- `apps/api` — current backend app area; target baseline is Node.js modular monolith
- `packages/*` — shared code only when reuse is real and justified
- `infra/*` — local/dev infrastructure, docker, postgres, service support
- `docs/*` — architecture, decisions, specs, tasks, and runbooks
- `scripts/*` — local automation and doctor/recovery utilities
- `.agents/skills/*` — repo-local skills for SDD and architecture
- `.opencode/agents/*` — project-local OpenCode agents

## Standard commands

- `corepack pnpm install`
- `corepack pnpm run ai:doctor` (or `npm run ai:doctor` for bootstrap verification)
- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm build`

Only run broader checks when the scope justifies it.

## SDD artifact conventions

- Specs live in `docs/specs/`
- Task plans live in `docs/tasks/`
- Decisions live in `docs/decisions/`
- Workflow docs live in `docs/ai/`

Filename convention:

- `YYYY-MM-DD-short-slug.md`

## Skill registry (lazy load)

Load only what the current step needs:

- `.agents/skills/sdd-orchestrator/SKILL.md`
- `.agents/skills/repo-guardrails/SKILL.md`
- `.agents/skills/guarne-monorepo-architecture/SKILL.md`
- `.agents/skills/safe-tooling-install/SKILL.md`

## Agent registry

OpenCode project agents live in `.opencode/agents/`:

- `architect`
- `explorer`
- `proposer`
- `spec-writer`
- `task-planner`
- `implementer`
- `verifier`
- `archiver`

## Required phase order

1. Explorer
2. Proposer
3. Spec Writer & Designer
4. Task Planner
5. Human approval gate
6. Implementer
7. Verifier
8. Archiver

## Guardrails for this repo

- Do not start scaffolding before the baseline issue is approved
- Do not couple broker logic directly to HTTP controllers
- Do not treat Swagger UI as the contract; OpenAPI is the contract
- Without TypeScript, validation and tests become non-optional
- Keep `packages/*` lean; no speculative abstractions
