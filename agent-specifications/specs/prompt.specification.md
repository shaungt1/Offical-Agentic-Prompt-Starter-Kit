---
name: prompt-specification
description: "Defines reusable prompt files with inputs, tools, workflow, outputs, and validation."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "*.prompt.md"
    category: execution
    status: draft
    normative: true
    tags: [prompts, inputs, workflow, outputs]
    related_specifications: [agent-specification, instructions-specification, tool-specification, vendor-formats-specification]
---

# Prompt Specification

## Purpose

A prompt file is a reusable, usually user-invoked task instruction. It is narrower and more invocation-oriented than a persistent instruction file and does not need to represent a discoverable skill unless the workflow should be automatically selected and bundled with resources.

## Canonical Frontmatter

```yaml
---
name: <prompt-name>
description: "Actionable outcome and when to run this prompt."
version: 0.1.0
author: <author>
license: <project-license>
agent: <default-agent-or-mode>
model: <optional-model>
tools: [<least-privilege-tool-list>]
argument-hint: "<expected-user-input>"
permissions:
  external-writes: confirm
metadata:
  tags: [prompt, <domain>]
  related_prompts: [<prompt-name>]
  status: draft
---
```

## Required Logical Flow

```text
Mission / Primary Directive
        ↓
Scope & Preconditions
        ↓
Inputs / Context
        ↓
Workflow
        ↓
Output Contract
        ↓
Quality / Validation
```

| Section | Requirement | Purpose |
|---|---|---|
| `Mission` or `Primary Directive` | REQUIRED | One clear outcome. |
| `Scope & Preconditions` | REQUIRED | What the prompt may assume and when it should stop/ask. |
| `Inputs` | REQUIRED when variable | Required values, placeholders, defaults, and missing-input behavior. |
| `Workflow` | REQUIRED | Ordered actions or decision criteria. |
| `Output Contract` | REQUIRED | Format, destination, and side effects. |
| `Quality Assurance` | REQUIRED | Acceptance checks, failure triggers, and retry/stop rules. |

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Input Rules

Use runtime-native input syntax only in the vendor transformation. The universal prompt should identify variables semantically (`repository`, `file`, `environment`, `ticket-id`) and state whether each is required, optional, defaulted, or discoverable from context.

## Output Rules

State whether the prompt returns text, creates files, edits code, opens issues, sends messages, submits forms, or performs another external action. A text draft and an external send are different operations and MUST NOT be conflated.

## Construction Rules

- Use direct imperative language.
- Keep the prompt focused on one reusable task outcome.
- Do not grant tools merely because they are available.
- Put long domain references in linked files rather than repeating them in every prompt.
- Define what to do when mandatory context is absent.
- Define success and failure in terms a reviewer or agent can observe.

## Common Vendor Form

GitHub Copilot commonly stores prompt files under `.github/prompts/<name>.prompt.md` and supports fields such as `description`, `name`, `agent`, `model`, `tools`, and `argument-hint`. Other vendors may translate prompt variables or invocation syntax differently.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.

## Reference Model

https://github.com/github/awesome-copilot/blob/main/instructions/prompt.instructions.md
