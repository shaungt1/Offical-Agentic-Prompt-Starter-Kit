---
name: boot-specification
description: "Defines recurring startup instructions and readiness checks."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "BOOT.md"
    category: workflow
    status: draft
    normative: true
    tags: [boot, startup, readiness]
    related_specifications: [bootstrap-specification, heartbeat-specification, plan-specification]
---

# BOOT.md Specification

## Purpose

`BOOT.md` defines work that should occur each time an agent runtime/workspace starts: load critical context, verify dependencies, restore state, perform lightweight health checks, and establish the current operating context.

## When to Create

Create a boot file when startup has repeatable actions distinct from one-time bootstrap and periodic heartbeat work.

## Naming and Placement

House filename: `BOOT.md`. Vendor runtimes may require a startup hook to execute it.

## Frontmatter Template

```yaml
---
name: boot
description: "Recurring startup checklist for the agent/runtime."
version: 0.1.0
author: <author>
run: startup
metadata:
  tags: [boot, startup]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Boot profile name. |
| `description` | REQUIRED | Startup objective. |
| `version` | REQUIRED | Procedure revision. |
| `author` | REQUIRED | Maintainer. |
| `run` | REQUIRED | Startup trigger semantics. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Startup Order` | Required load/check order. |
| `Context Load` | Which identity/user/memory/manifest files are read. |
| `Health Checks` | Lightweight dependency checks. |
| `State Restore` | Resume data or active plan state. |
| `Failure Policy` | What blocks startup vs degrades gracefully. |
| `Ready State` | Observable condition meaning startup is complete. |

## Optional Sections

| Section | Use when |
|---|---|
| `Environment Checks` | Use when runtime dependencies vary. |
| `Announcements` | Use only if startup must surface a user-visible state change. |

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
| bootstrap | Bootstrap precedes recurring boot on first run. |
| heartbeat | Heartbeat is periodic after startup. |
| plan | Boot may restore the active plan/resume pointer. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
