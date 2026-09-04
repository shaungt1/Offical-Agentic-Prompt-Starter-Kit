# Common Agent Control Markdown Files
## A Survey of the Markdown Control Plane Used by Modern Coding Agents

**Status:** Technical survey  
**Version:** 1.0  
**Date:** September 3, 2026

---

## Abstract

Modern coding agents are increasingly configured through ordinary Markdown files placed in repositories, user configuration directories, agent workspaces, and tool-specific folders. These files do more than provide documentation. Depending on the runtime, they can supply persistent project instructions, reusable skills, scoped rules, specialist-agent definitions, prompt templates, plans, identity, user context, memory, startup behavior, and reflective state.

This document calls that collection of Markdown-based control surfaces the **agent Markdown control plane**. The term is descriptive rather than a formal industry standard. Its purpose is to give engineers a single, readable map of the file types already used in current agent ecosystems, explain what each file is for, distinguish portable conventions from vendor-specific implementations, and clarify where similarly named files have materially different meanings.

Two open conventions now provide the strongest cross-tool anchors. `AGENTS.md` acts as a repository-facing instruction file for coding agents, while `SKILL.md` is the required entry point of the Agent Skills format for reusable procedural capabilities [1], [2]. Around those anchors, vendors and frameworks have introduced additional Markdown families for rules, instructions, prompts, custom agents, memory, identity, planning, and lifecycle behavior.

This survey focuses on **what exists now**. It does not introduce new resource types such as skill sets, capabilities, adaptive memory, or other proposed extensions.

---

## 1. What Is an Agent Markdown Control Plane?

A conventional software repository contains files that primarily describe software to humans: `README.md`, `CONTRIBUTING.md`, architecture notes, design documents, and API documentation. Modern coding-agent systems add another class of Markdown: files that are deliberately discovered, loaded, interpreted, or invoked by an agent runtime.

Those files form a lightweight control plane because they can influence:

- **what the agent knows about a repository;**
- **how the agent is expected to behave;**
- **which procedures it can discover and reuse;**
- **which rules apply to which parts of a codebase;**
- **which specialist roles or subagents are available;**
- **which prompts or commands can be invoked;**
- **what persistent information survives between sessions;**
- **how an agent presents its identity or models its user; and**
- **what initialization, planning, or maintenance behavior should occur.**

The files are usually human-readable Markdown, but their meaning comes from the runtime that recognizes them. A filename that is significant to one tool may be ordinary documentation to another. Some formats are broadly portable; others are vendor-native; some are compatibility layers; and some are historical conventions that remain visible in older repositories.

### 1.1 Terminology Used in This Document

| Term | Meaning |
|---|---|
| **Agent** | A software system in which a language model can reason over context and, often, use tools to read files, edit code, run commands, search, or delegate work. |
| **Control file** | A file intentionally interpreted by an agent runtime as instructions, configuration-like context, procedural knowledge, identity, memory, or another behavioral input. |
| **Context file** | A control file whose contents are injected or otherwise made available to the model as contextual instructions. |
| **Frontmatter** | A structured YAML block placed between `---` delimiters at the beginning of a Markdown file. It commonly contains fields such as `name`, `description`, `tools`, or scope metadata. |
| **Scope** | The files, directories, repositories, users, tasks, or sessions to which a control file applies. |
| **Precedence** | The order used when multiple applicable instruction sources conflict. |
| **Progressive disclosure** | Loading only lightweight metadata first, then loading detailed instructions or supporting material only when it becomes relevant. Agent Skills explicitly uses this pattern [2]. |
| **Portable convention** | A naming or structural convention intentionally supported by multiple independent agent implementations. |
| **Vendor-native convention** | A filename or directory structure defined primarily by one product or framework. |
| **Legacy convention** | A previously supported format that remains in older projects or compatibility layers but is no longer preferred. |

---

## 2. The Paradigm at a Glance

The simplest way to understand the current ecosystem is by **function**, not by vendor.

| Functional family | Common file or pattern | Primary purpose | Status |
|---|---|---|---|
| Repository instructions | `AGENTS.md` | Persistent repository guidance for coding agents | Open, cross-tool convention |
| Instruction override | `AGENTS.override.md` | Replace or specialize `AGENTS.md` guidance at a given scope | Supported by selected runtimes |
| Reusable capability | `SKILL.md` | Defines one discoverable procedural skill | Open Agent Skills format |
| Skill reference | `REFERENCE.md`, `references/*.md` | Detailed supporting knowledge loaded when needed | Agent Skills convention |
| Repository-wide instructions | `.github/copilot-instructions.md` | Always-on GitHub Copilot repository instructions | GitHub/VS Code family |
| Scoped instructions | `*.instructions.md` | Instructions applied by path or task relevance | GitHub/VS Code family |
| Modular rules | `rules/*.md`, `.claude/rules/*.md`, `.cursor/rules/*.mdc` | Topic- or path-scoped behavioral rules | Tool-specific family |
| Custom agent | `*.agent.md`, `agents/<name>.md` | Defines a specialist agent or subagent | Widely used pattern |
| Reusable prompt | `*.prompt.md` | Explicitly invoked prompt template | GitHub/VS Code family |
| Command | `commands/<name>.md` | Named reusable prompt or slash command | Common tool-specific pattern |
| Workflow | `workflows/<name>.md` | Multi-step reusable procedure or interaction flow | Tool-specific pattern |
| Planning protocol | `PLANS.md` | Defines how long-running execution plans should be authored and maintained | Optional convention |
| Claude context | `CLAUDE.md`, `CLAUDE.local.md` | Persistent Claude Code instructions | Claude-native |
| Gemini context | `GEMINI.md` | Persistent Gemini CLI instructions | Gemini-native |
| Qwen context | `QWEN.md`, `.qwen/QWEN.local.md` | Persistent Qwen Code instructions | Qwen-native |
| Hermes context | `.hermes.md`, `HERMES.md` | Hermes-specific project instructions | Hermes-native |
| Agent identity | `SOUL.md` | Durable persona, tone, and behavioral identity | Hermes/OpenClaw pattern |
| Display identity | `IDENTITY.md` | Agent name, presentation identity, or related metadata | OpenClaw pattern |
| User model | `USER.md` | Stable user preferences and profile context | Hermes/OpenClaw pattern |
| Long-term memory | `MEMORY.md` | Durable learned facts and decisions | Multi-framework pattern |
| Episodic memory | `memory/YYYY-MM-DD.md` | Dated observations and working history | OpenClaw-style pattern |
| Reflection | `DREAMS.md` | Human-reviewable reflective or consolidation output | OpenClaw/Qwen-related pattern |
| First-run initialization | `BOOTSTRAP.md` | One-time setup or identity-establishment ritual | OpenClaw pattern |
| Startup instructions | `BOOT.md` | Runtime or gateway startup checklist | OpenClaw pattern |
| Periodic checklist | `HEARTBEAT.md` | Historical periodic-agent checklist | Legacy/retired in current OpenClaw |
| Legacy Cursor rules | `.cursorrules` | Older persistent Cursor project instructions | Legacy but still widely recognized |
| Legacy Windsurf rules | `.windsurfrules` | Older Windsurf/Cascade project rules | Legacy |
| Replit context | `replit.md` | Persistent Replit Agent project context | Replit-native |

This table deliberately mixes exact filenames, suffix families, and directory conventions because the ecosystem has not converged on one naming strategy. Some tools use fixed uppercase files such as `AGENTS.md`; others identify semantic types by suffix, such as `review.agent.md`; still others rely on the file's directory, such as `.claude/rules/security.md`.

---

## 3. A Practical Repository View

A repository that must coexist with several modern coding agents may contain a structure similar to the following:

```text
repository/
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── QWEN.md
├── PLANS.md
│
├── .agents/
│   └── skills/
│       └── code-review/
│           ├── SKILL.md
│           └── references/
│               └── REFERENCE.md
│
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/
│   │   └── frontend.instructions.md
│   ├── prompts/
│   │   └── review.prompt.md
│   └── agents/
│       └── reviewer.agent.md
│
├── .claude/
│   ├── CLAUDE.md
│   ├── rules/
│   │   └── testing.md
│   └── skills/
│       └── release/
│           └── SKILL.md
│
└── .cursor/
    └── rules/
        └── architecture.mdc
```

This is an **illustrative interoperability layout**, not a recommendation that every repository create every file. In fact, duplicating the same instruction across many agent-specific files is usually undesirable. The better pattern is to keep one authoritative source where possible and use imports, compatibility support, or narrowly scoped vendor files only when a tool genuinely requires them.

The underlying design principle is simple:

> **Always-loaded instructions should remain small; specialized detail should be loaded only when relevant.**

That principle appears explicitly in the Agent Skills specification, which recommends loading skill metadata first, the full `SKILL.md` only after activation, and supporting resources only when required [2]. Similar motivations appear in scoped rule systems from Claude Code, Cursor, GitHub Copilot, and other agent platforms [4], [7], [8].

---

# 4. Repository and Project Instruction Files

## 4.1 `AGENTS.md` — Repository Instructions for Agents

`AGENTS.md` is the strongest current cross-tool convention for repository-level agent instructions. The format describes itself as a "README for agents": a predictable place to record setup commands, testing procedures, code style, architectural context, security considerations, and other information that an agent needs to work correctly in a repository [1].

Unlike a conventional `README.md`, `AGENTS.md` is written specifically for machine agents. A useful file normally contains information that would otherwise have to be repeatedly explained in prompts:

- how to install or start the project;
- build, test, lint, and validation commands;
- important architectural boundaries;
- naming and coding conventions;
- repository-specific workflows;
- areas that should not be changed casually;
- security or compliance constraints; and
- instructions for verifying work before completion.

The format intentionally imposes no required schema or frontmatter. It is ordinary Markdown [1].

### Hierarchical use

`AGENTS.md` can appear in multiple directories. The general pattern is that a root file establishes broad repository guidance while deeper files specialize instructions for a package, service, or subdirectory. `agents.md` describes the closest applicable file as taking precedence, and systems such as Codex, Cursor, GitHub Copilot, Hermes, and OpenCode implement related hierarchical behavior [1], [3], [7], [10], [15].

```text
repository/
├── AGENTS.md
├── services/
│   ├── payments/
│   │   └── AGENTS.md
│   └── search/
│       └── AGENTS.md
```

The important conceptual distinction is that `AGENTS.md` describes **how agents should work in a repository**. It does not define a specialist agent persona; that is the job of custom-agent files described later.

---

## 4.2 `AGENTS.override.md` — Scoped Replacement or Override

`AGENTS.override.md` is an explicit override convention used by Codex and Hermes. Codex checks for an override before the normal `AGENTS.md` at the same level, while Hermes supports it as a personal or per-directory replacement for repository guidance [10], [15].

It is useful when a user, machine, or subproject needs different instructions without changing the shared `AGENTS.md`.

```text
services/payments/
├── AGENTS.md
└── AGENTS.override.md
```

Where supported, the override is not merely an additional note: it can replace the ordinary instruction file at that scope. Because this behavior is implementation-specific, repositories should not assume every coding agent recognizes it.

---

## 4.3 Vendor-Native Context Files

Several tools implement their own persistent project-context file. These files serve roughly the same high-level purpose as `AGENTS.md`, but their discovery and precedence rules differ.

### `CLAUDE.md`

Claude Code uses `CLAUDE.md` for persistent project, user, or organization instructions. Typical content includes coding standards, architecture, build commands, workflows, and behavioral guidance. Claude can load files from several scopes and directories, and it also supports `CLAUDE.local.md` for more local or personal instructions [8].

Claude Code does **not** natively treat `AGENTS.md` as its primary instruction file. Its documentation recommends importing `AGENTS.md` from `CLAUDE.md` when a repository wants one shared source of truth [8].

```markdown
@AGENTS.md
```

### `CLAUDE.local.md`

`CLAUDE.local.md` is a more specific companion to `CLAUDE.md`. It is appropriate for machine-specific commands, personal workflow preferences, local environment notes, or instructions that should not necessarily be committed for the whole team [8].

### `GEMINI.md`

Gemini CLI uses `GEMINI.md` as its default hierarchical context file. It can hold project instructions, personas, style guidance, and other persistent context. Gemini also supports `@file.md` imports and allows the configured context filename to be changed, including to `AGENTS.md` [13].

### `QWEN.md`

Qwen Code uses `QWEN.md` as a permanent briefing that is read at the beginning of sessions. Qwen's documentation recommends it for build commands, conventions, architectural decisions, and persistent preferences. Qwen also reads `AGENTS.md`, reducing the need to duplicate shared repository guidance [14].

Qwen additionally supports `.qwen/QWEN.local.md` for project-specific personal context [14].

### `.hermes.md` and `HERMES.md`

Hermes Agent recognizes `.hermes.md` and `HERMES.md` as Hermes-specific project instruction files with higher priority than compatible `AGENTS.md`, `CLAUDE.md`, and legacy Cursor instruction sources [15].

### `replit.md`

Replit Agent uses lowercase `replit.md` as persistent project context. Replit describes it as a living project document containing preferences, architecture, coding patterns, dependencies, and other information that Agent should continue to use as the project evolves [21].

---

# 5. Skills and Supporting Knowledge

## 5.1 `SKILL.md` — One Reusable Procedural Capability

The exact standardized filename is:

```text
SKILL.md
```

It is **singular** and conventionally uppercase. `SKILLS.md`, `Skills.md`, and `skill.md` are not the required Agent Skills entry filename.

The Agent Skills specification defines a skill as a directory containing at minimum a `SKILL.md` file. The file contains YAML frontmatter followed by Markdown instructions [2].

```text
skill-name/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

The current open specification requires:

```yaml
---
name: skill-name
description: What the skill does and when it should be used.
---
```

Optional fields include `license`, `compatibility`, `metadata`, and the experimental `allowed-tools` field [2].

The Markdown body contains the procedural instructions. The specification recommends step-by-step guidance, examples, and edge cases. It also recommends moving lengthy detail out of the main file and into supporting resources [2].

### Why skills are different from repository instructions

`AGENTS.md` is generally persistent repository context. A `SKILL.md` is intended to be **discoverable and selectively loaded** when its capability is relevant.

Agent Skills formalizes progressive disclosure in three stages:

1. lightweight metadata is made available for discovery;
2. the full `SKILL.md` is loaded when the skill is activated; and
3. scripts, references, and assets are loaded only as needed [2].

This structure reduces context consumption and keeps procedural knowledge modular.

---

## 5.2 `REFERENCE.md` and `references/*.md`

A reference file is supporting material for a skill. The Agent Skills specification explicitly recommends a `references/` directory and gives `REFERENCE.md`, `FORMS.md`, and domain-specific Markdown files as examples [2].

References are appropriate for:

- detailed API documentation;
- schemas;
- domain terminology;
- compatibility notes;
- long examples;
- policy detail;
- templates or form descriptions; and
- information that would unnecessarily enlarge the core `SKILL.md`.

`REFERENCE.md` is not a universal repository-wide "magic" file. Its meaning comes from its relationship to a skill or from an agent being explicitly directed to read it.

---

# 6. Instructions and Rules

The ecosystem does **not** currently have one universal `INSTRUCTION.md` or one universal `RULES.md`. Instead, runtimes identify instructions by a fixed path, a suffix, a directory, frontmatter, or some combination of those mechanisms.

## 6.1 `.github/copilot-instructions.md`

GitHub Copilot uses `.github/copilot-instructions.md` for repository-wide custom instructions. These instructions provide persistent project context such as structure, coding standards, build procedures, and validation expectations [3], [4].

This file is automatically applied in supported GitHub Copilot environments and is distinct from a prompt file, which is manually invoked.

---

## 6.2 `*.instructions.md`

GitHub Copilot and Visual Studio Code use files ending in `.instructions.md` for modular, often path-specific instructions [3], [4].

Example:

```text
.github/instructions/
├── frontend.instructions.md
├── python.instructions.md
└── security.instructions.md
```

These files can use YAML frontmatter such as `applyTo` to identify which files or directories they govern [4].

The key idea is **conditional context**: instead of placing every instruction in one always-loaded file, the runtime loads the relevant instructions for the part of the codebase being handled.

---

## 6.3 `.claude/rules/*.md`

Claude Code supports modular Markdown rules under `.claude/rules/`. Rules may be general or path-scoped, allowing large projects to keep topics such as testing, API design, database conventions, or frontend practices in separate files [8].

```text
.claude/rules/
├── testing.md
├── api-design.md
└── security.md
```

Claude's documentation explicitly positions scoped rules as a way to reduce irrelevant context in larger repositories [8].

---

## 6.4 `.cursor/rules/*.mdc`

Cursor stores project rules under `.cursor/rules/` using `.mdc` files. These files combine Markdown-style content with structured metadata for scope or activation. Cursor supports project rules, user rules, team rules, and `AGENTS.md` as a simpler Markdown alternative [7].

`.mdc` is not simply another spelling of `.md`; it is Cursor's structured rule format.

---

## 6.5 Other `rules/` Families

Other coding agents use similar directory-based rule systems, even though the filenames and metadata differ. Examples in the current ecosystem include tool-specific directories such as `.windsurf/rules/`, `.devin/rules/`, `.clinerules/`, `.roo/rules/`, `.amazonq/rules/`, and `.continue/rules/`.

The shared architectural idea is more important than the exact directory:

> **Rules are often modular instructions whose activation is narrower than repository-wide context.**

They may apply globally, by path, by language, by task, by operating mode, or through explicit invocation.

---

# 7. Custom Agents and Subagents

## 7.1 `*.agent.md`

Visual Studio Code and GitHub Copilot use `*.agent.md` files to define custom agents. A custom agent is a named specialist configuration such as a planner, security reviewer, researcher, implementation agent, or code reviewer [6].

A custom-agent file can include YAML frontmatter for fields such as:

- `name`;
- `description`;
- `tools`;
- available subagents;
- model selection;
- invocation controls;
- handoffs; and
- optional agent-scoped hooks [6].

The Markdown body supplies the actual role and operating instructions.

```text
.github/agents/
├── planner.agent.md
├── reviewer.agent.md
└── security.agent.md
```

### `AGENTS.md` versus `*.agent.md`

These names are easy to confuse:

- **`AGENTS.md`** tells agents how to work in a repository.
- **`*.agent.md`** defines a particular agent role.

They solve different problems.

---

## 7.2 `agents/<name>.md`

Several runtimes use ordinary `.md` files inside a designated `agents/` directory instead of the `.agent.md` suffix. Claude Code, OpenCode, and other systems use variations of this pattern.

For example, VS Code can also recognize Claude-style agent files under `.claude/agents/`, where plain `.md` files use Claude-specific frontmatter [6].

The directory supplies the type; the filename supplies the agent's identity.

---

# 8. Prompts, Commands, Workflows, and Plans

These files are related, but they should not be treated as interchangeable.

## 8.1 `*.prompt.md` — Reusable Explicit Prompt

Visual Studio Code prompt files use the `.prompt.md` suffix. They are reusable prompt templates that the user explicitly invokes, often as slash commands [5].

A prompt file can define frontmatter such as:

- `name`;
- `description`;
- `argument-hint`;
- agent;
- model; and
- tools [5].

The important distinction is activation: custom instructions are normally applied automatically, while prompt files are invoked for a particular interaction [5].

---

## 8.2 `commands/<name>.md` — Named Command

A number of agent tools represent reusable commands as Markdown files under a `commands/` directory.

OpenCode, for example, reads project commands from `.opencode/commands/` and user commands from `~/.config/opencode/commands/`. YAML frontmatter can specify properties such as the description, agent, or model, while the body becomes the prompt template [20].

```text
.opencode/commands/
├── test.md
├── release.md
└── review.md
```

Commands are typically explicit entry points: the user invokes a named operation rather than waiting for the agent to infer that a skill or rule applies.

---

## 8.3 `workflows/<name>.md` — Multi-Step Workflow

Some agent systems use Markdown workflow files to encode repeatable multi-step interaction flows. The exact semantics are vendor-specific. A workflow may represent sequential prompts, checkpoints, transitions, or task steps.

Because "workflow" is also used for executable automation systems outside conversational agents, the presence of a Markdown file named `workflow.md` or a `workflows/` directory should not be assumed to have portable semantics unless the runtime documents it.

---

## 8.4 `PLANS.md` — Planning Protocol

`PLANS.md` is an optional but influential convention used in Codex-oriented workflows for defining how a long-running **execution plan** should be written and maintained.

OpenAI's published ExecPlan pattern describes `PLANS.md` as a document that specifies the requirements for self-contained, living plans that can guide substantial implementation work and preserve progress, discoveries, decisions, and outcomes [12].

The distinction is important:

- `PLANS.md` normally defines **how plans should be authored and maintained**.
- An individual execution-plan file represents **one particular planned body of work**.

`PLANS.md` is therefore not a universal required agent file. It is a repository convention that becomes meaningful when the repository's agent instructions tell the agent to use it [12].

---

# 9. Identity, User Context, and Persistent Memory

Agent frameworks that operate beyond one coding task increasingly separate **who the agent is**, **who the user is**, and **what the agent has learned**.

## 9.1 `SOUL.md` — Durable Agent Identity

Hermes and OpenClaw use `SOUL.md` for durable persona, tone, communication style, and behavioral identity [16], [17].

Hermes explicitly distinguishes:

- `SOUL.md` — who the agent is and how it speaks;
- `AGENTS.md` — what a project requires [16].

This separation is useful because persona should usually remain stable across projects, while repository instructions should change with the repository.

---

## 9.2 `IDENTITY.md` — Presentation Identity

OpenClaw uses `IDENTITY.md` for concise identity information such as the agent's name, presentation style, or related display characteristics [17].

`IDENTITY.md` is narrower than `SOUL.md`. A useful conceptual distinction is:

- `IDENTITY.md` — **what the agent is called and how it is presented**;
- `SOUL.md` — **how the agent should characteristically behave and communicate**.

---

## 9.3 `USER.md` — Persistent User Model

Hermes and OpenClaw use `USER.md` to represent durable information about the human the agent serves. This can include communication preferences, role information, expectations, stable project context, and other details that should influence future interaction [16], [18].

The important architectural idea is to keep user modeling separate from general agent memory. A user's persistent preference is not the same kind of information as a technical lesson learned from a project.

---

## 9.4 `MEMORY.md` — Curated Long-Term Memory

`MEMORY.md` is used by multiple agent systems as a human-readable durable-memory surface.

OpenClaw defines it as curated long-term memory for durable non-profile facts, standing decisions, and summaries that should remain available across sessions [18]. Hermes similarly separates `MEMORY.md` from `USER.md`, describing the former as what the agent has learned and the latter as information specifically about the user [16].

The key design idea is **curation**. A long-term memory file should not simply become a transcript dump.

---

## 9.5 `memory/YYYY-MM-DD.md` — Episodic or Daily Memory

OpenClaw uses dated files under `memory/` for detailed daily notes, observations, session summaries, and working context [18].

Example:

```text
memory/
├── 2026-09-01.md
├── 2026-09-02.md
└── 2026-09-03.md
```

These files preserve **what happened**, while `MEMORY.md` preserves a smaller set of information that remains useful over time.

That separation anticipates a broader distinction between episodic history and consolidated long-term knowledge.

---

## 9.6 `DREAMS.md` — Reflection and Consolidation

OpenClaw uses `DREAMS.md` as a human-reviewable output surface for its background "dreaming" memory-consolidation process [18].

The file can record reflective summaries, historical backfill, and the results of deciding which short-term material is important enough to promote into durable memory. Qwen Code also exposes a `/dream` command as part of its managed memory system and uses periodic cleanup and synthesis of remembered material [14].

`DREAMS.md` should therefore be understood as a **reflection or consolidation artifact**, not merely another long-term memory file.

---

# 10. Runtime and Lifecycle Files

## 10.1 `BOOTSTRAP.md` — First-Run Initialization

OpenClaw uses `BOOTSTRAP.md` during the creation of a new workspace. It supplies a one-time initialization ritual used to establish identity and initial workspace state [19].

Its defining property is lifecycle: it is not intended as ordinary recurring project context.

---

## 10.2 `BOOT.md` — Startup Checklist

OpenClaw's `BOOT.md` is an optional startup instruction file. When the relevant boot hook is enabled, the file provides short, explicit instructions to run when the gateway starts [19].

It is appropriate for startup checks such as verifying required services or restoring expected state. Startup instructions should be idempotent and concise because the runtime may start more than once.

---

## 10.3 `HEARTBEAT.md` — Historical Periodic Checklist

`HEARTBEAT.md` deserves special treatment because engineers will encounter conflicting references in older documentation and repositories.

Current OpenClaw English reference documentation marks the workspace `HEARTBEAT.md` file as **retired**. New workspaces no longer create it and the current runtime no longer reads it as the active source of heartbeat instructions; those instructions moved into system-managed monitor or cron state [22].

Therefore:

```text
HEARTBEAT.md
```

should be documented as a **historical/legacy agent-control file**, not presented as a current portable standard.

The broader idea of a heartbeat—a periodic agent wake-up or monitoring cycle—still exists in agent systems. What changed is the control surface.

---

# 11. Legacy and Compatibility Files

## 11.1 `.cursorrules`

`.cursorrules` is Cursor's older project-rule file. Cursor still recognizes it for compatibility but documents `.cursor/rules/*.mdc` as the modern project-rule mechanism [7].

The file also remains relevant because other runtimes, including Hermes and migration tools, recognize it as a compatibility source [15].

---

## 11.2 `.windsurfrules`

`.windsurfrules` is an older Windsurf/Cascade project-rule convention. Modern Windsurf installations favor modular rule directories. The filename still appears in existing projects and compatibility/import mechanisms, so it remains part of the historical control-file vocabulary.

---

## 11.3 `AGENT.md`

`AGENT.md` singular appears in selected compatibility paths and older conventions, but it should not be confused with the much more established `AGENTS.md` plural.

For new cross-agent repository guidance:

```text
AGENTS.md
```

is the safer portable convention.

---

## 11.4 `TOOLS.md`

`TOOLS.md` has appeared in agent workspaces as a place for local tool notes, including older OpenClaw layouts. Current OpenClaw documentation places local tool conventions inside the `## Tools` section of `AGENTS.md` rather than treating `TOOLS.md` as an active primary workspace file [17].

---

# 12. Naming Patterns: Why Case and Suffix Matter

The ecosystem uses several naming strategies at the same time.

## 12.1 Fixed uppercase filenames

These names are recognized because the exact filename has semantic meaning:

```text
AGENTS.md
SKILL.md
CLAUDE.md
GEMINI.md
QWEN.md
HERMES.md
SOUL.md
IDENTITY.md
USER.md
MEMORY.md
DREAMS.md
BOOTSTRAP.md
BOOT.md
PLANS.md
```

For portable formats such as Agent Skills, case is not cosmetic. The required entry filename is `SKILL.md` [2].

---

## 12.2 Typed suffixes

Some ecosystems encode the resource type into the suffix:

```text
review.agent.md
testing.instructions.md
release.prompt.md
```

This allows the author to choose a descriptive resource name while the suffix identifies the semantic type.

---

## 12.3 Directory-defined types

Other systems infer the file's purpose from its directory:

```text
.claude/rules/security.md
.opencode/commands/review.md
.claude/agents/reviewer.md
```

Here, `security.md` by itself is ordinary Markdown. Its location under `.claude/rules/` gives it agent-specific meaning.

---

## 12.4 Extensionless legacy files

Several older systems used hidden extensionless files:

```text
.cursorrules
.windsurfrules
```

These are easy for humans to overlook and harder to type-check or validate, which is one reason newer ecosystems increasingly use explicit directories, Markdown suffixes, or structured frontmatter.

---

# 13. Frontmatter and Markdown Body Conventions

There is **no one universal YAML frontmatter schema** for all agent-control Markdown files.

Different resource types need different metadata.

For example, the Agent Skills specification requires `name` and `description`, with optional `license`, `compatibility`, `metadata`, and experimental tool declarations [2]:

```yaml
---
name: code-review
description: Review code for correctness, regressions, and missing tests.
license: MIT
metadata:
  author: example-org
  version: "1.0"
---
```

A VS Code custom agent may instead declare a name, description, tools, subagents, model behavior, or handoffs [6]:

```yaml
---
name: Reviewer
description: Reviews changes before implementation is considered complete.
tools:
  - search
  - read
---
```

A path-scoped instruction file may need little more than a selector [4]:

```yaml
---
applyTo: "src/api/**/*.ts"
---
```

The important lesson is that **frontmatter should describe metadata the runtime needs to discover, scope, select, or configure the resource**. The Markdown body should explain the actual behavior, procedure, context, or guidance in language a model and a human can understand.

---

# 14. Automatic, Conditional, and Explicit Loading

A useful way to reason about agent-control files is by **when they enter model context**.

| Loading mode | Examples | Meaning |
|---|---|---|
| **Always or session loaded** | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `QWEN.md`, `SOUL.md` | Persistent baseline context for a repository, user, or agent |
| **Conditionally loaded** | `*.instructions.md`, `.claude/rules/*.md`, `.cursor/rules/*.mdc` | Activated by path, relevance, scope, or runtime rules |
| **Progressively disclosed** | `SKILL.md`, `references/*.md` | Metadata is discoverable first; full detail loads only when relevant |
| **Explicitly invoked** | `*.prompt.md`, `commands/*.md`, many workflows | User or agent explicitly selects the resource |
| **Persistent state** | `MEMORY.md`, `memory/YYYY-MM-DD.md`, `DREAMS.md` | Stores state or learned information for future retrieval |
| **Lifecycle-triggered** | `BOOTSTRAP.md`, `BOOT.md` | Used during initialization or startup rather than ordinary turns |

This distinction matters because placing too much material in always-loaded context consumes prompt budget and increases the chance that irrelevant or contradictory instructions influence the model. Progressive and conditional loading are therefore not merely organizational preferences; they are mechanisms for context management.

---

# 15. What Is Actually Portable Today?

The ecosystem is converging, but it has not converged completely.

## Strongest cross-tool anchors

### `AGENTS.md`

`AGENTS.md` has broad multi-vendor support and is specifically intended as an open, predictable repository instruction format [1].

### `SKILL.md`

`SKILL.md` is defined by the open Agent Skills specification and is supported by an increasing number of independent coding-agent systems [2], [9], [11], [21].

These two files currently provide the clearest portable foundation:

```text
AGENTS.md  = how agents should operate in this repository
SKILL.md   = how to perform one reusable procedural capability
```

## Portable concepts with non-portable filenames

Rules, instructions, custom agents, prompts, commands, workflows, memory, and persona files are all common concepts, but their exact naming remains fragmented.

For example:

```text
Scoped instruction
├── *.instructions.md
├── .claude/rules/*.md
└── .cursor/rules/*.mdc
```

Each solves a similar problem, but they are not the same format.

---

# 16. Files That Sound Standard but Are Not

The following names may be reasonable project conventions, but a developer should not assume that modern agent runtimes recognize them automatically.

| Filename | Current status |
|---|---|
| `SKILLS.md` | Not the Agent Skills entry point. Use `SKILL.md`. |
| `Skills.md` | Not the Agent Skills entry point. |
| `RULES.md` | No universal cross-vendor standard; rule directories are more common. |
| `INSTRUCTION.md` | No universal cross-vendor standard; typed `*.instructions.md` and vendor rule directories are common. |
| `PROMPT.md` | No universal entry point; typed prompt files or command directories are more common. |
| `PERSONA.md` | Not a general standard; persona/identity is framework-specific. |
| `MCP.md` | Not a Model Context Protocol configuration standard. MCP configuration is generally represented through structured configuration rather than this filename. |
| `CODEX.md` | Not the standard Codex repository instruction file; Codex uses `AGENTS.md`. |
| `CHATGPT.md` | Not a documented portable OpenAI repository instruction entry point. |
| `CURSOR.md` | Not Cursor's standard rule file. |
| `OPENCODE.md` | Not OpenCode's standard project instruction file; OpenCode uses `AGENTS.md`. |

A repository can, of course, create any of these files and instruct an agent to read them. The distinction is **automatic semantic recognition** versus ordinary Markdown referenced by another control file.

---

# 17. Ordinary Documentation Still Matters

Files such as:

```text
README.md
CONTRIBUTING.md
ARCHITECTURE.md
SECURITY.md
DESIGN.md
```

remain extremely important to coding agents because agents can read and reason over them. However, those filenames are primarily conventional human documentation. Their presence does not generally guarantee that an agent runtime will automatically inject them into its persistent control context.

A good agent-control file can point to ordinary documentation rather than duplicating it.

For example:

```markdown
## Architecture

Read `docs/ARCHITECTURE.md` before changing service boundaries.
```

This keeps always-loaded agent instructions small while preserving deeper human-readable documentation elsewhere.

---

# 18. Design Principles Emerging Across the Ecosystem

Although vendors differ in naming, several consistent design principles are visible.

## 18.1 Separate durable context from task-specific procedure

Repository instructions such as `AGENTS.md` or `CLAUDE.md` should contain information that is repeatedly relevant. A skill should contain a procedure that is loaded only when that capability is needed.

## 18.2 Scope instructions as narrowly as practical

Path-specific rules and modular instructions exist because a backend service, frontend application, database package, and deployment system may require different guidance.

## 18.3 Prefer one source of truth over duplicated instruction files

Where compatibility exists, import or reference shared guidance rather than manually maintaining several nearly identical copies. Claude's documented `@AGENTS.md` pattern is a direct example [8].

## 18.4 Keep identity, user modeling, and project instructions separate

Hermes and OpenClaw demonstrate a useful separation:

```text
SOUL.md     → who the agent is
USER.md     → who the user is
MEMORY.md   → what has been learned
AGENTS.md   → what the project requires
```

Those categories evolve for different reasons and should not be collapsed into one permanent prompt [16]–[18].

## 18.5 Treat context as a limited resource

Agent Skills, scoped rules, hierarchical instructions, and on-demand references all reflect the same practical constraint: a model's context window is finite. Loading less irrelevant material generally makes the control plane easier to reason about and maintain [2], [4], [8], [21].

---

# 19. Summary

Modern coding agents are no longer controlled by a single prompt. Their behavior increasingly emerges from a **layered Markdown control plane** composed of repository instructions, procedural skills, scoped rules, specialist agents, prompts, commands, plans, memory, identity, and lifecycle files.

The most important current distinctions are:

```text
AGENTS.md
    Repository operating instructions.

SKILL.md
    One reusable procedural capability.

*.instructions.md / rules/*
    Scoped or conditional behavioral guidance.

*.agent.md / agents/*
    Specialist agent definitions.

*.prompt.md / commands/*
    Explicitly invoked prompt entry points.

PLANS.md
    A planning protocol for long-running work.

CLAUDE.md / GEMINI.md / QWEN.md / HERMES.md / replit.md
    Vendor-native persistent project context.

SOUL.md / IDENTITY.md / USER.md
    Identity and human-context layers in selected agent frameworks.

MEMORY.md / memory/YYYY-MM-DD.md / DREAMS.md
    Persistent memory, episodic history, and reflective consolidation.

BOOTSTRAP.md / BOOT.md
    Initialization and startup lifecycle instructions.
```

Two filenames currently stand apart as the clearest open, cross-tool conventions:

1. **`AGENTS.md`** for repository guidance.
2. **`SKILL.md`** for reusable procedural capability packages.

Everything else should be evaluated according to the runtime that discovers it. Similar names can have different loading semantics, and ordinary Markdown does not become an agent-control surface merely because its filename sounds plausible.

A companion vendor-implementation document should therefore answer the next question this survey intentionally leaves open:

> **Which tools recognize each file, where do they look for it, what metadata do they support, and how do their precedence rules differ?**

---

# References

[1] Agentic AI Foundation, “AGENTS.md — A simple, open format for guiding coding agents,” *AGENTS.md*. [Online]. Available: https://agents.md/. Accessed: Sep. 3, 2026.

[2] Agent Skills, “Specification,” *Agent Skills*. [Online]. Available: https://agentskills.io/specification. Accessed: Sep. 3, 2026.

[3] GitHub, “Support for different types of custom instructions,” *GitHub Docs*. [Online]. Available: https://docs.github.com/en/copilot/reference/custom-instructions-support. Accessed: Sep. 3, 2026.

[4] Microsoft, “Use custom instructions in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/custom-instructions. Accessed: Sep. 3, 2026.

[5] Microsoft, “Use prompt files in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/prompt-files. Accessed: Sep. 3, 2026.

[6] Microsoft, “Custom agents in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/custom-agents. Accessed: Sep. 3, 2026.

[7] Cursor, “Rules,” *Cursor Documentation*. [Online]. Available: https://cursor.com/docs/rules. Accessed: Sep. 3, 2026.

[8] Anthropic, “How Claude remembers your project,” *Claude Code Documentation*. [Online]. Available: https://code.claude.com/docs/en/memory. Accessed: Sep. 3, 2026.

[9] Anthropic, “Extend Claude with skills,” *Claude Code Documentation*. [Online]. Available: https://code.claude.com/docs/en/skills. Accessed: Sep. 3, 2026.

[10] OpenAI, “Custom instructions with AGENTS.md,” *Codex Documentation*. [Online]. Available: https://learn.chatgpt.com/docs/agent-configuration/agents-md. Accessed: Sep. 3, 2026.

[11] OpenAI, “Build skills,” *Codex Documentation*. [Online]. Available: https://learn.chatgpt.com/docs/build-skills. Accessed: Sep. 3, 2026.

[12] OpenAI, “Using PLANS.md for multi-hour problem solving,” *OpenAI Cookbook*. [Online]. Available: https://github.com/openai/openai-cookbook/blob/main/articles/codex_exec_plans.md. Accessed: Sep. 3, 2026.

[13] Google, “Provide context with GEMINI.md files,” *Gemini CLI Documentation*. [Online]. Available: https://geminicli.com/docs/cli/gemini-md/. Accessed: Sep. 3, 2026.

[14] Qwen, “Memory,” *Qwen Code Documentation*. [Online]. Available: https://qwenlm.github.io/qwen-code-docs/en/users/features/memory/. Accessed: Sep. 3, 2026.

[15] Nous Research, “Context Files,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files. Accessed: Sep. 3, 2026.

[16] Nous Research, “Which File Does What?,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/which-file-does-what. Accessed: Sep. 3, 2026.

[17] OpenClaw Foundation, “Agent workspace,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/agent-workspace. Accessed: Sep. 3, 2026.

[18] OpenClaw Foundation, “Memory overview,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/concepts/memory. Accessed: Sep. 3, 2026.

[19] OpenClaw Foundation, “Agent runtime” and “BOOT.md template,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/concepts/agent and https://docs.openclaw.ai/reference/templates/BOOT. Accessed: Sep. 3, 2026.

[20] OpenCode, “Commands,” *OpenCode Documentation*. [Online]. Available: https://opencode.ai/v2/docs/commands. Accessed: Sep. 3, 2026.

[21] Replit, “Context management” and “Custom templates,” *Replit Documentation*. [Online]. Available: https://docs.replit.com/learn/foundations/context-management and https://docs.replit.com/teams/custom-templates. Accessed: Sep. 3, 2026.

[22] OpenClaw Foundation, “Retired HEARTBEAT.md workspace file,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/reference/templates/HEARTBEAT. Accessed: Sep. 3, 2026.

---

## Document Scope Note

This survey intentionally describes the current control-file landscape without proposing a replacement naming system. Vendor-by-vendor discovery paths, precedence rules, supported frontmatter fields, and compatibility behavior belong in the companion document **Vendor Agent Control File Implementations**.
