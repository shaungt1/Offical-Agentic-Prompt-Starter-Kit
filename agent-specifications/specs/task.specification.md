---
name: task-specification
description: "Defines portable Task and Task List Markdown artifacts for tracked project work."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "task_*.md / task-list_*.md"
    category: execution
    status: draft
    normative: true
    tags: [tasks, task-list, execution, tracking, completion]
    related_specifications: [plan-specification, workflow-specification, reference-specification]
---

# Task and Task List Specification

## Purpose

This specification defines two lightweight project-work artifacts:

1. **Task** — one executable unit of work with a clear objective, requirements, deliverables, references, and an objective definition of done.
2. **Task List** — a manifest that groups multiple Task files, tracks their state, and links them into a larger body of work without duplicating each task's detailed instructions.

Tasks are execution records, not reusable procedures. Reusable procedures belong in skills or workflows; broad multi-phase execution strategy belongs in plans.

## Artifact Forms

| Form | Use when | Primary content |
|---|---|---|
| **Task** | One discrete piece of work can be completed and verified independently. | Objective, requirements, references, deliverables, done checklist. |
| **Task List** | Several related tasks must be coordinated or tracked together. | Overall objective plus a manifest of linked Task files and their status. |

## Naming Convention

Use lowercase descriptive filenames with the creation date as the final component.

```text
task_<descriptor>_<YYYY-MM-DD>.md
task-list_<descriptor>_<YYYY-MM-DD>.md
```

Examples:

```text
task_build-admin-layout_2026-09-03.md
task_add-authentication_2026-09-03.md
task-list_front-end-admin_2026-09-03.md
```

The date records when the artifact was created, not when it was completed. **Do not rename a task solely because its status changes**; stable filenames preserve links from task lists, plans, commits, and documentation.

## Minimal Frontmatter

Task artifacts intentionally use a smaller frontmatter than skills, agents, or other reusable control artifacts.

```yaml
---
name: <human-readable task or task-list name>
date: <YYYY-MM-DD>
description: "One-sentence statement of the work to be completed."
status: pending
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | **REQUIRED** | Human-readable identity of the Task or Task List. |
| `date` | **REQUIRED** | Creation date in `YYYY-MM-DD` format. |
| `description` | **REQUIRED** | Concise statement of the work or collection of work represented by the file. |
| `status` | **RECOMMENDED** | Current lifecycle state: `pending`, `in-progress`, `blocked`, `complete`, or `cancelled`. |

Do not add rich metadata merely because other specifications use it. Add extra fields only when the project has an established need for them.

## Task Template

```markdown
---
name: <task name>
date: <YYYY-MM-DD>
description: "<what must be accomplished>"
status: pending
---

# <Task Name>

## Objective

State the concrete end condition this task exists to produce.

## Requirements

- State required constraints, behavior, inputs, dependencies, or conditions.
- Do not duplicate large design or implementation documents; reference them instead.

## References

| Resource | Purpose |
|---|---|
| `<relative/path/to/document.md>` | Authoritative requirements or implementation context. |

## Deliverables

- List the files, changes, outputs, decisions, or other artifacts that must exist when the task is finished.

## Done When

- [ ] Completion criterion is observable and testable.
- [ ] Required deliverables exist at the stated locations.
- [ ] Required validation or review has passed.
```

### Required Task Sections

| Section | Requirement | Purpose |
|---|---|---|
| `Objective` | **REQUIRED** | Defines the exact result the task is intended to produce. |
| `Requirements` | **REQUIRED** | Defines constraints and conditions the implementation must satisfy. |
| `References` | **REQUIRED when external context exists** | Points to the source documents, plans, specifications, issues, designs, or code that govern the task. |
| `Deliverables` | **REQUIRED** | Defines the artifacts or observable changes expected from execution. |
| `Done When` | **REQUIRED** | Objective completion checklist. Every item must be verifiable. |

Optional sections such as `Dependencies`, `Risks`, `Notes`, or `Validation Commands` MAY be added when they materially affect execution. Do not add empty headings.

## Task List Template

A Task List is a manifest. Detailed work belongs in the linked Task files.

```markdown
---
name: <task-list name>
date: <YYYY-MM-DD>
description: "<what this group of tasks delivers>"
status: in-progress
---

# <Task List Name>

## Objective

State the collective outcome produced when the task list is complete.

## Tasks

| Status | Task | File | Dependency |
|---|---|---|---|
| ⬜ Pending | <task name> | `tasks/task_<name>_<date>.md` | — |
| 🔄 In Progress | <task name> | `tasks/task_<name>_<date>.md` | <dependency> |
| ✅ Complete | <task name> | `tasks/task_<name>_<date>.md` | <dependency> |

## Completion

- [ ] Every required Task resolves to a valid file.
- [ ] Every required Task is `complete` or explicitly dispositioned as `cancelled`.
- [ ] The collective objective has been validated against the governing requirements.
```

## Status and Completion Convention

Use status consistently across frontmatter, headings, and Task List tables.

| Status | Visual indicator | Meaning |
|---|---|---|
| `pending` | ⬜ | Work has not started. |
| `in-progress` | 🔄 | Work is actively being executed. |
| `blocked` | ⛔ | Work cannot proceed until a dependency or decision is resolved. |
| `complete` | ✅ | Objective and all `Done When` criteria are satisfied. |
| `cancelled` | ❌ | Task is intentionally abandoned or superseded. |

When a Task is complete, set `status: complete` and the H1 MAY be rendered as:

```markdown
# ✅ Complete — Build Admin Layout
```

Do not mark a task complete merely because work was attempted. Completion requires evidence that the `Done When` checklist holds.

## Backtrace and Duplicate-Prevention Rule

Before creating a new Task, inspect the existing task location and the relevant repository state.

1. Search for an existing Task or Task List representing the same objective.
2. Inspect referenced documents, code, commits, issues, generated artifacts, or other evidence that can establish whether the objective has already been satisfied.
3. If equivalent active work already exists, update or link the existing Task instead of creating a duplicate.
4. If repository evidence proves the requested objective is already complete, mark the existing task `complete` or create the requested task already marked `complete` with the supporting evidence referenced.
5. If the prior work only partially satisfies the objective, preserve the existing evidence and define only the remaining work.

The agent MUST NOT infer completion from a filename, stale checklist, or task-list row when repository evidence contradicts it.

## References and Detailed Work

Tasks SHOULD stay concise. If a design document, implementation specification, issue, plan, architecture document, or other artifact already explains the work, link to it instead of copying it.

Use repository-relative references whenever the task is committed with the project.

```markdown
## References

| Resource | Purpose |
|---|---|
| `docs/admin-page-spec.md` | Authoritative UI and interaction requirements. |
| `agent-specifications/specs/skill.specification.md` | Required structure for the skill created by this task. |
```

## Relationship to Other Artifacts

| Artifact | Relationship |
|---|---|
| **Plan** | A plan may create or coordinate Task Lists and Tasks as execution units. |
| **Workflow** | A Task may invoke a reusable workflow but does not redefine it. |
| **Skill** | A Task may require a skill to execute a procedure. |
| **Reference** | Tasks link to detailed context rather than duplicating it. |
| **Task List** | A Task List indexes Tasks and derives its progress from them. |

## Verification Checklist

- [ ] Filename ends with the creation date in `YYYY-MM-DD` form.
- [ ] `name`, `date`, and `description` are present in YAML frontmatter.
- [ ] `status` accurately reflects the current repository evidence.
- [ ] A Task has Objective, Requirements, Deliverables, and Done When sections.
- [ ] A Task List points to individual Task files rather than duplicating their full content.
- [ ] Existing tasks and implementation evidence were backtraced before creating duplicates.
- [ ] Every reference resolves from the file's actual location.
- [ ] A completed task has objective evidence that every applicable Done When criterion is satisfied.
