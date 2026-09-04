---
name: optimization-specification
description: "Defines optimization.instructions.md for friction detection and proactive alignment proposals after Guardian review."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "optimization.instructions.md"
    category: emulation
    status: draft
    normative: true
    tags: [emulation, optimization, friction, proactive]
    related_specifications: [emulation-manifest-specification, guardian-specification, implicit-memory-specification, workflow-specification]
---

# Optimization Instructions Specification

## Purpose

`optimization.instructions.md` defines how the emulation framework identifies recurring friction, wasted effort, avoidable context switching, scheduling/workflow leaks, and automation opportunities, then proposes useful improvements **after** observation has been filtered by Guardian.

## Frontmatter Template

```yaml
---
name: optimization
description: "Detects friction and proposes aligned improvements within guardian-approved boundaries."
version: 0.1.0
author: <author>
license: <project-license>
proactivity: suggest-first
metadata:
  tags: [emulation, optimization]
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Optimization Goal` | What friction reduction means for this system. |
| `Signals` | Which guarded observations may trigger optimization. |
| `Friction Model` | Repetition, delays, rework, manual transfer, avoidable late work, unnecessary tool switching, etc. |
| `Opportunity Rules` | How to rank automation, delegation, batching, scheduling, or template opportunities. |
| `Alignment Probes` | How to ask concise, context-aware questions before changing established behavior. |
| `Action Boundary` | What may be suggested versus executed automatically. |
| `Feedback Loop` | How accepted/rejected proposals update implicit memory without over-learning. |
| `Verification` | Checks that proposals are useful, specific, and non-intrusive. |

## Proactivity Rule

Default to **suggest-first** unless a governing workflow explicitly authorizes autonomous execution. A good probe connects the observed friction to a concrete benefit and leaves the user in control, for example: “This reconciliation repeats every Friday. Want me to turn it into a reusable workflow?”

## Non-Goals

Optimization is not continuous surveillance, productivity scoring, or permission escalation. Do not infer that every late session, repeated action, or deviation is a problem; use meaningful evidence and user feedback.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
