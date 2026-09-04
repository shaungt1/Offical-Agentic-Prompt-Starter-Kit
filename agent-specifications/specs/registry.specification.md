---
name: registry-specification
description: "Defines catalogs used to discover live capabilities, skill sets, skills, agents, tools, and packages."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "REGISTRY.md"
    category: composition
    status: draft
    normative: true
    tags: [registry, discovery, catalog]
    related_specifications: [file-index-specification, manifest-specification, capability-specification]
---

# REGISTRY.md Specification

## Purpose

A registry is a discoverable catalog spanning many artifacts or packages. It records stable identifiers, types, paths, versions, status, tags, and relationships so an agent can find what exists without opening every file.

## When to Create

Create a registry when the repository contains enough capabilities, skills, tools, agents, or plugins that discovery needs a single catalog. Use an index for simple human navigation and a manifest for one package's dependency graph.

## Naming and Placement

House filename: `REGISTRY.md` at the library root. A machine-readable registry may accompany it (JSON/YAML), but `REGISTRY.md` remains the human/agent-readable contract.

## Frontmatter Template

```yaml
---
name: <registry-name>
description: "Catalog of available agent artifacts and relationships."
version: 0.1.0
author: <author>
registry-version: 1
metadata:
  tags: [registry, discovery]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Registry identity. |
| `description` | REQUIRED | What ecosystem it catalogs. |
| `version` | REQUIRED | Registry content version. |
| `author` | REQUIRED | Maintainer. |
| `registry-version` | RECOMMENDED | Schema revision. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Scope` | What artifact roots are included. |
| `Registry Table` | ID, type, path, version, status, tags, parent/related IDs. |
| `Resolution Rules` | How duplicate IDs, missing files, and precedence are handled. |
| `Maintenance` | How additions/removals/version changes update the registry. |
| `Verification` | All registered paths resolve and IDs are unique within scope. |

## Optional Sections

| Section | Use when |
|---|---|
| `Aliases` | Use for migrations/renames. |
| `Vendor Exposure` | Use when only some registered artifacts are exported to a vendor runtime. |

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
| file index | Registry is discovery metadata; index is navigation prose. |
| manifest | Manifest describes one package; registry catalogs many. |
| capability hierarchy | Registry should preserve capability → skillset → skill parentage. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
