---
name: memory-index
description: "Episodic memory log — chronological record of explicit user-stated preferences, decisions, and instructions that should be remembered and checked on future turns."
version: 0.1.0
status: active
---

# Memory Index — Episodic Log

Governing specification: `agent-specifications/specs/episodic-memory.specification.md`

## What Goes Here

An entry belongs here when the user **explicitly** states something to remember and apply later — a preference, a standing instruction, a correction, or a decision. Examples:

- "I like the color blue — only show me blue-themed templates."
- "I like dogs. Don't show me pictures of cats."
- "Call me sir."

This is different from **implicit memory** (`memory/implicit/`), which the agent derives on its own from patterns and evidence over time. An episodic entry exists because the user said it **directly**, and it is recorded **here, by default** — even when the runtime also has its own separate persistence mechanism (e.g. an IDE's own auto-memory) — unless the user explicitly asks for it to be stored somewhere else instead.

## How To Use This

1. **Check this table on (almost) every request** before acting — not just once at the start of a session.
2. **The moment the user explicitly states something to remember**, add a new row in the same turn. Do not wait to be asked to save it.
3. Never edit a previous row to change its meaning. If a preference changes, add a new row and mark the old one superseded in its Notes column.
4. Keep each entry short and actionable — a preference or decision, not a transcript of the conversation that produced it.

## Episodic Memory Log

| Date | Summary | Status | Notes |
|------|---------|--------|-------|
|  |  |  |  |

_No entries yet._
