---
name: user-specification
description: "Defines stable user-context files while separating preferences from episodic history and secrets."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "USER.md"
    category: memory
    status: draft
    normative: true
    tags: [user, preferences, context]
    related_specifications: [episodic-memory-specification, implicit-memory-specification, soul-specification]
---

# USER.md Specification

## Purpose

`USER.md` contains stable context that a user intentionally wants agents to know across tasks: preferred forms of address, communication defaults, persistent project roles, non-sensitive workflow preferences, and durable constraints. It should not become an indiscriminate profile dump.

## When to Create

Create a user file when multiple agents need a shared, human-reviewable user context. Use episodic memory for events and implicit memory for learned patterns that still require evidence/confidence.

## Naming and Placement

House filename: `USER.md` at the agent workspace root or memory package root. Vendor systems may have their own user-memory locations.

## Frontmatter Template

```yaml
---
name: user-context
description: "Stable user context that agents may use across tasks."
version: 0.1.0
author: <user-or-system>
last-updated: <ISO-8601>
metadata:
  tags: [user, context]
  retention: <policy>
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Context identity. |
| `description` | REQUIRED | Purpose of the file. |
| `version` | RECOMMENDED | Revision. |
| `author` | RECOMMENDED | User/system maintaining it. |
| `last-updated` | RECOMMENDED | Freshness marker. |
| `metadata.retention` | RECOMMENDED | Retention/update policy. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `User-Provided Context` | Stable facts/preferences the user intentionally supplied. |
| `Working Preferences` | Communication/workflow defaults. |
| `Project Relationships` | Only durable roles/relationships relevant to the workspace. |
| `Constraints` | Persistent boundaries the agent should respect. |
| `Correction Policy` | How updates and conflicts are handled. |

## Optional Sections

| Section | Use when |
|---|---|
| `Preferred Outputs` | Use when formatting preferences are stable. |
| `Accessibility / Environment` | Use only when user intentionally includes it and it changes interaction. |

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
| implicit memory | Learned patterns should remain in implicit memory until explicitly promoted. |
| episodic memory | Time-bound events remain episodic. |
| soul | Soul describes the agent, not the user. |

## Privacy Boundary

Do not store passwords, API keys, authentication tokens, financial credentials, or unnecessary sensitive information in `USER.md`. Use secure stores and reference them by logical name only when required.



## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
