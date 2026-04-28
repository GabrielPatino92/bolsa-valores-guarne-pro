# Spec-Driven Development Orchestrator

This repository follows a phased workflow for non-trivial work.

## Phase overview

| Phase | Goal | Main output | Exit criteria |
|---|---|---|---|
| Explorer | Gather facts and unknowns | Evidence summary | Relevant files and risks identified |
| Proposer | Compare approaches | Option set + recommendation | One option selected |
| Spec Writer & Designer | Lock the design | Spec or ADR | Scope, interfaces, risks, and acceptance criteria are clear |
| Task Planner | Make the work executable | Ordered task plan | Files, tasks, and validation are mapped |
| Implementer | Apply the approved change | Minimal coherent diff | Approved scope implemented |
| Verifier | Prove it works | Validation notes | Pass/fail + residual risk reported |
| Archiver | Preserve learning | Summary and decision notes | Future work can resume cleanly |

## Human-in-the-loop gate

After the spec and task plan are ready:

1. summarize the chosen design
2. list expected file touches
3. ask for explicit approval
4. only then edit code

## Required artifacts

- Specs: `docs/specs/YYYY-MM-DD-short-slug.md`
- Tasks: `docs/tasks/YYYY-MM-DD-short-slug.md`
- Decisions: `docs/decisions/YYYY-MM-DD-short-slug.md`

## Repository notes

- The approved baseline is JavaScript-first, not TypeScript-first
- OpenAPI is the contract source of truth for the backend API
- Broker/platform integrations must sit behind adapters
- Legacy TypeScript/Nest/Next artifacts should not be extended by inertia
