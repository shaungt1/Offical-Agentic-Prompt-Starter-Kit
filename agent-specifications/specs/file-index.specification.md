---
name: file-index-specification
description: "Defines human-readable indexes for files, artifacts, and navigation."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "INDEX.md / README.md index section"
    category: knowledge
    status: draft
    normative: true
    tags: [index, navigation, files]
    related_specifications: [manifest-specification, registry-specification]
---

# INDEX.md / README.md index section Specification

## Purpose

A file index is a navigation artifact. It tells humans and agents what files exist, what each is for, where it lives, and which specification governs it. It is not the source of dependency semantics; use a manifest or registry for that.

## When to Create

Create an index when a directory or library contains enough artifacts that discovery by filename alone is unreliable.

## Naming and Placement

Use `INDEX.md` for a dedicated index or an `Index` section inside a package `README.md`. Keep entries relative to the index location.

## Frontmatter Template

```yaml
---
name: <index-name>
description: "Navigation index for <directory/package>."
version: 0.1.0
author: <author>
metadata:
  tags: [index, navigation]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Index identity. |
| `description` | REQUIRED | What collection is indexed. |
| `version` | OPTIONAL | Use if index format/contents are independently versioned. |
| `author` | RECOMMENDED | Maintainer. |
| `metadata.tags` | OPTIONAL | Navigation tags. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Scope` | What directory/package is covered. |
| `Index` | Table: file, type, description, governing specification, status. |
| `Navigation Rules` | How agents choose the next file to read. |
| `Maintenance` | When entries are added/removed and how stale links are detected. |

## Optional Sections

| Section | Use when |
|---|---|
| `Categories` | Use to group large indexes. |
| `Quick Start` | Use when a few entry points dominate usage. |

## Construction Rules

- Use clear Markdown headings, tables for schemas or registries, and numbered steps only when order matters.
- Write direct instructions that change agent behavior. Replace vague advice such as “use best practices” with an observable rule or completion criterion.
- Keep portable semantics in the main document. Put vendor-only fields or paths behind an explicit vendor note or adapter.
- Use repository-relative links. Do not hard-code a developer's machine path into a committed artifact.
- Declare dependencies, tools, network access, secrets, external writes, and destructive side effects instead of assuming them.
- Prefer least privilege. Read-only is the default when a task can succeed without write, shell, browser-transaction, administrator, or destructive access.
- Separate required sections from optional sections. Do not create empty headings merely to satisfy a template.
- If a vendor runtime does not recognize a house field, retain the semantic value in `metadata` or translate it in the vendor-specific form.



## Relationships and Transformations

| Related artifact | Rule |
|---|---|
| manifest | Manifest owns dependency/order; index owns discoverability. |
| registry | Registry may be machine-oriented and span several packages. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
