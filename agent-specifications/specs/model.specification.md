---
name: model-specification
description: "Defines model selection, serving, inference, compatibility, and operational limits."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "MODEL.md"
    category: runtime
    status: draft
    normative: true
    tags: [models, inference, serving, limits]
    related_specifications: [agent-specification, evaluation-specification, vendor-formats-specification]
---

# MODEL.md Specification

## Purpose

A model specification records the exact model or model profile an agent system depends on: provider/model identifier, intended role, context limits, modalities, serving requirements, inference settings, tool/function support, cost/performance considerations, and known constraints.

## When to Create

Create a model artifact when a project relies on a specific model, local serving profile, fallback chain, or workload-specific model policy that must be reproducible.

## Naming and Placement

House filename: `MODEL.md` inside `models/<profile-name>/` or adjacent to the agent/package that owns the model profile. Provider configuration may live in separate runtime config files.

## Frontmatter Template

```yaml
---
name: <model-name>
description: "Model role and intended workload."
version: <model-or-profile-version>
author: <profile-author>
license: <model-license-or-terms>
provider: <provider-or-local>
model-id: <exact-provider-model-id>
context-window: <tokens-or-unknown>
modalities: [text]
platforms: [linux, macos, windows]
metadata:
  tags: [model, <workload>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Human/project model profile name. |
| `description` | REQUIRED | Workload and selection rationale. |
| `version` | REQUIRED | Profile version or model release/version where meaningful. |
| `author` | REQUIRED house field | Profile owner. |
| `license` | REQUIRED | Model terms/license or reference. |
| `provider` | REQUIRED | Provider, local runtime, or self-hosted service. |
| `model-id` | REQUIRED | Exact model identifier used by the runtime. |
| `context-window` | RECOMMENDED | Verified supported context or `unknown`. |
| `modalities` | RECOMMENDED | Input/output modalities. |
| `metadata.tags` | RECOMMENDED | Workload tags. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Role` | What this model is selected to do. |
| `Capabilities` | Reasoning, coding, vision, tool use, structured output, etc.—only verified capabilities. |
| `Limits` | Context, rate, size, modality, safety, or provider limitations. |
| `Serving / Endpoint` | Provider API or local serving requirements. |
| `Inference Profile` | Temperature/top-p/reasoning/structured-output defaults only when intentionally controlled. |
| `Fallbacks` | When another model should be used. |
| `Evaluation` | Tasks/metrics that justify the selection. |
| `Verification` | How to confirm the configured model is actually active. |

## Optional Sections

| Section | Use when |
|---|---|
| `Cost / Performance` | Use for budgeted or latency-sensitive deployments. |
| `Hardware` | Use for local/self-hosted models. |
| `Quantization` | Use when quantization materially affects memory, quality, or compatibility. |

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
| agent | Agents may reference a model profile rather than hard-code provider details. |
| tool | Model-serving tools should expose exact model identifiers. |
| vendor formats | Translate model field names/provider settings as required. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
