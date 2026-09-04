---
name: evaluation-specification
description: "Defines behavioral and structural evaluations for agent artifacts."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "EVALUATION.md / evals/<name>.md"
    category: quality
    status: draft
    normative: true
    tags: [evaluation, testing, acceptance]
    related_specifications: [skill-specification, agent-specification, model-specification]
---

# EVALUATION.md / evals/<name>.md Specification

## Purpose

An evaluation defines repeatable cases that prove an agent artifact behaves as intended. It can test discovery, routing, procedural correctness, permission boundaries, output shape, failure handling, or end-to-end results.

## When to Create

Create an evaluation when an artifact's behavior matters enough to regress, when multiple models/vendors should behave consistently, or when correctness cannot be demonstrated by simple syntax validation.

## Naming and Placement

House form: `evals/<name>.md` or `EVALUATION.md` inside the artifact package. Machine-readable case files may accompany it.

## Frontmatter Template

```yaml
---
name: <evaluation-name>
description: "Evaluates <artifact/capability> against representative cases."
version: 0.1.0
author: <author>
target: <artifact-id-or-path>
metadata:
  tags: [evaluation, <domain>]
  status: draft
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Evaluation identifier. |
| `description` | REQUIRED | What behavior is being tested. |
| `version` | REQUIRED | Evaluation revision. |
| `author` | REQUIRED | Maintainer. |
| `target` | REQUIRED | Artifact/capability under test. |
| `metadata.tags` | RECOMMENDED | Domain/test tags. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Objective` | Behavior/contract being validated. |
| `Test Environment` | Model/vendor/tools/data assumptions. |
| `Cases` | Table or structured cases with input, preconditions, expected behavior, forbidden behavior. |
| `Scoring / Pass Criteria` | Deterministic checks or rubric. |
| `Failure Analysis` | How failures are classified. |
| `Regression Policy` | When cases are added or changed. |

## Optional Sections

| Section | Use when |
|---|---|
| `Golden Outputs` | Use only when exact output stability is meaningful. |
| `Metrics` | Use for latency, cost, accuracy, or routing benchmarks. |
| `Security Cases` | Use for permission/prompt-injection/secret boundaries. |

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
| skill/agent/prompt/tool | Evaluations target these artifacts without replacing their own verification sections. |
| model | Model profiles may cite evaluation results as selection evidence. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
