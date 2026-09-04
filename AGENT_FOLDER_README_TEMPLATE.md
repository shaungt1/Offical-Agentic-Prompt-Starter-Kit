---
name: agent-control-framework-folder-readme
description: "Root README for a lean (folders-only) install of the Offical-Agentic-Prompt-Starter-Kit — explains what this folder is and maps every subfolder to its manifest and specification."
version: 0.4.0
status: active
---

# Offical-Agentic-Prompt-Starter-Kit — Agent Control Framework

**This is the complete map of this framework.** Read it once per conversation and hold it in context — you do not need to re-read it again unless your context gets compacted or summarized. It tells you what every folder is, what's in it, its version, and how to use it. Nothing below is optional background reading; it is the reference for the entire system.

## What This Is

A vendor-neutral library of specifications, root manifests, and runtime instructions that lets AI coding agents (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Qwen Code, and any other `AGENTS.md`-aware or MCP-capable agent) build and use skills, rules, tasks, workflows, agent roles, tools, memory, and identity consistently — instead of one giant, ever-growing system prompt.

**Source:** https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit
**Folder version:** 0.4.0

This folder is `FRAMEWORK_ROOT`. The project that installed it has its own `AGENTS.md` (or `CLAUDE.md`, `.github/copilot-instructions.md`, etc.) pointing here — that pointer file is separate and lives at the project root, not inside this folder.

## Folder Overview

| Folder | Purpose |
|---|---|
| `agent-specifications/` | Authoring contract library — one specification per artifact type |
| `agents/` | Agent / subagent role registry |
| `emulation/` | Owner-model pipeline: observe → guard → optimize |
| `identity/` | Agent identity / presentation |
| `instructions/` | Reusable scoped instruction sets |
| `mcp/` | Local stdio MCP server |
| `memory/` | Episodic + implicit memory |
| `modes/` | Triggered stance / output changes |
| `plans/` | Instance-specific execution plans |
| `prompt_engineering/` | Prompt-engineering framework library (methodology — how to write good prompts) |
| `prompts/` | Reusable, explicitly-invoked prompts written by the user or the agent |
| `rules/` | Behavioral rules manifest |
| `skills/` | Skill / Skill Set / Capability manifest |
| `state/` | Compact runtime-health model |
| `task/` | Task / Task List routing |
| `telemetry/` | Recurring session re-entry pattern |
| `tools/` | Callable tool contracts |
| `workflows/` | Reusable multi-step orchestration |
| `.gitignore` | Ignore rules for this framework's own tooling |

**The golden rule, before you touch any folder below:** creating a new file in it means reading its Governing Specification first. Do not invent a new shape for something that already has one.

---

## `agent-specifications/`

| Field | Value |
|---|---|
| Purpose | The authoring contract library itself — defines how every other artifact type must be built |
| Entry point | `agent-specifications/specs/_README.md` |
| Governing specification | — (this folder *is* the specification layer) |
| Version | 0.1.0 |
| How to use | Read the matching `*.specification.md` before creating or redesigning any artifact anywhere in this framework |
| Adding something new | Only for a brand-new artifact *type*; follow `_specification-authoring.md` |

## `agents/`

| Field | Value |
|---|---|
| Purpose | Registry of agent / subagent roles, tools, permissions, and delegation boundaries |
| Entry point | `agents/AGENTS.md` |
| Governing specification | `agent-specifications/specs/agent.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for an existing role before defining a new one |
| Adding something new | Add a manifest row, then create the agent file per spec |

## `emulation/`

| Field | Value |
|---|---|
| Purpose | Owner-model pipeline: learns from evidence, filters it, turns it into suggestions — never invents permissions |
| Entry point | `emulation/EMULATION.MANIFEST.md` |
| Governing specification | `emulation-manifest.specification.md`, `observation.specification.md`, `guardian.specification.md`, `optimization.specification.md` |
| Version | 0.2.0 |
| How to use | Observation → Guardian → Optimization, in that order |
| Adding something new | Extend the manifest and the relevant instruction file (`OBSERVATION`/`GUARDIAN`/`OPTIMIZATION.INSTRUCTIONS.md`) |

## `identity/`

| Field | Value |
|---|---|
| Purpose | Stable agent identity and presentation |
| Entry point | `identity/IDENTITY.md` |
| Governing specification | `agent-specifications/specs/identity.specification.md` |
| Version | 0.1.0 |
| How to use | Read once; it rarely changes |
| Adding something new | Edit in place — this is a single definition, not a growing collection |

## `instructions/`

| Field | Value |
|---|---|
| Purpose | Reusable scoped operating guidance that isn't a hard rule or a one-off task |
| Entry point | `instructions/INSTRUCTIONS.md` |
| Governing specification | `agent-specifications/specs/instructions.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for existing scoped guidance before creating overlapping instructions |
| Adding something new | Add the instruction file, then add its manifest row. See also `instructions/capability-skillset-instructions/` |

## `mcp/`

| Field | Value |
|---|---|
| Purpose | Local stdio MCP server exposing this framework's install/inspect/wire tooling to any MCP-capable agent |
| Entry point | `mcp/mcp-server/README.md` |
| Governing specification | `agent-specifications/specs/mcp.specification.md` |
| Version | 0.4.0 |
| How to use | `framework_detect`, `framework_inspect`, `framework_install_or_update`, `framework_wire_agent`, `framework_write_migration_plan` |
| Adding something new | Read the server's own README before modifying its tools |

## `memory/`

| Field | Value |
|---|---|
| Purpose | Two systems: episodic (explicit user statements) and implicit (agent-inferred patterns) |
| Entry point | `memory/MEMORY.md` |
| Governing specification | `episodic-memory.specification.md`, `implicit-memory.specification.md` |
| Version | 0.1.0 |
| How to use | Read `memory/MEMORY_INDEX.md` and `memory/implicit/implicit.memory.md` once at the start of a conversation and hold them in context; re-read only after a context compaction |
| Adding something new | Episodic: add a row to `memory/MEMORY_INDEX.md` the moment the user states something explicit. Implicit: follow `memory/implicit/implicit-memory.instructions.md` |

## `modes/`

| Field | Value |
|---|---|
| Purpose | Triggered stance / output changes with no execution of their own |
| Entry point | `modes/MODES.md` |
| Governing specification | `agent-specifications/specs/mode.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for an existing mode before defining a new one |
| Adding something new | Add the mode file, then add its manifest row |

## `plans/`

| Field | Value |
|---|---|
| Purpose | Instance-specific execution sequencing for one concrete piece of work |
| Entry point | `plans/PLANS.md` |
| Governing specification | `agent-specifications/specs/plan.specification.md` |
| Version | 0.1.0 |
| How to use | One plan per concrete effort — not a reusable procedure (that's a workflow) |
| Adding something new | Add the plan file, then add its manifest row |

## `prompt_engineering/`

| Field | Value |
|---|---|
| Purpose | Router over a two-volume compendium of 49 prompt-engineering frameworks |
| Entry point | `prompt_engineering/prompt-engineering.skill.md` |
| Governing specification | `agent-specifications/specs/prompt.specification.md` |
| Version | 1.0.0 |
| How to use | Identify the failure mode/goal, pick the matching framework from the skill's index table, apply its template from the source volume |
| Adding something new | Add a framework entry to the relevant volume and index it in the skill's routing table |

## `prompts/`

| Field | Value |
|---|---|
| Purpose | Reusable, explicitly-invoked request text written by the user or the agent — not ambient guidance (that's `instructions/`) and not a procedure the agent runs on its own (that's `skills/`) |
| Entry point | `prompts/PROMPTS.md` |
| Governing specification | `agent-specifications/specs/prompt.specification.md` |
| Version | 0.1.0 |
| How to use | Someone explicitly invokes a saved prompt to get a specific outcome |
| Adding something new | Save it the moment it proves useful — either party (user or agent) may add one; record the author and add the manifest row |

## `rules/`

| Field | Value |
|---|---|
| Purpose | Ongoing behavioral constraints and requirements |
| Entry point | `rules/RULES.md` |
| Governing specification | `agent-specifications/specs/rules.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for an applicable rule before acting in an area it might govern |
| Adding something new | Add the rule, then add its manifest row — never duplicate an existing rule |

## `skills/`

| Field | Value |
|---|---|
| Purpose | Reusable, focused procedures — plus the Skill Set / Capability composition layers above them |
| Entry point | `skills/SKILLS.md` |
| Governing specification | `agent-specifications/specs/skill.specification.md` (+ `skillset.specification.md`, `capability.specification.md`) |
| Version | 0.1.0 |
| How to use | Search the manifest for an equivalent skill before creating a new one |
| Adding something new | Create `skills/<name>/SKILL.md` per spec, then add the manifest row |

## `state/`

| Field | Value |
|---|---|
| Purpose | Compact, honest runtime-health signal — context capacity, constraint integrity, execution stability |
| Entry point | `state/AURA.STATE.md` |
| Governing specification | — (related to the emulation/heartbeat specs) |
| Version | 0.1.0 |
| How to use | Read as a qualitative signal, not a precise metric |
| Adding something new | Edit in place; never fabricate telemetry no tool actually supplied |

## `task/`

| Field | Value |
|---|---|
| Purpose | Routing manifest and instructions for Task / Task List placement, lifecycle, and completion — not where task files themselves live |
| Entry point | `task/TASKS.md` + `task/task-management.instructions.md` |
| Governing specification | `agent-specifications/specs/task.specification.md` |
| Version | 0.1.0 |
| How to use | Follow `task-management.instructions.md` for *where* a task belongs (`/_tasks/`, `.admin-local/Tasks/`, etc.) |
| Adding something new | Follow the spec for structure; add the Task List to the manifest |

## `telemetry/`

| Field | Value |
|---|---|
| Purpose | Recurring same-context session re-entry pattern (not an independent cron job) |
| Entry point | `telemetry/HEARTBEAT.md` |
| Governing specification | `agent-specifications/specs/heartbeat.specification.md` |
| Version | 0.1.0 |
| How to use | Edit in place |
| Adding something new | Edit in place — this is one pattern, not a growing collection |

## `tools/`

| Field | Value |
|---|---|
| Purpose | Callable tool contracts: inputs, outputs, side effects |
| Entry point | `tools/TOOLS.md` |
| Governing specification | `agent-specifications/specs/tool.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for an existing contract before defining a new one |
| Adding something new | Add the tool contract, then add its manifest row |

## `workflows/`

| Field | Value |
|---|---|
| Purpose | Reusable multi-step orchestration — the repeatable process, not one instance of running it (that's a plan) |
| Entry point | `workflows/WORKFLOWS.md` |
| Governing specification | `agent-specifications/specs/workflow.specification.md` |
| Version | 0.1.0 |
| How to use | Check the manifest for an existing workflow before defining a new one |
| Adding something new | Add the workflow file, then add its manifest row |

---

## Updating This Folder

If this folder was installed by `INSTALL-FRAMEWORK.SH` or the framework's MCP server, re-run the same install/update command with the same `--source` to refresh it — the existing copy is backed up first. Check the sibling `.agent-framework-install.json` in this same folder, if present, for the recorded source and install timestamp.
