---
name: skills
description: "Master definition, construction guide, routing model, and live manifests for skills, skill sets, and capabilities."
version: 0.1.0
status: active
---

# SKILLS

## PURPOSE

This document is the **root control document for the Skill hierarchy**. It defines what a Skill is, how Skills are organized into Skill Sets, how Skill Sets are organized into Capabilities, how an agent creates each artifact from the governing specifications, and how all three layers are indexed so they can be discovered without loading every child file.

The hierarchy is intentionally simple:

```text
CAPABILITY
   │
   ├── SKILL SET
   │      │
   │      ├── SKILL
   │      ├── SKILL
   │      └── SKILL
   │
   └── SKILL SET
          │
          ├── SKILL
          └── SKILL
```

A **Skill** is the executable knowledge unit. A **Skill Set** groups related Skills. A **Capability** groups related Skill Sets into a broader ability.

This root file is a **manifest and routing document**, not a replacement for the individual Skill, Skill Set, or Capability artifacts.

---

## 1. WHAT A SKILL IS

A **Skill** is one reusable, focused procedure or competency that teaches an agent how to perform a specific kind of work predictably. A Skill can define triggers, requirements, inputs, tools, permissions, decision logic, ordered procedures, outputs, pitfalls, resources, and verification.

A Skill should be atomic enough that an agent can select it for one recognizable kind of work. Examples include:

- reviewing a pull request;
- generating an API migration;
- testing a React component;
- extracting action items from meeting notes;
- auditing accessibility;
- deploying a service;
- validating a database migration.

A Skill is **not** merely a label or a list of related topics. If the artifact only groups several Skills, it is a Skill Set. If it groups several Skill Sets into a broader ability, it is a Capability.

### Governing Specification

When creating or materially redesigning a Skill, follow:

```text
agent-specifications\Specs\SKILL.SPECIFICATION.MD
```

The specification is authoritative for the Skill's required frontmatter, body structure, resource model, permissions, procedure design, output contract, verification, and vendor transformations.

### Canonical Skill Folder

Every Skill MUST have its own folder. The folder name is the Skill's stable lowercase kebab-case identifier, and the primary file inside that folder is always:

```text
SKILL.MD
```

Canonical house structure:

```text
skills/
├── SKILLS.MD
│
├── <skill-name>/
│   ├── SKILL.MD
│   ├── scripts/          # optional
│   ├── references/       # optional
│   ├── templates/        # optional
│   ├── assets/           # optional
│   └── evals/            # optional
│
└── <another-skill>/
    └── SKILL.MD
```

Do not place several unrelated Skills in one `SKILL.MD`. Do not create an empty Skill folder merely to reserve a name.

---

## 2. WHAT A SKILL SET IS

A **Skill Set** is a coherent grouping of multiple related Skills that together represent a role, discipline, domain function, or reusable cluster of competencies.

Examples:

```text
frontend-development
├── react-component-authoring
├── accessibility-review
├── frontend-testing
└── state-management
```

The Skill Set does not duplicate the procedures inside the member Skills. Its job is to explain the boundary of the group, index the member Skills, and help an agent choose which Skill or combination of Skills applies.

### Governing Specification

When creating or materially redesigning a Skill Set, follow:

```text
agent-specifications\Specs\SKILLSET.SPECIFICATION.MD
```

### Canonical Skill Set Folder

```text
skillsets/
└── <skillset-name>/
    └── SKILLSET.MD
```

A Skill Set should normally contain multiple Skills. If the proposed Skill Set would contain only one Skill and adds no meaningful routing, shared constraints, or domain boundary, keep the Skill standalone until the grouping is justified.

---

## 3. WHAT A CAPABILITY IS

A **Capability** is a broad reusable ability made from multiple Skill Sets. It represents what an agent, system, or role is capable of accomplishing at a higher level without copying the details of the Skill Sets and Skills beneath it.

Example:

```text
CAPABILITY: software-engineering
│
├── SKILLSET: frontend-development
│   ├── react-component-authoring
│   ├── accessibility-review
│   └── frontend-testing
│
├── SKILLSET: backend-development
│   ├── api-design
│   ├── authentication
│   └── database-migrations
│
└── SKILLSET: devops
    ├── ci-pipeline
    ├── deployment
    └── observability
```

### Governing Specification

When creating or materially redesigning a Capability, follow:

```text
agent-specifications\Specs\CAPABILITY.SPECIFICATION.MD
```

Composition and traversal guidance is additionally defined in:

```text
agent-specifications\Specs\CAPABILITY-SKILLSET.INSTRUNCTION.MD
```

### Canonical Capability Folder

```text
capabilities/
└── <capability-name>/
    └── CAPABILITY.MD
```

A Capability should normally contain multiple Skill Sets. Do not create a Capability merely as another name for a single Skill Set.

---

## 4. HOW TO CHOOSE THE CORRECT LAYER

Use the smallest layer that accurately represents the reusable behavior.

```text
New reusable behavior
        │
        ▼
Is this one focused procedure or competency?
        │
   ┌────┴────┐
  YES       NO
   │         │
   ▼         ▼
 SKILL   Does it group multiple related Skills?
             │
        ┌────┴────┐
       YES       NO
        │         │
        ▼         ▼
    SKILL SET   Does it group multiple Skill Sets?
                    │
               ┌────┴────┐
              YES       NO
               │         │
               ▼         ▼
          CAPABILITY   Re-evaluate the abstraction.
```

Do not create extra layers for organizational appearance alone. Every layer must improve discovery, routing, composition, shared constraints, or reuse.

---

## 5. HOW TO CREATE A NEW SKILL

When an agent is asked to create a Skill:

1. **Search this document's Skill Manifest first.** Determine whether the Skill already exists under the same or equivalent purpose.
2. **Inspect related Skill Sets and Capabilities.** Determine where the new Skill belongs and whether an existing parent already covers the domain.
3. **Read `agent-specifications\Specs\SKILL.SPECIFICATION.MD`.** Do not invent a local format when the specification already defines the artifact contract.
4. **Choose the Skill name.** Use a stable lowercase kebab-case identifier that describes the competency rather than a temporary task.
5. **Create the Skill folder.** Use `skills/<skill-name>/` unless the project or vendor explicitly defines another canonical location.
6. **Create `SKILL.MD` inside the folder.** Populate the required rich frontmatter and required body sections from the specification.
7. **Add supporting resources only when needed.** Scripts, references, templates, assets, or evaluations belong inside the Skill folder and should be referenced from `SKILL.MD`.
8. **Connect the hierarchy.** If the Skill belongs to a Skill Set, update the Skill's metadata and the parent Skill Set manifest. If that Skill Set belongs to a Capability, preserve that relationship as well.
9. **Add or update the Skill Manifest row below.** The root manifest is how agents discover the Skill without opening every folder.
10. **Verify the Skill.** Every path, relationship, resource, required tool, permission, output, and completion condition must resolve before the Skill is considered active.

### Creation Flow

```text
Request to create a Skill
          │
          ▼
Read SKILLS.MD manifests
          │
          ▼
Duplicate or equivalent Skill exists?
      ┌───┴───┐
     YES      NO
      │        │
      ▼        ▼
Reuse /   Read SKILL.SPECIFICATION.MD
extend          │
                ▼
       Create skills/<name>/
                │
                ▼
             SKILL.MD
                │
                ▼
      Link Skill Set / Capability
                │
                ▼
        Update Skill Manifest
                │
                ▼
             Verify
```

---

## 6. HOW TO CREATE A NEW SKILL SET

When several Skills form one coherent domain or role:

1. Search the **Skill Set Manifest** for an equivalent grouping.
2. Read `agent-specifications\Specs\SKILLSET.SPECIFICATION.MD`.
3. Verify that the proposed member Skills exist or are explicitly marked as planned.
4. Create `skillsets/<skillset-name>/SKILLSET.MD`.
5. Define the Skill Set's boundary, shared requirements, selection logic, and member Skill table.
6. Reference member Skills by stable path; do not duplicate their procedures.
7. Update member Skill metadata when the hierarchy is being used.
8. Add or update the Skill Set Manifest row below.
9. If the Skill Set contributes to a Capability, update that relationship.
10. Validate every child path and parent relationship.

---

## 7. HOW TO CREATE A NEW CAPABILITY

When multiple Skill Sets combine into a broader reusable ability:

1. Search the **Capability Manifest** for an equivalent ability.
2. Read `agent-specifications\Specs\CAPABILITY.SPECIFICATION.MD`.
3. Read `agent-specifications\Specs\CAPABILITY-SKILLSET.INSTRUNCTION.MD` for composition and routing behavior.
4. Verify that the member Skill Sets exist and represent distinct, meaningful functions.
5. Create `capabilities/<capability-name>/CAPABILITY.MD`.
6. Define the capability boundary, member Skill Sets, composition, routing, shared constraints, and expected outcomes.
7. Do not copy member Skill or Skill Set procedures into the Capability.
8. Add or update the Capability Manifest row below.
9. Validate every Skill Set path and hierarchy relationship.

---

## 8. HOW AGENTS SHOULD USE THE HIERARCHY

The hierarchy supports progressive discovery. Load only as much context as necessary.

```text
Broad request
    │
    ▼
CAPABILITY.MD
    │
    ▼
Choose relevant SKILLSET.MD
    │
    ▼
Choose required SKILL.MD
    │
    ▼
Execute the Skill using its allowed tools/resources
```

If the user explicitly identifies a Skill, the agent may go directly to that Skill without loading every parent.

```text
User: "Use the accessibility-review skill."
                     │
                     ▼
          accessibility-review/SKILL.MD
```

If the request spans several competencies, load the parent Skill Set or Capability to determine composition.

---

## 9. RELATIONSHIP AND TRACEABILITY RULES

The manifests below are **running registries**. Keep them current whenever a Skill, Skill Set, or Capability is created, renamed, deprecated, moved, or materially changed.

For every manifest row:

- `Status` identifies lifecycle state such as `planned`, `draft`, `active`, `deprecated`, or `retired`.
- `Name` is the stable discovery identifier.
- `Description / Purpose` explains what the artifact contributes without requiring the child file to be loaded.
- `Canonical Path` is the repository-relative source-of-truth path.
- `Version` is the current artifact version.
- `Parent` records the immediate hierarchy relationship where applicable.
- `Dependencies / Requirements` records significant tools, runtimes, services, or other artifacts needed for use.
- `Related` records lateral relationships that aid discovery without changing parentage.
- `Tags` support search and classification.
- `Updated` records the last meaningful revision date when the project tracks it.
- `Notes` captures deprecation, migration, conflict, or exceptional routing information.

Never use the manifest as a substitute for the artifact itself. The manifest is the index; the child file is authoritative for behavior.

---

# SKILL MANIFEST

This table indexes every managed Skill available to the project or library.

| Status | Skill | Description / Purpose | Canonical Path | Version | Skill Set | Capability | Dependencies / Requirements | Related Skills | Tags | Updated | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |  |  |

---

# SKILL SET MANIFEST

This table indexes every managed Skill Set and its relationship to member Skills and parent Capabilities.

| Status | Skill Set | Description / Domain | Canonical Path | Version | Capability | Member Skills | Shared Requirements | Related Skill Sets | Tags | Updated | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |  |  |

---

# CAPABILITY MANIFEST

This table indexes every managed Capability and the Skill Sets that compose it.

| Status | Capability | Description / Outcome | Canonical Path | Version | Member Skill Sets | Shared Constraints / Requirements | Related Capabilities | Tags | Updated | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |  |

---

## 10. MAINTENANCE RULES

### Adding

Whenever a new Skill, Skill Set, or Capability is created, add its manifest row in the same change. Do not leave discoverability as a later cleanup step.

### Moving or Renaming

When an artifact moves or is renamed:

1. update the canonical path;
2. update all parent/child references;
3. update related manifests;
4. update vendor adapters where applicable;
5. verify that no stale references remain.

### Deprecating

Do not silently delete an artifact that may still be referenced. Mark it `deprecated`, identify the replacement when one exists, migrate dependents, then retire or remove it according to project policy.

### Duplicate Prevention

Before creating a new artifact, search by name **and semantic purpose**. A differently named Skill that performs materially the same procedure should normally be extended or renamed rather than duplicated.

### Progressive Disclosure

The root `SKILLS.MD` SHOULD remain an index and routing layer. Detailed procedures remain inside individual `SKILL.MD` files. Detailed Skill Set composition remains inside `SKILLSET.MD`. Detailed Capability composition remains inside `CAPABILITY.MD`.

---

## 11. VENDOR TRANSFORMATION

The Skill hierarchy is intended to remain vendor-neutral at the semantic level. A vendor may require a different path, metadata field, discovery mechanism, or runtime syntax.

When vendor-specific representation is required, follow:

```text
agent-specifications\Specs\VENDOR-FORMATS.SPECIFICATION.MD
```

Do not weaken or discard the canonical meaning merely because one runtime lacks a native equivalent. Preserve the canonical source and transform only what the vendor requires.

---

## 12. VERIFICATION CHECKLIST

Before considering the Skill hierarchy current:

- [ ] Every active Skill has exactly one valid Skill Manifest row.
- [ ] Every active Skill Set has exactly one valid Skill Set Manifest row.
- [ ] Every active Capability has exactly one valid Capability Manifest row.
- [ ] Every manifest path resolves to the authoritative artifact.
- [ ] Every Skill folder contains a `SKILL.MD` that follows `SKILL.SPECIFICATION.MD`.
- [ ] Every Skill Set follows `SKILLSET.SPECIFICATION.MD`.
- [ ] Every Capability follows `CAPABILITY.SPECIFICATION.MD`.
- [ ] Skill → Skill Set → Capability relationships agree in both directions where parent metadata is used.
- [ ] No manifest entry claims a missing child is active.
- [ ] No procedures are unnecessarily duplicated across hierarchy layers.
- [ ] Tool, permission, platform, resource, and side-effect requirements are discoverable from the Skill or its indexed metadata.
- [ ] Deprecated artifacts identify replacements or migration notes where applicable.
- [ ] Vendor-specific forms remain traceable to the canonical artifact.
