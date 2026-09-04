---
name: mode-specification
description: "Defines trigger-activated behavioral modes that change agent stance and output without executing work."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "MODE.md / modes/<name>.md"
    category: behavior
    status: draft
    normative: true
    tags: [mode, behavior, stance, output-style, trigger]
    related_specifications: [instructions-specification, rules-specification, agent-specification]
---

# Mode Specification

## Purpose

A **mode** is a trigger-activated behavioral switch. It changes how an agent approaches a conversation or presents an answer without independently performing a task or invoking a real-world action.

Examples include discussion mode, writing mode, testing mode, planning mode, Spanish mode, review mode, or another explicitly named stance.

A mode is not a rule, task, skill, workflow, or tool. Rules constrain behavior, tasks describe work to complete, skills define reusable procedures, workflows coordinate work, and tools perform callable actions. A mode changes **stance, emphasis, reasoning posture, interaction pattern, or output style**.

## Canonical Frontmatter

```yaml
---
name: <mode-name>
description: "What behavior changes while this mode is active."
version: 0.1.0
author: <author>
triggers: ["<trigger phrase>", "<alternate phrase>"]
status: active
metadata:
  tags: [mode, <domain>]
  exclusive: false
---
```

## Required Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Stable mode identifier. |
| `description` | REQUIRED | Concise statement of the behavior changed by the mode. |
| `version` | REQUIRED | Revision of the mode contract. |
| `triggers` | REQUIRED | Explicit phrases or semantic triggers that activate the mode. |
| `status` | RECOMMENDED | `draft`, `active`, `disabled`, or `deprecated`. |
| `metadata.exclusive` | OPTIONAL | Whether this mode must replace conflicting active modes. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Purpose` | Defines the stance or behavior the mode changes. |
| `Activation` | Defines explicit trigger phrases and entry conditions. |
| `Behavior While Active` | Defines tone, depth, structure, interaction style, or reasoning emphasis. |
| `What This Mode Does Not Do` | Prevents the mode from becoming a task, workflow, tool, or permission grant. |
| `Exit / Reset` | Defines how the user or controlling agent leaves the mode. |
| `Conflicts and Precedence` | Defines what happens when another mode or higher-priority instruction conflicts. |
| `Verification` | Defines observable signs that the mode is being applied correctly. |

## Mode Construction Rules

- A mode MUST be behavior-only. It does not independently execute tools, mutate files, submit forms, send messages, or perform other external actions.
- A mode MUST NOT override higher-priority rules, safety constraints, explicit permissions, or authoritative project instructions.
- A mode SHOULD define both activation and exit behavior so the active stance is not ambiguous.
- A mode MAY be composable with another mode when their scopes do not conflict. Example: `discussion` + `spanish`.
- When two modes conflict, the more recently and explicitly requested user mode SHOULD control the conflicting behavior unless a project precedence rule states otherwise.
- Keep modes focused. If the content becomes a repeatable procedure with ordered actions, create a skill or workflow instead.
- Store long examples or domain references elsewhere and link them rather than turning a mode into a large reference document.

## Canonical Placement

House convention:

```text
modes/
├── modes.md
└── <mode-name>/
    └── mode.md
```

A project MAY use `modes/<mode-name>.md` when a flat structure is preferable. Vendor-specific placement is a transformation and does not change the semantic contract.

## Verification Checklist

- [ ] The artifact changes behavior or output style rather than executing work.
- [ ] Trigger phrases are explicit.
- [ ] Exit/reset behavior is explicit.
- [ ] Conflicting modes and higher-priority instructions are handled.
- [ ] The mode does not grant tools or permissions.
- [ ] The mode is indexed in the applicable `modes.md` manifest.
