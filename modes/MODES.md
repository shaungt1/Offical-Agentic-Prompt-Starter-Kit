---
name: modes
description: "Master definition, usage guidance, and manifest for behavioral modes."
version: 0.1.0
status: active
---

# Modes

## What a Mode Is

A **mode** is a trigger-phrase behavior switch. It changes the agent's stance, interaction pattern, reasoning emphasis, language, response depth, or output style while the mode is active.

A mode **does not execute anything by itself**.

Examples:

- **Discussion Mode** — short conversational responses intended for back-and-forth thinking.
- **Writing Mode** — produces polished prose using the requested writing style.
- **Testing Mode** — emphasizes test construction, defect isolation, and validation evidence.
- **Planning Mode** — emphasizes sequencing, dependencies, risks, and decisions before execution.
- **Spanish Mode** — changes the working language to Spanish.

A mode is different from other control artifacts:

| Artifact | Primary job |
|---|---|
| Rule | Enforces a behavioral or project constraint. |
| Mode | Changes stance or output behavior when activated. |
| Instruction | Provides scoped guidance for how work should be performed. |
| Skill | Defines a reusable procedure. |
| Workflow | Coordinates several steps or procedures. |
| Tool | Performs a callable action. |
| Task | Describes a concrete unit of work to complete. |

## Objectives of a Mode

A mode should:

1. Make an intentional behavior change easy to activate with natural language.
2. Keep temporary stance/output preferences separate from permanent rules.
3. Make the active interaction contract understandable to both the user and agent.
4. Define what changes and what stays unchanged.
5. Provide a predictable exit or reset path.
6. Remain compatible with higher-priority rules, permissions, and project instructions.

## How to Create a Mode

Before creating a mode:

1. Check the **Mode Manifest** below for an existing mode that already covers the requested behavior.
2. If the behavior is a constraint that should always apply, create a rule instead.
3. If the behavior performs a repeatable procedure, create a skill or workflow instead.
4. If a new mode is appropriate, follow `agent-specifications/Specs/mode.specification.md`.
5. Create the mode under the project's selected mode location.
6. Add one row to this manifest.
7. Verify its triggers, exit behavior, precedence, and path.

House structure:

```text
modes/
├── modes.md
└── <mode-name>/
    └── mode.md
```

A flat `modes/<mode-name>.md` structure is also acceptable when explicitly chosen by the project.

## Activation and Precedence

A mode becomes active when the user or controlling agent invokes one of its defined triggers. A mode remains active only for the scope defined by that mode or until the user resets, replaces, or exits it.

Modes do not override:

- higher-priority rules;
- safety boundaries;
- explicit permission restrictions;
- authoritative project instructions;
- direct user requirements that are more specific than the mode.

Compatible modes may be combined. Conflicting modes must resolve according to explicit user intent or the project's declared precedence.

## Mode Manifest

| Status | Mode | Purpose | Trigger / Activation | Canonical Path | Version | Notes / Conflicts |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every active mode has one manifest row.
- [ ] Every manifest path resolves.
- [ ] Every mode follows `agent-specifications/Specs/mode.specification.md`.
- [ ] Trigger phrases and exit behavior are explicit.
- [ ] Modes do not contain hidden execution behavior or permission grants.
- [ ] Conflicting modes have a defined resolution path.
