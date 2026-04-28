---
name: sdd-orchestrator
description: >
  Runs Spec-Driven Development in explicit phases with a hard human approval gate before implementation.
  Trigger: Use for architecture, scaffolding, refactors, security work, integration boundaries, or any task that spans multiple files or decisions.
license: Apache-2.0
metadata:
  owner: bolsa-valores-guarne-pro
  version: "1.0"
---

## Required Phase Order

1. Explorer
2. Proposer
3. Spec Writer & Designer
4. Task Planner
5. Human approval gate
6. Implementer
7. Verifier
8. Archiver

## Mandatory outputs

- Spec: `docs/specs/YYYY-MM-DD-short-slug.md`
- Task plan: `docs/tasks/YYYY-MM-DD-short-slug.md`
- Decision note when architecture changes: `docs/decisions/YYYY-MM-DD-short-slug.md`

## HITL gate

Before any code change:

1. summarize the chosen design
2. list planned file touches
3. ask for explicit approval
4. only then implement

## Anti-patterns

- jumping from discovery to edits
- silently keeping legacy stack assumptions alive
- treating Swagger UI as a substitute for OpenAPI governance
- claiming done without targeted verification
