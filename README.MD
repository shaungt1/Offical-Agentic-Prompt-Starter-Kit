

# Offical-Agentic-Prompt-Starter-Kit
Opensource production-ready AI agent prompt template &amp; workspace kit for Cursor, Claude Code, Windsurf, &amp; MCP server prompts. Drop-in rules, skills, &amp; system prompts to automate task decomposition, role assignment, and multi-step reasoning loops while preventing prompt injection. Structural context playbooks for precise, error-free code generation.

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
📂 agentic-prompt-starter-kit/
│
├── 📜 README.md                             # Global workspace documentation
├── ⚙️ INSTALL-FRAMEWORK.SH                  # Automated ingestion & workspace setup script
├── 📌 MIGRATION.INSTRUCTIONS.MD             # Scaling guide from legacy mono-prompts
├── 📌 AGENT-SETUP.INSTRUCTIONS.MD           # Local IDE environment provisioning
│
├── 📂 agent-specifications/                 # Foundational agent prompt templates
│   ├── 📝 CAPABILITY_SKILLSET_COMPOSITION.MD
│   ├── 📝 VENDOR_AGENT_CONTROL_FILE_IMPL.MD
│   └── 📝 COMMON_AGENT_CONTROL_MARKDOWN.MD
│
└── 📂 .agents/                              # Modular directory injected into runtime memory
    ├── 📁 rules/                            # Global guardrails and formatting constraints
    ├── 📁 modes/                            # State-based operation shifts (e.g., architect vs. engineer)
    ├── 📁 instructions/                     # Strict codebase and styling execution behaviors
    ├── 📁 plans/                            # Multi-step sequential reasoning loop logic
    ├── 📁 workflows/                        # State machines for complex multi-agent execution
    ├── 📁 agents/                           # Root system personas and configuration blocks
    ├── 📁 tools/                            # Execution loop mechanics, tags, and formatting rules
    ├── 📁 identity/                         # Core behavioral constraints and "constitutions"
    ├── 📁 skills/                           # On-demand, feature-specific capability registers
    ├── 📁 memory/                           # Context management and state boundaries
    ├── 📁 task/                             # Job-specific granular script templates
    ├── 📁 agent-specifications/             # Cross-compatibility templates
    ├── 📁 telemetry/                        # Logging, token monitoring, and agent tracing
    ├── 📁 state/                            # Persisted agent runtime flags
    ├── 📁 prompt_engineering/               # Raw metaprompt libraries
    └── 📁 emulation/                        # Cross-client environment simulators
```

---


# 1. VS Code Model Context Protocol (MCP) Server

This repository ships with a dedicated Node-based Agent-Control MCP Server. Once added to your IDE, your LLM gains its own tools to read, compile, and swap out its own rules dynamically depending on what code file you open.
To register the MCP server in Cursor / VS Code Copilot / Claude Desktop:
Add this to your local MCP settings configuration file:

```
{
  "mcpServers": {
    "agent-control-mcp-server": {
      "command": "node",
      "args": ["path/to/agent-control-mcp-server-v0.4.0/index.js"],
      "env": {
        "AGENT_WORKSPACE_PATH": "./.agents"
      }
    }
  }
}
```

This allows the LLM to call custom tools like get_active_skills() and apply_rule_guardrail() directly through your chat window.

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

- What exactly is a **Skill**, and how should a new `SKILL.MD` be constructed?
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
                    ├── README.MD
                    ├── root manifests
                    └── agent-specifications/Specs/
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
│   │       ├── README.MD
│   │       ├── agent-specifications/
│   │       ├── skills/
│   │       ├── rules/
│   │       ├── ...
│   │       └── mcp-server/
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
scripts/INSTALL-FRAMEWORK.SH
```

The script is designed to avoid the nested-repository problem.

### Install From an Already Downloaded Copy

```bash
sh scripts/INSTALL-FRAMEWORK.SH install \
  --source . \
  --target /path/to/your-project \
  --destination .agent-framework \
  --wire agents
```

### Install Into Admin Local

```bash
sh scripts/INSTALL-FRAMEWORK.SH install \
  --source . \
  --target /path/to/your-project \
  --admin-local \
  --wire agents
```

### Install From the Future GitHub Repository

Once this project has its final repository URL:

```bash
sh INSTALL-FRAMEWORK.SH install \
  --source https://github.com/<OWNER>/<REPOSITORY>.git \
  --target /path/to/your-project \
  --destination .agent-framework \
  --wire agents
```

The script clones remote sources into a temporary directory and copies the framework **without `.git/`**. It therefore does not create a Git repository inside your existing repository.

### Update Later

```bash
sh scripts/INSTALL-FRAMEWORK.SH update \
  --source https://github.com/<OWNER>/<REPOSITORY>.git \
  --target /path/to/your-project \
  --destination .agent-framework
```

Updates create a timestamped backup before replacing the managed framework directory.

> **Recommended rule:** customize project behavior outside the managed upstream copy whenever possible. Put project-specific skills, tasks, instructions, rules, and memories in the project's chosen locations and let the migration/setup instructions link them together. That makes upstream framework updates much easier.

---

# 4. INSTALL OR MANAGE WITH MCP

The repository includes a local MCP server:

```text
mcp-server/
```

It exposes tools that an MCP-capable agent can use to:

- inspect a framework installation;
- copy/install or update the framework safely;
- wire an agent-control file to the framework;
- inventory existing agent-control artifacts and write a migration plan.

The MCP server uses **stdio**, so it runs locally as a child process of the MCP host.

## Start the Server

```bash
cd mcp-server
npm install
npm start
```

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node src/index.mjs
```

See:

```text
mcp-server/README.MD
```

for VS Code configuration and operational details.

---

# 5. MANUAL INSTALLATION

A manual installation is always supported and is intentionally simple.

## Safe Manual Clone-and-Copy

Do **not** leave this repository's `.git/` directory inside another Git repository.

Instead:

```bash
git clone --depth 1 https://github.com/<OWNER>/<REPOSITORY>.git /tmp/agent-framework
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

## Portable Pointer Block

Replace `<FRAMEWORK_ROOT>` with the actual relative or absolute path.

```markdown
<!-- BEGIN PORTABLE AGENT CONTROL FRAMEWORK -->

## Shared Agent Control Framework

This project uses a reusable agent-control framework located at:

`<FRAMEWORK_ROOT>`

When creating, modifying, discovering, or validating an agent-control artifact:

1. Read `<FRAMEWORK_ROOT>/README.MD` only when repository-level routing is needed.
2. Read the applicable root manifest, such as:
   - `skills/SKILLS.MD`
   - `rules/RULES.MD`
   - `modes/MODES.MD`
   - `instructions/INSTRUCTIONS.MD`
   - `task/TASKS.MD`
   - `plans/PLANS.MD`
   - `workflows/WORKFLOWS.MD`
   - `agents/AGENTS.MD`
   - `tools/TOOLS.MD`
   - `memory/MEMORY.MD`
3. When creating or materially redesigning an artifact, follow the corresponding contract in:
   `<FRAMEWORK_ROOT>/agent-specifications/Specs/`
4. Load only the documents relevant to the current task. Do not recursively load the entire framework into context.
5. Check an existing root manifest before creating a duplicate artifact.
6. Preserve vendor-native files when the runtime requires them; use them as adapters/pointers to the canonical framework whenever practical.
7. For existing project customizations, follow:
   `<FRAMEWORK_ROOT>/setup/MIGRATION.INSTRUCTIONS.MD`
8. For initial installation or configuration, follow:
   `<FRAMEWORK_ROOT>/setup/AGENT-SETUP.INSTRUCTIONS.MD`

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
| **Agent Skills / portable** | `AGENTS.md` plus skill discovery | `.agents/skills/`, `.github/skills/`, `.claude/skills/` | Keep `SKILL.MD` inside each skill folder |
| **Claude Code** | `CLAUDE.md` and `.claude/rules/` | `.claude/` or external framework path referenced by `CLAUDE.md` | Use native files as the entry layer |
| **Cursor** | `AGENTS.md` or `.cursor/rules/` | Framework can remain external and be referenced | Cursor supports project rules under `.cursor/rules` |
| **Gemini CLI** | `GEMINI.md` | Any readable framework path referenced/imported by `GEMINI.md` | Gemini supports Markdown context imports |
| **Qwen Code** | `QWEN.md`, `.qwen/QWEN.local.md`, or `AGENTS.md` | Any readable framework path | Qwen can reference other files from QWEN.md |
| **Generic agent harness** | `AGENTS.md` | `.agent-framework/` or `.agents/` | Use the portable pointer block |

The vendor mapping is intentionally not the source of truth for artifact semantics. For vendor-specific naming and compatibility rules, use:

```text
agent-specifications/Specs/VENDOR-FORMATS.SPECIFICATION.MD
```

---

# 8. REPOSITORY STRUCTURE

```text
/
├── README.MD
│
├── agent-specifications/
│   └── Specs/
│       ├── AGENT.SPECIFICATION.MD
│       ├── SKILL.SPECIFICATION.MD
│       ├── SKILLSET.SPECIFICATION.MD
│       ├── CAPABILITY.SPECIFICATION.MD
│       ├── TASK.SPECIFICATION.MD
│       ├── WORKFLOW.SPECIFICATION.MD
│       ├── TOOL.SPECIFICATION.MD
│       ├── MCP.SPECIFICATION.MD
│       └── ...
│
├── skills/
│   └── SKILLS.MD
├── rules/
│   └── RULES.MD
├── modes/
│   └── MODES.MD
├── instructions/
│   ├── INSTRUCTIONS.MD
│   └── CAPABILITY-SKILLSET.INSTRUCTIONS.MD
├── task/
│   ├── TASKS.MD
│   └── TASK-MANAGEMENT.INSTRUCTIONS.MD
├── plans/
│   └── PLANS.MD
├── workflows/
│   └── WORKFLOWS.MD
├── agents/
│   └── AGENTS.MD
├── tools/
│   └── TOOLS.MD
├── identity/
│   └── IDENTITY.MD
├── memory/
│   └── MEMORY.MD
│
├── emulation/
│   ├── EMULATION.MANIFEST.MD
│   ├── OBSERVATION.INSTRUCTIONS.MD
│   ├── GUARDIAN.INSTRUCTIONS.MD
│   └── OPTIMIZATION.INSTRUCTIONS.MD
│
├── telemetry/
│   └── HEARTBEAT.MD
├── state/
│   └── AURA.STATE.MD
│
├── prompt-engineering/        # Optional/user-maintained advanced prompt library
├── documentation/
│   └── README.MD
│
├── setup/
│   ├── AGENT-SETUP.INSTRUCTIONS.MD
│   └── MIGRATION.INSTRUCTIONS.MD
│
├── scripts/
│   └── INSTALL-FRAMEWORK.SH
│
└── mcp-server/
    ├── README.MD
    ├── package.json
    └── src/
        └── index.mjs
```

---

# 9. MASTER AGENT-CONTROL MAP

| System | Root / Entry File | Creation Contract | What It Controls |
|---|---|---|---|
| **Capabilities** | `skills/SKILLS.MD` | `CAPABILITY.SPECIFICATION.MD` | Broad ability composed of Skill Sets |
| **Skill Sets** | `skills/SKILLS.MD` | `SKILLSET.SPECIFICATION.MD` | Related collection of Skills |
| **Skills** | `skills/SKILLS.MD` | `SKILL.SPECIFICATION.MD` | Reusable task-specific procedures and resources |
| **Rules** | `rules/RULES.MD` | `RULES.SPECIFICATION.MD` | Constraints and requirements |
| **Modes** | `modes/MODES.MD` | `MODE.SPECIFICATION.MD` | Triggered stance/output changes |
| **Instructions** | `instructions/INSTRUCTIONS.MD` | `INSTRUCTIONS.SPECIFICATION.MD` | Scoped reusable operating guidance |
| **Tasks** | `task/TASKS.MD` | `TASK.SPECIFICATION.MD` | Concrete units of work |
| **Task Management** | `task/TASK-MANAGEMENT.INSTRUCTIONS.MD` | `TASK.SPECIFICATION.MD` | Task placement, backtrace, lifecycle, completion |
| **Plans** | `plans/PLANS.MD` | `PLAN.SPECIFICATION.MD` | Instance-specific execution sequencing |
| **Workflows** | `workflows/WORKFLOWS.MD` | `WORKFLOW.SPECIFICATION.MD` | Reusable multi-step orchestration |
| **Agents** | `agents/AGENTS.MD` | `AGENT.SPECIFICATION.MD` | Roles, tools, permissions, delegation |
| **Tools** | `tools/TOOLS.MD` | `TOOL.SPECIFICATION.MD` | Callable actions and side effects |
| **MCP** | Specification only / implementation-specific | `MCP.SPECIFICATION.MD` | Standardized external tool/resource interfaces |
| **Identity** | `identity/IDENTITY.MD` | `IDENTITY.SPECIFICATION.MD` | Stable agent identity/presentation |
| **Memory** | `memory/MEMORY.MD` | Episodic + Implicit Memory specifications | Durable experience and learned patterns |
| **Emulation** | `emulation/EMULATION.MANIFEST.MD` | Emulation + component specifications | Owner-model learning, Guardian filtering, optimization |
| **Heartbeat** | `telemetry/HEARTBEAT.MD` | `HEARTBEAT.SPECIFICATION.MD` | Context-aware recurring session re-entry |
| **Aura** | `state/AURA.STATE.MD` | Current Aura contract / future dedicated spec | Compact qualitative runtime health state |
| **Vendor Formats** | Documentation/specification layer | `VENDOR-FORMATS.SPECIFICATION.MD` | Translation into vendor-native control forms |

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
skills/SKILLS.MD
```

That document maintains **three separate running manifests**:

1. Skill Manifest
2. Skill Set Manifest
3. Capability Manifest

When building or editing this hierarchy, also read:

```text
instructions/CAPABILITY-SKILLSET.INSTRUCTIONS.MD
```

and the corresponding specifications.

---

# 11. PROMPT ENGINEERING LIBRARY

This repository is designed to coexist with a larger advanced prompt-engineering library.

Recommended structure:

```text
prompt-engineering/
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
5. use `PROMPT.SPECIFICATION.MD` when creating a reusable prompt artifact.

---

# 12. EMULATION FRAMEWORK

The Emulation Framework is the owner-model layer.

```text
EMULATION.MANIFEST.MD
        │
        ├── OBSERVATION.INSTRUCTIONS.MD
        ├── GUARDIAN.INSTRUCTIONS.MD
        └── OPTIMIZATION.INSTRUCTIONS.MD
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
telemetry/HEARTBEAT.MD
```

Heartbeat defines a recurring **same-context** runtime pulse. It is appropriate when a recurring check depends on the current conversation or session.

It is not equivalent to an independent cron job.

## Aura

```text
state/AURA.STATE.MD
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

`agent-specifications/Specs/` is the authoring contract library.

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
agent-specifications/Specs/SPECIFICATION-AUTHORING.MD
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
setup/MIGRATION.INSTRUCTIONS.MD
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
sh scripts/INSTALL-FRAMEWORK.SH update ...
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
setup/AGENT-SETUP.INSTRUCTIONS.MD
```

For migrating an existing project:

```text
setup/MIGRATION.INSTRUCTIONS.MD
```

For automated copying/updating:

```text
scripts/INSTALL-FRAMEWORK.SH
```

For agent-driven local tooling:

```text
mcp-server/
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