---
name: agents
description: "Master definition, usage guidance, and manifest for agents, subagents, orchestrators, and overrides."
version: 0.1.0
status: active
---

# Agents

## What an Agent Is

An **agent** is a persistent operating role with a defined responsibility, scope, tools, permissions, instructions, delegation boundaries, outputs, and verification expectations.

Agent forms may include:

- **Custom agent** — a named specialist selected directly.
- **Subagent** — a narrower specialist delegated work by another agent.
- **Orchestrator** — coordinates agents, skills, workflows, and tools.
- **Repository agent instructions** — persistent operating guidance for agents working in a codebase.
- **Override** — a narrower change to an inherited agent contract, such as an `AGENTS.override.md` form where the runtime supports it.

An override is part of the agent family and does not require its own specification.

## Creating an Agent

Follow:

- `agent-specifications/specs/agent.specification.md` for the universal agent contract.
- `agent-specifications/specs/vendor-formats.specification.md` when translating the agent into a vendor-native filename, location, frontmatter, or runtime feature.

The canonical semantics remain stable even when the vendor representation changes.

Typical portable structure:

```text
agents/
├── agents.md
└── <agent-name>.agent.md
```

A vendor may instead require `.github/agents/`, `AGENTS.md`, `CLAUDE.md`, or another native location.

## Agent Manifest

| Status | Agent | Role | Invocation | Canonical Path | Version | Tools / Skills | Parent / Overrides |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

## Agent Rules

- Grant only the tools and permissions needed for the role.
- Keep role boundaries explicit.
- Keep subagent delegation narrower than or equal to the parent's authorized scope unless explicit elevation is configured.
- Use overrides only for focused differences; create a new agent when the majority of the contract changes.
- Record vendor-native transformations without creating duplicate conceptual agents in this manifest.

## Verification

- [ ] Every active agent is indexed.
- [ ] Agent paths resolve.
- [ ] Agents follow `agent.specification.md`.
- [ ] Vendor-specific forms follow `vendor-formats.specification.md`.
- [ ] Tool and permission boundaries are explicit.
- [ ] Overrides identify the parent and the exact changed behavior.
