---
name: episodic-memory-specification
description: "Defines time-bound event and session memory records with provenance, confidence, and promotion rules."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "EPISODIC_MEMORY.md / memory/episodes/*.md"
    category: memory
    status: draft
    normative: true
    tags: [memory, episodic, events, provenance]
    related_specifications: [implicit-memory-specification, user-specification, dreams-specification]
---

# Episodic Memory Specification

## Purpose

Episodic memory records **what happened** in a particular interaction, session, event, decision, or time window. It preserves chronology and provenance so later systems can distinguish a remembered event from a stable preference or rule.

## Recommended Storage

Use `EPISODIC_MEMORY.md` for a compact single-file system or `memory/episodes/YYYY-MM-DD.md` / `memory/episodes/<event-id>.md` when the history grows. The index/manifest should state which form is authoritative.

## Frontmatter Template

```yaml
---
name: episodic-memory-<date-or-id>
description: "Time-bound memory for <session/event>."
version: 0.1.0
author: <system-or-human>
recorded-at: <ISO-8601>
source: <conversation|file|event|tool>
confidence: <0.0-1.0-or-label>
retention: <project-policy>
metadata:
  tags: [memory, episodic, <domain>]
  related_episodes: [<episode-id>]
  promotion-candidates: [<implicit-memory-key>]
---
```

## Required Record Structure

| Section | Purpose |
|---|---|
| `Context` | What situation/session produced the memory. |
| `Events / Observations` | Time-bound facts or actions, preserving uncertainty and chronology. |
| `Decisions` | Decisions actually made, including owner/source when available. |
| `Open Loops` | Unresolved tasks/questions that matter to later sessions. |
| `Provenance` | Source pointers sufficient to distinguish observed, stated, inferred, and tool-derived content. |
| `Promotion Candidates` | Patterns that may become implicit memory only after sufficient evidence or confirmation. |

## Memory Rules

- Do not silently turn a one-time event into a permanent preference.
- Distinguish **stated**, **observed**, **inferred**, and **derived** information.
- Preserve uncertainty and conflicting evidence rather than merging it into false certainty.
- Do not store credentials, authentication secrets, or unnecessary sensitive raw content.
- Apply project retention/deletion policy. A memory system must be able to forget or supersede stale episodes.
- Episodic memory is evidence for implicit memory; it is not automatically implicit memory.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
