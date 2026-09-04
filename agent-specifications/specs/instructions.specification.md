---
name: instructions-specification
description: "Defines persistent or scoped instruction files."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "*.instructions.md / repository instruction file"
    category: governance
    status: draft
    normative: true
    tags: [instructions, scope, rules]
    related_specifications: [rules-specification, agent-specification, prompt-specification]
---

# *.instructions.md / repository instruction file Specification

## Purpose

Instruction files provide persistent background guidance that should apply whenever work matches a scope. They are appropriate for architecture conventions, coding standards, compliance requirements, repository operating rules, and other context that should not require manual invocation.

## When to Create

Create instructions when guidance must apply repeatedly across tasks or files. Do not use instructions for one-shot procedures better represented as prompts, or atomic reusable procedures better represented as skills.

## Naming and Placement

House form: `<scope>.instructions.md`. Vendor-native forms may include repository-wide files such as `.github/copilot-instructions.md` or other control files. Always record the actual scope and precedence.

## Frontmatter Template

```yaml
---
name: <instruction-set-name>
description: "Persistent guidance applied to matching work."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
apply-to: "<glob-or-scope>"
priority: normal
metadata:
  tags: [instructions, <domain>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Stable identity for the instruction set. |
| `description` | REQUIRED | What guidance is supplied. |
| `version` | REQUIRED house field | Change tracking. |
| `author` | REQUIRED house field | Owner. |
| `license` | REQUIRED house field | Project license. |
| `apply-to` | REQUIRED when scoped | Glob, directory, artifact type, or semantic scope. |
| `priority` | OPTIONAL | Precedence when several instruction layers match. |
| `metadata.tags` | RECOMMENDED | Discovery tags. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Purpose` | Why these instructions exist. |
| `Scope` | What work/files they apply to and what is excluded. |
| `Instructions` | Concrete rules written in direct language. |
| `Precedence` | How conflicts with broader/narrower instructions are resolved. |
| `Validation` | Observable checks that show the instructions were followed. |

## Optional Sections

| Section | Use when |
|---|---|
| `Examples` | Use to clarify a rule. |
| `Exceptions` | Use for approved deviations. |
| `References` | Use for authoritative standards rather than copying them. |

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
| rules | Instructions may aggregate rules; modular reusable rules should remain separately addressable. |
| agent | Agent files may include or reference instruction sets. |
| prompt | Prompts inherit applicable instructions unless the runtime says otherwise. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
