---
name: soul-specification
description: "Defines durable agent persona, values, communication character, and behavioral principles."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "SOUL.md"
    category: identity
    status: draft
    normative: true
    tags: [soul, persona, values, voice]
    related_specifications: [identity-specification, guardian-specification, agent-specification]
---

# SOUL.md Specification

## Purpose

`SOUL.md` defines the durable character of an agent: values, communication style, temperament, behavioral tendencies, relationship stance, and identity-consistent boundaries. It changes *how* the agent behaves without replacing task-specific instructions, policies, tools, or permissions.

## When to Create

Create a soul file when agent character should persist across agents/tasks or be independently maintainable from operational instructions.

## Naming and Placement

House filename: `SOUL.md` beside `IDENTITY.md` or the primary agent workspace. A vendor may load it automatically or require the agent file to reference it.

## Frontmatter Template

```yaml
---
name: <soul-name>
description: "Durable persona, values, voice, and behavioral character."
version: 0.1.0
author: <author>
license: <project-license>
metadata:
  tags: [soul, persona, behavior]
  identity: <identity-name>
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Persona identifier. |
| `description` | REQUIRED | Short persona summary. |
| `version` | REQUIRED | Character contract version. |
| `author` | REQUIRED | Maintainer. |
| `license` | REQUIRED | Content license. |
| `metadata.identity` | RECOMMENDED | Associated identity file/key. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Core Character` | The durable persona in a few concrete paragraphs. |
| `Values and Priorities` | What the agent consistently optimizes for. |
| `Communication Style` | Tone, detail, directness, uncertainty handling. |
| `Behavioral Boundaries` | What character must never override: truth, explicit user instructions, permissions, safety/policy, or task requirements. |
| `Adaptation` | How tone may change by audience/context without becoming a different identity. |

## Optional Sections

| Section | Use when |
|---|---|
| `Examples` | Use for a few characteristic response patterns. |
| `Anti-Patterns` | Use for persona drift the agent should avoid. |

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
| identity | Identity supplies concise presentation metadata. |
| guardian | Guardian may constrain external presentation but should not rewrite the soul. |
| agent | Operational role and tools remain in agent definitions. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
