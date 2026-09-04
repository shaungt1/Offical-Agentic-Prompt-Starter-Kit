---
name: implicit-memory-specification
description: "Defines learned preferences and behavioral patterns derived from repeated evidence."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "IMPLICIT_MEMORY.md"
    category: memory
    status: draft
    normative: true
    tags: [memory, implicit, preferences, patterns]
    related_specifications: [episodic-memory-specification, user-specification, guardian-specification]
---

# Implicit Memory Specification

## Purpose

Implicit memory captures **learned patterns** that are useful across future interactions: preferences, recurring decision tendencies, working styles, defaults, friction patterns, and stable behavioral signals. It is derived from repeated evidence or explicit confirmation, not from one isolated episode.

## Frontmatter Template

```yaml
---
name: implicit-memory
description: "Learned stable patterns used to adapt future agent behavior."
version: 0.1.0
author: <system-or-human>
last-updated: <ISO-8601>
retention: <project-policy>
metadata:
  tags: [memory, implicit]
  evidence-policy: multi-source-or-confirmed
---
```

## Recommended Entry Table

| Key | Pattern / Preference | Domain | Confidence | Evidence | Last Confirmed | Actionable Effect |
|---|---|---|---|---|---|---|
| `<id>` | `<learned pattern>` | `<domain>` | `<level>` | `<episode refs>` | `<date>` | `<how agent behavior changes>` |

## Required Rules

- Every implicit entry MUST state evidence or explicit confirmation.
- The entry MUST describe the **behavioral effect**; memory that never changes decisions or interaction is noise.
- New contradictory evidence MUST reduce confidence, create a conflict, or supersede the entry—never silently disappear.
- Do not infer protected/sensitive personal traits merely because they correlate with observed behavior.
- Do not store secrets. Link to secure credential systems by name only when operationally necessary.
- Use domain scope so a preference learned in one context does not automatically bleed into unrelated contexts.
- Allow entries to be corrected, expired, or removed.

## Required Sections

| Section | Purpose |
|---|---|
| `Learning Policy` | Evidence threshold, confirmation policy, confidence model, and conflict handling. |
| `Implicit Memory` | Table or keyed entries. |
| `Application Rules` | How entries influence prompts, routing, style, defaults, or automation. |
| `Exceptions / Conflicts` | Contexts where a general preference should not apply. |
| `Provenance` | Links back to episodic memory or explicit user statements. |

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
