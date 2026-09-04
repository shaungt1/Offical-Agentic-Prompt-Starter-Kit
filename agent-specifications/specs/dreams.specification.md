---
name: dreams-specification
description: "Defines reflective memory-consolidation notes that are not automatically authoritative."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "DREAMS.md"
    category: memory
    status: draft
    normative: true
    tags: [dreams, reflection, memory-consolidation]
    related_specifications: [episodic-memory-specification, implicit-memory-specification, soul-specification, user-specification]
---

# DREAMS.md Specification

## Purpose

`DREAMS.md` is a human-reviewable reflection layer used to summarize episodes, surface recurring themes, propose memory promotions, and record why a durable memory might change. It is working analysis, not an automatic source of truth.

## When to Create

Create or update dreams during deliberate consolidation/reflection cycles, especially when episodic records are becoming large or repeated patterns need review before promotion.

## Naming and Placement

House filename: `DREAMS.md` in the memory root. If date-sharded, maintain a clear index and promotion log.

## Frontmatter Template

```yaml
---
name: dreams
description: "Reflective memory-consolidation working notes pending review or promotion."
version: 0.1.0
author: <system-or-human>
last-updated: <ISO-8601>
metadata:
  tags: [dreams, reflection, memory]
  status: working
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | File identity. |
| `description` | REQUIRED | Reflection purpose. |
| `version` | RECOMMENDED | Format revision. |
| `author` | RECOMMENDED | System/human producing reflections. |
| `last-updated` | REQUIRED | Freshness. |
| `metadata.status` | RECOMMENDED | Working/reviewed/archived. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Reflection Window` | Episodes/time period considered. |
| `Observations` | Patterns and tensions noticed. |
| `Promotion Proposals` | Candidate implicit/user/soul changes with supporting evidence. |
| `Rejected Promotions` | What was considered but intentionally not promoted and why. |
| `Review Status` | Human/system review outcome. |

## Optional Sections

| Section | Use when |
|---|---|
| `Questions` | Use for unresolved interpretations. |
| `Memory Maintenance` | Use for stale/conflicting entries needing cleanup. |

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
| episodic memory | Provides source evidence. |
| implicit memory | Receives promoted learned patterns only after policy is met. |
| soul/user | Durable identity/user changes require explicit promotion policy. |

## Caveat

Do not let speculative reflection silently mutate durable memory. Promotion must be explicit, traceable, and reversible.



## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
