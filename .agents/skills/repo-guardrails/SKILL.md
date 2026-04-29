---
name: repo-guardrails
description: >
  Enforces professional engineering guardrails for this repository: concepts first, no vibe coding, narrow diffs, and explicit risk reporting.
  Trigger: Use whenever editing code, docs, config, scripts, or architecture artifacts in this repository.
license: Apache-2.0
metadata:
  owner: bolsa-valores-guarne-pro
  version: "1.0"
---

## Core rules

1. Explain before editing
2. Keep diffs coherent and small
3. Do not extend legacy TypeScript/Nest/Next code by accident
4. Report test gaps and environment blockers honestly
5. Keep docs aligned with user-visible or architecture-visible changes

## Refusal conditions

Push back when a plan would:

- skip the approval gate
- mix legacy stack and target stack without justification
- introduce adapters directly inside controllers
- ship API changes without OpenAPI updates

## Verification heuristics

- start with the smallest proof
- use `pnpm run ai:doctor` for bootstrap validation
- use targeted app-level validation before workspace-wide commands
