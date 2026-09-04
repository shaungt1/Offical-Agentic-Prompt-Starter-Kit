---
name: instructions
description: "Master definition, usage guidance, and manifest for reusable instruction sets."
version: 0.1.0
status: active
---

# Instructions

## What an Instruction Is

An **instruction** is reusable guidance that tells an agent how to behave or work within a defined scope. Instructions may apply to a repository, directory, file type, engineering domain, agent, workflow, or other explicitly defined context.

Instructions are broader than a single rule and are not the same as a task or procedure. A rule establishes a focused requirement or constraint. An instruction set may contain several related directives, conventions, decision criteria, examples, and validation requirements that belong together.

## Objectives of Instructions

Instructions should:

1. Give agents stable guidance that should not need to be repeated in every prompt.
2. Define exactly where and when the guidance applies.
3. Preserve project conventions, architecture, quality expectations, and recurring decisions.
4. Keep reusable guidance separate from one-time task details.
5. Make precedence and exceptions explicit when multiple instruction layers can apply.
6. Remain concise enough to load usefully and reference larger material rather than duplicate it.

## Creating Instructions

Use `agent-specifications/specs/instructions.specification.md` whenever a new instruction file is created or materially redesigned.

Before creation:

1. Check the manifest below for an existing instruction set covering the same scope.
2. Determine the scope: global, repository, directory, language, artifact type, agent, or workflow.
3. Create the instruction using the specification's frontmatter and body structure.
4. Use vendor-native placement only when required; otherwise preserve a portable canonical copy.
5. Add the instruction to this manifest.
6. Verify scope, precedence, links, and version.

Typical house form:

```text
instructions/
├── instructions.md
└── <instruction-name>.instructions.md
```

Vendor-specific transformations are defined by `agent-specifications/specs/vendor-formats.specification.md`.

## Instruction Manifest

| Status | Instruction | Purpose | Scope / Apply To | Canonical Path | Version | Related Rules / Agents |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every active instruction set is indexed once.
- [ ] Scope is explicit.
- [ ] Manifest paths resolve.
- [ ] Instructions follow `agent-specifications/specs/instructions.specification.md`.
- [ ] Rules are referenced rather than unnecessarily duplicated.
- [ ] Vendor-specific copies preserve the canonical meaning.
