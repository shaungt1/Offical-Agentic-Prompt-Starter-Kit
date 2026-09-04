---
name: memory
description: "Master definition, routing guidance, and manifest for episodic and implicit memory systems."
version: 0.1.0
status: active
---

# Memory

## What Memory Is

**Memory** is retained information that survives beyond the immediate conversational turn and can inform later reasoning, personalization, continuity, or emulation.

This library separates memory into two primary forms:

| Memory Type | Purpose | Governing Specification |
|---|---|---|
| **Episodic Memory** | Records time-bound events, sessions, observations, decisions, and experiences with provenance. | `agent-specifications/specs/episodic-memory.specification.md` |
| **Implicit Memory** | Records learned preferences, tendencies, recurring patterns, inferred behavior, and confidence-weighted observations. | `agent-specifications/specs/implicit-memory.specification.md` |

Memory is not a rule. Memory describes what was observed, learned, or retained. Rules determine what must or must not happen.

## Canonical Memory Structure

```text
memory/
├── MEMORY.md               # This file — routing manifest
├── MEMORY_INDEX.md         # Episodic memory log (flat file; behavior defined inline)
└── implicit/               # Implicit memory subsystem
    ├── IMPLICIT_MEMORY.md
    ├── implicit-memory.instructions.md
    ├── implicit-memory-tool.specification.md
    ├── implicit.memory.md
    └── MEMORY_INDEX_ENTRY.md
```

The exact storage shape may be changed by the applicable memory specification or project configuration.

## Memory Routing

When adding memory:

1. Determine whether the information is an event/experience (**episodic**) or a learned pattern/preference (**implicit**).
2. Follow the applicable memory specification.
3. Preserve source/provenance and confidence where required.
4. Do not promote a single noisy observation into an implicit pattern without the evidence threshold required by the implicit-memory design.
5. Apply memory-specific rules from the corresponding memory rule location.
6. Add the memory subsystem or managed memory collection to this manifest when it is meant to be discoverable from the root.

## Memory Manifest

| Status | Memory System / Collection | Type | Purpose | Canonical Path | Version | Rules / Notes |
|---|---|---|---|---|---|---|
| active | Episodic Memory | Episodic | Chronological log of what the user **explicitly** stated should be remembered — preferences, standing instructions, corrections, decisions. | `memory/MEMORY_INDEX.md` | 0.1 | Governed by `agent-specifications/specs/episodic-memory.specification.md`. Check on (almost) every request; add a row the moment the user states something explicitly. |
| active | Implicit Memory | Implicit | Persistent, revisable conclusions derived from interaction, evidence, and reflection that are expected to materially improve future reasoning or behavior. | `memory/implicit/IMPLICIT_MEMORY.md` | 1.0 | Governed by `agent-specifications/specs/implicit-memory.specification.md`; operational hook in `memory/implicit/implicit-memory.instructions.md`. |

## Memory-Scoped Rules

Memory-specific behavioral rules are stored with the memory system rather than duplicated into the general project rule manifest:

```text
memory/MEMORY_INDEX.md                          # episodic behavior, defined inline
memory/implicit/implicit-memory.instructions.md # implicit behavior
```

These rules remain subject to `agent-specifications/specs/rules.specification.md` in addition to the applicable memory specification.

## Verification

- [ ] Memory is classified as episodic or implicit.
- [ ] The applicable specification is followed.
- [ ] Provenance/confidence requirements are preserved.
- [ ] Memory-specific rules remain with the correct subsystem.
- [ ] The root manifest does not duplicate individual low-level memory entries unnecessarily.
