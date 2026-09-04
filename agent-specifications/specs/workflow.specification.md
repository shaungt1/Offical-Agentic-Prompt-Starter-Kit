---
name: workflow-specification
description: "Defines repeatable multi-step workflows and orchestration sequences."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "WORKFLOW.md / workflows/<name>.md"
    category: workflow
    status: draft
    normative: true
    tags: [workflow, orchestration, steps]
    related_specifications: [plan-specification, skill-specification, hook-specification, blueprint-specification]
---

# WORKFLOW.md / workflows/<name>.md Specification

## Purpose

A workflow coordinates several actions, skills, tools, or agents toward one repeatable outcome. It describes sequence, branching, dependencies, state, outputs, and recovery. A workflow is reusable; a plan is a particular execution instance.

## When to Create

Create a workflow when multiple steps recur with stable ordering or decision gates. Use a skill for one focused procedure and a plan for one concrete instance of work.

## Naming and Placement

House form: `workflows/<name>.md` or `WORKFLOW.md` inside a workflow package. Vendor slash-workflow locations are mapped separately.

## Frontmatter Template

```yaml
---
name: <workflow-name>
description: "Repeatable multi-step process that produces <outcome>."
version: 0.1.0
author: <author>
license: <project-license>
trigger: <manual|event|schedule|dependency>
agent: <optional-orchestrator>
metadata:
  tags: [workflow, <domain>]
  skills: [<skill-name>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Workflow identifier. |
| `description` | REQUIRED | Outcome and trigger. |
| `version` | REQUIRED | Workflow contract version. |
| `author` | REQUIRED | Owner. |
| `license` | REQUIRED | Project/distribution license. |
| `trigger` | RECOMMENDED | Manual, event, schedule, or dependency trigger. |
| `agent` | OPTIONAL | Orchestrator/default agent. |
| `metadata.skills` | OPTIONAL | Skills used by the workflow. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Objective` | End state. |
| `Inputs` | Required starting context. |
| `Preconditions` | What must be true before execution. |
| `Workflow` | Ordered steps, branches, and gates. |
| `State and Resumption` | What is persisted and how interrupted work resumes. |
| `Outputs` | Artifacts and side effects. |
| `Failure / Recovery` | Retry, rollback, compensation, escalation. |
| `Verification` | End-to-end completion checks. |

## Optional Sections

| Section | Use when |
|---|---|
| `Dispatch Table` | Use when several agents own distinct steps. |
| `Schedule` | Use for recurring workflows. |
| `Approval Gates` | Use when humans must approve transitions or side effects. |

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
| plan | Plans instantiate a workflow for a specific request. |
| skill | Workflow steps may invoke skills. |
| hook | Hooks may trigger workflows. |
| blueprint | Blueprints may generate configured workflow instances. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
