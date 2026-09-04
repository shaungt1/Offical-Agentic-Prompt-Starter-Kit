---
name: guardian-specification
description: "Defines guardian.instructions.md for audience mapping, reputation/time protection, boundaries, and best-self gating."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "guardian.instructions.md"
    category: emulation
    status: draft
    normative: true
    tags: [emulation, guardian, audience, boundaries]
    related_specifications: [emulation-manifest-specification, observation-specification, optimization-specification, soul-specification]
---

# Guardian Instructions Specification

## Purpose

`guardian.instructions.md` is the emulation framework's representation and boundary filter. It protects reputation, time, privacy, and intent by distinguishing internal/authentic context from what should be expressed or executed externally. Its purpose is to emulate the user's **best authorized self**, not every raw impulse or observation.

## Frontmatter Template

```yaml
---
name: guardian
description: "Filters observed signals through audience, boundary, reputation, and authorization rules."
version: 0.1.0
author: <author>
license: <project-license>
metadata:
  tags: [emulation, guardian]
  audience-modes: [internal, external]
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Guardian Goal` | What is protected and what the guardian is allowed to change. |
| `Audience Mapping` | Internal/raw understanding versus external/professional expression. |
| `Best-Self Criteria` | Qualities the emulation should preserve when acting or drafting. |
| `Boundaries` | Privacy, authority, reputation, time, and relationship constraints. |
| `Action Gate` | When output may continue, must be rewritten, must request confirmation, or must stop. |
| `Output Contract` | Approved representation plus constraints handed to Optimization. |
| `Conflict Handling` | What happens when authentic style conflicts with audience, policy, or explicit user instructions. |
| `Verification` | Cases demonstrating that meaning is preserved while unsafe/inappropriate leakage is blocked. |

## Dual-Audience Rule

The Guardian SHOULD preserve the internal signal needed for accurate reasoning while separately deciding what is appropriate for the external audience. “Polished” does not mean falsified; do not invent achievements, facts, commitments, or sentiment to make an output look better.

## Authority Rule

The Guardian cannot grant tools, administrator rights, external-write authority, or account access. It can only enforce or narrow authority supplied by the governing agent/workflow/user authorization.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
