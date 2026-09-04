---
name: capability-skillset-instructions
description: "Instructions for designing, building, linking, and maintaining capabilities and skill sets."
applyTo: "**/{CAPABILITY.md,SKILLSET.md}"
---

# Capability and Skill Set Construction Instructions

## Purpose

Use these instructions when creating, restructuring, or maintaining the reusable ability hierarchy used by this repository. The hierarchy separates broad capability from domain-level skill grouping and from atomic executable skills so that agents can discover the correct level of knowledge without duplicating procedures.

The governing specifications are:

- `agent-specifications\Specs\capability.specification.md` — authoritative structure for `CAPABILITY.md`.
- `agent-specifications\Specs\skillset.specification.md` — authoritative structure for `SKILLSET.md`.
- `agent-specifications\Specs\skill.specification.md` — supporting structure for member `SKILL.md` files.

**Before creating or materially changing a capability or skill set, read the matching specification.** These instructions explain how to decide what to build and how the layers work together; the specification defines the required artifact structure, frontmatter, sections, relationships, and validation rules.

## Core Hierarchy

```text
                    CAPABILITY
            Broad reusable ability
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      SKILLSET      SKILLSET      SKILLSET
     Domain/role    Domain/role    Domain/role
          │            │            │
       ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
       ▼     ▼      ▼     ▼      ▼     ▼
     SKILL  SKILL  SKILL  SKILL  SKILL  SKILL
     Atomic reusable procedures / competencies
```

The relationship is always:

```text
Capability = one or more related Skill Sets
Skill Set  = one or more related Skills
Skill      = one focused reusable procedure or competency
```

Do not flatten the hierarchy by placing detailed skill procedures directly in a capability or by using a skill set as a long procedure. A capability and skill set are composition and routing artifacts; the skill is the execution artifact.

## Decide Which Artifact to Create

Use the smallest layer that accurately represents the requested behavior.

```text
User or project needs a reusable behavior
                 │
                 ▼
      Is it one focused procedure?
          ┌──────┴──────┐
         Yes            No
          │              │
          ▼              ▼
       SKILL.md    Are multiple skills part
                   of one role/domain function?
                      ┌──────┴──────┐
                     Yes            No
                      │              │
                      ▼              ▼
                 SKILLSET.md   Are multiple skill sets
                               needed for a broad ability?
                                  ┌──────┴──────┐
                                 Yes            No
                                  │              │
                                  ▼              ▼
                            CAPABILITY.md   Re-evaluate scope;
                                            do not add a layer
                                            only for naming.
```

### Use a Skill when

The behavior can be expressed as one reusable procedure or competency with its own trigger, requirements, workflow or decision logic, output contract, pitfalls, and verification.

### Use a Skill Set when

Several skills naturally belong together because an agent performing one role, discipline, or domain function may need to select among them or combine them.

Examples include `frontend-development`, `backend-development`, `devops`, `security-review`, or `technical-writing`.

### Use a Capability when

A broad ability depends on multiple distinct skill sets and the agent needs a top-level map describing how those skill sets combine to provide the ability.

Examples include `software-engineering`, `product-delivery`, `research-and-analysis`, or `business-operations`.

## Construction Order

Build from the executable leaf upward whenever practical. This prevents capabilities and skill sets from pointing at imaginary or undefined children.

```text
1. Define atomic skills
         │
         ▼
2. Group related skills into a SKILLSET.md
         │
         ▼
3. Group related skill sets into a CAPABILITY.md
         │
         ▼
4. Validate every path and relationship
```

When the architecture is designed top-down first, treat the initial capability and skill-set entries as planned references until the child artifacts exist. Do not mark the composition complete until every required child resolves.

## Building a Skill Set

Follow `agent-specifications\Specs\skillset.specification.md` for the exact `SKILLSET.md` format.

A skill set MUST explain the domain boundary and provide a discoverable manifest of its member skills. It SHOULD help the agent decide which skill to load rather than repeat the instructions already contained in those skills.

### Required design process

1. **Establish the domain or role.** State the coherent function the skill set represents and what falls outside it.
2. **Identify the member skills.** Include only skills that independently provide a reusable competency within that domain.
3. **Verify every member.** Resolve each referenced `SKILL.md`; do not list a skill merely because it is planned unless the artifact clearly marks it as planned.
4. **Define selection guidance.** Explain when one skill is selected, when several skills cooperate, and when a different skill set should be used.
5. **Extract shared requirements.** Put only truly shared tools, credentials, policies, terminology, or platform requirements at the skill-set level.
6. **Keep procedures in skills.** Link to the skill instead of copying its procedure into `SKILLSET.md`.
7. **Validate the relationship.** Member skills SHOULD identify this skill set in their metadata when the hierarchy is being used.

### Skill Set example

```text
SKILLSET: frontend-development
│
├── react-component-authoring
│   └── Build or modify React components.
│
├── frontend-accessibility
│   └── Review and correct accessibility behavior.
│
├── state-management
│   └── Select and implement application state patterns.
│
└── frontend-testing
    └── Build and execute frontend test coverage.
```

A corresponding `SKILLSET.md` should contain a routing table similar to:

| Skill | Path | Purpose | Select when |
|---|---|---|---|
| `react-component-authoring` | `skills/react-component-authoring/SKILL.md` | Create or modify React UI components | The work centers on component implementation |
| `frontend-accessibility` | `skills/frontend-accessibility/SKILL.md` | Audit and correct accessibility | Accessibility behavior or WCAG compliance is involved |
| `state-management` | `skills/state-management/SKILL.md` | Design or modify state flow | Shared/local/server state architecture is involved |
| `frontend-testing` | `skills/frontend-testing/SKILL.md` | Implement frontend tests | The task requires test coverage or regression verification |

The table is a map, not a substitute for the individual skills.

## Building a Capability

Follow `agent-specifications\Specs\capability.specification.md` for the exact `CAPABILITY.md` format.

A capability MUST describe the broad ability and link the skill sets that collectively deliver it. It SHOULD explain composition, routing, shared constraints, and capability-level inputs or outcomes without restating the skills beneath those sets.

### Required design process

1. **Establish the ability boundary.** Define the broad competence the capability represents and the outcomes it is expected to support.
2. **Identify the required skill sets.** Each member should represent a distinct role, discipline, or functional grouping that contributes materially to the capability.
3. **Verify every skill set.** Resolve the corresponding `SKILLSET.md` and confirm its purpose is not duplicated by another member.
4. **Define composition.** Explain whether skill sets operate independently, sequentially, or cooperatively.
5. **Define routing.** When the agent can choose among multiple skill sets, provide clear selection rules.
6. **Declare shared constraints.** Capture capability-wide limits, permissions, runtime requirements, or policies only when they genuinely apply across the member skill sets.
7. **Avoid direct skill duplication.** A capability normally reaches skills through its skill sets. Direct skill lists should be exceptional and explicitly justified.
8. **Validate both directions.** The capability lists its skill sets, and each skill set SHOULD identify its parent capability when the hierarchy is being used.

### Capability example

```text
CAPABILITY: software-engineering
│
├── SKILLSET: frontend-development
│   ├── react-component-authoring
│   ├── frontend-accessibility
│   ├── state-management
│   └── frontend-testing
│
├── SKILLSET: backend-development
│   ├── api-design
│   ├── database-migrations
│   ├── authentication
│   └── backend-testing
│
└── SKILLSET: devops
    ├── ci-pipeline
    ├── containerization
    ├── deployment
    └── observability
```

The capability manifest may therefore look like:

| Skill Set | Path | Contribution | Select when |
|---|---|---|---|
| `frontend-development` | `skillsets/frontend-development/SKILLSET.md` | Browser/UI implementation | Work primarily affects the client-facing application |
| `backend-development` | `skillsets/backend-development/SKILLSET.md` | APIs, services, data, authentication | Work primarily affects server-side behavior |
| `devops` | `skillsets/devops/SKILLSET.md` | Build, deployment, runtime operations | Work involves CI/CD, infrastructure, packaging, or runtime health |

## How an Agent Traverses the Hierarchy

The hierarchy should support progressive disclosure. Start broad only when the request is broad; descend until the executable skill is known.

```text
Request: "Build the admin page and make sure it is accessible."

software-engineering CAPABILITY
               │
               ▼
frontend-development SKILLSET
          ┌────┴──────────────┐
          ▼                   ▼
react-component-authoring   frontend-accessibility
          │                   │
          └─────────┬─────────┘
                    ▼
            Execute both skills
```

Another request may bypass the capability if the needed skill is already obvious:

```text
Request: "Run the accessibility audit skill on this page."
                       │
                       ▼
          frontend-accessibility SKILL
```

Do not force the agent to load every parent and sibling when the correct atomic skill has already been explicitly identified.

## Composition Rules

- A capability MUST contain one or more skill-set references; it should normally contain multiple skill sets or it does not justify the additional layer.
- A skill set MUST contain one or more skill references; it should normally contain multiple related skills or it does not justify the grouping.
- A skill SHOULD have one primary skill set when the hierarchy is strict. If a skill is legitimately reusable across several sets, reference it rather than copying it.
- A skill set MAY participate in more than one capability when the domain genuinely supports multiple broader abilities. Record those relationships explicitly and avoid conflicting parent assumptions.
- Child artifacts own executable detail. Parent artifacts own composition, routing, shared constraints, and discovery.
- Never duplicate a skill simply to make each skill set self-contained. Stable shared references are preferable to copies that drift.
- Never create empty capabilities, empty skill sets, or placeholder members and present them as complete.

## Relationship Integrity

Before considering a capability or skill set complete, validate the chain:

```text
CAPABILITY.md
  │
  ├─ references ──> SKILLSET.md ── references ──> SKILL.md
  │                     │                            │
  │                     └─ parent metadata          └─ parent metadata
  │
  └─ all paths resolve and all descriptions agree
```

Check for:

- missing files;
- stale filenames or moved directories;
- duplicate identifiers;
- a child whose stated purpose conflicts with the parent description;
- capabilities listing skills directly when a skill set should own them;
- skill sets containing procedural content that belongs in a skill;
- circular routing or references that provide no usable selection path.

## Updating Existing Hierarchies

When adding, removing, renaming, or moving a skill or skill set:

1. Search for existing references before changing the identifier or path.
2. Update the child artifact first when its own contract changes.
3. Update the containing skill set when member skills change.
4. Update the containing capability when member skill sets or capability-level routing changes.
5. Update any manifest, registry, index, agent instruction, or documentation that points at the changed artifact.
6. Re-run relationship verification and ensure no stale references remain.

Do not silently repurpose an existing identifier for a materially different capability or skill set. Create a new artifact or explicitly version/migrate the old contract when the semantic meaning changes.

## Recommended Directory Example

```text
agent-specifications/
└── capabilities/
    └── software-engineering/
        ├── CAPABILITY.md
        │
        └── skillsets/
            ├── frontend-development/
            │   ├── SKILLSET.md
            │   └── skills/
            │       ├── react-component-authoring/
            │       │   └── SKILL.md
            │       └── frontend-accessibility/
            │           └── SKILL.md
            │
            ├── backend-development/
            │   └── SKILLSET.md
            │
            └── devops/
                └── SKILLSET.md
```

The repository MAY keep `capabilities/`, `skillsets/`, and `skills/` as separate top-level directories instead. Path layout is a project decision; relationship integrity and the applicable specifications are not.

## Verification Checklist

Before accepting a capability or skill set:

- [ ] The correct governing specification was read before authoring.
- [ ] The artifact is at the correct hierarchy level; an atomic procedure was not promoted into a skill set or capability.
- [ ] Required YAML and Markdown sections follow the matching specification.
- [ ] Every child identifier and relative path resolves to a real artifact or is explicitly marked as planned.
- [ ] A capability references skill sets rather than duplicating their member skill procedures.
- [ ] A skill set references skills rather than duplicating their procedures.
- [ ] Selection and routing guidance is specific enough for an agent to choose the correct child.
- [ ] Shared requirements and constraints are declared at the lowest common level that actually owns them.
- [ ] Parent/child metadata is consistent where the hierarchy is enabled.
- [ ] No stale, circular, duplicated, or contradictory relationships remain.
- [ ] The result remains understandable without relying on a vendor-specific runtime.

## Governing Specifications

When this instruction file and a specification appear to conflict, the artifact-specific specification controls the file structure and required properties:

1. `agent-specifications\Specs\capability.specification.md`
2. `agent-specifications\Specs\skillset.specification.md`
3. `agent-specifications\Specs\skill.specification.md`

Use this file for **decision-making, composition, construction order, traversal, and maintenance behavior**. Use the specification files for the exact artifact contract.
