

# Offical-Agentic-Prompt-Starter-Kit
Opensource production-ready AI agent prompt template &amp; workspace kit for Cursor, Claude Code, Windsurf, &amp; MCP server prompts. Drop-in rules, skills, &amp; system prompts to automate task decomposition, role assignment, and multi-step reasoning loops while preventing prompt injection. Structural context playbooks for precise, error-free code generation.

---

## 🔗 Admin Local — Start Here

**[Admin Local](https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local)** is a free VS Code extension by Shaun Pritchard. It gives every repository a private, Git-safe `.admin-local/` workbench, and links that workbench to one shared, computer-wide **Toolbox** (`shared_toolbox/`) via a filesystem link. Install this framework into the Toolbox **once**, and every project you initialize with Admin Local can use it immediately — no per-project copying, no drift between projects.

**Marketplace link:** https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local

- API keys, prompts, scripts, and this framework live in one centralized Toolbox shared across all your repositories.
- `.admin-local/` is added to `.git/info/exclude`, so it never gets committed with application code.
- Editing the framework in one project's Toolbox link updates it everywhere — no syncing.
- Full walkthrough with setup steps: **[Section 2 — Recommended: Admin Local](#2-recommended-admin-local)**.

**Don't use Admin Local?** Skip straight to **[Section 1 — Fastest Start](#1-fastest-start)** for the shell-script, MCP-server, or manual-copy install paths — all covered below, for both a **fresh install** and an **existing project** that already has its own agent-control files.

**Tell your agent to do this for you.** Once your agent (Claude Code, Copilot, Cursor, etc.) can read this README — or once the local MCP server (§4) is connected — you can simply say:

```text
Go get the Offical-Agentic-Prompt-Starter-Kit from GitHub
(https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git)
and install it into this project.
```

or, if the MCP server is already wired in:

```text
Use the framework MCP tools to inspect, install, and wire this framework into the current project.
```

Either path works for a brand-new project or an existing one — see §16 for migrating an existing project's agent-control files instead of scattering copies.

---

## 🚀 Overview
The Agentic Prompt Starter Kit provides a standardized, multi-document context (MDC) architecture designed explicitly for modern AI coding assistants and agent loops (including Cursor, Claude Code, Windsurf, GitHub Copilot Workspace, and Model Context Protocol (MCP) clients).
By splitting monolithic system prompts into highly optimized, localized files—such as rules.md, skills.md, identity.md, and tools.md—this architecture dramatically slashes token overhead and ensures your LLMs execute complex reasoning loops safely, without context dilution or code hallucination ([0:25](https://www.youtube.com/watch?v=bwvfdFWR1RI&t=25s)).


---

## 🧱 Core Techniques & Agentic Patterns
This framework transitions your development environment from single, fragile instructions into an enterprise-grade agentic workflow ([0:50](https://www.youtube.com/watch?v=bwvfdFWR1RI&t=50s)). It enforces four core pillars natively within your IDE context:

* Task Decomposition: Automatically splits complex, large-scale software engineering goals into sequential, bite-sized mini-tasks to eliminate model confusion ([6:07](https://www.youtube.com/watch?v=bwvfdFWR1RI&t=367s)).
* Role Assignment: Provisions clean, isolated system personas (agent.md) mapping dedicated inputs, tool execution bounds, and strict output contracts.
* Chain of Thought (CoT): Mandates models to process state changes inside hidden <thinking> blocks before running code modifications or terminal commands.
* Tool Augmentation: Seamlessly bridges your local LLM to terminal runners, file system controllers, and custom Model Context Protocol (MCP) tool servers.

---

## ⚖️ Why Shift to Modular Agentic Prompting?

   1. Fewer Hallucinations: Breaking a codebase execution down into single-purpose rule scopes (.mdc / .md fragments) prevents token dilution and erratic logic drifts ([4:54](https://www.youtube.com/watch?v=bwvfdFWR1RI&t=294s)).
   2. Deterministic Consistency: Standardized templates ensure predictable code formatting, testing standards, and file structures across your entire development team.
   3. Model Agility: Empowers smaller, cost-efficient, or open-source local models to successfully complete highly complex refactoring scripts that would normally crash a massive monolithic prompt window ([0:00](https://www.youtube.com/watch?v=bwvfdFWR1RI&t=0s)).

---

## 📂 Repository File System Architecture
This repository implements the exact directory schema required for native AI context injection:

```
📂 Offical-Agentic-Prompt-Starter-Kit/
│
├── 📜 README.md                             # Global workspace documentation
├── ⚙️ INSTALL-FRAMEWORK.SH                  # Automated ingestion & workspace setup script
├── 📌 MIGRATION.INSTRUCTIONS.md             # Scaling guide for integrating an existing project
├── 📌 AGENT-SETUP.INSTRUCTIONS.md           # Local IDE environment provisioning
├── 📝 CAPABILITY_SKILLSET_SKILL_COMPOSITION_MODEL.md
├── 📝 VENDOR_AGENT_CONTROL_FILE_IMPLEMENTATIONS.md
├── 📝 COMMON_AGENT_CONTROL_MARKDOWN_FILES.md
│
├── 📂 agent-specifications/                 # Authoring contract library (specs/*.specification.md)
├── 📁 rules/                                # Global guardrails and formatting constraints
├── 📁 modes/                                # State-based operation shifts (e.g., architect vs. engineer)
├── 📁 instructions/                         # Strict codebase and styling execution behaviors
├── 📁 plans/                                # Multi-step sequential reasoning loop logic
├── 📁 workflows/                            # State machines for complex multi-agent execution
├── 📁 agents/                               # Root system personas and configuration blocks
├── 📁 tools/                                # Execution loop mechanics, tags, and formatting rules
├── 📁 identity/                             # Core behavioral constraints and "constitutions"
├── 📁 skills/                               # On-demand, feature-specific capability registers
├── 📁 memory/                               # Context management and state boundaries
├── 📁 task/                                 # Task/Task-List routing manifest and instructions
├── 📁 telemetry/                            # Logging, token monitoring, and agent tracing
├── 📁 state/                                # Persisted agent runtime flags
├── 📁 prompt_engineering/                   # Raw metaprompt libraries
├── 📁 emulation/                            # Cross-client environment simulators
└── 📁 mcp/mcp-server/                       # Local stdio MCP server (see §4)
```

All of the above are top-level folders in this repository — see §8 for the complete file-level structure.

---


## ⚙️ VS Code Model Context Protocol (MCP) Server

This repository ships with a dedicated Node-based Agent-Control MCP Server at `mcp/mcp-server/`. Once added to your IDE, your LLM gains its own tools to inspect, install/update, wire, and plan migrations for the framework. Full setup, tool list, and security notes: **[Section 4 — Install or Manage With MCP](#4-install-or-manage-with-mcp)**.
To register the MCP server in Cursor / VS Code Copilot / Claude Desktop:
Add this to your local MCP settings configuration file:

```json
{
  "mcpServers": {
    "agent-control-framework": {
      "command": "node",
      "args": ["path/to/Offical-Agentic-Prompt-Starter-Kit/mcp/mcp-server/src/index.mjs"],
      "env": {
        "AGENT_FRAMEWORK_HOME": "path/to/Offical-Agentic-Prompt-Starter-Kit"
      }
    }
  }
}
```

This allows the LLM to call the tools `framework_inspect`, `framework_install_or_update`, `framework_wire_agent`, and `framework_write_migration_plan` directly through your chat window. See `mcp/mcp-server/README.md` for full details.

---


This repository is a **agentic prompt starter kit** for projects that use AI coding agents, local agents, subagents, MCP tools, reusable skills, task systems, memory, runtime state, emulation, and vendor-specific control files.


## The central idea is simple:

```text
DO NOT PUT EVERY INSTRUCTION INTO ONE GIANT AGENT FILE.

Keep reusable behavior in a structured library.
Point your agent's native control file at that library.
Load only the part needed for the current job.
```

The repository gives an agent a stable place to answer questions such as:

- What exactly is a **Skill**, and how should a new `SKILL.md` be constructed?
- What is the difference between a **Skill Set** and a **Capability**?
- Where are the active **Rules**, **Modes**, **Tasks**, **Workflows**, **Plans**, and **Tools**?
- Which specification controls a new artifact?
- How should vendor files such as `AGENTS.md`, `CLAUDE.md`, Copilot instructions, Qwen context, or Cursor rules point into the same canonical library?
- How should an existing project be migrated without destroying its current agent configuration?
- How do Heartbeat, Aura, memory, and the Emulation Framework fit into a larger persistent-agent architecture?

The library is **vendor-neutral first**. Vendor-specific files are adapters or entry points. The reusable specifications and root manifests remain the canonical knowledge layer.

---

# 1. FASTEST START

You have four supported ways to bring the framework into a project.

| Method | Best For | Git Relationship | Recommended |
|---|---|---|---|
| **Admin Local Shared Toolbox** | One private framework shared across many local projects | `.admin-local/` is excluded locally from Git | **Best personal / multi-project option** |
| **Install Shell Script** | Clean project-local or Admin Local installation | Copies files without carrying this repository's `.git` directory | **Best automated file install** |
| **Local MCP Server** | Let an AI agent install, wire, inspect, and plan migrations | MCP operates on the local filesystem under explicit tool calls | **Best agent-driven setup** |
| **Manual Copy** | Maximum transparency and no runtime dependency | Copy files only; no nested Git metadata | Always supported |

After installation, add a small pointer to the agent-control file your runtime already reads.

```text
PROJECT AGENT FILE
      │
      └── points to FRAMEWORK ROOT
                    │
                    ├── README.md
                    ├── root manifests
                    └── agent-specifications/specs/
```

The agent should **not recursively load this entire repository on every turn**. It should use the root manifests and specifications as an on-demand routing system.

---

# 2. RECOMMENDED: ADMIN LOCAL

**Admin Local** is a VS Code extension by Shaun Pritchard that creates a Git-safe `.admin-local/` workbench in each repository and connects it to one shared physical Toolbox on the computer.

Marketplace:

https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local

Admin Local is especially useful for this framework because its `shared_toolbox/` is a filesystem link to one physical folder. Put this framework into the Toolbox once and every initialized repository can see the same files without maintaining copies.

## Recommended Layout

```text
my-project/
├── .git/
├── .admin-local/
│   ├── shared_toolbox/
│   │   └── agent-control-framework/
│   │       ├── README.md
│   │       ├── agent-specifications/
│   │       ├── skills/
│   │       ├── rules/
│   │       ├── ...
│   │       └── mcp/mcp-server/
│   └── ...
├── AGENTS.md
└── src/
```

The `.admin-local/` workbench is local to the repository and Admin Local adds it to `.git/info/exclude`, so it can remain available to agents without being committed with application code. The shared Toolbox itself is one reusable folder available to every initialized project on that machine.

### Admin Local Setup

1. Install **Admin Local** from the VS Code Marketplace.
2. Open the target Git repository.
3. Run `(.Admin-Local) Initialize`.
4. Create or select the shared Toolbox.
5. Install this framework into:

```text
.admin-local/shared_toolbox/agent-control-framework/
```

6. Add the pointer block from [Section 6](#6-connect-your-agent-to-the-framework) to the project's agent-control file.
7. Open another repository and initialize Admin Local. The same shared framework is available there.

Use Admin Local for **private/shared personal tooling**. If the entire team should receive the framework through Git, use a committed project-local installation instead.

---

# 3. INSTALL WITH THE SHELL SCRIPT

The repository includes:

```text
INSTALL-FRAMEWORK.SH
```

The script is designed to avoid the nested-repository problem.

### Install From an Already Downloaded Copy

```bash
sh INSTALL-FRAMEWORK.SH install \
  --source . \
  --target /path/to/your-project \
  --destination .agent-framework \
  --wire agents
```

### Install Into Admin Local

```bash
sh INSTALL-FRAMEWORK.SH install \
  --source . \
  --target /path/to/your-project \
  --admin-local \
  --wire agents
```

### Install Directly From GitHub

You do not need a local copy first. Point `--source` at the GitHub repository and the script clones it for you:

```bash
sh INSTALL-FRAMEWORK.SH install \
  --source https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git \
  --target /path/to/your-project \
  --destination .agent-framework \
  --wire agents
```

The script clones remote sources into a temporary directory and copies the framework **without `.git/`**. It therefore does not create a Git repository inside your existing repository.

### Update Later

```bash
sh INSTALL-FRAMEWORK.SH update \
  --source https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git \
  --target /path/to/your-project \
  --destination .agent-framework
```

Updates create a timestamped backup before replacing the managed framework directory.

> **Recommended rule:** customize project behavior outside the managed upstream copy whenever possible. Put project-specific skills, tasks, instructions, rules, and memories in the project's chosen locations and let the migration/setup instructions link them together. That makes upstream framework updates much easier.

---

# 4. INSTALL OR MANAGE WITH MCP

The repository includes a local MCP server:

```text
mcp/mcp-server/
```

It exposes tools that an MCP-capable agent can use to:

- inspect a framework installation;
- copy/install or update the framework safely;
- wire an agent-control file to the framework;
- inventory existing agent-control artifacts and write a migration plan.

The MCP server uses **stdio**, so it runs locally as a child process of the MCP host.

## Start the Server

```bash
cd mcp/mcp-server
npm install
npm start
```

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node src/index.mjs
```

See:

```text
mcp/mcp-server/README.md
```

for VS Code configuration and operational details.

---

# 5. MANUAL INSTALLATION

A manual installation is always supported and is intentionally simple.

## Safe Manual Clone-and-Copy

Do **not** leave this repository's `.git/` directory inside another Git repository.

Instead:

```bash
git clone --depth 1 https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git /tmp/agent-framework
rm -rf /tmp/agent-framework/.git
cp -R /tmp/agent-framework /path/to/project/.agent-framework
```

On Windows, use Git Bash, WSL, or manually copy the downloaded repository contents after deleting its `.git` folder.

Another safe option is to download a release ZIP and extract it directly into the chosen destination.

## Why This Matters

This structure is intended to become **project content or private shared tooling**, not an accidental nested Git repository.

If you deliberately want submodules or subtrees, use normal Git submodule/subtree practices. That is a separate source-management decision and is not the default installation model of this framework.

---

# 6. CONNECT YOUR AGENT TO THE FRAMEWORK

Installation alone does not guarantee that your agent knows the framework exists.

Add a pointer to a control file that your agent runtime automatically reads.

## Fastest Way: Copy the Ready-Made `AGENTS.md`

This repository's own root `AGENTS.md` **is** the ready-to-copy pointer file — it already contains the full block below plus a robust description of what the framework provides. To use it in another project:

1. If your runtime supports native initialization (Claude Code's or Copilot's `/init`) and the project has never been set up for that runtime, run `/init` first so a native control file (`CLAUDE.md`, `.github/copilot-instructions.md`, etc.) exists.
2. Copy `AGENTS.md` from this repository into the target project's root.
3. Replace every `<FRAMEWORK_ROOT>` placeholder in the copied file with the real relative path to where you installed the framework (see the two examples below).
4. If the project's native control file is separate from `AGENTS.md` (e.g. Claude Code's `CLAUDE.md`), reference it from there instead of duplicating the content:

   ```markdown
   @AGENTS.md
   ```

   Claude Code natively supports this `@file` import syntax. If your runtime does not support `@file` imports, add one sentence of context above the pointer block instead, so the agent knows what it is about to read:

   > This project uses the Offical-Agentic-Prompt-Starter-Kit (see `AGENTS.md` at the project root). It provides skills, rules, tasks, workflows, agent roles, tools, memory, and specification contracts for building and validating agent-control artifacts consistently. Read `AGENTS.md` before creating or modifying any of those.

## Portable Pointer Block

If you would rather hand-assemble the pointer instead of copying `AGENTS.md` wholesale, use this block directly.

Replace `<FRAMEWORK_ROOT>` with the actual relative or absolute path.

```markdown
<!-- BEGIN PORTABLE AGENT CONTROL FRAMEWORK -->

## Shared Agent Control Framework

This project uses a reusable agent-control framework located at:

`<FRAMEWORK_ROOT>`

When creating, modifying, discovering, or validating an agent-control artifact:

1. Read `<FRAMEWORK_ROOT>/README.md` only when repository-level routing is needed.
2. Read the applicable root manifest, such as:
   - `skills/SKILLS.md`
   - `rules/RULES.md`
   - `modes/MODES.md`
   - `instructions/INSTRUCTIONS.md`
   - `task/TASKS.md`
   - `plans/PLANS.md`
   - `workflows/WORKFLOWS.md`
   - `agents/AGENTS.md`
   - `tools/TOOLS.md`
   - `memory/MEMORY.md`
3. When creating or materially redesigning an artifact, follow the corresponding contract in:
   `<FRAMEWORK_ROOT>/agent-specifications/specs/`
4. Load only the documents relevant to the current task. Do not recursively load the entire framework into context.
5. Check an existing root manifest before creating a duplicate artifact.
6. Preserve vendor-native files when the runtime requires them; use them as adapters/pointers to the canonical framework whenever practical.
7. For existing project customizations, follow:
   `<FRAMEWORK_ROOT>/MIGRATION.INSTRUCTIONS.md`
8. For initial installation or configuration, follow:
   `<FRAMEWORK_ROOT>/AGENT-SETUP.INSTRUCTIONS.md`

<!-- END PORTABLE AGENT CONTROL FRAMEWORK -->
```

## Example: Admin Local Pointer

```markdown
Framework root:
`.admin-local/shared_toolbox/agent-control-framework`
```

## Example: Committed Project Copy

```markdown
Framework root:
`.agent-framework`
```

---

# 7. WHERE THE POINTER CAN LIVE

The framework itself may live almost anywhere. What matters is that the active agent runtime can read the pointer and the referenced path.

| Runtime / Pattern | Common Control Entry Point | Framework Placement Recommendation | Notes |
|---|---|---|---|
| **Admin Local** | Project `AGENTS.md` or vendor file | `.admin-local/shared_toolbox/agent-control-framework/` | Recommended private cross-project setup |
| **VS Code / GitHub Copilot** | `.github/copilot-instructions.md` or `AGENTS.md` | `.agent-framework/`, `.github/`, `.agents/`, or Admin Local | VS Code supports configurable customization locations |
| **Agent Skills / portable** | `AGENTS.md` plus skill discovery | `.agents/skills/`, `.github/skills/`, `.claude/skills/` | Keep `SKILL.md` inside each skill folder |
| **Claude Code** | `CLAUDE.md` and `.claude/rules/` | `.claude/` or external framework path referenced by `CLAUDE.md` | Use native files as the entry layer |
| **Cursor** | `AGENTS.md` or `.cursor/rules/` | Framework can remain external and be referenced | Cursor supports project rules under `.cursor/rules` |
| **Gemini CLI** | `GEMINI.md` | Any readable framework path referenced/imported by `GEMINI.md` | Gemini supports Markdown context imports |
| **Qwen Code** | `QWEN.md`, `.qwen/QWEN.local.md`, or `AGENTS.md` | Any readable framework path | Qwen can reference other files from QWEN.md |
| **Generic agent harness** | `AGENTS.md` | `.agent-framework/` or `.agents/` | Use the portable pointer block |

The vendor mapping is intentionally not the source of truth for artifact semantics. For vendor-specific naming and compatibility rules, use:

```text
agent-specifications/specs/vendor-formats.specification.md
```

---

# 8. REPOSITORY STRUCTURE

```text
/
├── README.md
├── AGENTS.md                    # Ready-to-copy portable pointer/entry file (see §6)
├── AGENT-SETUP.INSTRUCTIONS.md
├── MIGRATION.INSTRUCTIONS.md
├── INSTALL-FRAMEWORK.SH
│
├── agent-specifications/
│   └── specs/
│       ├── agent.specification.md
│       ├── skill.specification.md
│       ├── skillset.specification.md
│       ├── capability.specification.md
│       ├── task.specification.md
│       ├── workflow.specification.md
│       ├── tool.specification.md
│       ├── mcp.specification.md
│       └── ...
│
├── skills/
│   └── SKILLS.md
├── rules/
│   └── RULES.md
├── modes/
│   └── MODES.md
├── instructions/
│   ├── INSTRUCTIONS.md
│   └── capability-skillset-instructions/
│       └── capability-skillset.instructions.md
├── task/
│   ├── TASKS.md
│   └── task-management.instructions.md
├── plans/
│   └── PLANS.md
├── workflows/
│   └── WORKFLOWS.md
├── agents/
│   └── AGENTS.md
├── tools/
│   └── TOOLS.md
├── identity/
│   └── IDENTITY.md
├── memory/
│   ├── MEMORY.md
│   └── implicit/          # implicit-memory subsystem
│
├── emulation/
│   ├── EMULATION.MANIFEST.md
│   ├── OBSERVATION.INSTRUCTIONS.md
│   ├── GUARDIAN.INSTRUCTIONS.md
│   └── OPTIMIZATION.INSTRUCTIONS.md
│
├── telemetry/
│   └── HEARTBEAT.md
├── state/
│   └── AURA.STATE.md
│
├── prompt_engineering/        # Optional/user-maintained advanced prompt library
├── documentation/             # Optional — explanatory/publishable material, not yet present
│
└── mcp/mcp-server/
    ├── README.md
    ├── package.json
    └── src/
        └── index.mjs
```

---

# 9. MASTER AGENT-CONTROL MAP

| System | Root / Entry File | Creation Contract | What It Controls |
|---|---|---|---|
| **Capabilities** | `skills/SKILLS.md` | `capability.specification.md` | Broad ability composed of Skill Sets |
| **Skill Sets** | `skills/SKILLS.md` | `skillset.specification.md` | Related collection of Skills |
| **Skills** | `skills/SKILLS.md` | `skill.specification.md` | Reusable task-specific procedures and resources |
| **Rules** | `rules/RULES.md` | `rules.specification.md` | Constraints and requirements |
| **Modes** | `modes/MODES.md` | `mode.specification.md` | Triggered stance/output changes |
| **Instructions** | `instructions/INSTRUCTIONS.md` | `instructions.specification.md` | Scoped reusable operating guidance |
| **Tasks** | `task/TASKS.md` | `task.specification.md` | Concrete units of work |
| **Task Management** | `task/TASK-MANAGEMENT.INSTRUCTIONS.md` | `task.specification.md` | Task placement, backtrace, lifecycle, completion |
| **Plans** | `plans/PLANS.md` | `plan.specification.md` | Instance-specific execution sequencing |
| **Workflows** | `workflows/WORKFLOWS.md` | `workflow.specification.md` | Reusable multi-step orchestration |
| **Agents** | `agents/AGENTS.md` | `agent.specification.md` | Roles, tools, permissions, delegation |
| **Tools** | `tools/TOOLS.md` | `tool.specification.md` | Callable actions and side effects |
| **MCP** | Specification only / implementation-specific | `mcp.specification.md` | Standardized external tool/resource interfaces |
| **Identity** | `identity/IDENTITY.md` | `identity.specification.md` | Stable agent identity/presentation |
| **Memory** | `memory/MEMORY.md` | Episodic + Implicit Memory specifications | Durable experience and learned patterns |
| **Emulation** | `emulation/EMULATION.MANIFEST.md` | Emulation + component specifications | Owner-model learning, Guardian filtering, optimization |
| **Heartbeat** | `telemetry/HEARTBEAT.md` | `heartbeat.specification.md` | Context-aware recurring session re-entry |
| **Aura** | `state/AURA.STATE.md` | Current Aura contract / future dedicated spec | Compact qualitative runtime health state |
| **Vendor Formats** | Documentation/specification layer | `vendor-formats.specification.md` | Translation into vendor-native control forms |

---

# 10. SKILLS, SKILL SETS, AND CAPABILITIES

The reusable capability hierarchy is:

```text
CAPABILITY
    │
    └── contains / coordinates multiple SKILL SETS
                                  │
                                  └── each contains multiple SKILLS
                                                               │
                                                               └── each Skill defines a focused reusable procedure
```

The canonical root is:

```text
skills/SKILLS.md
```

That document maintains **three separate running manifests**:

1. Skill Manifest
2. Skill Set Manifest
3. Capability Manifest

When building or editing this hierarchy, also read:

```text
instructions/CAPABILITY-SKILLSET.INSTRUCTIONS.md
```

and the corresponding specifications.

---

# 11. PROMPT ENGINEERING LIBRARY

This repository is designed to coexist with a larger advanced prompt-engineering library.

Recommended structure:

```text
prompt_engineering/
├── <MASTER ROUTER / INDEX>
├── frameworks/
│   ├── <framework files>
│   └── ...
└── references/
```

The prompt-engineering router should decide **which prompting framework is appropriate for the current reasoning problem** rather than injecting every framework simultaneously.

Examples of framework families might include decomposition, reflective review, role/constraint framing, iterative critique, multi-path reasoning, prompt optimization, structured extraction, or domain-specific prompting. The exact library is maintained separately by the repository owner and should not be fabricated or renamed by this README.

If an existing prompt framework is migrated into this repository:

1. preserve its semantics;
2. preserve authorship and provenance;
3. index it in the prompt-engineering router;
4. avoid duplicating it as both a prompt and a skill unless the two artifacts serve genuinely different purposes;
5. use `prompt.specification.md` when creating a reusable prompt artifact.

---

# 12. EMULATION FRAMEWORK

The Emulation Framework is the owner-model layer.

```text
EMULATION.MANIFEST.md
        │
        ├── OBSERVATION.INSTRUCTIONS.md
        ├── GUARDIAN.INSTRUCTIONS.md
        └── OPTIMIZATION.INSTRUCTIONS.md
```

### Observation
Learns from authorized evidence: interests, projects, corrections, decisions, routines, time investment when measurable, communication style, values, friction, people, places, and other owner-model dimensions.

### Guardian
Determines what should be preserved, amplified, transformed by audience, bounded, confirmed, or rejected as a default emulation behavior.

### Optimization
Converts the guarded owner model into useful workflow improvements, automation suggestions, sequencing changes, and sparse high-value probing questions.

The framework learns; it does not invent permissions.

---

# 13. HEARTBEAT AND AURA

These are runtime-layer concepts rather than ordinary content manifests.

## Heartbeat

```text
telemetry/HEARTBEAT.md
```

Heartbeat defines a recurring **same-context** runtime pulse. It is appropriate when a recurring check depends on the current conversation or session.

It is not equivalent to an independent cron job.

## Aura

```text
state/AURA.STATE.md
```

Aura is the compact qualitative runtime-health model:

```text
CONTEXT CAPACITY
CONSTRAINT INTEGRITY
EXECUTION STABILITY
        │
        ▼
LUMINOUS / STRAINED / RESTING / FRACTURED
```

Aura must not invent fake telemetry. Exact measurements are used only when a runtime or external tool actually supplies them.

---

# 14. AGENT SPECIFICATIONS

`agent-specifications/specs/` is the authoring contract library.

The specifications answer:

> "If I need to create this kind of agent artifact, exactly what structure, metadata, sections, relationships, and verification rules should I use?"

Examples include:

- Agent
- Capability
- Skill Set
- Skill
- Task
- Rule
- Mode
- Instruction
- Plan
- Workflow
- Tool
- MCP
- Plugin
- Model
- Blueprint
- Manifest
- Memory
- Identity
- Soul
- Emulation modules
- Vendor transformations

Before creating a new artifact, an agent should read **only the applicable specification**, not the entire specification folder.

To define a new specification type, follow:

```text
agent-specifications/specs/SPECIFICATION-AUTHORING.md
```

---

# 15. DOCUMENTATION AND PUBLISHED PARADIGMS

The `documentation/` folder is for explanatory and publishable material, not runtime instruction loading.

It can contain:

- the Capability → Skill Set → Skill composition proposal;
- Emulation Framework paper;
- Aura runtime-state proposal;
- Heartbeat runtime pattern;
- Common Agent Control Markdown Files research;
- Vendor Agent Control comparison;
- new experimental prompting structures;
- diagrams, white papers, and rationale.

These documents explain **why** a paradigm exists. The root/control files and specifications define **how agents use it**.

---

# 16. CLEAN MIGRATION OF AN EXISTING PROJECT

Do not scatter copies blindly through a mature project.

Use:

```text
MIGRATION.INSTRUCTIONS.md
```

The migration process is intentionally:

```text
INVENTORY
   ↓
CLASSIFY
   ↓
MAP TO CANONICAL ARTIFACT
   ↓
CHECK DUPLICATES / CONFLICTS
   ↓
CREATE DRY-RUN PLAN
   ↓
COPY / LINK / ADAPT
   ↓
UPDATE ROOT MANIFESTS
   ↓
WIRE VENDOR ENTRY FILE
   ↓
VERIFY
```

The migration instructions cover existing:

- skills;
- task/task lists;
- instructions;
- rules;
- prompt files;
- agents;
- plans;
- workflows;
- tools/MCP references;
- memory;
- identity;
- vendor control files.

Vendor-native files should not be destroyed merely because a canonical framework now exists. Keep them when the runtime needs them and use them as adapters/pointers.

---

# 17. UPDATES WITHOUT NESTED GIT

There are three recommended update models.

### Admin Local Shared Toolbox

Update the one shared framework copy. Every linked project sees the new version.

### Managed Project Copy

Re-run:

```bash
sh INSTALL-FRAMEWORK.SH update ...
```

The script backs up the current managed copy before replacement.

### MCP

Ask the connected agent to run the framework install/update tool with the new upstream source.

## Avoid

```text
my-project/
└── framework/
    └── .git/   <-- accidental nested repository
```

unless you deliberately chose a Git submodule/subtree architecture.

---

# 18. SECURITY AND TRUST

Agent-control repositories are executable in a practical sense: instructions can change agent behavior, and bundled scripts/MCP servers can run code.

Before adopting or updating this framework:

- review changed instruction files;
- review scripts;
- review MCP server code;
- do not place API keys in committed framework files;
- keep secrets in proper secret stores or private local systems;
- use Admin Local or another ignored local path for private materials;
- keep tool permissions least-privilege;
- do not let framework installation overwrite project files silently;
- use migration plans and backups for existing repositories.

---

# 19. OFFICIAL REFERENCE LINKS

These upstream systems are useful compatibility references:

| Reference | Link |
|---|---|
| Admin Local | https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local |
| VS Code Custom Instructions | https://code.visualstudio.com/docs/agent-customization/custom-instructions |
| VS Code Agent Skills | https://code.visualstudio.com/docs/agent-customization/agent-skills |
| VS Code Custom Agents | https://code.visualstudio.com/docs/agent-customization/custom-agents |
| VS Code MCP Configuration | https://code.visualstudio.com/docs/agents/reference/mcp-configuration |
| Agent Skills Specification | https://agentskills.io/ |
| Cursor Rules | https://cursor.com/docs/rules |
| Gemini CLI Context | https://geminicli.com/docs/cli/gemini-md/ |
| Qwen Code Memory / QWEN.md | https://qwenlm.github.io/qwen-code-docs/en/users/features/memory/ |
| MCP TypeScript SDK | https://ts.sdk.modelcontextprotocol.io/v2/ |

---

# 20. WHAT AN AGENT SHOULD DO FIRST

When an agent encounters this repository:

```text
1. Read this README only far enough to locate the correct root.
2. Read the relevant root manifest.
3. Check whether the requested artifact already exists.
4. Read the corresponding specification.
5. Perform the requested creation/update.
6. Update the root manifest.
7. Validate references.
8. Do not load unrelated framework material.
```

For installing the framework into a new project:

```text
AGENT-SETUP.INSTRUCTIONS.md
```

For migrating an existing project:

```text
MIGRATION.INSTRUCTIONS.md
```

For automated copying/updating:

```text
INSTALL-FRAMEWORK.SH
```

For agent-driven local tooling:

```text
mcp/mcp-server/
```

## Source

---
name: portable-agent-control-framework
description: "Portable specifications, root manifests, runtime instructions, prompt architecture, and setup tooling for consistent multi-agent projects."
version: 0.4.0
author: Shaun Pritchard
license: "Project-specific; individual bundled components may declare their own license."
status: pre-release
---


#### 🌐 keywords
ai agent prompt template · prompt engineering · agentic workflows · cursorrules · claude code config · model context protocol prompts · mcp server prompts · llm prompt templates · multi-agent workspace framework · ai instruction files · llm coding assistant rules · copilot instructions starter pack · developer prompt directory