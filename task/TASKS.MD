---
name: tasks
description: "Master definition, usage guidance, and manifest for project Tasks and Task Lists."
version: 0.1.0
status: active
---

# Tasks

## What a Task Is

A **Task** is one independently verifiable unit of work that should remain visible across agent sessions, commits, or handoffs. A **Task List** is a manifest that groups several related Tasks contributing to one larger outcome.

A Task is not a Skill, Workflow, Rule, or design document. It describes a concrete objective with completion criteria, not a reusable procedure or a standing constraint.

## Creating a Task

Follow `agent-specifications/specs/task.specification.md` for the required structure of a Task or Task List file.

Follow `task/task-management.instructions.md` for location resolution, backtracing, status lifecycle, completion behavior, and archiving. That instruction set is authoritative for **where** Task files live — by default `/_tasks/` for committed project work, or `.admin-local/Tasks/` for private/local work. Task files are intentionally **not** stored directly under `task/`; this folder holds the routing manifest and the governing instructions only.

## Task Manifest

This table indexes active Task Lists so they remain discoverable from the root without opening every task directory. Individual Tasks are tracked inside their own Task List, not duplicated here.

| Status | Task List | Objective | Location | Version | Dependencies | Notes |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every active Task List is indexed once above.
- [ ] Manifest locations resolve to real Task List files.
- [ ] Tasks and Task Lists follow `agent-specifications/specs/task.specification.md`.
- [ ] Location choice (committed vs. private) follows `task/task-management.instructions.md`.
- [ ] Status reflects repository evidence rather than assumption.
