---
name: agents-entry-pointer
description: "Portable AGENTS.md entry file for the Offical-Agentic-Prompt-Starter-Kit. Copy this file into a consuming project's root (replacing <FRAMEWORK_ROOT>) to wire that project's agents to this framework."
version: 0.4.0
status: active
---

# AGENTS.md

> **If you are an AI coding agent reading this**, this is the repository-facing instruction file. Read this file before you read anything else in the repository it lives in.

## What this file is

This is the **portable entry pointer** for the Offical-Agentic-Prompt-Starter-Kit — a vendor-neutral library of specifications, root manifests, and runtime instructions for AI coding agents (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Qwen Code, and any other `AGENTS.md`-aware or MCP-capable agent).

Two ways this file gets used:

1. **Inside this repository** (`FRAMEWORK_ROOT` = `.`, this repo's own root) — it tells an agent working *on the framework itself* what everything here is for.
2. **Copied into another project** (`FRAMEWORK_ROOT` = wherever the framework was installed, e.g. `.agent-framework` or `.admin-local/shared_toolbox/agent-control-framework`) — it becomes that project's pointer into the shared framework. Replace every `<FRAMEWORK_ROOT>` below with the real relative path before copying.

## First: check whether this project already has native agent setup

Before relying on this file alone:

- **Claude Code / GitHub Copilot**: if the project has never been initialized for your runtime (no `CLAUDE.md`, no `.github/copilot-instructions.md`, no `.claude/` folder as applicable), run that runtime's own init flow first (e.g. `/init`) so a native control file exists. Then add the pointer block below to that native file rather than only relying on this one.
- This file (`AGENTS.md`) is itself a recognized native entry point for many agents (Codex, Cursor, generic `AGENTS.md`-aware runtimes) and needs no separate init step for those.

## What you will find in this framework

```text
<FRAMEWORK_ROOT>/README.md                      — repository-level routing and install guide (start here for setup)
<FRAMEWORK_ROOT>/AGENT-SETUP.INSTRUCTIONS.md     — how to install/wire this framework into a project
<FRAMEWORK_ROOT>/MIGRATION.INSTRUCTIONS.md       — how to integrate an existing project's agent-control files
<FRAMEWORK_ROOT>/INSTALL-FRAMEWORK.SH            — automated installer (local copy or Git URL source)
<FRAMEWORK_ROOT>/agent-specifications/specs/     — authoring contract for every artifact type (skill, rule, task,
                                                    workflow, agent, tool, mcp, memory, identity, mode, ...)
<FRAMEWORK_ROOT>/skills/SKILLS.md                — Skill / Skill Set / Capability manifest
<FRAMEWORK_ROOT>/rules/RULES.md                  — behavioral rules manifest
<FRAMEWORK_ROOT>/modes/MODES.md                  — triggered stance/output-mode manifest
<FRAMEWORK_ROOT>/instructions/INSTRUCTIONS.md    — reusable scoped-instruction manifest
<FRAMEWORK_ROOT>/task/TASKS.md                   — Task/Task-List routing manifest
<FRAMEWORK_ROOT>/plans/PLANS.md                  — execution-plan manifest
<FRAMEWORK_ROOT>/workflows/WORKFLOWS.md          — reusable multi-step workflow manifest
<FRAMEWORK_ROOT>/agents/AGENTS.md                — agent/subagent role manifest (the framework's OWN registry —
                                                    distinct from this pointer file)
<FRAMEWORK_ROOT>/tools/TOOLS.md                  — callable tool-contract manifest
<FRAMEWORK_ROOT>/identity/IDENTITY.md            — agent identity/presentation
<FRAMEWORK_ROOT>/memory/MEMORY.md                — episodic + implicit memory manifest
<FRAMEWORK_ROOT>/emulation/                      — owner-model observation/guardian/optimization pipeline
<FRAMEWORK_ROOT>/telemetry/HEARTBEAT.md          — recurring session re-entry pattern
<FRAMEWORK_ROOT>/state/AURA.STATE.md             — compact runtime-health model
<FRAMEWORK_ROOT>/mcp/mcp-server/                 — local stdio MCP server: framework_inspect,
                                                    framework_install_or_update, framework_wire_agent,
                                                    framework_write_migration_plan
```

## What to do when creating, modifying, discovering, or validating an agent-control artifact

1. Read `<FRAMEWORK_ROOT>/README.md` only when repository-level routing is needed.
2. Read the applicable root manifest (see the map above) before creating a duplicate artifact.
3. Follow the corresponding specification under `<FRAMEWORK_ROOT>/agent-specifications/specs/` when creating or materially redesigning an artifact.
4. Load only the documents relevant to the current task — do not recursively load the entire framework into context on every turn.
5. Preserve vendor-native files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, etc.) when the runtime requires them. Point them at this framework rather than duplicating its instructions inside them.
6. For existing project customizations, follow `<FRAMEWORK_ROOT>/MIGRATION.INSTRUCTIONS.md`.
7. For installation or reconfiguration, follow `<FRAMEWORK_ROOT>/AGENT-SETUP.INSTRUCTIONS.md`.
8. Getting the framework itself: clone or point an install at `https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git`, or use the local MCP server's `framework_install_or_update` tool if it is already connected.

## Referencing this file from a vendor-native control file

Keep vendor files thin. In `CLAUDE.md`:

```markdown
@AGENTS.md
```

Anthropic's own Claude Code documentation recommends this exact pattern for importing a shared `AGENTS.md` rather than duplicating its content. If your runtime does not support `@file` imports, paste the "Shared Agent Control Framework" pointer block from `AGENT-SETUP.INSTRUCTIONS.md` §5 instead, and add one sentence such as:

> This project uses the Offical-Agentic-Prompt-Starter-Kit (see `AGENTS.md` at the project root). It provides skills, rules, tasks, workflows, agent roles, tools, memory, and specification contracts for building and validating agent-control artifacts consistently. Read `AGENTS.md` before creating or modifying any of those.

<!-- BEGIN PORTABLE AGENT CONTROL FRAMEWORK -->

## Shared Agent Control Framework

Framework root: `<FRAMEWORK_ROOT>`

When creating, modifying, discovering, or validating an agent-control artifact:

1. Read `<FRAMEWORK_ROOT>/README.md` when repository-level routing is needed.
2. Read the applicable root manifest before creating a duplicate.
3. Follow the corresponding specification under `<FRAMEWORK_ROOT>/agent-specifications/specs/`.
4. Load only the documents relevant to the current task.
5. Preserve vendor-native entry files when the runtime requires them.
6. For existing customizations, follow `<FRAMEWORK_ROOT>/MIGRATION.INSTRUCTIONS.md`.

<!-- END PORTABLE AGENT CONTROL FRAMEWORK -->
