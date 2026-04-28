import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "AGENTS.md",
  "opencode.json",
  ".agents/skills/sdd-orchestrator/SKILL.md",
  ".agents/skills/repo-guardrails/SKILL.md",
  ".agents/skills/guarne-monorepo-architecture/SKILL.md",
  ".agents/skills/safe-tooling-install/SKILL.md",
  ".opencode/agents/architect.md",
  ".opencode/agents/explorer.md",
  ".opencode/agents/proposer.md",
  ".opencode/agents/spec-writer.md",
  ".opencode/agents/task-planner.md",
  ".opencode/agents/implementer.md",
  ".opencode/agents/verifier.md",
  ".opencode/agents/archiver.md",
  ".opencode/.gitignore",
  "docs/ai/sdd-orchestrator.md",
  "docs/specs/README.md",
  "docs/specs/2026-04-27-monorepo-js-baseline-openapi.md",
  "docs/tasks/README.md",
  "docs/tasks/2026-04-27-monorepo-js-baseline-openapi.md",
  "docs/decisions/README.md",
  "docs/decisions/2026-04-27-js-monorepo-baseline.md",
  "docs/templates/spec-template.md",
  "docs/templates/task-plan-template.md",
  "docs/templates/decision-template.md"
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));

let configError = null;
let opencodeConfig = null;
try {
  opencodeConfig = JSON.parse(readFileSync(join(root, "opencode.json"), "utf8"));
} catch (error) {
  configError = error instanceof Error ? error.message : String(error);
}

const agentDir = join(root, ".opencode/agents");
const skillDir = join(root, ".agents/skills");

const agents = existsSync(agentDir)
  ? readdirSync(agentDir).filter((file) => file.endsWith(".md")).sort()
  : [];

const skills = existsSync(skillDir)
  ? readdirSync(skillDir).sort()
  : [];

const summary = {
  ok: missing.length === 0 && !configError,
  defaultAgent: opencodeConfig?.default_agent ?? null,
  agents,
  skills,
  missing,
  configError
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exitCode = 1;
}
