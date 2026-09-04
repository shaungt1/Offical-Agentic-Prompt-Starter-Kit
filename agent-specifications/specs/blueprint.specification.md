---
name: blueprint-specification
description: "Defines reusable parameterized compositions that generate or configure agent artifacts/workflows."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "BLUEPRINT.md"
    category: composition
    status: draft
    normative: true
    tags: [blueprint, templates, composition]
    related_specifications: [manifest-specification, workflow-specification, capability-specification]
---

# BLUEPRINT.md Specification

## Purpose

A blueprint is a reusable composition pattern that describes which artifacts should exist, how they connect, and which values vary when instantiating the pattern. It is a template for a system or workflow, not the execution instance itself.

## When to Create

Create a blueprint when the same multi-artifact architecture will be instantiated repeatedly with different names, tools, domains, agents, schedules, or providers.

## Naming and Placement

House form: `blueprints/<name>/BLUEPRINT.md` with optional templates/resources. Generated artifacts should record the blueprint/version they came from.

## Frontmatter Template

```yaml
---
name: <blueprint-name>
description: "Reusable composition template for <system/workflow>."
version: 0.1.0
author: <author>
license: <project-license>
parameters: [<parameter-name>]
metadata:
  tags: [blueprint, <domain>]
  produces: [<artifact-type>]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Blueprint identifier. |
| `description` | REQUIRED | What architecture/composition it creates. |
| `version` | REQUIRED | Blueprint version. |
| `author` | REQUIRED | Maintainer. |
| `license` | REQUIRED | Distribution license. |
| `parameters` | RECOMMENDED | Values required to instantiate the blueprint. |
| `metadata.produces` | RECOMMENDED | Artifact types created. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Purpose` | What recurring architecture the blueprint captures. |
| `Parameters` | Name, type, required/default, validation. |
| `Artifact Map` | Files/components created and specification each follows. |
| `Relationships` | How generated artifacts reference each other. |
| `Instantiation Procedure` | Steps to render/configure safely. |
| `Post-Generation Validation` | Checks after generation. |

## Optional Sections

| Section | Use when |
|---|---|
| `Variants` | Use for supported configurations. |
| `Migration` | Use when generated instances need upgrades. |
| `Examples` | Use for one representative instantiation. |

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
| manifest | Generated packages may receive a manifest. |
| workflow | Blueprint may generate workflows. |
| capability/skillset/skill | Blueprint can scaffold hierarchy but must not duplicate their specifications. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
