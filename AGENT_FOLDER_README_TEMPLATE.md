---
name: agent-control-framework-folder-readme
description: "Root README for a lean (folders-only) install of the Offical-Agentic-Prompt-Starter-Kit — explains what this folder is and maps every subfolder to its manifest and specification."
version: 0.4.0
status: active
---

# Agent Control Framework

## What This Is

This folder is a **lean, runtime-ready copy** of the Offical-Agentic-Prompt-Starter-Kit — a vendor-neutral library of specifications, root manifests, and runtime instructions that lets AI coding agents (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Qwen Code, and any other `AGENTS.md`-aware or MCP-capable agent) build and use skills, rules, tasks, workflows, agent roles, tools, memory, and identity consistently.

It contains **only the folders an agent actually needs at runtime** — specifications, manifests, and instructions. It deliberately does not include this upstream project's own research papers, its install tooling, or its top-level setup guides; those live in the source repository, not in every project that installs this framework.

**Source:** https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit
**Framework version:** 0.4.0
**Installed:** see the sibling `.agent-framework-install.json` in this same folder, if present, for the exact source and install timestamp

This folder is `FRAMEWORK_ROOT`. The project that installed it has its own `AGENTS.md` (or `CLAUDE.md`, `.github/copilot-instructions.md`, etc.) pointing here — that pointer file is separate from this folder and is not duplicated inside it.

## The Golden Rule: Use the Specifications

**Before creating any new file in any folder below — a skill, a rule, a task, a workflow, an agent, a tool, an instruction set, anything — read the matching file under `agent-specifications/specs/` first.** Every artifact type in this framework has a normative specification that defines its required structure, frontmatter, and verification checklist. Do not invent a new shape for something that already has a spec. If you are not sure which spec applies, read `agent-specifications/specs/_README.md` — it indexes all of them.

## Complete Folder Map

| Folder | What it is | Root manifest / entry point | Governing specification | How to add something new |
|---|---|---|---|---|
| `agent-specifications/` | Authoring contract library | `agent-specifications/specs/_README.md` | — (this folder *is* the specification layer) | Only when defining a brand-new artifact type; follow `_specification-authoring.md` |
| `agents/` | Agent / subagent role registry | `agents/AGENTS.md` | `agent-specifications/specs/agent.specification.md` | Add a role entry to the manifest, then create the agent file per spec |
| `emulation/` | Owner-model pipeline (observe → guard → optimize) | `emulation/EMULATION.MANIFEST.md` | `emulation-manifest.specification.md`, `observation.specification.md`, `guardian.specification.md`, `optimization.specification.md` | Extend the manifest and the relevant instruction file; it learns, it does not invent permissions |
| `identity/` | Agent identity / presentation | `identity/IDENTITY.md` | `agent-specifications/specs/identity.specification.md` | Edit directly — this is a single stable definition, not a growing collection |
| `instructions/` | Reusable scoped instruction sets | `instructions/INSTRUCTIONS.md` | `agent-specifications/specs/instructions.specification.md` | Add the instruction file, then add its manifest row |
| `mcp/` | Local stdio MCP server | `mcp/mcp-server/README.md` | `agent-specifications/specs/mcp.specification.md` | See the server's own README before modifying its tools |
| `memory/` | Episodic + implicit memory | `memory/MEMORY.md` | `episodic-memory.specification.md`, `implicit-memory.specification.md` | Episodic: add a row to `memory/MEMORY_INDEX.md`. Implicit: follow `memory/implicit/implicit-memory.instructions.md` |
| `modes/` | Triggered stance/output changes | `modes/MODES.md` | `agent-specifications/specs/mode.specification.md` | Add the mode file, then add its manifest row |
| `plans/` | Instance-specific execution plans | `plans/PLANS.md` | `agent-specifications/specs/plan.specification.md` | One plan per concrete effort; not a reusable procedure (that's a workflow) |
| `prompt_engineering/` | Prompt-engineering framework library | `prompt_engineering/prompt-engineering.skill.md` | `agent-specifications/specs/prompt.specification.md` | Add a framework entry to the compendium volumes and index it in the skill's routing table |
| `rules/` | Behavioral rules manifest | `rules/RULES.md` | `agent-specifications/specs/rules.specification.md` | Add the rule, then add its manifest row; do not duplicate an existing rule |
| `skills/` | Skill / Skill Set / Capability manifest | `skills/SKILLS.md` | `agent-specifications/specs/skill.specification.md` (+ `skillset.specification.md`, `capability.specification.md`) | Create `skills/<name>/SKILL.md` per spec, then add the manifest row — see the map's own creation flow |
| `state/` | Compact runtime-health model | `state/AURA.STATE.md` | — (see `agent-specifications/specs/` for related emulation/heartbeat specs) | Edit in place; never fabricate telemetry no tool actually supplied |
| `task/` | Task / Task List routing | `task/TASKS.md` + `task/task-management.instructions.md` | `agent-specifications/specs/task.specification.md` | Follow `task-management.instructions.md` for *where* tasks live; follow the spec for their structure |
| `telemetry/` | Recurring session re-entry pattern | `telemetry/HEARTBEAT.md` | `agent-specifications/specs/heartbeat.specification.md` | Edit in place; this is a same-context pattern, not an independent cron job |
| `tools/` | Callable tool contracts | `tools/TOOLS.md` | `agent-specifications/specs/tool.specification.md` | Add the tool contract, then add its manifest row |
| `workflows/` | Reusable multi-step orchestration | `workflows/WORKFLOWS.md` | `agent-specifications/specs/workflow.specification.md` | Add the workflow file, then add its manifest row |
| `.gitignore` | Ignore rules for this framework's own tooling (e.g. `mcp/mcp-server/node_modules/`) | — | — | Extend if you add more managed tooling with build artifacts |

## How To Use This From a Consuming Project

1. This folder is referenced from the project's own committed or private control file (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, etc.) via a pointer block — that pointer lives at the project root, not in here.
2. Load only what the current task needs. Do not recursively load every file in this folder on every turn.
3. Check the applicable root manifest above before creating a duplicate artifact.
4. Follow the applicable specification before creating or materially redesigning an artifact.
5. **Check `memory/MEMORY_INDEX.md` on (almost) every request** — if the user has explicitly stated a preference or standing instruction, it is recorded there and must be honored.
6. Keep this folder as a managed upstream copy. Put project-specific customizations in the project's own chosen locations (see `task-management.instructions.md`'s location-resolution logic as the model to follow for any other project-specific content) rather than editing this copy directly — that keeps future framework updates painless, and, if this copy lives in a shared Admin Local Toolbox, it keeps one project's customizations from leaking into every other project that shares it.

## Updating

If this folder was installed by `INSTALL-FRAMEWORK.SH` or the framework's MCP server, re-run the same install/update command with the same `--source` to refresh it — the existing copy is backed up first. Check `.agent-framework-install.json` next to this README (if present) for the recorded source and version.
