---
name: skillset-specification
description: "Defines SKILLSET.md files that group related skills under a capability."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "SKILLSET.md"
    category: composition
    status: draft
    normative: true
    tags: [skillset, skills, composition]
    related_specifications: [capability-specification, skill-specification]
---

# SKILLSET.md Specification

## Purpose

A skill set is the middle layer between capability and skill. It represents a coherent role, discipline, or domain function and exposes the related skills an agent may need to perform that function.

## When to Create

Create a skill set when multiple reusable skills naturally belong together and are selected as a domain or role. A skill set should not contain detailed procedures; those belong in `SKILL.md`.

## Naming and Placement

Preferred house filename: `SKILLSET.md` inside `skillsets/<skillset-name>/`. Keep the referenced skills in stable paths and use relative links when possible.

## Frontmatter Template

```yaml
---
name: <skillset-name>
description: "Related skills that together perform a role or domain function."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
metadata:
  tags: [<domain>, skillset]
  capability: <capability-name>
  skills: [<skill-name>]
  related_skillsets: [<skillset-name>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Stable skill-set identifier. |
| `description` | REQUIRED | What domain/role the set covers and when it is selected. |
| `version` | REQUIRED | Semantic version. |
| `author` | REQUIRED | Responsible human or organization. |
| `license` | REQUIRED | Project/distribution license. |
| `platforms` | RECOMMENDED | Supported platforms inherited or narrowed by member skills. |
| `metadata.capability` | REQUIRED | Parent capability identifier. |
| `metadata.skills` | REQUIRED | Member skill identifiers. |
| `metadata.related_skillsets` | OPTIONAL | Adjacent sets that are not members. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Overview` | Defines the domain boundary and expected outcomes. |
| `Skills` | Table: skill, relative path, purpose, trigger, key dependency. |
| `Selection Guidance` | How an agent chooses the correct member skill or combination. |
| `Shared Requirements` | Dependencies, credentials, tools, policies, or vocabulary common to the set. |
| `Constraints` | What the set does not cover and when another skill set is required. |

## Optional Sections

| Section | Use when |
|---|---|
| `Workflow Patterns` | Use when member skills have recurring combinations. |
| `Examples` | Use to show routing between skills. |
| `References` | Use for domain standards shared by several skills. |

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
| CAPABILITY.md | Each skill set belongs to or is referenced by a capability. |
| SKILL.md | Every skill row MUST resolve to a skill and preserve that skill’s independent contract. |
| registry | May list the set and members for discovery. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
