---
name: manifest-specification
description: "Defines master linker manifests for multi-file agent packages."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "*.manifest.md / manifest.md"
    category: composition
    status: draft
    normative: true
    tags: [manifest, index, dependencies]
    related_specifications: [file-index-specification, registry-specification, emulation-manifest-specification]
---

# *.manifest.md / manifest.md Specification

## Purpose

A manifest is the authoritative linker for a package of related artifacts. It records identity, versions, locations, dependencies, load/execution order, and optional/required components without copying those components' contents.

## When to Create

Create a manifest when several files must be treated as one package or ordered pipeline. For simple navigation only, use a file index instead.

## Naming and Placement

Use `<package>.manifest.md` when multiple manifests may coexist, or `manifest.md` at a package root. Specialized manifests such as `emulation.manifest.md` extend this generic contract.

## Frontmatter Template

```yaml
---
name: <manifest-name>
description: "Master linker for <package/system>."
version: 0.1.0
author: <author>
license: <project-license>
manifest-version: 1
metadata:
  tags: [manifest, <domain>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Package/manifest identity. |
| `description` | REQUIRED | What the manifest links. |
| `version` | REQUIRED | Package version. |
| `author` | REQUIRED | Maintainer. |
| `license` | REQUIRED | Package license. |
| `manifest-version` | RECOMMENDED | Schema revision for the manifest format. |
| `metadata.status` | RECOMMENDED | Lifecycle status. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Package Overview` | Purpose and boundary. |
| `Component Table` | Artifact, path, required/optional, version, role. |
| `Dependency Graph / Order` | Load or execution dependencies. |
| `Resolution Rules` | How relative paths and missing optional components are handled. |
| `Compatibility` | Runtime/vendor assumptions. |
| `Verification` | All required links resolve and ordering is valid. |

## Optional Sections

| Section | Use when |
|---|---|
| `Configuration` | Use for package-level non-secret settings. |
| `Migration` | Use for breaking manifest versions. |
| `Checksums` | Use when package integrity needs explicit verification. |

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
| file index | Index is navigational; manifest is dependency/linkage authoritative. |
| registry | Registry catalogs many packages/artifacts; manifest describes one package. |
| emulation manifest | Specialized manifest with required observation → guardian → optimization pipeline. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
