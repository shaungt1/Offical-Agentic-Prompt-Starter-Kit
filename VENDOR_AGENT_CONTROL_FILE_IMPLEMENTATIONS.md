# Vendor Agent Control File Implementations
## How Modern Coding Agents Discover, Load, Scope, and Interpret Markdown Control Files

**Status:** Technical survey  
**Version:** 1.0  
**Date:** September 3, 2026  
**Companion document:** `COMMON_AGENT_CONTROL_MARKDOWN_FILES.md`

---

## Abstract

The modern agent ecosystem has begun to converge on a small number of reusable Markdown concepts—repository instructions, skills, scoped rules, specialist agents, reusable prompts, plans, identity, and memory—but the **implementation details remain vendor-specific**.

A file named `AGENTS.md` may be portable across several coding agents, yet one runtime may concatenate every applicable file while another selects only one instruction family. A `SKILL.md` package may follow the same open Agent Skills structure across tools, but the directories searched, activation permissions, precedence rules, and supported frontmatter fields can differ. Custom agents may use `.agent.md` suffixes in one product and ordinary `.md` files inside an `agents/` directory in another. Memory may be a first-class Markdown subsystem in one framework and not a file-based feature at all in another.

This document maps those differences. It is intended as the vendor-specific companion to **Common Agent Control Markdown Files**, which defines the common vocabulary without tying it to individual products.

The objective here is not to declare one vendor correct. It is to make the behavior explicit enough that a developer can answer five practical questions:

1. **Which Markdown files does this agent recognize?**
2. **Where must those files be placed?**
3. **When are they loaded?**
4. **How are conflicts and scopes resolved?**
5. **Which parts are portable, and which are specific to one runtime?**

All behaviors described here are based on current vendor documentation available as of September 3, 2026.

---

# 1. How to Read This Document

## 1.1 Native, Compatible, and Portable

Three terms are used throughout this survey.

| Term | Meaning |
|---|---|
| **Native** | The vendor explicitly defines the file or directory as part of its own customization model. |
| **Compatible** | The vendor intentionally recognizes a format created by another ecosystem so existing repositories can work without duplication. |
| **Portable** | The format is intentionally usable across independent tools rather than belonging to one vendor. `AGENTS.md` and Agent Skills `SKILL.md` are the strongest examples today. |

A compatible file is not necessarily implemented identically to the original system. For example, a runtime may read `CLAUDE.md` for compatibility without reproducing Claude Code's complete hierarchical loading behavior.

## 1.2 The Six Implementation Questions

For each vendor, this document examines the same six dimensions:

1. **Persistent project instructions** — the baseline context the agent carries while working in the repository.
2. **Scoped rules or instructions** — guidance that is activated only for selected files, tasks, or contexts.
3. **Skills** — reusable procedures or knowledge packages loaded on demand.
4. **Agents or subagents** — specialist model configurations with their own prompts, tools, or context.
5. **Prompts, commands, or workflows** — explicit user-invoked reusable tasks.
6. **Memory, identity, and lifecycle files** — persistent state beyond ordinary repository guidance.

That common frame makes products easier to compare even when their terminology differs.

---

# 2. Cross-Vendor Implementation Matrix

The table below intentionally shows the **primary implementation surfaces**, not every compatibility alias.

| Platform | Persistent project instructions | Scoped rules / instructions | Skills | Custom agents / subagents | Prompt / command surface | File-based memory / identity |
|---|---|---|---|---|---|---|
| **GitHub Copilot / VS Code** | `.github/copilot-instructions.md`, `AGENTS.md` | `.github/instructions/*.instructions.md` | `.github/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md` | `.github/agents/*.agent.md` | `.github/prompts/*.prompt.md` | No comparable general Markdown memory stack |
| **Cursor** | `AGENTS.md` | `.cursor/rules/*.mdc` | Agent Skills supported | `.cursor/agents/*.md` | Built-in/custom command surfaces | Product-managed memories rather than a common root memory file |
| **Claude Code** | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md` | `.claude/rules/**/*.md` | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` | `.claude/commands/*.md` | Auto-memory under `~/.claude/projects/.../memory/` |
| **OpenAI Codex** | `AGENTS.md`, `AGENTS.override.md` | Hierarchical `AGENTS.md` / overrides | `.agents/skills/*/SKILL.md` | Product/runtime dependent | Reusable prompts exist, but skills are the stronger portable capability surface | No standard project `MEMORY.md` contract |
| **Hermes Agent** | `.hermes.md`, `HERMES.md`, `AGENTS.md`, compatibility files | Hierarchical/project context discovery | `~/.hermes/skills/*/SKILL.md` plus configured external roots | Delegated child agents | Skills and scheduled tasks | `SOUL.md`, `USER.md`, `MEMORY.md` |
| **OpenClaw** | Workspace `AGENTS.md` | Primarily workspace instructions and runtime configuration | Workspace / `.agents/skills` / managed `SKILL.md` roots | Per-agent workspaces and runtime configuration | Skills, cron, standing/runtime actions | `SOUL.md`, `IDENTITY.md`, `USER.md`, `MEMORY.md`, daily memory, `DREAMS.md`, `BOOTSTRAP.md`, `BOOT.md` |
| **Gemini CLI** | `GEMINI.md`, configurable aliases including `AGENTS.md` | Context hierarchy and imported files | `.gemini/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md` | `.gemini/agents/*.md` | Custom commands plus built-in commands | Context memory through `GEMINI.md`; persistent memory mechanisms are tool-managed |
| **Qwen Code** | `QWEN.md`, `.qwen/QWEN.local.md`, `AGENTS.md` | Context files plus skill path gates and other configuration | `.qwen/skills/*/SKILL.md` | `.qwen/agents/*.md` | `.qwen/commands/*.md` | Auto-memory, pinned memory, team memory, `/dream` |
| **Kimi Code** | `AGENTS.md`, `.kimi-code/AGENTS.md`, user `AGENTS.md`, `SYSTEM.md` | Scope-specific instruction discovery | `.kimi-code/skills/`, `.agents/skills/` | `.kimi-code/agents/*.md`, `.agents/agents/*.md` | Skills and plugin contributions | Runtime/session state; not the same Markdown memory stack as OpenClaw/Hermes |
| **OpenCode** | `AGENTS.md` | Hierarchical `AGENTS.md`; dynamic instruction sources | `.opencode/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md` | `.opencode/agents/*.md` | `.opencode/commands/*.md` | Session-managed; no common root Markdown memory contract |
| **Factory Droid** | `AGENTS.md` and compatible names | Nested instruction discovery | `.factory/skills/*/SKILL.md` | Factory custom Droid definitions | `.factory/commands/*` | No comparable common Markdown memory stack |
| **Goose** | Project instructions plus context-engineering mechanisms | Tool/configuration dependent | `.agents/skills/*/SKILL.md` recommended | `.agents/agents/*.md` recommended | Recipes and explicit workflows | Not centered on a root `MEMORY.md` convention |
| **Windsurf** | `AGENTS.md` plus global/workspace rules | `.windsurf/rules/*.md` | Skills supported by current Cascade customization model | Product-specific agent features | Workflows | Auto-generated Memories + `global_rules.md` |
| **Cline** | Cline rules / compatibility instructions | `.clinerules/` | `.cline/skills/*/SKILL.md` | Mode/agent features | Workflows/modes | Memory Bank methodology is separate from a universal runtime contract |
| **OpenHands** | `AGENTS.md`, compatible `CLAUDE.md` / `GEMINI.md` | Skill/context system | `.agents/skills/<name>/SKILL.md` | SDK/file-based agent mechanisms | SDK/task mechanisms | Context system, not a universal root-memory filename |
| **Kiro** | `AGENTS.md`, `.kiro/steering/*.md` | Steering inclusion modes | Skill-like/on-demand steering behavior | Custom agents | Spec/task workflows | Steering rather than a standard `MEMORY.md` |
| **Amazon Q Developer** | Project rules | `.amazonq/rules/*.md` | Product features rather than Agent Skills as primary contract | Product managed | IDE/agent features | `.amazonq/rules/memory-bank/*.md` |
| **Continue** | Rules | `.continue/rules/*.md` | Configuration/ecosystem dependent | Configuration dependent | Prompt/config blocks | No common root Markdown memory contract |
| **Amp** | `AGENTS.md`; `AGENT.md` / `CLAUDE.md` fallback | Nested `AGENTS.md` | Product-specific capabilities | Product agent runtime | Agent interaction surfaces | No common Markdown memory stack |

The matrix should be read as a map of **documented primary surfaces**, not as a guarantee that every feature exists in every product edition, IDE integration, or cloud execution mode. GitHub Copilot alone has feature-dependent support differences between IDE chat, CLI, cloud agent, and code review [1].

---

# 3. GitHub Copilot and Visual Studio Code

GitHub Copilot and Visual Studio Code currently expose one of the most explicit Markdown customization taxonomies. The ecosystem distinguishes **always-on instructions**, **path-scoped instructions**, **skills**, **custom agents**, and **prompt files** instead of treating them as interchangeable concepts [1]–[5].

## 3.1 Repository Instructions

The principal Copilot-native repository file is:

```text
.github/copilot-instructions.md
```

It supplies repository-wide instructions such as project structure, coding standards, build commands, testing requirements, and validation expectations [1], [3].

Copilot also recognizes agent-oriented instruction files in supported surfaces:

```text
AGENTS.md
CLAUDE.md
GEMINI.md
```

Support varies by Copilot feature. For example, Copilot CLI and cloud-agent environments recognize a broader collection of agent instruction files than some IDE or code-review surfaces [1].

### Important interoperability point

Copilot does not force a repository to choose exclusively between its native file and `AGENTS.md`. Both may be supplied. When multiple applicable instruction sources are active, Copilot combines them, and the product documentation recommends avoiding contradictory guidance [1].

## 3.2 Path-Specific Instructions

GitHub and VS Code use:

```text
.github/instructions/<name>.instructions.md
```

These files normally begin with YAML frontmatter containing an `applyTo` glob:

```yaml
---
applyTo: "src/api/**/*.ts"
---
```

The body contains the actual instructions.

This design makes the activation condition explicit. A frontend rule need not consume context when the agent is editing a database migration, and a database rule does not need to remain permanently active while the model is working elsewhere [1], [4].

## 3.3 Agent Skills

Visual Studio Code and Copilot support the open Agent Skills model using `SKILL.md`.

Project skill locations include:

```text
.github/skills/
.claude/skills/
.agents/skills/
```

Personal skill locations include:

```text
~/.copilot/skills/
~/.claude/skills/
~/.agents/skills/
```

A skill directory contains `SKILL.md` and may contain scripts, references, examples, templates, or other resources. Only the core metadata needs to be exposed for discovery; detailed instructions can be loaded when relevant [2].

This is a significant interoperability feature because VS Code intentionally recognizes several existing skill locations rather than requiring a Copilot-only directory.

## 3.4 Custom Agents

Custom agents use the typed suffix:

```text
.github/agents/<name>.agent.md
```

The YAML frontmatter can specify properties such as the agent's name, description, tools, model behavior, and handoff/delegation configuration. The Markdown body provides the agent's actual instructions [5].

The semantic distinction is:

```text
AGENTS.md
    instructions for agents operating in the repository

reviewer.agent.md
    definition of a particular specialist agent
```

Those two filenames should never be treated as aliases.

## 3.5 Prompt Files

Reusable explicit prompts use:

```text
.github/prompts/<name>.prompt.md
```

Prompt files are manually invoked and may declare metadata such as a description, selected agent, tools, and argument hints. Current VS Code documentation distinguishes them from always-on custom instructions and from Agent Skills. Skills may be automatically selected by the agent, while prompt files are primarily user-invoked [3].

## 3.6 Practical Character of the GitHub/VS Code Model

The GitHub/VS Code family is best understood as a **typed customization system**:

```text
copilot-instructions.md  → persistent repository guidance
*.instructions.md        → conditional guidance
SKILL.md                 → reusable capability
*.agent.md               → specialist agent
*.prompt.md              → explicit reusable prompt
```

That separation is one of the clearest examples of the industry moving away from one giant persistent prompt.

---

# 4. Cursor

Cursor uses `AGENTS.md` for straightforward project guidance while retaining its own structured rule system under `.cursor/rules/` [6].

## 4.1 `AGENTS.md`

Cursor treats root and nested `AGENTS.md` files as Markdown agent instructions. Nested files apply when the agent works inside the corresponding directory tree [6].

This makes Cursor compatible with the broader `AGENTS.md` convention without requiring developers to rewrite existing repository instructions.

## 4.2 `.cursor/rules/*.mdc`

Cursor's native project rules live under:

```text
.cursor/rules/
```

and use the `.mdc` extension.

Rules can be:

- scoped by path;
- manually invoked;
- automatically included according to relevance; or
- used as persistent context [6].

Cursor therefore has two parallel surfaces:

```text
AGENTS.md
    simple, readable repository guidance

.cursor/rules/*.mdc
    structured Cursor-native rules with metadata and activation behavior
```

The second is more expressive; the first is more portable.

## 4.3 Skills

Cursor supports Agent Skills and exposes built-in skill-management operations such as `/create-skill`. Its documentation describes skills as reusable capabilities distinct from subagents: a skill is appropriate for a focused repeatable task, while a subagent is more appropriate when context isolation, parallel work, or an independent specialist is required [7], [8].

## 4.4 Subagents

Cursor custom subagents are stored as Markdown definitions such as:

```text
.cursor/agents/verifier.md
```

The definition uses YAML frontmatter followed by the specialist prompt. Each subagent receives an independent context window and returns its result to the parent agent [8].

This isolation is architecturally important. A subagent is not simply a large skill; it is another reasoning context.

## 4.5 Legacy `.cursorrules`

Older Cursor projects frequently contain:

```text
.cursorrules
```

Modern Cursor documentation favors `.cursor/rules/*.mdc` and `AGENTS.md`, but `.cursorrules` remains important as a compatibility artifact because other coding agents still detect or import it.

---

# 5. Claude Code

Claude Code has a mature hierarchy separating persistent project memory, modular rules, skills, custom subagents, legacy commands, and automatic memory [9]–[11].

## 5.1 `CLAUDE.md`

Claude Code's principal project instruction file is:

```text
CLAUDE.md
```

It may also live at:

```text
.claude/CLAUDE.md
```

Claude supports several scopes:

```text
managed organization CLAUDE.md
~/.claude/CLAUDE.md
project CLAUDE.md
CLAUDE.local.md
```

The contents are loaded into model context as instructions, not as hard enforcement. Anthropic explicitly distinguishes behavioral instructions from settings or hooks that actually block actions [9].

### Hierarchy

Claude loads applicable `CLAUDE.md` and `CLAUDE.local.md` files from the working directory and ancestors. Files in subdirectories below the starting location are discovered when Claude works there [9].

Unlike a pure override system, applicable files are generally **concatenated** rather than replacing one another. More specific material appears later in context.

## 5.2 Relationship to `AGENTS.md`

Claude Code's native filename remains `CLAUDE.md`.

Current Anthropic documentation explicitly states that Claude Code reads `CLAUDE.md`, not `AGENTS.md`, and recommends creating a small `CLAUDE.md` that imports an existing `AGENTS.md`:

```markdown
@AGENTS.md
```

This provides interoperability without maintaining duplicate instruction bodies [9].

## 5.3 `.claude/rules/*.md`

Modular project rules live under:

```text
.claude/rules/
```

A rule without path metadata can be loaded generally. A path-scoped rule uses YAML frontmatter such as:

```yaml
---
paths:
  - "src/api/**/*.ts"
---
```

Claude activates those instructions when it works with matching files [9].

## 5.4 `.claude/skills/<skill>/SKILL.md`

Claude Code supports `SKILL.md` packages under project, personal, enterprise, and plugin scopes [10].

Typical project location:

```text
.claude/skills/deploy/SKILL.md
```

Typical personal location:

```text
~/.claude/skills/deploy/SKILL.md
```

Claude can activate skills automatically based on their description or expose them as commands. Skills in nested `.claude/skills/` directories can become available when Claude begins working in that subtree [10].

## 5.5 `.claude/agents/*.md`

Claude custom subagents use ordinary Markdown files under:

```text
.claude/agents/
~/.claude/agents/
```

The files use YAML frontmatter, with fields such as `name`, `description`, `tools`, and `model`, followed by the agent's system prompt in Markdown [11].

Claude watches existing agent directories for changes, allowing many agent-definition updates to become available without restarting the session [11].

## 5.6 `.claude/commands/*.md`

Claude retains Markdown custom-command compatibility under:

```text
.claude/commands/
```

Skills now overlap with and often supersede this older reusable-command role. When a command and a skill share a name, current Claude Code behavior gives the skill precedence [10].

## 5.7 Auto-Memory

Claude Code now includes agent-written auto-memory separate from `CLAUDE.md`.

A repository receives a memory directory such as:

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md
├── user_role.md
├── feedback_testing.md
└── ...
```

Anthropic distinguishes the two layers clearly:

```text
CLAUDE.md
    instructions written by the human

auto-memory
    learnings and patterns written by Claude
```

Auto-memory may record user preferences, corrections, project facts that cannot be derived from the code, and reference locations. Claude's documentation explicitly states that it does **not** save something every session; it decides whether the information is likely to be useful later [9].

This current behavior is especially relevant to later work on adaptive and implicit memory, but it is documented here only as an existing implementation.

---

# 6. OpenAI Codex

Codex uses `AGENTS.md` as its principal persistent repository-instruction convention and `.agents/skills/` as its primary portable repository skill path [12], [13].

## 6.1 `AGENTS.md` and `AGENTS.override.md`

Codex resolves instructions at two broad scopes:

- user/global Codex guidance; and
- repository guidance from the project root toward the current working directory.

At each directory level, Codex checks:

```text
AGENTS.override.md
AGENTS.md
configured fallback filenames
```

and includes at most one qualifying instruction file from that directory [12].

This makes `AGENTS.override.md` an explicit replacement mechanism rather than simply another appended note.

A typical structure is:

```text
repository/
├── AGENTS.md
└── services/
    └── payments/
        ├── AGENTS.md
        └── AGENTS.override.md
```

At the payments level, the override can replace the ordinary file for Codex instruction discovery [12].

## 6.2 `.agents/skills/<skill>/SKILL.md`

Codex implements the open Agent Skills model and scans `.agents/skills` from the current working directory upward toward the repository root. It also supports user and administrative skill locations [13].

The skill model is explicitly progressive:

```text
name + description
        ↓
agent decides skill is relevant
        ↓
full SKILL.md
        ↓
scripts / references / assets if needed
```

That means the repository can expose many skills without inserting every procedure into the initial model context [13].

## 6.3 Why Codex Matters to the Portable Model

Codex is notable because its two most important Markdown surfaces deliberately align with open conventions:

```text
AGENTS.md
.agents/skills/*/SKILL.md
```

A repository targeting multiple agents can therefore use Codex without creating a `CODEX.md` file.

---

# 7. Hermes Agent

Hermes combines project context, global agent identity, persistent user/memory files, a rich `SKILL.md` implementation, and compatibility with several external instruction formats [14]–[17].

## 7.1 Project Context Priority

Hermes recognizes:

```text
.hermes.md / HERMES.md
AGENTS.override.md
AGENTS.md
CLAUDE.md
.cursorrules
.cursor/rules/*.mdc
```

Its documented project-context priority begins with Hermes-native context and then falls through compatible formats. Only one project-context **type** is selected for the session, while `SOUL.md` is loaded independently as agent identity [14].

A key practical consequence is that dropping every supported file into one repository does not mean Hermes concatenates every family.

## 7.2 Hierarchical `AGENTS.md`

When Hermes selects `AGENTS.md`, it supports a chain from the Git root toward the working directory. Deeper files appear later and therefore provide more specific instructions [14].

Hermes also progressively discovers subdirectory context as the agent navigates through the repository. This reduces startup context and helps preserve prompt-cache stability [14].

## 7.3 `SOUL.md`

Hermes stores its primary personality and communication identity at:

```text
~/.hermes/SOUL.md
```

or the configured Hermes home.

It is not discovered from the repository working directory. This explicitly separates **agent identity** from **project instructions** [15], [16].

## 7.4 `USER.md` and `MEMORY.md`

Hermes distinguishes:

```text
USER.md
    information about the user

MEMORY.md
    what the agent has learned
```

Both are maintained under the Hermes memory location and injected as persistent context at session startup. Hermes documentation notes that writes made during the current session are persisted immediately but the frozen startup snapshot is refreshed on the next session, preserving prompt-prefix caching [16].

## 7.5 Hermes `SKILL.md`

Hermes uses the Agent Skills model but extends the frontmatter with a richer house convention.

A Hermes skill may include:

```yaml
---
name: my-skill
description: Brief description of what this skill does
version: 1.0.0
author: Your Name
license: MIT
platforms:
  - macos
  - linux
metadata:
  hermes:
    tags:
      - automation
      - python
    category: devops
---
```

Hermes also supports metadata for toolset requirements, configuration, platform gating, and related runtime behavior [17].

This is an **implementation extension**, not a replacement for the portable Agent Skills minimum. A skill intended for cross-agent use should still preserve the standard `name` and `description` contract.

---

# 8. OpenClaw

OpenClaw differs from most coding-only agents because it treats the agent workspace as a persistent home containing operating instructions, identity, user modeling, memory, and lifecycle files [18]–[21].

## 8.1 Workspace Model

The default workspace is typically:

```text
~/.openclaw/workspace
```

Current OpenClaw expects or supports a file map including:

```text
AGENTS.md
SOUL.md
IDENTITY.md
USER.md
BOOTSTRAP.md
MEMORY.md
memory/YYYY-MM-DD.md
BOOT.md
```

`DREAMS.md` participates in the memory-reflection subsystem [18]–[20].

## 8.2 `AGENTS.md`

OpenClaw uses workspace `AGENTS.md` for operating instructions, priorities, behavioral guidance, and memory-use conventions. Current documentation also places local tool notes under an `## Tools` section inside `AGENTS.md` [18].

This is broader than the typical coding-repository use of `AGENTS.md`, because an OpenClaw workspace can represent the persistent home of a personal or multi-channel agent rather than merely a source-code repository.

## 8.3 `SOUL.md`, `IDENTITY.md`, and `USER.md`

OpenClaw separates three concepts:

```text
SOUL.md
    persona, tone, boundaries

IDENTITY.md
    name, vibe, emoji / presentation identity

USER.md
    stable preferences, communication style, relationships,
    and active user context
```

That separation is useful because each category changes for a different reason [18], [20].

## 8.4 `MEMORY.md`, Daily Memory, and `DREAMS.md`

OpenClaw uses:

```text
MEMORY.md
    durable long-term facts and decisions

memory/YYYY-MM-DD.md
    dated observations and daily/episodic notes

DREAMS.md
    human-reviewable output from reflective consolidation
```

Current OpenClaw memory documentation describes `DREAMS.md` as the human review surface for reflection/consolidation while durable promotion ultimately updates `MEMORY.md` [19].

## 8.5 `BOOTSTRAP.md` and `BOOT.md`

`BOOTSTRAP.md` is created for a brand-new workspace as a one-time first-run ritual and is intended to disappear after initialization [18], [20].

`BOOT.md` is an optional startup checklist that runs when the corresponding gateway boot hook is enabled [18].

## 8.6 `HEARTBEAT.md` — Current Status

Older OpenClaw documentation and workspaces may contain:

```text
HEARTBEAT.md
```

Current OpenClaw reference documentation marks the workspace file as **retired**. New workspaces no longer create it, and heartbeat instructions have moved into system-owned monitor/cron state [21].

This is exactly why vendor/version documentation is necessary: the name is historically real, but presenting it as a current portable standard would be incorrect.

## 8.7 Skills

OpenClaw currently loads skills from several sources, including:

```text
<workspace>/skills
<workspace>/.agents/skills
~/.agents/skills
~/.openclaw/skills
bundled skill roots
configured extra directories
```

The skill entry remains `SKILL.md` [20].

---

# 9. Gemini CLI

Gemini CLI combines a native hierarchical context file with portable Agent Skills and Markdown-defined local subagents [22]–[24].

## 9.1 `GEMINI.md`

The default persistent context filename is:

```text
GEMINI.md
```

Gemini uses it for project instructions, personas, style guidance, and other reusable context [22].

A `GEMINI.md` can import another file:

```markdown
@./shared/instructions.md
```

Gemini also allows the context filename itself to be configured. For example, a user can configure:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
  }
}
```

This makes `AGENTS.md` compatibility an explicit configuration option rather than requiring duplication [22].

## 9.2 Agent Skills

Gemini supports:

```text
.gemini/skills/
.agents/skills/
~/.gemini/skills/
~/.agents/skills/
```

Its documented precedence favors more specific workspace skills over user and extension/built-in sources. The `.agents/skills/` alias exists specifically for cross-tool interoperability [23].

Gemini exposes only skill metadata initially, then activates the full skill after determining relevance and obtaining activation consent where required [23].

## 9.3 Subagents

Gemini custom subagents are Markdown files with YAML frontmatter:

```text
.gemini/agents/security-auditor.md
~/.gemini/agents/security-auditor.md
```

The body becomes the agent system prompt. Frontmatter can define its name, description, model, temperature, and tool access [24].

Each subagent operates with an independent context, which keeps specialized analysis from unnecessarily consuming the main conversation's context window.

---

# 10. Qwen Code

Qwen Code has one of the broader current Markdown ecosystems: persistent project context, personal local context, Agent Skills, custom subagents, Markdown commands, automatic memory, pinned memory, and reflective cleanup [25]–[28].

## 10.1 `QWEN.md`

`QWEN.md` is Qwen Code's persistent project briefing.

Typical scopes include:

```text
~/.qwen/QWEN.md
project/QWEN.md
project/.qwen/QWEN.local.md
```

Qwen also reads an existing `AGENTS.md`, reducing the need to duplicate shared instructions [25].

`QWEN.local.md` is intended for personal project-specific instructions that should not necessarily be committed to the repository.

## 10.2 Skills

Qwen project skills use:

```text
.qwen/skills/<skill>/SKILL.md
```

with YAML frontmatter and Markdown instructions [26].

Qwen's implementation adds its own optional properties, such as priority and path gating, while preserving the core concept of a named, described procedural resource.

## 10.3 Subagents

Qwen stores project and user subagents at:

```text
.qwen/agents/
~/.qwen/agents/
```

Each subagent is a Markdown file with YAML frontmatter followed by a system prompt. Fields include agent identity, model selection, approval mode, tool allowlists, and disallowed tools [27].

Qwen also supports selected Claude Code compatibility fields, demonstrating deliberate interoperability at the metadata layer [27].

## 10.4 Markdown Custom Commands

Current Qwen custom commands use Markdown:

```text
.qwen/commands/<name>.md
~/.qwen/commands/<name>.md
```

Nested directories create namespaced commands such as:

```text
.qwen/commands/git/commit.md
    → /git:commit
```

The older TOML command format remains deprecated compatibility behavior [28].

## 10.5 Auto-Memory and `/dream`

Qwen separates human-authored `QWEN.md` from automatic memory. Its memory interface supports remembered items, pinned memory, team memory, forgetting, and a `/dream` operation for periodic cleanup and synthesis [25].

This is conceptually similar to the broader distinction emerging across several frameworks:

```text
explicit instructions
    written deliberately by the human

learned memory
    maintained by the agent/runtime
```

---

# 11. Kimi Code

Kimi Code currently supports portable instruction and skill locations while also providing its own system-prompt and custom-agent mechanisms [29], [30].

## 11.1 Instruction Files

Kimi supports user and project instructions such as:

```text
$KIMI_CODE_HOME/AGENTS.md
~/.agents/AGENTS.md
.kimi-code/AGENTS.md
AGENTS.md
```

This gives Kimi both a vendor-specific location and a shared `.agents` compatibility surface [29].

## 11.2 `SYSTEM.md`

Kimi also supports:

```text
$KIMI_CODE_HOME/SYSTEM.md
```

as a full main-agent system-prompt override.

This is much more powerful than ordinary repository guidance. It should be treated as trusted user configuration, not as another generic project-context file [29].

## 11.3 Skills

Kimi supports:

```text
.kimi-code/skills/
.agents/skills/
~/.kimi-code/skills/
~/.agents/skills/
```

and recommends directory-form skills containing `SKILL.md` for richer packages. Kimi's skill frontmatter can additionally express invocation behavior, named arguments, trigger guidance, and skill type [30].

## 11.4 Custom Agents

Kimi custom agents are Markdown files with YAML frontmatter and a Markdown system prompt. Project-level agent discovery includes Kimi-specific and portable `.agents/agents/` locations [29].

Kimi's documentation makes an important security point: a repository-provided custom agent can have a much stronger effect than ordinary repository guidance because it may replace a built-in agent's system prompt or retain broad tool access [29].

That distinction should be considered whenever agent-definition files are committed to third-party repositories.

---

# 12. OpenCode

OpenCode V2 deliberately centers `AGENTS.md` as persistent instructions, `SKILL.md` as on-demand behavior, Markdown agent files as reusable profiles, and Markdown command files as explicit shortcuts [31]–[34].

## 12.1 `AGENTS.md`

Current OpenCode V2 loads:

```text
~/.config/opencode/AGENTS.md
```

plus applicable project `AGENTS.md` files.

OpenCode combines applicable instruction files rather than treating them as one simple replacement chain [31].

Importantly, current V2 documentation says that older `CLAUDE.md` fallback behavior does **not** describe the current discovery path. This is another example of why current-version documentation must be distinguished from older tutorials [31].

## 12.2 Skills

OpenCode supports:

```text
.opencode/skills/<name>/SKILL.md
~/.config/opencode/skills/<name>/SKILL.md
.claude/skills/<name>/SKILL.md
.agents/skills/<name>/SKILL.md
```

The model initially sees the skill identity and description, then calls the skill tool to load the full body [32].

Permissions can independently allow, deny, or require approval for skill loading.

## 12.3 Agents

OpenCode custom agents use:

```text
.opencode/agents/<name>.md
~/.config/opencode/agents/<name>.md
```

The Markdown body becomes the agent's system prompt; frontmatter configures model preference, permissions, mode, step limits, and display metadata [33].

## 12.4 Commands

OpenCode supports reusable custom command definitions, including Markdown-based project/user command surfaces. Commands can select an agent or model and can be configured to run as a subtask so the work does not unnecessarily consume primary context [34].

---

# 13. Factory Droid

Factory Droid combines `AGENTS.md`, `SKILL.md`, custom Droids, design-specific Markdown, and explicit command surfaces [35], [36].

## 13.1 `AGENTS.md`

Factory recommends `AGENTS.md` for durable project commands, conventions, boundaries, and verification requirements.

Its documentation also recognizes compatible filenames, including selected capitalization variants and `CLAUDE.md`, but explicitly warns against creating all compatibility files and duplicating the same instructions [35].

## 13.2 `DESIGN.md`

Factory is unusual in explicitly treating:

```text
DESIGN.md
Design.md
design.md
```

as separate always-on design-system, user-experience, visual, and interaction guidance [35].

This demonstrates that vendor-native semantic files can coexist with portable repository instructions.

## 13.3 Skills and Commands

Factory skills use:

```text
.factory/skills/<skill>/SKILL.md
```

and are intended for reusable workflows that are too specialized for permanent `AGENTS.md` context [36].

Factory also exposes `.factory/commands/*` for simpler user-invoked shortcuts.

---

# 14. Goose

Goose is notable for actively recommending the portable `.agents/` namespace for both skills and custom agents [37], [38].

## 14.1 Skills

Recommended locations:

```text
.agents/skills/<skill>/SKILL.md
~/.agents/skills/<skill>/SKILL.md
```

Goose retains compatibility with selected `.goose/skills/` and `.claude/skills/` locations but identifies `.agents/skills/` as the preferred shared standard [37].

## 14.2 Custom Agents

Recommended locations:

```text
.agents/agents/<name>.md
~/.agents/agents/<name>.md
```

The files use YAML frontmatter and a Markdown instruction body. Goose can delegate work to custom agents when delegation tools are available [38].

This is one of the clearest current examples of `.agents/` evolving from a skill-only interoperability path into a broader shared agent-resource namespace.

---

# 15. Windsurf

Windsurf's Cascade environment separates automatically generated memories from explicit rules and also recognizes `AGENTS.md` [39].

## 15.1 Rules

Workspace rules live at:

```text
.windsurf/rules/*.md
```

Global rules live in:

```text
~/.codeium/windsurf/memories/global_rules.md
```

Workspace rules can declare activation behavior rather than being permanently active in every situation [39].

## 15.2 `AGENTS.md`

Windsurf processes `AGENTS.md` through the same broader rules mechanism. Root-level guidance is broadly applicable, while nested `AGENTS.md` files can be scoped to the corresponding directory [39].

## 15.3 Memories

Cascade can generate local Memories automatically. Windsurf distinguishes these from explicit, shareable repository rules. Its documentation recommends writing durable team guidance into `.windsurf/rules/` or `AGENTS.md` instead of relying on locally generated Memories [39].

---

# 16. Cline

Cline uses its own project-rule ecosystem while also supporting Agent Skills.

## 16.1 Rules

Cline's traditional rule surface is the `.clinerules/` directory. Rules can be project-specific, while global rules apply across workspaces.

In multi-root workspaces, current documentation notes that project `.clinerules/` behavior is tied to the primary workspace, which is an implementation detail that matters in large multi-repository projects [40].

## 16.2 Skills

Current Cline documentation recommends:

```text
.cline/skills/
```

for project skills, while also recognizing compatibility locations including:

```text
.clinerules/skills/
.claude/skills/
```

Each skill may bundle `SKILL.md` and additional supporting files [41].

---

# 17. OpenHands

OpenHands distinguishes permanent repository context, triggered knowledge, and progressive Agent Skills [42], [43].

## 17.1 Permanent Context

OpenHands recommends root-level:

```text
AGENTS.md
```

for always-loaded repository guidance.

It also recognizes model-specific compatibility files such as:

```text
CLAUDE.md
GEMINI.md
```

and several older instruction formats [42].

## 17.2 Agent Skills

OpenHands supports the open `SKILL.md` directory model under `.agents/skills/`. It also retains a legacy OpenHands format in which plain Markdown files under `.agents/skills/*.md` can be trigger-loaded [42].

The distinction matters:

```text
.agents/skills/foo/SKILL.md
    Agent Skills progressive-disclosure package

.agents/skills/foo.md
    legacy/simple OpenHands triggered skill
```

---

# 18. Kiro

Kiro uses Markdown **steering** for persistent project knowledge and Markdown **spec artifacts** for requirements-driven development [44], [45].

## 18.1 Steering

Workspace steering files live under:

```text
.kiro/steering/
```

Common foundation files are:

```text
product.md
tech.md
structure.md
```

Kiro can also recognize `AGENTS.md` as steering input [44].

Custom steering files can be always included, path/file matched, manually invoked, or automatically selected according to descriptive metadata.

## 18.2 Specs

Kiro's specification workflow produces:

```text
.kiro/specs/<feature>/
├── requirements.md
├── design.md
└── tasks.md
```

Those files are not generic agent-control files in the same sense as `AGENTS.md`; they are persistent artifacts in a spec-driven development lifecycle [45].

Still, they are important to the broader Markdown control plane because agents actively create, revise, and execute against them.

---

# 19. Amazon Q Developer

Amazon Q Developer uses Markdown project rules and can generate a project memory bank as Markdown [46], [47].

## 19.1 Project Rules

Rules live under:

```text
.amazonq/rules/
```

Amazon Q uses these files automatically as project context in supported IDE and repository workflows [46].

A rule can encode coding standards, security constraints, architectural practices, or other project-specific guidance.

## 19.2 Memory Bank

Amazon Q can generate:

```text
.amazonq/rules/memory-bank/
├── product.md
├── structure.md
├── tech.md
└── guidelines.md
```

These files summarize project purpose, architecture, technology, and working standards so the agent does not need to reconstruct all of that context repeatedly [47].

This is a **project-context memory bank**, not the same thing as a persistent user-learning model.

---

# 20. Continue

Continue uses Markdown rule files as a principal mechanism for customizing agent behavior [48].

## 20.1 `.continue/rules/*.md`

Rules live under:

```text
.continue/rules/
```

and can use YAML frontmatter such as:

```yaml
---
name: Documentation Standards
globs:
  - "docs/**/*.md"
alwaysApply: false
description: Standards for project documentation.
---
```

Continue can include rules globally, by matching file globs or regexes, or through agent relevance decisions depending on configuration [48].

This is another example of the industry-wide movement toward **selective instruction loading** rather than one monolithic permanent prompt.

---

# 21. Amp

Amp uses `AGENTS.md` as its preferred persistent project instruction convention and retains compatibility with earlier or vendor-specific names [49].

## 21.1 Instruction Discovery

Amp looks for `AGENTS.md` in:

- the current working directory;
- ancestor directories;
- relevant subtrees as the agent reads files;
- personal configuration locations; and
- optional system-wide locations [49].

If no `AGENTS.md` exists at a location, Amp can fall back to:

```text
AGENT.md
CLAUDE.md
```

This is historically significant because Amp originally promoted singular `AGENT.md`, then deliberately migrated toward the plural `AGENTS.md` convention to reduce ecosystem fragmentation [49].

---

# 22. What the Vendors Are Converging On

Despite the number of products, the implementation patterns are becoming easier to classify.

## 22.1 Repository Instructions Are Converging Around `AGENTS.md`

The strongest shared file is:

```text
AGENTS.md
```

It is native or deliberately compatible in Codex, Cursor, Hermes, GitHub Copilot surfaces, OpenCode, Factory, Windsurf, OpenHands, Kiro, Amp, and other tools.

Claude Code remains a notable exception because its native context file is `CLAUDE.md`, although Anthropic explicitly documents the `@AGENTS.md` import pattern [9].

## 22.2 Skills Are Converging Around `SKILL.md`

The second major point of convergence is Agent Skills:

```text
<skill>/
└── SKILL.md
```

Support now spans tools including Codex, Claude Code, GitHub Copilot/VS Code, Cursor, Hermes, Gemini CLI, Qwen Code, Kimi Code, OpenCode, Factory, Goose, Cline, and OpenHands.

The portable minimum remains deliberately small:

```yaml
---
name: example-skill
description: Explain what this skill does and when it should be used.
---
```

Vendors may add metadata, but portability depends on preserving the common core.

## 22.3 `.agents/` Is Emerging as an Interoperability Namespace

Several tools now recognize:

```text
.agents/skills/
~/.agents/skills/
```

and some also recognize:

```text
.agents/agents/
~/.agents/agents/
```

This is not yet as universally standardized as `AGENTS.md` or `SKILL.md`, but it is one of the clearest directory-level convergence trends.

## 22.4 Rules Remain Fragmented

Rules are conceptually common but structurally fragmented:

```text
.github/instructions/*.instructions.md
.cursor/rules/*.mdc
.claude/rules/*.md
.windsurf/rules/*.md
.clinerules/
.amazonq/rules/*.md
.continue/rules/*.md
.kiro/steering/*.md
```

The common idea is obvious—persistent or conditional behavioral guidance—but there is no universal `RULE.md` or `RULES.md` contract currently shared across the ecosystem.

## 22.5 Custom Agents Are Converging on Markdown + YAML Frontmatter

The filename varies:

```text
*.agent.md
.claude/agents/*.md
.cursor/agents/*.md
.gemini/agents/*.md
.qwen/agents/*.md
.kimi-code/agents/*.md
.opencode/agents/*.md
.agents/agents/*.md
```

But the underlying pattern is remarkably consistent:

```text
YAML metadata
    name
    description
    model
    tools / permissions
    other runtime options

Markdown body
    specialist role and system instructions
```

This is a meaningful structural convergence even though the exact schema is not portable.

---

# 23. The Most Important Compatibility Differences

A developer building a multi-agent repository should pay attention to four differences above all others.

## 23.1 Concatenation Versus Replacement

Some runtimes concatenate multiple applicable files. Others choose one file family or allow an override to replace another source.

Examples:

```text
Claude Code
    concatenates applicable CLAUDE.md hierarchy

Codex
    selects one file per directory, with AGENTS.override.md before AGENTS.md

Hermes
    selects one project-context type according to its priority chain

OpenCode V2
    combines applicable AGENTS.md instruction sources
```

A repository should therefore not assume that "nearest file wins" means the same thing everywhere.

## 23.2 Startup Loading Versus Progressive Discovery

Some files enter context immediately. Others are discovered when the agent enters a directory or activates a capability.

Examples:

```text
AGENTS.md / CLAUDE.md
    frequently startup or ambient context

nested repository instructions
    may be discovered when files in that subtree are accessed

SKILL.md
    generally metadata first, full body later

references/*
    normally only when the active skill needs them
```

This difference directly affects context-window usage.

## 23.3 Instructions Versus Enforcement

A Markdown instruction is usually **guidance to a model**, not a hard security boundary.

Claude's documentation makes this distinction explicit: behavioral guidance belongs in `CLAUDE.md`, while client settings or hooks are required to block tools or enforce sandbox behavior regardless of what the model decides [9].

The same principle applies generally:

> A sentence saying "never run destructive commands" is not equivalent to a runtime permission that makes destructive commands impossible.

## 23.4 Repository Trust

Agent files can contain executable-looking instructions, tool permissions, scripts, and system-prompt content.

Skills and agent definitions from an untrusted repository should therefore be reviewed in the same spirit as scripts or build configuration. Kimi explicitly warns that a project agent definition can replace a built-in agent prompt, while Gemini and VS Code emphasize review/consent around third-party skills [2], [23], [29].

---

# 24. Recommended Interoperability Strategy

A repository that wants broad compatibility should **not create every supported vendor file by default**.

A cleaner strategy is:

```text
repository/
├── AGENTS.md                     # portable repository instructions
│
├── .agents/
│   └── skills/
│       └── example/
│           └── SKILL.md          # portable skill
│
├── CLAUDE.md                     # only if Claude Code support is required
│                                 # ideally imports AGENTS.md
│
├── .github/
│   └── instructions/             # only for Copilot-specific scoped rules
│
├── .cursor/
│   └── rules/                    # only for Cursor-specific structured rules
│
└── <other vendor dirs>           # only when they provide unique value
```

The principle is:

> **Use portable files for shared meaning and vendor files only for behavior that cannot be expressed portably.**

For Claude Code, for example:

```markdown
@AGENTS.md

## Claude-specific behavior

Use Plan mode before modifying production migration logic.
```

is usually better than manually copying the entire contents of `AGENTS.md` into `CLAUDE.md`.

---

# 25. Summary

The current ecosystem is not one Markdown standard. It is a collection of related implementations that are beginning to converge.

The strongest common foundation is:

```text
AGENTS.md
    portable repository instructions

SKILL.md
    portable reusable procedural capability
```

Around those two anchors, vendors provide increasingly similar but still incompatible concepts:

```text
rules / instructions
custom agents
prompts / commands
plans / specs
identity
memory
startup behavior
```

The major implementation differences are not primarily about Markdown syntax. They are about:

- **discovery paths;**
- **scope;**
- **precedence;**
- **activation;**
- **context budgeting;**
- **permissions;**
- **runtime trust; and**
- **whether the file is guidance, state, or an executable control surface.**

For engineers designing new agent-facing file conventions, those behaviors matter more than inventing another filename.

The next layer of work can therefore build on a stable observation:

> Modern agent systems already have an emerging atomic procedural unit—`SKILL.md`—and a portable repository instruction surface—`AGENTS.md`. New conventions should extend that ecosystem deliberately, preserve progressive disclosure, and avoid forcing developers to duplicate the same meaning across vendor-specific files.

---

# References

[1] GitHub, “Adding custom instructions for GitHub Copilot CLI,” *GitHub Docs*. [Online]. Available: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions. Accessed: Sep. 3, 2026.

[2] Microsoft, “Use Agent Skills in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/agent-skills. Accessed: Sep. 3, 2026.

[3] Microsoft, “Use prompt files in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/prompt-files. Accessed: Sep. 3, 2026.

[4] GitHub, “Support for different types of custom instructions,” *GitHub Docs*. [Online]. Available: https://docs.github.com/en/copilot/reference/custom-instructions-support. Accessed: Sep. 3, 2026.

[5] Microsoft, “Custom agents in VS Code,” *Visual Studio Code Documentation*. [Online]. Available: https://code.visualstudio.com/docs/agent-customization/custom-agents. Accessed: Sep. 3, 2026.

[6] Cursor, “Rules,” *Cursor Documentation*. [Online]. Available: https://cursor.com/docs/rules. Accessed: Sep. 3, 2026.

[7] Cursor, “Agent Skills,” *Cursor Documentation*. [Online]. Available: https://cursor.com/docs/skills. Accessed: Sep. 3, 2026.

[8] Cursor, “Subagents,” *Cursor Documentation*. [Online]. Available: https://cursor.com/docs/subagents. Accessed: Sep. 3, 2026.

[9] Anthropic, “How Claude remembers your project,” *Claude Code Documentation*. [Online]. Available: https://code.claude.com/docs/en/memory. Accessed: Sep. 3, 2026.

[10] Anthropic, “Extend Claude with skills,” *Claude Code Documentation*. [Online]. Available: https://code.claude.com/docs/en/skills. Accessed: Sep. 3, 2026.

[11] Anthropic, “Create custom subagents,” *Claude Code Documentation*. [Online]. Available: https://code.claude.com/docs/en/sub-agents. Accessed: Sep. 3, 2026.

[12] OpenAI, “Custom instructions with AGENTS.md,” *Codex Documentation*. [Online]. Available: https://learn.chatgpt.com/docs/agent-configuration/agents-md. Accessed: Sep. 3, 2026.

[13] OpenAI, “Build skills,” *Codex Documentation*. [Online]. Available: https://learn.chatgpt.com/docs/build-skills. Accessed: Sep. 3, 2026.

[14] Nous Research, “Context Files,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files/. Accessed: Sep. 3, 2026.

[15] Nous Research, “Hermes Agent Configuration,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/configuration/. Accessed: Sep. 3, 2026.

[16] Nous Research, “Which File Does What?,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/which-file-does-what. Accessed: Sep. 3, 2026.

[17] Nous Research, “Skills System,” *Hermes Agent Documentation*. [Online]. Available: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/. Accessed: Sep. 3, 2026.

[18] OpenClaw Foundation, “Agent workspace,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/agent-workspace. Accessed: Sep. 3, 2026.

[19] OpenClaw Foundation, “Memory overview,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/concepts/memory. Accessed: Sep. 3, 2026.

[20] OpenClaw Foundation, “Agent runtime,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/concepts/agent. Accessed: Sep. 3, 2026.

[21] OpenClaw Foundation, “Retired HEARTBEAT.md workspace file,” *OpenClaw Documentation*. [Online]. Available: https://docs.openclaw.ai/templates/HEARTBEAT. Accessed: Sep. 3, 2026.

[22] Google, “Provide context with GEMINI.md files,” *Gemini CLI Documentation*. [Online]. Available: https://geminicli.com/docs/cli/gemini-md/. Accessed: Sep. 3, 2026.

[23] Google, “Agent Skills,” *Gemini CLI Documentation*. [Online]. Available: https://geminicli.com/docs/cli/skills/. Accessed: Sep. 3, 2026.

[24] Google, “Subagents,” *Gemini CLI Documentation*. [Online]. Available: https://geminicli.com/docs/core/subagents/. Accessed: Sep. 3, 2026.

[25] Qwen, “Memory,” *Qwen Code Documentation*. [Online]. Available: https://qwenlm.github.io/qwen-code-docs/en/users/features/memory/. Accessed: Sep. 3, 2026.

[26] Qwen, “Agent Skills,” *Qwen Code Documentation*. [Online]. Available: https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/. Accessed: Sep. 3, 2026.

[27] Qwen, “Subagents,” *Qwen Code Documentation*. [Online]. Available: https://qwenlm.github.io/qwen-code-docs/en/users/features/sub-agents/. Accessed: Sep. 3, 2026.

[28] Qwen, “Commands,” *Qwen Code Documentation*. [Online]. Available: https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/. Accessed: Sep. 3, 2026.

[29] Kimi, “Agents and Sub-Agents,” *Kimi Code Documentation*. [Online]. Available: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents. Accessed: Sep. 3, 2026.

[30] Kimi, “Agent Skills,” *Kimi Code Documentation*. [Online]. Available: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html. Accessed: Sep. 3, 2026.

[31] OpenCode, “Instructions,” *OpenCode Documentation*. [Online]. Available: https://opencode.ai/v2/docs/instructions. Accessed: Sep. 3, 2026.

[32] OpenCode, “Agent Skills,” *OpenCode Documentation*. [Online]. Available: https://opencode.ai/docs/skills. Accessed: Sep. 3, 2026.

[33] OpenCode, “Agents,” *OpenCode Documentation*. [Online]. Available: https://opencode.ai/v2/docs/agents. Accessed: Sep. 3, 2026.

[34] OpenCode, “Commands,” *OpenCode Documentation*. [Online]. Available: https://dev.opencode.ai/docs/commands. Accessed: Sep. 3, 2026.

[35] Factory, “AGENTS.md,” *Factory Documentation*. [Online]. Available: https://docs.factory.ai/harness/agents-md. Accessed: Sep. 3, 2026.

[36] Factory, “Skills,” *Factory Documentation*. [Online]. Available: https://docs.factory.ai/harness/skills. Accessed: Sep. 3, 2026.

[37] Block, “Agent Skills,” *Goose Documentation*. [Online]. Available: https://goose-docs.ai/docs/guides/context-engineering/using-skills/. Accessed: Sep. 3, 2026.

[38] Block, “Custom Agents,” *Goose Documentation*. [Online]. Available: https://goose-docs.ai/docs/guides/context-engineering/custom-agents/. Accessed: Sep. 3, 2026.

[39] Windsurf, “Cascade Memories & Rules,” *Windsurf Documentation*. [Online]. Available: https://docs.windsurf.com/windsurf/cascade/memories. Accessed: Sep. 3, 2026.

[40] Cline, “Multi-Root Workspaces,” *Cline Documentation*. [Online]. Available: https://docs.cline.bot/features/multiroot-workspace. Accessed: Sep. 3, 2026.

[41] Cline, “Skills,” *Cline Documentation*. [Online]. Available: https://docs.cline.bot/customization/skills. Accessed: Sep. 3, 2026.

[42] OpenHands, “Skills,” *OpenHands Documentation*. [Online]. Available: https://docs.openhands.dev/overview/skills. Accessed: Sep. 3, 2026.

[43] OpenHands, “Agent Skills & Context,” *OpenHands Documentation*. [Online]. Available: https://docs.openhands.dev/sdk/guides/skill. Accessed: Sep. 3, 2026.

[44] Kiro, “Steering,” *Kiro Documentation*. [Online]. Available: https://kiro.dev/docs/steering/. Accessed: Sep. 3, 2026.

[45] Kiro, “Specs in CLI,” *Kiro Documentation*. [Online]. Available: https://kiro.dev/docs/cli/v3/specs/. Accessed: Sep. 3, 2026.

[46] Amazon Web Services, “Creating project rules for use with Amazon Q Developer chat,” *Amazon Q Developer User Guide*. [Online]. Available: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-project-rules.html. Accessed: Sep. 3, 2026.

[47] Amazon Web Services, “Generating a memory bank for Amazon Q chat,” *Amazon Q Developer User Guide*. [Online]. Available: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-memory-bank.html. Accessed: Sep. 3, 2026.

[48] Continue, “How to Create and Manage Rules in Continue,” *Continue Documentation*. [Online]. Available: https://docs.continue.dev/customize/deep-dives/rules. Accessed: Sep. 3, 2026.

[49] Amp, “AGENTS.md,” *Amp Documentation*. [Online]. Available: https://ampcode.com/docs/customize/agents-md. Accessed: Sep. 3, 2026.

---

## Document Scope Note

This document describes current vendor implementations and compatibility behavior. It intentionally does **not** define the proposed `SKILLSET.md`, `CAPABILITY.md`, dynamic implicit-memory model, or any other new specification. Those proposals should remain separate from the survey of existing practice so readers can clearly distinguish **observed ecosystem behavior** from **new architectural contributions**.
