---
name: safe-tooling-install
description: >
  Installs or upgrades developer tooling with version checks, path validation, conflict checks, and rollback thinking.
  Trigger: Use for OpenCode, OpenClaw, Engram, Node, pnpm, Docker, or local toolchain setup work.
license: Apache-2.0
metadata:
  owner: bolsa-valores-guarne-pro
  version: "1.0"
---

## Safety protocol

1. verify current version and command path first
2. prefer official installers or documented commands
3. identify file-lock or PATH conflicts before replacing binaries
4. validate final version and command path after install
5. document recovery steps for the runbook
