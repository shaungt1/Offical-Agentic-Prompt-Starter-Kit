---
name: identity
description: "Master definition, usage guidance, and manifest for agent identity definitions."
version: 0.1.0
status: active
---

# Identity

## What Identity Is

**Identity** defines the concise, stable answer to “who is this agent?” It covers canonical name, display identity, role label, presentation metadata, aliases, and other stable identifiers that multiple agent-control artifacts may need to reference consistently.

Identity is intentionally narrower than `SOUL.md`. Identity names and presents the agent; soul defines deeper personality, voice, values, and behavioral character. Agent files define responsibilities, tools, workflow, and execution boundaries.

## Creating an Identity

Follow `agent-specifications/Specs/identity.specification.md`.

When deeper personality or values are required, follow `agent-specifications/Specs/soul.specification.md` and link the soul artifact rather than placing the entire persona inside the identity file.

Typical structure:

```text
identity/
├── identity.md
└── <identity-name>/
    └── IDENTITY.md
```

## Identity Manifest

| Status | Identity | Role / Presentation | Canonical Path | Version | Agent | Soul |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every managed identity is indexed.
- [ ] Identity paths resolve.
- [ ] Identity follows `agent-specifications/Specs/identity.specification.md`.
- [ ] Personality/values are referenced from soul rather than duplicated.
- [ ] Agent responsibilities and tool permissions remain in the agent contract.
