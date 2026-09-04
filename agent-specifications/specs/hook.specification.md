---
name: hook-specification
description: "Defines event-driven hooks, commands/actions, inputs, timeouts, permissions, and failure policy."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "HOOK.md + hooks.json/vendor config"
    category: execution
    status: draft
    normative: true
    tags: [hooks, events, automation]
    related_specifications: [workflow-specification, tool-specification, vendor-formats-specification]
---

# Hook Specification

## Purpose

A hook binds an event to a deterministic action or instruction. Hooks are appropriate for session lifecycle events, tool-use gates, formatting, validation, context injection, logging, or other work that should occur because an event happened rather than because a user manually invoked a prompt.

## Canonical Frontmatter

```yaml
---
name: <hook-name>
description: "Runs <action> when <event> occurs."
version: 0.1.0
author: <author>
license: <project-license>
event: <event-name>
blocking: false
timeout-seconds: 30
permissions:
  filesystem: read-only
  shell: restricted
  network: none
metadata:
  tags: [hook, <event-domain>]
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Event` | Exact event, timing, source, and whether the hook runs before/after the event. |
| `Conditions` | Filters/guards that determine whether it should run. |
| `Action` | Command, tool, prompt injection, validation, or workflow invoked. |
| `Inputs` | Event payload fields and trusted/untrusted data boundaries. |
| `Outputs` | Exit code, message, injected context, mutation, or block/allow result. |
| `Timeout and Failure Policy` | Fail-open/fail-closed, timeout, retry, and logging behavior. |
| `Permissions` | Filesystem/shell/network/account authority. |
| `Verification` | Manual test or deterministic event simulation. |

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Rules

- Test hook scripts independently before registering them.
- Keep hooks fast; long work should dispatch a workflow rather than block an interactive event unless blocking is required.
- Treat user/tool/event payloads as untrusted input when they can contain external content.
- State whether a failure blocks the parent operation. Silent policy ambiguity is unacceptable.
- Vendor event names and `hooks.json` schemas belong in the vendor transformation, not in the universal semantic contract.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
