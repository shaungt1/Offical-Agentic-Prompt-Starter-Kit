---
name: plans
description: "Master definition, usage guidance, and manifest for execution plans."
version: 0.1.0
status: active
---

# Plans

## What a Plan Is

A **plan** is an instance-specific execution document for a concrete objective. It records sequence, milestones, dependencies, decisions, progress, risks, validation, and enough state for work to resume without reconstructing the original intent.

A plan is not a reusable workflow. A workflow defines a repeatable process; a plan applies intent to one specific body of work. A plan may reference Tasks for its executable work units.

## Creating a Plan

Follow `agent-specifications/specs/plan.specification.md`.

Create a plan when work spans several meaningful steps, files, agents, decisions, or sessions. Do not create a plan for trivial work or merely to restate a Task List.

House structure:

```text
plans/
├── plans.md
└── <plan-name>.md
```

## Plan Manifest

| Status | Plan | Objective | Owner | Canonical Path | Version | Related Task List / Workflow |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Active plans are indexed.
- [ ] Plan paths resolve.
- [ ] Each plan follows `agent-specifications/specs/plan.specification.md`.
- [ ] Plans reference reusable workflows rather than copying them when one already exists.
- [ ] Completion is supported by validation evidence.
