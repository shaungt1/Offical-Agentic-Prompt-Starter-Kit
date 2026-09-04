---
name: heartbeat-specification
description: "Defines periodic background checks and attention policies."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "HEARTBEAT.md (house format; vendor support varies)"
    category: workflow
    status: draft
    normative: true
    tags: [heartbeat, periodic, background]
    related_specifications: [boot-specification, hook-specification, workflow-specification]
---

# HEARTBEAT.md (house format; vendor support varies) Specification

## Purpose

`HEARTBEAT.md` defines what a background-capable agent should check periodically, what constitutes a meaningful change, and when to notify versus remain silent. It is a house artifact; vendor runtimes may use schedules/automations instead of a Markdown heartbeat file.

## When to Create

Create heartbeat instructions only for genuinely recurring attention. Do not use a heartbeat for one-time reminders or high-frequency polling without a real need.

## Naming and Placement

House filename: `HEARTBEAT.md`. Some vendors may not read this file natively; translate it into that runtime's scheduler, cron, automation, or hook system and document the mapping.

## Frontmatter Template

```yaml
---
name: heartbeat
description: "Periodic attention/check policy for background agent activity."
version: 0.1.0
author: <author>
schedule: <runtime-defined>
notify: on-change
metadata:
  tags: [heartbeat, periodic, background]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Heartbeat profile. |
| `description` | REQUIRED | What is monitored. |
| `version` | REQUIRED | Policy revision. |
| `author` | REQUIRED | Maintainer. |
| `schedule` | REQUIRED | Cadence or runtime scheduling reference. |
| `notify` | RECOMMENDED | Notification condition such as `on-change` or `on-threshold`. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Purpose` | Why periodic attention is useful. |
| `Checks` | Exactly what is inspected each run. |
| `Change Criteria` | What counts as meaningful. |
| `Notification Policy` | When to notify and when to stay silent. |
| `State` | What must persist between runs to compare changes. |
| `Failure Policy` | Retries/backoff and what happens when a source is unavailable. |

## Optional Sections

| Section | Use when |
|---|---|
| `Quiet Hours` | Use when notifications should be suppressed during defined windows. |
| `Escalation` | Use for thresholds requiring different handling. |

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
| boot | Boot starts the runtime; heartbeat operates after startup. |
| hook/automation | Vendor systems may implement heartbeat through hooks or scheduled jobs. |

## Vendor Caveat

A vendor may retire or ignore a `HEARTBEAT.md` workspace file while still supporting periodic scheduling. Treat the semantic contract as portable and the filename as a house convention unless current vendor documentation says it is native.



## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
