---
name: capability-specification
description: "Defines CAPABILITY.md files that compose multiple skill sets into a broad ability."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "CAPABILITY.md"
    category: composition
    status: draft
    normative: true
    tags: [capability, skillsets, composition]
    related_specifications: [skillset-specification, skill-specification, registry-specification]
---

# CAPABILITY.md Specification

## Purpose

A capability is the top reusable ability layer in this framework. It describes a broad domain of competence and links the skill sets that collectively deliver that ability. A capability coordinates; it does not duplicate the procedures contained in its skill sets or skills.

## When to Create

Create a capability when one meaningful ability requires multiple distinct skill sets. Do not create one for a single procedure; that is a skill. Do not create one merely to rename a single skill set.

## Naming and Placement

Preferred house filename: `CAPABILITY.md` inside a capability directory such as `capabilities/<capability-name>/CAPABILITY.md`. A repository MAY use another location, but the manifest/index must preserve the capability → skill set links.

## Frontmatter Template

```yaml
---
name: <capability-name>
description: "Broad ability delivered by coordinated skill sets."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
compatibility: <optional-runtime-requirements>
metadata:
  tags: [<domain>, capability]
  related_capabilities: [<capability-name>]
  skillsets: [<skillset-name>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Stable lowercase kebab-case identifier. |
| `description` | REQUIRED | What broad ability exists and when it is relevant. |
| `version` | REQUIRED | Semantic version of the capability contract. |
| `author` | REQUIRED | Human or organization responsible for the definition. |
| `license` | REQUIRED | Project or distribution license. |
| `platforms` | RECOMMENDED | Supported host platforms; omit only when irrelevant. |
| `compatibility` | OPTIONAL | Runtime, network, package, or environment constraints. |
| `metadata.tags` | RECOMMENDED | Discovery tags. |
| `metadata.skillsets` | REQUIRED | Identifiers of the skill sets composing the capability. |
| `metadata.related_capabilities` | OPTIONAL | Adjacent capabilities without duplicating them. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Overview` | Defines the ability boundary, outcome, and what it deliberately excludes. |
| `Skill Sets` | Table of skill set name, path, purpose, and when it is selected. |
| `Composition Rules` | Explains how skill sets cooperate, sequence, or remain independent. |
| `Inputs and Outputs` | Defines capability-level inputs/results without re-specifying skill procedures. |
| `Constraints` | Shared limits, permissions, or platform boundaries across the capability. |

## Optional Sections

| Section | Use when |
|---|---|
| `Routing` | Use when the capability needs deterministic selection between skill sets. |
| `Examples` | Use only to clarify composition or boundary decisions. |
| `References` | Use for external domain standards or architecture references. |

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
| SKILLSET.md | Every listed skill set MUST resolve and provide part of the capability. |
| SKILL.md | Capabilities normally reach skills through skill sets; avoid direct skill duplication. |
| manifest / registry | Use to expose capability identity and dependency relationships to a larger system. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
