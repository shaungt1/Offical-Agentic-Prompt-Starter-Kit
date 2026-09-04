---
name: emulation-manifest-specification
description: "Defines emulation.manifest.md as the master index and linker for observation, guardian, and optimization instructions."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "emulation.manifest.md"
    category: emulation
    status: draft
    normative: true
    tags: [emulation, manifest, observation, guardian, optimization]
    related_specifications: [observation-specification, guardian-specification, optimization-specification, manifest-specification]
---

# Emulation Manifest Specification

## Purpose

`emulation.manifest.md` is the **master index and linker** for the three-file emulation framework. It does not contain the detailed observation, guardian, or optimization policies. It declares their locations, order, interfaces, and dependency relationship so agents do not create circular or ad-hoc cross-references.

## Required Architecture

```text
emulation.manifest.md
        │
        ├── observation.instructions.md
        ├── guardian.instructions.md
        └── optimization.instructions.md

Execution pipeline:
Observation → Guardian → Optimization
```

## Frontmatter Template

```yaml
---
name: emulation-framework
description: "Master linker for observation, guardian, and optimization instructions."
version: 0.1.0
author: <author>
license: <project-license>
manifest-version: 1
pipeline: [observation, guardian, optimization]
metadata:
  tags: [emulation, manifest]
  status: draft
---
```

## Required Component Table

| Order | Component | Required filename | Responsibility | Input | Output |
|---:|---|---|---|---|---|
| 1 | Observation | `observation.instructions.md` | Interpret context and extract relevant signals/preferences. | User/context/event evidence | Structured observations and candidate preferences |
| 2 | Guardian | `guardian.instructions.md` | Apply audience, reputation, boundary, and best-self filters. | Observation output + intended audience/action | Guarded/approved representation and constraints |
| 3 | Optimization | `optimization.instructions.md` | Detect friction and formulate useful proactive improvements. | Guarded observations + current goals/workflow | Optimization proposals/actions within allowed boundaries |

## Required Sections

- `Framework Purpose`
- `Component Registry` using the table above
- `Pipeline Contract` defining observation → guardian → optimization
- `Shared Data Contract` naming common fields passed between stages without duplicating stage rules
- `Failure / Missing Component Policy`
- `Version Compatibility`
- `Verification`

## Linker Rules

- The manifest points to components; components SHOULD point back to the manifest, not directly form a mesh of cross-references.
- Guardian operates before optimization so proactive behavior is based on a representation that has already passed audience/boundary review.
- Observation does not authorize action; it produces evidence/signals.
- Optimization does not bypass guardian constraints.
- Missing required components make the framework incomplete; do not silently skip a stage.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
