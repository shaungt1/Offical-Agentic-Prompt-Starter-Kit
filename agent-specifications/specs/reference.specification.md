---
name: reference-specification
description: "Defines focused supporting reference documents loaded on demand."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "REFERENCE.md / references/*.md"
    category: knowledge
    status: draft
    normative: true
    tags: [references, documentation, progressive-disclosure]
    related_specifications: [skill-specification, agent-specification, manifest-specification]
---

# REFERENCE.md / references/*.md Specification

## Purpose

References hold detailed knowledge that would make a primary skill, agent, prompt, or specification unnecessarily large: APIs, schemas, examples, domain rules, troubleshooting matrices, lookup tables, or authoritative links.

## When to Create

Create a reference when material is useful to one or more artifacts but does not itself define an executable behavior. References should be read on demand rather than loaded indiscriminately.

## Naming and Placement

Use `references/<topic>.md` for focused files or `REFERENCE.md` for a primary reference inside an artifact package. Keep links relative when the reference is bundled with the artifact.

## Frontmatter Template

```yaml
---
name: <reference-name>
description: "Focused supporting reference for <artifact/domain>."
version: 0.1.0
author: <author>
license: <project-license>
source-of-truth: <internal|external|derived>
last-verified: <YYYY-MM-DD>
metadata:
  tags: [reference, <domain>]
  used-by: [<artifact-name>]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | RECOMMENDED | Reference identifier. |
| `description` | REQUIRED | What knowledge it contains. |
| `version` | RECOMMENDED | Version when the content is maintained as a contract. |
| `author` | RECOMMENDED | Maintainer. |
| `license` | RECOMMENDED | Required when content is redistributed. |
| `source-of-truth` | RECOMMENDED | Whether the file is authoritative, derived, or a local summary. |
| `last-verified` | OPTIONAL | Date external or version-sensitive information was checked. |
| `metadata.used-by` | OPTIONAL | Artifacts that depend on the reference. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Scope` | What questions this reference answers. |
| `Reference Content` | Tables, schemas, patterns, or domain information. |
| `Usage Notes` | How consuming artifacts should interpret the content. |
| `Sources` | Authoritative links or provenance when applicable. |

## Optional Sections

| Section | Use when |
|---|---|
| `Examples` | Use when examples are the primary reference value. |
| `Troubleshooting` | Use for symptom/cause/fix matrices. |
| `Change Log` | Use when downstream compatibility matters. |

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
| skill | Skills may load references only when needed. |
| agent | Agents may use references as domain knowledge, not as hidden permissions. |
| manifest | Manifests may index references without duplicating their contents. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
