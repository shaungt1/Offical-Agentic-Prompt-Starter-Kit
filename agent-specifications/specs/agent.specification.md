---
name: agent-specification
description: "Defines custom agents, subagents, orchestrators, and agent override variants."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "*.agent.md / AGENTS.md / AGENTS.override.md"
    category: agent
    status: draft
    normative: true
    tags: [agents, subagents, orchestration, overrides]
    related_specifications: [skill-specification, tool-specification, model-specification, instructions-specification, vendor-formats-specification]
---

# Agent Specification

## Purpose

An agent file defines a persistent operating role: what the agent is responsible for, what it may use, how it reasons about work, what it must not do, how it delegates, and what completion means. The universal contract is independent of whether a vendor names the file `*.agent.md`, `AGENTS.md`, `CLAUDE.md`, or another control file.

## Agent Forms

| Form | Use |
|---|---|
| Custom agent | Named specialist selected directly or delegated to. |
| Subagent | Narrow specialist intended primarily for delegation. |
| Orchestrator | Coordinates agents/skills/tools and owns sequencing and handoffs. |
| Repository agent instructions | Persistent operating rules for agents working in a repository. |
| Override | A more specific layer, such as `AGENTS.override.md`, that changes an inherited agent contract for a narrower scope. |

An override is a **variant of the agent contract**, not a separate artifact family; therefore it is specified here rather than in its own specification.

## Rich Frontmatter Template

```yaml
---
name: <agent-name>
description: "Role, domain, and when this agent should be selected."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
target: <optional-runtime-target>
model: <default-or-required-model>
user-invocable: true
disable-model-invocation: false
tools: [read, search]
skills: [<skill-name>]
mcp-servers: [<server-name>]
permissions:
  filesystem: read-only
  network: restricted
  browser: none
  shell: none
  external-writes: confirm
  account-scope: user
handoffs:
  - label: <action-label>
    agent: <target-agent>
    prompt: <optional-contextual-prompt>
metadata:
  tags: [<role>, <domain>]
  related_agents: [<agent-name>]
  status: draft
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Role` | Exact responsibility, expertise boundary, and operating objective. |
| `When to Use` | Selection/delegation triggers and counter-triggers. |
| `Operating Rules` | Behavioral constraints that remain active throughout the session/task. |
| `Tools and Access` | Tools, MCP servers, skills, permissions, network/browser/shell boundaries. |
| `Workflow` | How the agent approaches work and when it delegates or asks for input. |
| `Outputs` | Expected artifacts, summaries, edits, decisions, or handoffs. |
| `Verification` | How the agent proves the work is complete. |

## Optional Sections

Use `Subagents`, `Handoffs`, `Escalation`, `Memory`, `Model Selection`, `Security`, or `Domain References` only when the role needs them.

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Overrides and Precedence

- An override MUST identify its parent/source scope and exactly what changes.
- Unchanged parent rules continue to apply unless the vendor explicitly defines replacement semantics.
- Keep overrides small. If most of the parent must be replaced, define a new agent instead.
- Never use an override to silently grant broader tools or administrator access; elevation must be explicit.

## Orchestration Rules

An orchestrator SHOULD pass only the context a subagent needs, identify expected outputs, and verify the returned work before advancing dependent steps. Delegation must not erase the parent's permission boundary unless the runtime explicitly provides and authorizes a different boundary.

## Vendor Notes

GitHub Copilot commonly uses `.github/agents/<name>.agent.md`; cross-vendor repository instructions commonly use `AGENTS.md`; some runtimes support `AGENTS.override.md`. Map only the syntax and location—the role, permissions, delegation, and verification semantics remain the same.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.

## Reference Model

https://github.com/github/awesome-copilot/blob/main/instructions/agents.instructions.md
