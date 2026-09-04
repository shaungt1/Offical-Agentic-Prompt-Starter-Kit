---
name: specification-authoring
description: "Rules for adding, revising, and indexing artifact specifications."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "*.specification.md"
    category: governance
    status: draft
    normative: true
    tags: [specifications, authoring, governance]
    related_specifications: [vendor-formats-specification]
---

# Specification Authoring Standard

## Purpose

Use this document when adding a new artifact type to the Specs library or materially changing the contract of an existing specification. A specification is an **authoring contract**, not a product tutorial: it tells an agent what to create, what every part means, what is required, what is conditional, and how to verify the artifact.

## Required Specification File Shape

Every new specification MUST contain:

1. YAML frontmatter identifying the specification itself.
2. `# <Artifact> Specification` title.
3. Purpose and creation criteria.
4. Naming and placement rules.
5. A canonical frontmatter/template example for the artifact being built.
6. A property table marking fields `REQUIRED`, `RECOMMENDED`, `OPTIONAL`, or `VENDOR`.
7. Required body structure.
8. Optional sections with explicit inclusion criteria.
9. Construction rules, caveats, relationships, and vendor transformations where relevant.
10. A verification checklist.

## Specification Frontmatter

```yaml
---
name: <artifact>-specification
description: "Defines how to construct <artifact>."
version: 0.1.0
author: <human-or-organization>
license: <project-license>
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "<TARGET-FILENAME>"
    category: <category>
    status: draft
    normative: true
    tags: [<tags>]
    related_specifications: [<spec-name>]
---
```

## Adding a New Specification

1. **Prove the artifact is distinct.** Do not create a specification when the new concept is merely a section, variant, or vendor translation of an existing artifact.
2. **Choose the universal semantic name.** Prefer a stable concept (`tool`, `manifest`, `workflow`) over a vendor marketing term.
3. **Define the canonical artifact.** State filename, folder form, frontmatter, body contract, resources, permissions, inputs/outputs, and lifecycle.
4. **Document variants inside the parent specification** when the variant shares the same semantic contract. Example: `AGENTS.override.md` belongs in the agent specification rather than becoming a separate spec.
5. **Add vendor transformations** to `vendor-formats.specification.md` instead of copying the full specification into vendor-specific files.
6. **Add the file to `README.md`** in the correct conceptual order and link related specifications in both directions.
7. **Validate references.** No dangling relative links or references to files that do not exist.

## Change Policy

| Change | Version guidance | Required action |
|---|---|---|
| Clarification / typo | patch | Update text; preserve semantics. |
| New optional field or section | minor | Document default behavior and compatibility. |
| New required field / changed meaning | major | State migration path and update dependent specs. |
| Vendor-only format change | vendor map update | Do not change the universal contract unless semantics changed. |

## Writing Rules

- Explain rationale in plain professional language, but keep the file focused on construction.
- Use tables for field definitions, location maps, dependency maps, and transformations.
- Use code fences for canonical templates, not for large tutorials.
- State defaults. Ambiguous omission behavior causes agents to invent policy.
- State negative boundaries: what the artifact is **not** responsible for.
- Do not copy a vendor validator or repository-specific Python implementation into the universal standard.
- Cite or link external standards when interoperability depends on them.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
