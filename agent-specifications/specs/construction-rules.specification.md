---
name: construction-rules-specification
description: "Defines reusable construction-rule files that govern how artifacts are authored."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "CONSTRUCTION.md / *.construction.md"
    category: governance
    status: draft
    normative: true
    tags: [construction, rules, authoring]
    related_specifications: [specification-authoring, rules-specification]
---

# Construction Rules Specification

## Purpose

Construction rules define **how artifacts are built**, not how an agent performs the artifact's domain task. Use them for repository-wide authoring constraints such as naming, frontmatter requirements, formatting, resource placement, permission declarations, review gates, and required validation.

## Naming

Use `CONSTRUCTION.md` for repository-wide rules or `<scope>.construction.md` for a focused family such as `skills.construction.md`. If a vendor has a native scoped-instruction mechanism, this file may be translated into that mechanism.

## Frontmatter Template

```yaml
---
name: <scope>-construction
description: "Construction rules for <artifact family>."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
applies-to: [<glob-or-artifact-type>]
priority: normal
metadata:
  tags: [construction, <scope>]
  status: draft
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Scope` | Files/artifacts governed and excluded. |
| `Required Structure` | Mandatory fields, headings, tables, or directories. |
| `Naming and Placement` | Filenames, casing, locations, and path rules. |
| `Authoring Rules` | Specific normative rules for content and behavior. |
| `Validation` | Checks that determine compliance. |
| `Exceptions` | Explicitly approved deviations and who can authorize them. |

## Caveats

- Construction rules MUST NOT redefine domain procedures that belong in the artifact specification itself.
- Avoid duplicated rules across several construction files; one rule should have one source of truth.
- More-specific scoped rules may override broader construction rules only when precedence is stated.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
