---
name: agents-entry-pointer
description: "Portable AGENTS.md entry file for the Offical-Agentic-Prompt-Starter-Kit. Copy this file into a consuming project's root (replacing <FRAMEWORK_ROOT>) to wire that project's agents to this framework."
version: 0.4.0
status: active
---

# AGENTS.md

## 📎 Copy This to the Top of CLAUDE.md (or Your Runtime's Native Control File)

This is a small, literal, copy-pasteable block — not this file's own frontmatter. Paste it at the very top of `CLAUDE.md`, `.github/copilot-instructions.md`, or whichever native control file your runtime reads, so the agent sees it before anything else.

```yaml
reference: AGENTS.md
must_follow: true
description: >
  This project uses the Offical-Agentic-Prompt-Starter-Kit — a portable, vendor-neutral
  library of specifications, root manifests, and runtime instructions for AI coding agents.
  You must follow all instructions in the AGENTS.md file at the project root before
  creating, modifying, discovering, or validating any agent-control artifact (skill, rule,
  mode, instruction, task, plan, workflow, agent, tool, MCP integration, memory, or identity).
  See AGENTS.md for the complete map of what this repository contains, the critical
  operating rules, and how to use it.
```

## What this file is

This is the **portable entry pointer** for the Offical-Agentic-Prompt-Starter-Kit — a vendor-neutral library of specifications, root manifests, and runtime instructions for AI coding agents (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Qwen Code, and any other `AGENTS.md`-aware or MCP-capable agent).

Two ways this file gets used:

1. **Inside this repository** (`FRAMEWORK_ROOT` = `.`, this repo's own root) — it tells an agent working *on the framework itself* what everything here is for.
2. **Copied into another project** (`FRAMEWORK_ROOT` = wherever the framework was installed, e.g. `.agent-framework` or `.admin-local/shared_toolbox/agent-control-framework`) — it becomes that project's pointer into the shared framework. Replace every `<FRAMEWORK_ROOT>` below with the real relative path before copying.

---

## ‼️ FRAMEWORK_ROOT ‼️

```text
FRAMEWORK_ROOT = <FRAMEWORK_ROOT>
```

**EVERY** script, prompt, instruction, skill, rule, task, workflow, and specification this file talks about lives under this one path. When you need to run a script, load a prompt, follow an instruction, or — most importantly — **create a new skill, instruction, rule, task, or any other agent-control artifact**, THIS IS WHERE IT GOES, and it MUST be built using the matching contract under `<FRAMEWORK_ROOT>/agent-specifications/specs/`. Do not invent a parallel structure elsewhere.

---

## 🧠 MEMORY — READ ON START, THEN CARRY IT IN CONTEXT

Read this before the critical rules below. Memory is not optional background reading — it changes what you should do on the current turn.

There are exactly two memory systems in this framework, and they are triggered differently:

| | Episodic (`memory/MEMORY_INDEX.md`) | Implicit (`memory/implicit/`) |
|---|---|---|
| **Triggered by** | The user **explicitly** says something to remember | You infer a pattern from evidence, outcomes, or repetition |
| **Examples** | "I like the color blue — only show me blue templates." · "I like dogs, don't show me cats." · "Call me sir." | A recurring correction reveals a working style the user never stated outright |
| **When to record** | Immediately, in the same turn the user says it | After noticing the pattern is likely to matter again |
| **When to check** | Before acting on any request | Before a meaningful response or action, when it could plausibly apply |

**Enforcement:** if the user gives you a direct, explicit instruction about how to treat them, what to show them, or what to avoid — that is an episodic-memory event. Add the row to `memory/MEMORY_INDEX.md` in the same turn, before moving on. Do not rely on remembering it "in your head" for the rest of the session — write it down.

### ‼️ How Often To Actually Read The Files ‼️

- **At the start of a new conversation** (this file is being read for the first time this session), read both `memory/MEMORY_INDEX.md` and `memory/implicit/implicit.memory.md` and hold their contents in context.
- **After that, do not re-read them.** They are already in your context window. "Check memory before acting" means *consult what you already loaded*, not re-open the files on every turn — that would burn context for no reason.
- **When you add a new entry**, you already know the old entries plus the one you just added — no re-read needed there either.
- **The one time you DO need to re-read them:** if this conversation's context has been **compacted or summarized**, the full memory contents may no longer be reliably present. Re-read both files once, immediately, before continuing.

For implicit memory's full add/update/supersede/remove behavior, follow `memory/implicit/implicit-memory.instructions.md` exactly — do not improvise a different mechanism.

---

## ⚠️ CRITICAL RULES — READ FIRST

These apply on top of, not instead of, any project-specific rules in `rules/RULES.md`.

### 🚫 Never Assume

If you are not certain — about a requirement, a file's purpose, a value, or whether an action is safe — **ask**, or go read the actual file/code before answering. Do not guess and present the guess as fact.

This includes assuming what the person you're talking to already knows. Do not assume they know a term, an acronym, or a piece of complex terminology just because you do. Explain it. Give them a real knowledge transfer, not a shorthand answer that only makes sense if they already knew the answer. Cite the specific file, section, or source you're relying on, and use proper formatting so it's easy to verify.

### 🚫 Never Guess at Implementation Details

Read the relevant spec (`agent-specifications/specs/`), the relevant root manifest, or the actual source file before implementing or describing behavior. "It probably works like X" is not good enough when you can open the file and confirm.

### 🚫 Never Change Unrelated Code

Stay inside the scope of the current task. Do not refactor, "improve," rename, or reformat code or files that are not directly part of what was asked. No opportunistic scope creep, even when you notice something else that looks wrong — flag it separately instead.

### 🚫 Never Overcomplicate — Think Like an Engineer

**Engineering** is the discipline of taking a complex problem and finding the *simplest solution that is still correct, efficient, and complete* — not a shortcut that hides the complexity, and not a monolithic abstraction that makes the complexity worse. A good engineered solution is high-level enough to be maintainable, but never more elaborate than the problem actually requires. If a plain function does the job, don't build a framework around it. If one clear paragraph explains it, don't build a diagram.

### 🚫 Never Delete a File to Rebuild It

If something needs to be completely redone: **make a copy first**, do the rework on the copy, verify the fix actually works, and only then remove the old file. Never delete-then-rebuild in place — if the rebuild goes wrong, the original is gone.

### 🚫 Ask Before Starting or Stopping Any Server

The developer likely already has something running — the MCP server (`mcp/mcp-server/`), a dev server, a watch process. Ask before starting, stopping, or restarting one rather than assuming nothing is running.

### 🚫 Follow the Folders — Don't Skip Them

Plans, rules, prompts, skills, tasks, workflows, and tools each have their own governing folder in this repository (see the map below). When work touches one of those areas, read the corresponding root manifest and specification before acting — don't improvise a new structure because reading the existing one takes an extra step.

---

## First: Check Whether This Project Already Has Native Agent Setup

Before relying on this file alone:

- **Claude Code / GitHub Copilot**: if the project has never been initialized for your runtime (no `CLAUDE.md`, no `.github/copilot-instructions.md`, no `.claude/` folder as applicable), run that runtime's own init flow first (e.g. `/init`) so a native control file exists. Then add the pointer block below to that native file rather than only relying on this one.
- This file (`AGENTS.md`) is itself a recognized native entry point for many agents (Codex, Cursor, generic `AGENTS.md`-aware runtimes) and needs no separate init step for those.

---

## Complete Map of This Repository

| Path | What it is | What it's for |
|---|---|---|
| `README.md` | Repository-level routing guide | Start here for install/setup; explains every install method and links every root manifest |
| `AGENTS.md` (this file) | Portable entry pointer | Copy into a consuming project's root; wires that project's agents to this framework |
| `AGENT_FOLDER_README_TEMPLATE.md` | Lean-install README source | Becomes `README.md` at the root of every `--layout lean` install (the default); maps the runtime folders only |
| `AGENT-SETUP.INSTRUCTIONS.md` | Setup instructions | How to install/locate/wire the framework into a project, fresh or existing |
| `MIGRATION.INSTRUCTIONS.md` | Migration instructions | How to non-destructively integrate an existing project's own skills/rules/tasks/etc. into this framework |
| `INSTALL-FRAMEWORK.SH` | Installer script | Automated install/update from a local copy or a Git URL, with backup and validation |
| `agent-specifications/specs/` | Authoring contract library | One `*.specification.md` per artifact type (skill, rule, task, workflow, agent, tool, mcp, memory, identity, mode, ...). Read the applicable spec before creating or redesigning an artifact |
| `skills/SKILLS.md` | Skill / Skill Set / Capability manifest | Index of reusable procedures; also see `skills/hermes-reverse-engineering/` and `skills/qa-code-review-v1.0.0/` for working example skills |
| `rules/RULES.md` | Behavioral rules manifest | Ongoing constraints and requirements |
| `modes/MODES.md` | Mode manifest | Triggered stance/output changes with no execution |
| `instructions/INSTRUCTIONS.md` | Instruction-set manifest | Reusable scoped operating guidance; see also `instructions/capability-skillset-instructions/` |
| `task/TASKS.md` + `task/task-management.instructions.md` | Task routing manifest + instructions | Where/how to create, backtrace, and complete Tasks and Task Lists |
| `plans/PLANS.md` | Plan manifest | Instance-specific execution sequencing |
| `workflows/WORKFLOWS.md` | Workflow manifest | Reusable multi-step orchestration |
| `agents/AGENTS.md` | Agent/subagent role manifest | The framework's OWN registry of agent roles — distinct from this pointer file |
| `tools/TOOLS.md` | Tool-contract manifest | Callable actions and their side effects |
| `identity/IDENTITY.md` | Identity definition | Stable agent identity/presentation |
| `memory/MEMORY.md` | Memory manifest | Routes to the episodic and implicit memory systems (see "Memory" above) |
| `memory/MEMORY_INDEX.md` | Episodic memory log | The actual episodic store — explicit user-stated preferences/decisions, checked on almost every request |
| `memory/implicit/` | Implicit-memory subsystem | Working implementation: `IMPLICIT_MEMORY.md`, `implicit-memory.instructions.md`, `implicit.memory.md` (the actual store) |
| `emulation/` | Owner-model pipeline | `EMULATION.MANIFEST.md` + `OBSERVATION.INSTRUCTIONS.md`, `GUARDIAN.INSTRUCTIONS.md`, `OPTIMIZATION.INSTRUCTIONS.md` |
| `telemetry/HEARTBEAT.md` | Heartbeat pattern | Recurring same-context session re-entry (not an independent cron job) |
| `state/AURA.STATE.md` | Runtime-health model | Compact qualitative state: context capacity, constraint integrity, execution stability |
| `prompt_engineering/` | Prompt-engineering library | `prompt-engineering.skill.md` routes to two compendium volumes of 49 prompting frameworks — methodology, not the prompts themselves |
| `prompts/` | Reusable, explicitly-invoked prompts | `prompts/PROMPTS.md`; written dynamically by the user or the agent — see it for how a Prompt differs from an Instruction or a Skill |
| `mcp/mcp-server/` | Local stdio MCP server | Exposes `framework_detect`, `framework_inspect`, `framework_install_or_update`, `framework_wire_agent`, `framework_write_migration_plan` |
| `.admin-local/` (if present) | Private, Git-excluded workbench | Created by the Admin Local VS Code extension; never treat its contents as part of the portable framework payload |

---

## Other Ongoing Subsystems — How to Use Them

Memory is covered above. These two also expect active engagement during a session, not just a one-time read.

### Emulation (`emulation/`)

When authorized evidence about the project owner accumulates (interests, decisions, corrections, routines, communication style), the Observation → Guardian → Optimization pipeline governs how that's learned, filtered, and turned into useful suggestions. It learns; it does not invent permissions.

### Telemetry / Heartbeat (`telemetry/`, `state/`)

`HEARTBEAT.md` defines a recurring same-context check-in pattern for long-running sessions. `AURA.STATE.md` is a compact, honest runtime-health signal — never fabricate telemetry values that no tool actually supplied.

---

## What To Do When Creating, Modifying, Discovering, or Validating an Agent-Control Artifact

1. Read `<FRAMEWORK_ROOT>/README.md` only when repository-level routing is needed.
2. Read the applicable root manifest (see the map above) before creating a duplicate artifact.
3. Follow the corresponding specification under `<FRAMEWORK_ROOT>/agent-specifications/specs/` when creating or materially redesigning an artifact.
4. Load only the documents relevant to the current task — do not recursively load the entire framework into context on every turn.
5. Preserve vendor-native files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, etc.) when the runtime requires them. Point them at this framework rather than duplicating its instructions inside them.
6. For existing project customizations, follow `<FRAMEWORK_ROOT>/MIGRATION.INSTRUCTIONS.md`.
7. For installation or reconfiguration, follow `<FRAMEWORK_ROOT>/AGENT-SETUP.INSTRUCTIONS.md`.
8. Getting the framework itself: clone or point an install at `https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git`, or use the local MCP server's `framework_install_or_update` tool if it is already connected.

## Referencing This File From a Vendor-Native Control File

Keep vendor files thin. In `CLAUDE.md`:

```markdown
@AGENTS.md
```

Claude Code's own documentation recommends this exact pattern for importing a shared `AGENTS.md` rather than duplicating its content. If your runtime does not support `@file` imports, paste the YAML reference block from the top of this file instead.

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
