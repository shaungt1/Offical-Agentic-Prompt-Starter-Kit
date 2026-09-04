---
name: observation-specification
description: "Defines observation.instructions.md for context parsing, domain classification, and preference-signal extraction."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "observation.instructions.md"
    category: emulation
    status: draft
    normative: true
    tags: [emulation, observation, signals, domains]
    related_specifications: [emulation-manifest-specification, implicit-memory-specification, guardian-specification]
---

# Observation Instructions Specification

## Purpose

`observation.instructions.md` defines how the emulation layer observes text/context, separates domains, extracts high-signal implicit preferences, records provenance/confidence, and avoids noisy mechanical telemetry that does not meaningfully improve emulation.

## Frontmatter Template

```yaml
---
name: observation
description: "Extracts contextual signals and candidate preferences for the emulation pipeline."
version: 0.1.0
author: <author>
license: <project-license>
applies-to: <emulation-input-scope>
metadata:
  tags: [emulation, observation]
  domains: [DOMAIN_TECH, DOMAIN_STRATEGY, DOMAIN_FAMILY, DOMAIN_ADMIN]
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Observation Goal` | What useful signal is being extracted and what is intentionally ignored. |
| `Domain Model` | Domain identifiers and rules for adding project-specific domains. |
| `Signal Types` | Explicit statements, repeated preferences, decisions, corrections, friction, context boundaries. |
| `Extraction Rules` | How to separate evidence from inference and assign confidence. |
| `Noise Exclusions` | Mechanical telemetry or incidental behavior that should not be learned merely because it occurred. |
| `Output Contract` | Structured observations passed to Guardian, including source/domain/confidence. |
| `Memory Interface` | When observations become episodic evidence or implicit-memory candidates. |
| `Verification` | Representative examples and checks for over-inference. |

## Required Observation Record

```text
signal-id | domain | observation | evidence-type | source | confidence | candidate-effect
```

## Rules

- Observation produces **evidence and candidates**, not permissions or external actions.
- Do not convert one occurrence into a stable preference without explicit confirmation or sufficient repeated evidence.
- Domain classification should reduce context bleed; a pattern in `DOMAIN_TECH` should not automatically control unrelated family/admin contexts.
- Preserve raw meaning without copying unnecessary sensitive content into long-term memory.
- Prefer explicit user corrections and repeated choices over incidental timing/click/typing telemetry.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
