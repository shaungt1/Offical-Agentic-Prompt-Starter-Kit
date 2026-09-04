---
name: specifications-index
description: "Master index for portable agent-control artifact specifications."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "agent-specifications/specs/_README.md"
    category: index
    status: draft
    normative: true
    tags: [specifications, agents, portable, authoring]
    related_specifications: [specification-authoring]
---

# Agent Artifact Specifications

This directory is a portable authoring library. It defines **how to construct agent-control artifacts** consistently across repositories and vendor runtimes. The specifications describe universal semantics first, then document vendor transformations where formats differ.

#### IMPORTANT!
Use [`_specification-authoring.md`](_specification-authoring.md) to build a new specification and then add a reference row to the Specification Map table below.

---

The hierarchy for reusable ability is:

```text
CAPABILITY.md
  └── one or more SKILLSET.md files
        └── one or more SKILL.md files
```

A **capability** represents a broad ability, a **skill set** groups related skills required for a role or domain, and a **skill** defines one reusable procedure or focused behavior.

## Normative Language

The words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative. `REQUIRED`, `RECOMMENDED`, `OPTIONAL`, and `VENDOR` in tables have the same intent.

## Where the Specs Directory Can Live

The internal filenames stay the same even when the physical location changes. A controlling file such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or a vendor instruction file should point agents to the selected location.

| Priority | Environment | Suggested location | Notes |
|---|---|---|---|
| **Recommended local briefcase** | **Admin Local** | `.admin-local/agents/specs/` | Portable between projects and automatically excluded from Git. Best for a private personal library. Install: https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local |
| **Recommended shared repo** | Vendor-neutral | `agent-specifications/specs/` or `.agents/specs/` | Commit this location when the team needs the same specifications in source control. |
| Native-adjacent | GitHub Copilot / VS Code | `.github/specs/` | Keeps shared authoring standards near Copilot agents, prompts, instructions, and skills. The specs folder itself is a project convention. |
| Native-adjacent | Claude Code | `.claude/specs/` | Keeps the library beside Claude rules and skills. The specs folder itself is a project convention. |
| Native-adjacent | Other vendors | `<vendor-config-root>/specs/` | Use only when the vendor has a stable project configuration root and document the path in the controlling file. |

> **Admin Local caveat:** `.admin-local/` is intentionally local and Git-excluded. If these specifications must be reviewed, versioned, or shared by a team, keep the canonical copy in a committed repository location and optionally mirror/import it into Admin Local.

## How an Agent Uses This Library

1. Read this `README.md`.
2. Identify the artifact being requested.
3. Open the matching `*.specification.md` file.
4. Follow required structure and frontmatter first.
5. Add optional sections only when the artifact needs them.
6. Apply vendor transformations from `vendor-formats.specification.md` only after the universal artifact is understood.
7. Validate the result against the checklist in the selected specification.

A repository control file can contain a directive such as:

```markdown
## Artifact Construction
Before creating or materially changing an agent-control artifact, read `agent-specifications/specs/_README.md` and the matching specification. Use `agent-specifications/specs/vendor-formats.specification.md` when a vendor-specific filename, path, frontmatter field, or runtime behavior is required.
```

## Specification Map

| Order | Specification | Builds / governs |
|---:|---|---|
| 1 | [`capability.specification.md`](capability.specification.md) | `CAPABILITY.md` — broad ability composed of skill sets |
| 2 | [`skillset.specification.md`](skillset.specification.md) | `SKILLSET.md` — related skills grouped into a role/domain |
| 3 | [`skill.specification.md`](skill.specification.md) | `SKILL.md` — one reusable skill |
| 4 | [`specification-authoring.md`](specification-authoring.md) | Adding or changing specification types |
| 5 | [`construction-rules.specification.md`](construction-rules.specification.md) | Reusable construction/authoring constraints |
| 6 | [`agent.specification.md`](agent.specification.md) | Agents, subagents, orchestrators, and overrides |
| 7 | [`instructions.specification.md`](instructions.specification.md) | Persistent/scoped instruction files |
| 8 | [`rules.specification.md`](rules.specification.md) | Modular behavioral/project rules |
| 9 | [`prompt.specification.md`](prompt.specification.md) | Reusable prompt files |
| 10 | [`reference.specification.md`](reference.specification.md) | Supporting reference documents |
| 11 | [`tool.specification.md`](tool.specification.md) | Tool contracts and tool wrappers |
| 12 | [`mcp.specification.md`](mcp.specification.md) | MCP server/client integration packages |
| 13 | [`acp.specification.md`](acp.specification.md) | ACP protocol adapters; protocol identity is required |
| 14 | [`plugin.specification.md`](plugin.specification.md) | Packaged extensions combining resources/capabilities |
| 15 | [`model.specification.md`](model.specification.md) | Model requirements, serving, inference, and limits |
| 16 | [`hook.specification.md`](hook.specification.md) | Event-driven hooks |
| 17 | [`workflow.specification.md`](workflow.specification.md) | Repeatable multi-step workflows |
| 18 | [`plan.specification.md`](plan.specification.md) | Instance-specific execution plans |
| 19 | [`blueprint.specification.md`](blueprint.specification.md) | Reusable compositions/templates for systems or workflows |
| 20 | [`manifest.specification.md`](manifest.specification.md) | Package/linker manifests |
| 21 | [`file-index.specification.md`](file-index.specification.md) | Human-readable file/navigation indexes |
| 22 | [`registry.specification.md`](registry.specification.md) | Discoverable catalog of live artifacts and relationships |
| 23 | [`command.specification.md`](command.specification.md) | Reusable slash/task commands |
| 24 | [`evaluation.specification.md`](evaluation.specification.md) | Behavioral evaluation definitions |
| 25 | [`episodic-memory.specification.md`](episodic-memory.specification.md) | Time-bound event/session memory |
| 26 | [`implicit-memory.specification.md`](implicit-memory.specification.md) | Learned patterns/preferences with provenance and confidence |
| 27 | [`user.specification.md`](user.specification.md) | Stable user context and preferences |
| 28 | [`identity.specification.md`](identity.specification.md) | Concise agent identity/presentation metadata |
| 29 | [`soul.specification.md`](soul.specification.md) | Durable persona, values, voice, and behavioral character |
| 30 | [`dreams.specification.md`](dreams.specification.md) | Reflection/consolidation working notes |
| 31 | [`bootstrap.specification.md`](bootstrap.specification.md) | One-time first-run initialization |
| 32 | [`boot.specification.md`](boot.specification.md) | Recurring startup procedure |
| 33 | [`heartbeat.specification.md`](heartbeat.specification.md) | Periodic attention/background check definition |
| 34 | [`emulation-manifest.specification.md`](emulation-manifest.specification.md) | Master linker for the emulation pipeline |
| 35 | [`observation.specification.md`](observation.specification.md) | Observation/emulation input interpretation instructions |
| 36 | [`guardian.specification.md`](guardian.specification.md) | Reputation, audience, boundary, and best-self gating |
| 37 | [`optimization.specification.md`](optimization.specification.md) | Friction detection and proactive optimization instructions |
| 38 | [`vendor-formats.specification.md`](vendor-formats.specification.md) | Vendor filenames, locations, extensions, and translations |
| 39 | [`task.specification.md`](task.specification.md) | `TASKS.md` / Task and Task List files — concrete units of work |
| 40 | [`mode.specification.md`](mode.specification.md) | Triggered stance/output changes with no execution |

## Universal Design Principles

- **Semantic first, vendor second.** Define what an artifact means before translating it into a vendor format.
- **Progressive disclosure.** Put discovery metadata and high-value instructions in the primary file; move bulky reference material to linked resources.
- **Rich metadata, portable core.** Preserve the richer Hermes-style metadata model as the house standard while clearly labeling vendor extensions.
- **Least privilege.** Tools and permissions must be explicit when the artifact can mutate files, accounts, external systems, or execute commands.
- **Traceable composition.** Capabilities point to skill sets; skill sets point to skills; manifests and registries point rather than duplicate.
- **No empty ceremony.** Optional sections are omitted when they do not change execution or understanding.

## Reference Models Used to Design This Library

- Agent Skills specification: https://agentskills.io/specification
- Hermes Agent skill authoring example: https://github.com/NousResearch/hermes-agent/blob/main/skills/software-development/hermes-agent-skill-authoring/SKILL.md
- Awesome Copilot prompt authoring guidance: https://github.com/github/awesome-copilot/blob/main/instructions/prompt.instructions.md
- Awesome Copilot agent-skill guidance: https://github.com/github/awesome-copilot/blob/main/instructions/agent-skills.instructions.md
- Awesome Copilot agent guidance: https://github.com/github/awesome-copilot/blob/main/instructions/agents.instructions.md
- Admin Local: https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local
