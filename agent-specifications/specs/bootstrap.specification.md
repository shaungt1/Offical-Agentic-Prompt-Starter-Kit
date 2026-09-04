---
name: bootstrap-specification
description: "Defines one-time first-run initialization for an agent or workspace."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "BOOTSTRAP.md"
    category: workflow
    status: draft
    normative: true
    tags: [bootstrap, initialization, first-run]
    related_specifications: [boot-specification, identity-specification, soul-specification, user-specification]
---

# BOOTSTRAP.md Specification

## Purpose

`BOOTSTRAP.md` establishes initial workspace state: identity selection, user relationship, required directories, initial configuration, imports, and first-run questions. It is executed once unless the project explicitly resets initialization.

## When to Create

Create a bootstrap file when first use requires deliberate setup that should not run on every startup.

## Naming and Placement

House filename: `BOOTSTRAP.md` at the agent/workspace root. The runtime must have a completion marker or equivalent state so the procedure is not repeated accidentally.

## Frontmatter Template

```yaml
---
name: bootstrap
description: "One-time initialization procedure for a new agent/workspace."
version: 0.1.0
author: <author>
run-once: true
metadata:
  tags: [bootstrap, initialization]
  completion-marker: <marker-or-state>
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Bootstrap identity. |
| `description` | REQUIRED | Initialization outcome. |
| `version` | REQUIRED | Procedure version. |
| `author` | REQUIRED | Maintainer. |
| `run-once` | REQUIRED | Must be true for bootstrap semantics. |
| `metadata.completion-marker` | RECOMMENDED | How completion is recorded. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Purpose` | What initial state is established. |
| `Preconditions` | Fresh-install assumptions. |
| `Initialization Steps` | Ordered setup with checkpoints. |
| `User Decisions` | Questions that cannot be safely inferred. |
| `Artifacts Created` | Files/directories/configs produced. |
| `Completion Marker` | How future boots know bootstrap is complete. |
| `Verification` | Checks that initialization succeeded. |

## Optional Sections

| Section | Use when |
|---|---|
| `Migration` | Use when bootstrap version changes existing workspaces. |
| `Recovery` | Use for interrupted first run. |

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
| boot | Boot runs repeatedly after bootstrap. |
| identity/soul/user | Bootstrap may create initial versions but must follow their specs. |
| manifest | Bootstrap may validate/install a package manifest. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
