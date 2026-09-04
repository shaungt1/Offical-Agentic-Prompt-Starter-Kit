---
name: plan-specification
description: "Defines concrete execution plans with milestones, progress, decisions, validation, and resumability."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "PLAN.md / PLANS.md / plans/<name>.md"
    category: workflow
    status: draft
    normative: true
    tags: [plans, execution, progress, resumability]
    related_specifications: [workflow-specification, evaluation-specification]
---

# PLAN.md / PLANS.md / plans/<name>.md Specification

## Purpose

A plan is an execution-instance document for a specific objective. It records what will be done, sequence, ownership, progress, decisions, discoveries, blockers, and validation so work can continue across sessions without reconstructing intent.

## When to Create

Create a plan for non-trivial work that spans several steps, agents, files, or sessions. Do not create a plan to describe a reusable procedure; use a workflow or skill instead.

## Naming and Placement

Use `PLAN.md` for a single active project plan, `PLANS.md` for plan conventions/indexing, or `plans/<name>.md` for multiple concurrent plans. Vendor conventions may differ.

## Frontmatter Template

```yaml
---
name: <plan-name>
description: "Execution plan for <specific objective>."
version: 0.1.0
author: <author-or-agent>
created: <YYYY-MM-DD>
status: planned
workflow: <optional-workflow-name>
metadata:
  tags: [plan, <project>]
  owner: <owner>
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Plan identifier. |
| `description` | REQUIRED | Specific objective. |
| `version` | RECOMMENDED | Plan format revision. |
| `author` | REQUIRED | Planner/owner. |
| `created` | REQUIRED | Creation date. |
| `status` | REQUIRED | planned / active / blocked / complete / cancelled. |
| `workflow` | OPTIONAL | Reusable workflow being instantiated. |
| `metadata.owner` | RECOMMENDED | Responsible human/agent. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Objective` | Specific desired end state. |
| `Context` | Relevant starting state and constraints. |
| `Milestones` | Ordered measurable phases. |
| `Tasks / Progress` | Action items with status and ownership. |
| `Decisions` | Important choices and rationale. |
| `Discoveries / Risks` | New information that changes execution. |
| `Validation` | Tests/evidence required before completion. |
| `Resume Here` | Current state and next action for another session. |

## Optional Sections

| Section | Use when |
|---|---|
| `Dependencies` | Use when external tasks/teams block progress. |
| `Rollback` | Use when changes are risky or reversible. |
| `Artifacts` | Use when several outputs are produced. |

## Construction Rules

- Use clear Markdown headings, tables for schemas or registries, and numbered steps only when order matters.
- Write direct instructions that change agent behavior. Replace vague advice such as “use best practices” with an observable rule or completion criterion.
- Keep portable semantics in the main document. Put vendor-only fields or paths behind an explicit vendor note or adapter.
- Use repository-relative links. Do not hard-code a developer's machine path into a committed artifact.
- Declare dependencies, tools, network access, secrets, external writes, and destructive side effects instead of assuming them.
- Prefer least privilege. Read-only is the default when a task can succeed without write, shell, browser-transaction, administrator, or destructive access.
- Separate required sections from optional sections. Do not create empty headings merely to satisfy a template.
- If a vendor runtime does not recognize a house field, retain the semantic value in `metadata` or translate it in the vendor-specific form.

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Relationships and Transformations

| Related artifact | Rule |
|---|---|
| workflow | A plan may instantiate a reusable workflow. |
| agent | Agents may own plan tasks but the plan remains the shared execution state. |
| evaluation | Plan completion may require evaluation results. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
