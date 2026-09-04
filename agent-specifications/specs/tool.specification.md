---
name: tool-specification
description: "Defines tool contracts, schemas, permissions, execution behavior, and verification."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "TOOL.md / tools/<name>.md"
    category: integration
    status: draft
    normative: true
    tags: [tools, schemas, permissions, execution]
    related_specifications: [mcp-specification, agent-specification, skill-specification, model-specification]
---

# Tool Specification

## Purpose

A tool is a callable capability with a defined input/output contract. The specification describes the interface an agent can rely on; implementation may be local code, an API wrapper, an MCP tool, a plugin command, browser action, or vendor-native function.

## Canonical Frontmatter

```yaml
---
name: <tool-name>
description: "Callable action and appropriate use cases."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
runtime: <local|api|mcp|browser|vendor>
idempotent: false
permissions:
  filesystem: none
  network: restricted
  shell: none
  external-writes: confirm
  account-scope: user
metadata:
  tags: [tool, <domain>]
  related_tools: [<tool-name>]
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Purpose` | The one capability this tool exposes. |
| `Inputs` | Parameter table with type, required/default, constraints, and secret handling. |
| `Outputs` | Return shape, files/records produced, and error representation. |
| `Execution Contract` | Preconditions, idempotency, retries, timeouts, rate limits, and side effects. |
| `Permissions` | Least-privilege filesystem/network/browser/shell/account requirements. |
| `Failure Modes` | Known failures and whether retry is safe. |
| `Verification` | How to prove the action completed as intended. |

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Tool Design Rules

- Use a narrow, descriptive action name rather than one tool that multiplexes unrelated behavior.
- Keep schemas explicit. Agents should not guess parameter names, enum values, or return fields.
- Mark secrets as secret inputs; never embed credential values in examples.
- State idempotency. If a retry can duplicate an external side effect, require a read-back or idempotency key strategy.
- Separate dry-run/read-only operations from write/destructive operations when practical.

## Relationship to MCP and Plugins

MCP can transport/expose tools; a plugin can package multiple tools plus skills/resources; neither changes the underlying tool contract. Reference `mcp.specification.md` or `plugin.specification.md` for packaging and discovery.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
