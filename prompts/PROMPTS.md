---
name: prompts
description: "Master definition, usage guidance, and manifest for reusable, explicitly-invoked prompts written by the user or the agent."
version: 0.1.0
status: active
---

# Prompts

## What a Prompt Is

A **prompt** is a reusable, **explicitly invoked** piece of ready-to-use request text — the actual words a user or an agent submits to start or steer an interaction toward a specific outcome. Nobody acts on a prompt automatically; someone has to choose to use it.

Prompts in this folder belong to **both the user and the agent**, and this folder is expected to grow dynamically. Whenever a prompt turns out to work well — the user phrased something that got a great result, or the agent arrived at a request pattern worth reusing — save it here instead of losing it at the end of the conversation.

### Prompt vs. Instruction vs. Skill vs. Prompt Engineering

These four are easy to confuse. Use this test before creating any of them:

| | Triggered by | Nature | Example |
|---|---|---|---|
| **Prompt** (`prompts/`) | Explicit invocation — someone chooses to send it | Ready-to-use request text | "Review this PR for security issues using the OWASP Top 10 checklist." |
| **Instruction** (`instructions/`) | Automatically, whenever its scope applies | Passive, ambient guidance | "Always use single quotes in this codebase." |
| **Skill** (`skills/`) | The agent recognizing a matching task | A multi-step procedure, possibly bundling scripts/references/tools | A full QA code-review procedure with backtracing and evidence collection |
| **Prompt Engineering** (`prompt_engineering/`) | Read when *building* a prompt | A methodology library — knowledge about how to write effective prompts | The 49-framework compendium of prompting techniques |

If you are about to write down literal words someone would submit to get a specific answer, it's a **prompt**, and it goes here. If you are about to write down a standing rule that should apply without anyone asking, it's an **instruction**. If you are about to write down a repeatable multi-step procedure the agent performs, it's a **skill**. If you are about to write down advice about *how to phrase things well in general*, it belongs in `prompt_engineering/`, not here.

## Governing Specification

Follow `agent-specifications/specs/prompt.specification.md` for the required frontmatter and body structure of every `*.prompt.md` file: Mission → Scope & Preconditions → Inputs → Workflow → Output Contract → Quality Assurance.

## Canonical Structure

```text
prompts/
├── PROMPTS.md              # This file: definition, guidance, and manifest
└── <prompt-name>.prompt.md
```

Use a stable, descriptive, kebab-case name. A vendor-specific mirror (e.g. `.github/prompts/<name>.prompt.md` for GitHub Copilot) is a transformation of the canonical file here — see `agent-specifications/specs/vendor-formats.specification.md`.

## How to Create a New Prompt

1. Search the manifest below for an existing prompt covering the same outcome — extend it instead of duplicating.
2. Read `agent-specifications/specs/prompt.specification.md`.
3. Create `prompts/<prompt-name>.prompt.md` with the required frontmatter and logical flow.
4. Record who it's for in the manifest row: `user` or `agent`.
5. Add the manifest row in the same change.
6. Verify the inputs, outputs, and completion criteria are concrete enough for someone else to actually invoke it correctly.

## Prompt Manifest

| Status | Prompt | Author | Outcome | Canonical Path | Version | Notes |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Verification

- [ ] Every active prompt is indexed once above.
- [ ] Manifest paths resolve.
- [ ] Every prompt follows `agent-specifications/specs/prompt.specification.md`.
- [ ] Each prompt states its author (`user` or `agent`).
- [ ] The prompt is not silently duplicating an existing instruction, skill, or another prompt.
- [ ] No prompt grants tools or permissions broader than the task needs.
