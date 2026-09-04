---
name: command-specification
description: "Defines reusable slash commands and task macros."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "commands/<name>.md / vendor command file"
    category: execution
    status: draft
    normative: true
    tags: [commands, slash-commands, tasks]
    related_specifications: [prompt-specification, skill-specification, agent-specification]
---

# commands/<name>.md / vendor command file Specification

## Purpose

A command is an explicitly invoked task macro, often surfaced as `/name`. It packages a concise prompt plus arguments and optional agent/model/tool selection. Commands should be quick entry points, not large knowledge bases.

## When to Create

Create a command when users repeatedly invoke the same task manually and automatic skill discovery is unnecessary or undesirable.

## Naming and Placement

House form: `commands/<name>.md`. Vendor command folders or frontmatter may differ. The filename should describe the action and generally becomes the invocation name.

## Frontmatter Template

```yaml
---
name: <command-name>
description: "User-invoked command that performs <task>."
version: 0.1.0
author: <author>
agent: <optional-agent>
model: <optional-model>
arguments: [<argument-name>]
tools: [<tool-name>]
metadata:
  tags: [command, <domain>]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Command/invocation identifier. |
| `description` | REQUIRED | What running it does. |
| `version` | RECOMMENDED | Change tracking. |
| `author` | RECOMMENDED | Maintainer. |
| `agent` | OPTIONAL | Preferred agent/mode. |
| `model` | OPTIONAL | Model override only when necessary. |
| `arguments` | RECOMMENDED when parameterized | Expected arguments. |
| `tools` | OPTIONAL | Least-privilege tool list. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Usage` | Invocation syntax and arguments. |
| `Inputs` | Required/defaulted context. |
| `Command Body` | Concise instructions executed on invocation. |
| `Output` | What the user receives or what changes. |
| `Failure Behavior` | Missing args, unavailable tools, or unsafe conditions. |

## Optional Sections

| Section | Use when |
|---|---|
| `Examples` | Use for non-obvious argument forms. |
| `Aliases` | Use when runtime supports stable alternate names. |

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
| prompt | A command often wraps prompt semantics but has an explicit invocation name. |
| skill | Use a skill instead when automatic discovery and bundled resources are important. |
| agent | Command may route to a specific agent. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
