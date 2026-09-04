---
name: tools
description: "Master definition, usage guidance, and manifest for callable action tools."
version: 0.1.0
status: active
---

# Tools

## What a Tool Is

A **tool** is a callable action interface with defined inputs, outputs, permissions, side effects, failure behavior, and verification.

Tools perform or expose real actions. A tool may read files, execute commands, call APIs, browse, mutate project state, create records, or perform another concrete operation.

A tool is different from a mode or rule because it **executes**. A skill may use one or more tools to perform a reusable procedure.

## Creating a Tool

Follow `agent-specifications/specs/tool.specification.md`.

If the tool is exposed through MCP, packaged in a plugin, or depends on another protocol, also follow the applicable MCP/plugin/protocol specification rather than duplicating that information here.

Typical structure:

```text
tools/
├── tools.md
└── <tool-name>.md
```

## Tool Manifest

| Status | Tool | Action | Runtime | Canonical Path | Version | Permission Level | Side Effects |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

## Tool Rules

- Prefer one narrow action contract over a tool that multiplexes unrelated behavior.
- Define schemas explicitly.
- Use least privilege.
- State whether retries are safe.
- Require confirmation for external writes, destructive actions, administrator-level changes, purchases, messages, account changes, or similar side effects when the controlling policy requires it.
- Never place secrets directly in the manifest.

## Verification

- [ ] Every active tool is indexed.
- [ ] Tool paths resolve.
- [ ] Tools follow `agent-specifications/specs/tool.specification.md`.
- [ ] Inputs, outputs, permissions, idempotency, and failure behavior are explicit.
- [ ] Side effects and confirmation requirements are visible.
