---
name: rules-specification
description: "Defines modular behavior, project, coding, safety, or architecture rules."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "rules/<name>.md (vendor form may differ)"
    category: governance
    status: draft
    normative: true
    tags: [rules, behavior, scope]
    related_specifications: [instructions-specification, construction-rules-specification, vendor-formats-specification]
---

# rules/<name>.md (vendor form may differ) Specification

## Purpose

A rule file is a modular, focused set of constraints that can be composed into broader instructions. Rules should be narrow enough to understand independently and specific enough to change agent behavior.

## When to Create

Create a rule when one coherent policy or convention must be reused, scoped, enabled, or overridden independently. Prefer an instruction file when the content is a broad briefing rather than a modular rule.

## Naming and Placement

House location: `rules/<name>.md`. Vendors may use `.claude/rules/*.md`, `.cursor/rules/*.mdc`, `.github/instructions/*.instructions.md`, or other native forms. The vendor map owns those transformations.

## Frontmatter Template

```yaml
---
name: <rule-name>
description: "One focused behavioral, engineering, or policy rule set."
version: 0.1.0
author: <author>
license: <project-license>
applies-to: "<scope>"
activation: always
metadata:
  tags: [rules, <domain>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Stable rule identifier. |
| `description` | REQUIRED | Constraint and purpose. |
| `version` | REQUIRED house field | Change tracking. |
| `author` | REQUIRED house field | Rule owner. |
| `license` | REQUIRED house field | Project license. |
| `applies-to` | RECOMMENDED | Explicit scope. |
| `activation` | RECOMMENDED | `always`, `scoped`, `manual`, or equivalent. |
| `metadata.tags` | RECOMMENDED | Discovery tags. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Rule` | Normative behavior stated directly. |
| `Rationale` | Why the rule exists when the reason affects correct application. |
| `Applies To` | Scope and matching criteria. |
| `Exceptions` | Allowed exceptions or `None`. |
| `Verification` | Observable compliance check. |

## Optional Sections

| Section | Use when |
|---|---|
| `Examples` | Use for boundary clarification. |
| `Migration` | Use when replacing a previous rule. |

## Construction Rules

- Use clear Markdown headings, tables for schemas or registries, and numbered steps only when order matters.
- Write direct instructions that change agent behavior. Replace vague advice such as “use best practices” with an observable rule or completion criterion.
- Keep portable semantics in the main document. Put vendor-only fields or paths behind an explicit vendor note or adapter.
- Use repository-relative links. Do not hard-code a developer's machine path into a committed artifact.
- Declare dependencies, tools, network access, secrets, external writes, and destructive side effects instead of assuming them.
- Prefer least privilege. Read-only is the default when a task can succeed without write, shell, browser-transaction, administrator, or destructive access.
- Separate required sections from optional sections. Do not create empty headings merely to satisfy a template.
- If a vendor runtime does not recognize a house field, retain the semantic value in `metadata` or translate it in the vendor-specific form.



## Relationships and Transformations

| Related artifact | Rule |
|---|---|
| instructions | Broader instruction sets may reference modular rules. |
| construction rules | Construction rules govern artifact authoring rather than domain behavior. |
| vendor formats | Translate activation/scope syntax without changing the rule meaning. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
