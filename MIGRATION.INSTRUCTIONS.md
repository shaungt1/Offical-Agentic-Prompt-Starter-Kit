---
name: agent-framework-migration
description: "Non-destructive agentic migration instructions for integrating existing skills, tasks, instructions, prompts, rules, agents, workflows, tools, memory, and vendor control files into the framework."
version: 0.4.0
type: migration-instructions
status: active
---

# MIGRATION INSTRUCTIONS

## PURPOSE

Use these instructions after the framework has been installed or linked into an **existing** project that already contains agent customization.

A migration is not a mass file move.

A correct migration:

1. discovers what already exists;
2. determines what each artifact actually does;
3. maps it to the closest canonical artifact type;
4. detects duplication and conflicts;
5. preserves vendor-native files when needed;
6. creates a dry-run plan;
7. copies, links, adapts, or leaves files in place according to that plan;
8. updates root manifests and pointers;
9. verifies the agent can still use the project.

## NON-DESTRUCTIVE RULE

During migration:

- never delete the only copy of a file;
- never overwrite a conflicting artifact silently;
- never rewrite an unknown prompt/instruction simply to fit a filename;
- never move a vendor-required entry file out of its discovery path unless the replacement has been verified;
- never change semantics merely to make the directory tree look cleaner;
- create backups before replacement or merge operations;
- prefer copy + verification before any removal.

## PHASE 1 — INVENTORY

Search the repository for agent-control artifacts.

### Agent and project context

```text
AGENTS.md
AGENTS.override.md
CLAUDE.md
CLAUDE.local.md
QWEN.md
GEMINI.md
replit.md
.github/copilot-instructions.md
```

### Instructions and rules

```text
.github/instructions/**/*.instructions.md
.claude/rules/**/*.md
.cursor/rules/**/*.mdc
rules/**/*.md
.cursorrules
.windsurfrules
```

### Skills

```text
.github/skills/**/SKILL.md
.claude/skills/**/SKILL.md
.agents/skills/**/SKILL.md
skills/**/SKILL.md
```

### Prompts

```text
.github/prompts/**/*.prompt.md
prompts/**/*.md
prompt-engineering/**/*
commands/**/*.md
```

### Tasks and plans

```text
_tasks/**/*
task/**/*
docs/tasks/**/*
PLANS.md
plans/**/*
```

### Workflows / hooks / tools

```text
workflows/**/*
.github/hooks/**/*
hooks/**/*
.mcp.json
.vscode/mcp.json
mcp.json
tools/**/*
```

### Memory / identity / state

```text
MEMORY.md
memory/**/*
SOUL.md
IDENTITY.md
USER.md
DREAMS.md
BOOTSTRAP.md
BOOT.md
HEARTBEAT.md
AURA*.md
```

Produce an inventory table before proposing changes.

| Source | Detected Type | Vendor / Scope | Current Purpose | Canonical Mapping | Conflict? | Proposed Action |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## PHASE 2 — CLASSIFY BY SEMANTIC PURPOSE

Do not classify by filename alone.

Use this distinction:

| Artifact Type | Semantic Test |
|---|---|
| Rule | Is this an ongoing constraint or requirement? |
| Mode | Is this a triggered stance/output switch with no execution? |
| Instruction | Is this reusable scoped guidance? |
| Prompt | Is this a reusable invocation/request template? |
| Task | Is this a concrete unit of work with completion criteria? |
| Plan | Is this an instance-specific sequence for completing work? |
| Workflow | Is this a reusable multi-step process? |
| Skill | Is this a reusable focused procedure that may bundle resources/scripts? |
| Skill Set | Does it coordinate several related Skills? |
| Capability | Does it coordinate several Skill Sets into a broad ability? |
| Agent | Is this a persistent role with tools/instructions/delegation boundaries? |
| Tool | Is this a callable action interface with inputs/outputs/side effects? |
| Reference | Is this supporting knowledge rather than operating behavior? |
| Memory | Is this retained experience or learned context? |
| Identity | Does this define who the agent is/presents as? |
| Vendor Entry File | Is this primarily the runtime's native project entry/control file? |

If one file contains several unrelated artifact types, do not automatically split it. First write a migration proposal showing the logical separation.

## PHASE 3 — MAP TO CANONICAL ROOTS

| Existing Content | Canonical Root |
|---|---|
| Skills / Skill Sets / Capabilities | `skills/` + `skills/SKILLS.md` |
| Rules | `rules/` + `rules/RULES.md` |
| Modes | `modes/` + `modes/MODES.md` |
| Reusable Instructions | `instructions/` + `instructions/INSTRUCTIONS.md` |
| Tasks / Task Lists | `task/` + `task/TASKS.md` |
| Plans | `plans/` + `plans/PLANS.md` |
| Workflows | `workflows/` + `workflows/WORKFLOWS.md` |
| Agents / subagents / overrides | `agents/` + `agents/AGENTS.md` |
| Tool definitions | `tools/` + `tools/TOOLS.md` |
| Episodic / Implicit memory | `memory/` + `memory/MEMORY.md` |
| Identity | `identity/` + `identity/IDENTITY.md` |
| Emulation | `emulation/` |
| Heartbeat | `telemetry/HEARTBEAT.md` |
| Aura | `state/AURA.STATE.md` |
| Prompt-engineering methodology/frameworks | `prompt_engineering/` or project-selected prompt root |
| Reusable, explicitly-invoked prompts (`*.prompt.md`) | `prompts/` + `prompts/PROMPTS.md` |
| Research / proposals | `documentation/` |

Canonical roots do not override vendor discovery requirements.

## PHASE 4 — DUPLICATE AND CONFLICT ANALYSIS

For every candidate:

### IDENTICAL

Same semantics and equivalent content.

Action: keep one canonical definition and point adapters to it where possible.

### OVERLAPPING

Same subject but one contains additional valid rules.

Action: propose a merge. Preserve source provenance.

### CONFLICTING

Two active files give incompatible instructions.

Action:

1. identify the exact conflict;
2. identify precedence if the runtime/user already defines it;
3. prefer newer explicit user/project instruction over older inference;
4. ask the user when the correct policy cannot be determined safely;
5. do not silently choose based on filename.

### VENDOR-NATIVE

The file is required in its current location.

Action: keep it, minimize duplication, and add a pointer to canonical resources.

## PHASE 5 — CREATE THE DRY-RUN PLAN

Create:

```text
MIGRATION-PLAN.md
```

or another user-approved temporary location.

Use:

| # | Source | Destination / Adapter | Action | Reason | Backup | Manifest Update | User Decision |
|---:|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

Allowed actions:

- `KEEP`
- `COPY`
- `ADAPT`
- `MERGE`
- `LINK`
- `POINTER`
- `RENAME`
- `ARCHIVE`
- `SKIP`
- `NEEDS-DECISION`

No filesystem modifications occur during the dry-run phase unless the user explicitly asked for immediate migration.

## PHASE 6 — ARTIFACT-SPECIFIC MIGRATION

### Skills

A canonical Skill should live in its own folder:

```text
<skill-name>/
└── SKILL.md
```

Follow `skill.specification.md`.

Do not turn every reusable prompt into a Skill automatically. A Skill should encode a reusable capability/procedure.

### Skill Sets / Capabilities

Use the Skill hierarchy only when actual composition exists.

```text
CAPABILITY
   └── SKILL SET
          └── SKILL
```

Update all three manifests in `skills/SKILLS.md`.

### Tasks

Preserve active task IDs, dates, links, and completion state.

Do not duplicate already-completed work.

Follow both:

```text
task.specification.md
task/TASK-MANAGEMENT.INSTRUCTIONS.md
```

### Instructions / Rules

Do not copy the same project rule into several vendor directories unless the runtime requires it.

Prefer one canonical instruction/rule plus native pointers/imports/adapters.

### Prompt Engineering

Preserve advanced prompt frameworks as methodology under `prompt_engineering/`, distinct from the actual reusable, explicitly-invoked prompt files that belong under `prompts/` (see `prompts/PROMPTS.md` for the difference).

Do not flatten a prompt framework library into general instructions.

Preserve router/index behavior.

### Agents

Keep vendor custom-agent files in native discovery locations when required.

Register the conceptual agent in the canonical `agents/AGENTS.md` manifest when the project uses that registry.

### Workflows / Plans

Do not confuse a current plan with a reusable workflow.

Repeated process -> Workflow.

Current execution instance -> Plan.

### MCP / Tools

Do not copy secrets or hardcoded credentials.

Preserve host-native MCP configuration if needed.

Register conceptual tools in `tools/TOOLS.md` when appropriate.

## PHASE 7 — APPLY SAFELY

Before changing each file:

1. confirm source still exists;
2. confirm destination state has not changed since the plan;
3. create backup if replacement/merge is involved;
4. make one bounded change;
5. validate the result;
6. record completion in the migration plan.

If the repository changes materially during migration, refresh the plan.

## PHASE 8 — UPDATE ROOT MANIFESTS

After an artifact is successfully integrated, update the appropriate root manifest.

Do not add rows for artifacts that do not exist.

Every path in a manifest must resolve.

Every version/status value should reflect the actual artifact.

## PHASE 9 — WIRE THE VENDOR ENTRY FILE

The project's active vendor/native entry file should point to the framework.

Do not inject all migrated content directly into the entry file.

Keep the pointer small.

## PHASE 10 — VALIDATE

Verify:

- original files are preserved or intentionally archived;
- no broken references were introduced;
- vendor-native discovery still works;
- Skills still resolve their bundled resources;
- root manifests point to real files;
- no secret was copied into the public framework;
- no duplicate active rule now conflicts with its canonical replacement;
- tasks retain status and traceability;
- agent tool permissions did not expand accidentally;
- no `.git/` directory was introduced inside the project;
- migration plan reflects final results.

## PHASE 11 — CLEANUP

Only after validation:

- remove temporary staging copies if safe;
- retain backups according to user policy;
- mark the migration plan complete;
- leave vendor adapters in place when required.

Do not delete migration backups automatically unless the user explicitly asks.
