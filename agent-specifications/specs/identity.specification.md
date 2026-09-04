---
name: identity-specification
description: "Defines concise agent identity and presentation metadata."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "IDENTITY.md"
    category: identity
    status: draft
    normative: true
    tags: [identity, agent, presentation]
    related_specifications: [soul-specification, agent-specification, user-specification]
---

# IDENTITY.md Specification

## Purpose

`IDENTITY.md` answers “who is this agent?” at the concise presentation level: canonical name, display name, role label, visual/theme metadata, short description, and stable identifiers. It should not contain the full behavioral persona—that belongs in `SOUL.md` or the agent file.

## When to Create

Create identity metadata when several artifacts need a shared canonical identity or a runtime surfaces the agent by name/avatar/theme.

## Naming and Placement

House filename: `IDENTITY.md` near the agent root. Keep paths to avatar/assets relative and portable.

## Frontmatter Template

```yaml
---
name: <agent-identity-name>
description: "Concise identity and presentation metadata for the agent."
version: 0.1.0
author: <author>
license: <project-license>
metadata:
  display-name: <display-name>
  theme: <optional-theme>
  avatar: <optional-relative-path>
  tags: [identity]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Canonical identity key. |
| `description` | REQUIRED | Short identity summary. |
| `version` | RECOMMENDED | Identity revision. |
| `author` | RECOMMENDED | Maintainer. |
| `license` | RECOMMENDED | Asset/content license. |
| `metadata.display-name` | RECOMMENDED | Human-facing name. |
| `metadata.theme` | OPTIONAL | Presentation theme. |
| `metadata.avatar` | OPTIONAL | Relative asset path. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Identity` | Canonical name and role label. |
| `Presentation` | Display name, avatar/theme, concise descriptors. |
| `Boundaries` | What identity metadata must not attempt to control. |

## Optional Sections

| Section | Use when |
|---|---|
| `Aliases` | Use for stable alternate names. |
| `Provenance` | Use when identity is generated/imported. |

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
| soul | Soul owns personality/voice/values. |
| agent | Agent file owns responsibilities/tools/workflow. |
| user | User file describes the user, never the agent identity. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
