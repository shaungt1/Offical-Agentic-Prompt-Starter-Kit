---
name: rules
description: "Canonical rule manifest and operating guide for project and agent rules."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  artifact: rules-manifest
  category: governance
  status: active
  tags: [rules, manifest, governance, agent-control]
---

# Rules

This file is the **canonical rule manifest and operating guide** for the project. It defines what a rule is, how rules are organized, how new rules are created, and where every active rule can be found.

The manifest does **not** replace the rule specification. When a new rule is created or an existing rule is structurally changed, follow:

`agent-specifications/Specs/rules.specification.md`

For vendor-specific rule formats or placement requirements, also follow:

`agent-specifications/Specs/vendor-formats.specification.md`

## What a Rule Is

A **rule** is a persistent, reusable directive that constrains or governs agent behavior within a defined scope. A rule states what an agent **must do, must not do, should do, or may do** when a matching condition applies.

A rule is intentionally narrower than a general instruction document. It should represent one coherent policy, convention, boundary, or behavioral requirement that can be understood, referenced, updated, enabled, disabled, or superseded independently.

Examples include coding conventions, architectural boundaries, security restrictions, naming requirements, approval requirements, privacy constraints, output requirements, or project-specific behavioral expectations.

A rule is **not**:

- a task to be completed;
- a procedural skill or reusable workflow;
- a project plan;
- a memory record containing learned facts or events;
- a general reference document with no normative behavior.

If the content primarily explains **how to perform a repeatable procedure**, create a skill. If it describes **work that needs to be completed**, create a task. If it stores **learned or remembered information**, use the applicable memory structure.

## Objectives of a Rule

Every rule should serve one or more concrete governance objectives:

1. **Create behavioral consistency.** The same applicable condition should produce the same expected behavior across sessions and agents.
2. **Establish boundaries.** Rules define what is permitted, prohibited, required, or conditional within their scope.
3. **Preserve project conventions.** Architectural, engineering, security, quality, formatting, and operational decisions should not need to be rediscovered on every interaction.
4. **Provide explicit scope.** A rule should make clear where, when, and to what artifacts or activities it applies.
5. **Remain independently maintainable.** A focused rule can be changed without rewriting unrelated instructions.
6. **Support verification.** A rule should be written so compliance can be observed or checked when practical.
7. **Prevent duplication and contradiction.** Existing applicable rules must be reviewed before adding another rule covering the same concern.
8. **Remain portable in meaning.** Vendor-specific syntax may change, but the intent and behavioral contract of the rule should remain stable.

## Canonical Rules Structure

The house convention is a `rules/` directory containing this manifest and one directory for each independently managed rule.

```text
rules/
├── rules.md                         # This file: definition, instructions, and manifest
│
├── <rule-name>/
│   └── rules.md                     # Individual rule definition
│
└── <another-rule-name>/
    └── rules.md
```

The directory name is the stable rule identifier and should use descriptive kebab-case where possible.

Example:

```text
rules/
├── rules.md
├── no-direct-database-writes/
│   └── rules.md
└── require-test-evidence/
    └── rules.md
```

The individual `rules.md` inside each rule directory must be authored according to `agent-specifications/Specs/rules.specification.md`. Do not invent a new rule structure merely because a vendor supports a different native format. Vendor-native forms are transformations of the canonical rule and are documented separately.

## How to Use This Manifest

Before creating, changing, or applying a rule:

1. Read the manifest below and determine whether an applicable rule already exists.
2. If a matching rule exists, open that rule and follow it. Update the existing rule instead of creating a duplicate when the policy is materially the same.
3. If no matching rule exists and a new reusable behavioral constraint is required, read `agent-specifications/Specs/rules.specification.md` before authoring it.
4. Create a directory using the rule's stable name: `rules/<rule-name>/`.
5. Create `rules/<rule-name>/rules.md` using the required structure from the specification.
6. Add the rule to the **Rule Manifest** table in this file.
7. Verify the rule's path, scope, status, dependencies, and any related rules.
8. If a vendor-specific representation is required, consult `agent-specifications/Specs/vendor-formats.specification.md` and preserve the canonical rule's meaning during translation.

Do not create a rule solely to restate another rule, an instruction, or a specification. Reference the authoritative source instead.

## Rule Lifecycle

Use a stable rule path after creation. Prefer changing the rule's status or content over renaming its directory, because other rules, agents, instructions, manifests, tasks, and documentation may reference that path.

Recommended lifecycle values are:

| Status | Meaning |
|---|---|
| `draft` | Rule is being developed and is not yet authoritative. |
| `active` | Rule is approved and should be applied whenever its scope matches. |
| `disabled` | Rule is intentionally retained but should not currently be applied. |
| `deprecated` | Rule has been superseded or should no longer be used; point to its replacement when one exists. |

When rules conflict, do not silently choose whichever file was loaded last. Resolve the conflict using the project's declared precedence model, scope specificity, or authoritative controlling instruction. If precedence is not defined, surface the conflict rather than inventing one.

## Rule Manifest

This table is the canonical index of ordinary project rules. Add one row for every rule stored under this `rules/` hierarchy.

| Status | Rule | Purpose | Scope / Activation | Canonical Path | Version | Related Rules / Notes |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

### Adding a Rule to the Manifest

When a rule is added:

- Use the rule's exact canonical name in the **Rule** column.
- Summarize the behavioral purpose in one sentence; do not copy the entire rule.
- State the scope or activation condition clearly enough that another agent can decide whether to load it.
- Use a repository-relative canonical path.
- Record the rule version when versioning is used by the rule specification.
- Link or name related, superseded, or dependent rules when that relationship changes interpretation.
- Keep only one active manifest row for one canonical rule. Do not create duplicate rows for vendor-specific copies.

When a rule is disabled or deprecated, update its manifest row instead of deleting historical knowledge unless the rule itself is removed from the repository.

## Memory-Scoped Rules

Some rules belong to a memory subsystem rather than the general project-rule collection. These rules remain governed by the rule specification, but their storage and lifecycle are also governed by the applicable memory specification.

```text
memory/
├── episodic/
│   └── rules/                       # Episodic-memory-specific rules
└── implicit/
    └── rules/                       # Implicit-memory-specific rules
```

| Rule Domain | Purpose | Governing Specification | Expected Location |
|---|---|---|---|
| Episodic memory rules | Govern capture, retention, interpretation, consolidation, or use of event/session memory. | `agent-specifications/Specs/episodic-memory.specification.md` + `agent-specifications/Specs/rules.specification.md` | `memory/episodic/rules/` or the project-defined episodic-memory rules location |
| Implicit memory rules | Govern learned preferences, tendencies, inferred patterns, promotion thresholds, or use of implicit memory. | `agent-specifications/Specs/implicit-memory.specification.md` + `agent-specifications/Specs/rules.specification.md` | `memory/implicit/rules/` or the project-defined implicit-memory rules location |

Memory-scoped rules should **not be duplicated** into the ordinary Rule Manifest merely to make them visible. Instead, keep them indexed by their owning memory subsystem and maintain the cross-reference above. If the project's memory specifications define a different location, those specifications take precedence for storage.

## Vendor-Specific Rule Forms

There is no single vendor-native rule-file convention shared by every agent system. For example, GitHub Copilot commonly uses repository or path-scoped instruction files, while Cursor uses its own project-rule format. The canonical `rules/` hierarchy defined here is therefore the **portable source of truth for this project**, not a claim that every vendor automatically discovers `rules/rules.md`.

When a vendor requires a native rule representation:

1. Keep the canonical rule in this hierarchy unless the project explicitly chooses a vendor-native-only structure.
2. Follow `agent-specifications/Specs/vendor-formats.specification.md` for the vendor transformation.
3. Preserve the canonical rule's behavioral meaning, scope, and constraints.
4. Do not add separate manifest rows for generated or translated vendor copies.

## Maintenance Rules

- Keep this manifest current whenever rules are created, moved, deprecated, disabled, or removed.
- Keep rule names and paths stable after other artifacts begin referencing them.
- Prefer one focused rule over a large file containing unrelated policies.
- Merge overlapping rules rather than allowing multiple files to compete for the same behavioral concern.
- Do not bury material exceptions in prose. Put exceptions in the individual rule where they can be discovered with the rule itself.
- Do not store secrets, credentials, tokens, or sensitive runtime values in rule files.
- Use repository-relative links so the rule library can move with the project.
- Treat this file as both a human-readable index and an agent-readable routing document.

## Verification Checklist

Before considering the rule library current:

- [ ] Every ordinary rule under `rules/` has exactly one manifest row.
- [ ] Every manifest path resolves to an existing rule file.
- [ ] Every individual rule follows `agent-specifications/Specs/rules.specification.md`.
- [ ] No active rules materially duplicate or silently contradict one another.
- [ ] Rule scopes and activation conditions are explicit where scope is not global.
- [ ] Disabled and deprecated rules are clearly marked.
- [ ] Episodic-memory rules remain indexed by the episodic-memory subsystem.
- [ ] Implicit-memory rules remain indexed by the implicit-memory subsystem.
- [ ] Vendor-specific copies, if present, preserve the canonical rule semantics.
