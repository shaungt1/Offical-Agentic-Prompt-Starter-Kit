---
description: 'Instructions for creating, locating, updating, backtracing, and completing project Task and Task List files.'
applyTo: '**/_tasks/**/*.md, **/docs/tasks/**/*.md, **/.admin-local/Tasks/**/*.md'
---

# Task Management Instructions

Use these instructions whenever creating, locating, updating, reconciling, or completing Task and Task List artifacts. Construct the files themselves according to `task.specification.md`.

## When to Use Tasks

Create a **Task** when work has one independently verifiable objective and should remain visible across agent sessions, commits, or handoffs.

Create a **Task List** when several related Tasks contribute to one larger outcome and need a single progress manifest.

Do not create a Task merely to restate a trivial action that can be completed immediately. Do not use a Task as a replacement for a reusable skill, workflow, architectural specification, or detailed design document.

## Location Resolution

Task storage is project policy, not vendor policy. Resolve the location in this order:

1. **Explicit user location wins.** If the user names a directory, use it.
2. **Reuse an established project task location.** If `_tasks/`, `docs/tasks/`, `.admin-local/Tasks/`, or another clearly established task directory already exists, continue using it unless the user says otherwise.
3. **Use a project-configured location.** Honor any location declared in `AGENTS.md`, `CLAUDE.md`, repository instructions, project configuration, or the controlling task policy.
4. **Default committed project work to `/_tasks/`.** This is the house default for vendor-neutral, source-controlled task tracking.
5. **Use `.admin-local/Tasks/` for private/local work.** Choose this when the work should intentionally remain outside Git or is personal to one developer.
6. **Use `/docs/tasks/` when tasks are formal project documentation.** This is appropriate when task history is part of the documentation set rather than an active execution workspace.
7. **Ask the user only when location materially changes privacy, source-control behavior, or project organization and no safe choice can be inferred.** Do not interrupt routine task creation merely to ask for a path.

## Recommended Locations

| Location | Use | Source control | Recommendation |
|---|---|---|---|
| `/_tasks/` | Active project Tasks and Task Lists | Usually committed | **Default house location** |
| `/docs/tasks/` | Tasks maintained as project documentation/history | Usually committed | Use when documentation ownership is intentional |
| `.admin-local/Tasks/` | Personal, private, or machine-local task tracking | Normally excluded | Preferred private location when Admin Local is installed |
| Vendor configuration directories | Vendor-owned task features only | Vendor-dependent | Do not use merely because an agent happens to run there |
| User-defined custom path | Any explicitly requested organization | User-defined | Always honor explicit user choice |

Task files SHOULD NOT normally be placed under `.claude/`, `.github/`, `.cursor/`, or another vendor configuration directory unless that vendor specifically owns the task artifact or the user explicitly chooses that location. Project tasks describe project work; vendor directories primarily describe agent configuration.

## Default Directory Structure

For committed project work, prefer:

```text
_tasks/
├── task-list_<descriptor>_<YYYY-MM-DD>.md
├── tasks/
│   ├── task_<descriptor>_<YYYY-MM-DD>.md
│   └── ...
└── archive/
    └── ...
```

For private/local work, the equivalent structure MAY live under:

```text
.admin-local/Tasks/
```

Do not create `archive/` until it is actually needed.

## Creation Workflow

Before writing a Task or Task List:

1. Identify the requested objective and whether it is one Task or a coordinated set of Tasks.
2. Resolve the task directory using the location rules above.
3. Backtrace existing task files and repository evidence before creating new records.
4. Reuse or update an existing task when the objective already exists.
5. Create a new Task only for distinct remaining work.
6. For multiple Tasks, create the Task files first or at the same time as the Task List and link them with repository-relative paths.
7. Populate objective completion criteria that can actually be checked.

## Backtrace Logic

Backtrace is mandatory whenever a task could represent work that was already attempted or completed.

Inspect, as applicable:

- existing Task and Task List files;
- referenced specifications, requirements, plans, issues, and documentation;
- current source code and generated artifacts;
- tests and validation output;
- version-control history or commits when available;
- issue trackers or external systems when they are authoritative and access is permitted.

Use this evidence to determine the current state rather than blindly trusting an old checklist.

### Backtrace Outcomes

| Evidence state | Required action |
|---|---|
| Same active task already exists | Update/link the existing Task; do not duplicate it. |
| Objective is demonstrably complete | Set the Task to `complete` and record/reference the supporting evidence. |
| Objective is partially complete | Preserve completed work and define only the remaining requirements. |
| Existing task is obsolete or superseded | Mark it `cancelled` or document the superseding Task. |
| Evidence is contradictory or incomplete | Keep the task open and state what still requires verification. |

## Status Management

Use these lifecycle values:

```text
pending
in-progress
blocked
complete
cancelled
```

Update frontmatter status when the execution state changes. A Task List SHOULD derive its overall state from its member Tasks:

- `pending` when work has not started;
- `in-progress` when at least one required Task is active and unfinished;
- `blocked` when the collective objective cannot proceed because required work is blocked;
- `complete` only when every required Task is complete or explicitly dispositioned and the Task List objective is satisfied;
- `cancelled` when the grouped objective itself is abandoned.

Do not rename files to reflect lifecycle state. Use `status` and visible status markers so links remain stable.

## Completion Behavior

Before marking a Task `complete`:

1. Re-read the Task's `Objective`, `Requirements`, `Deliverables`, and `Done When` sections.
2. Inspect the actual outputs rather than assuming prior execution succeeded.
3. Run or review any required validation.
4. Check every applicable `Done When` item.
5. Set `status: complete` only when the evidence supports completion.
6. Optionally render the title as `# ✅ Complete — <Task Name>` for immediate human visibility.
7. Update every Task List that references the Task.

For a completed Task List, confirm the collective objective in addition to checking child statuses. Ten completed child tasks do not prove the parent objective if the integration result is still wrong.

## Task List Management

A Task List is a manifest, not a replacement for the Tasks it tracks.

- Keep one row per Task.
- Link to the Task file with a relative path.
- Include status and dependencies when useful.
- Do not duplicate each Task's full Requirements or Done When sections into the Task List.
- Update the manifest when tasks are added, cancelled, completed, renamed for a non-status reason, or superseded.
- Preserve dependency ordering when one Task cannot begin until another reaches a defined state.

If a large objective is still understandable as one Task with a reasonable checklist, do not fragment it solely to produce more files. Split only when units of work have meaningful independent ownership, dependencies, execution, or completion evidence.

## Archiving

Archiving is optional. Prefer stable active/history files over constant file movement.

Use `archive/` when completed or cancelled tasks materially clutter active navigation. When moving a task to an archive:

1. update every relative link that points to it;
2. preserve its original filename and date;
3. keep its final status and completion evidence intact;
4. do not archive a Task that is still referenced by an active workflow unless the references remain valid.

## Privacy and Source-Control Rule

Choose storage based on whether the Task should be shared:

- **Committed project responsibility:** use `/_tasks/` or `/docs/tasks/`.
- **Personal/private responsibility:** use `.admin-local/Tasks/` or another explicitly local path.
- **Unclear and materially sensitive:** ask the user before writing.

Never silently move private task content into a committed directory or committed project task content into a local-only directory.

## Validation Checklist

Before finishing task-management work, verify:

- [ ] The chosen location follows explicit user direction, existing project convention, or the default precedence rules.
- [ ] Existing work was backtraced before new Tasks were created.
- [ ] Duplicate Tasks were not created for the same objective.
- [ ] Task and Task List files follow `task.specification.md`.
- [ ] Relative references resolve from their actual file locations.
- [ ] Status reflects repository evidence rather than assumption.
- [ ] Completed Tasks satisfy their `Done When` criteria.
- [ ] Task Lists accurately reflect child Task status and dependencies.
- [ ] Privacy and source-control behavior match the intended scope of the work.
