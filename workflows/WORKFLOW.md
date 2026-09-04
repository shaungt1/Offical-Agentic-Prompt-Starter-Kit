---
name: workflows
description: "Master definition, usage guidance, and manifest for reusable multi-step workflows."
version: 0.1.0
status: active
---

# Workflows

## What a Workflow Is

A **workflow** is a reusable multi-step process that coordinates actions, skills, tools, agents, gates, or branches toward a repeatable outcome.

A workflow defines **how a recurring process operates**. A plan is one concrete execution instance; a task is one unit of work; a skill is one focused reusable procedure.

## Creating a Workflow

Follow `agent-specifications/Specs/workflow.specification.md`.

Create a workflow when several steps recur with stable sequencing, decision gates, handoffs, recovery behavior, or state transitions. If only one focused procedure is required, use a skill instead.

House structure:

```text
workflows/
├── workflows.md
└── <workflow-name>.md
```

## Workflow Manifest

| Status | Workflow | Outcome | Trigger | Canonical Path | Version | Skills / Agents / Tools |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every active workflow is indexed once.
- [ ] Manifest paths resolve.
- [ ] Workflows follow `agent-specifications/Specs/workflow.specification.md`.
- [ ] Inputs, outputs, branches, recovery, and completion checks are explicit.
- [ ] Reusable skills/tools are referenced instead of redefined.
