---
name: qa-code-review
description: "Conduct a complete QA code review by scanning and reverse engineering changed code, backtracing dependencies and behavior, reconstructing intent, proposing appropriate tests, executing evidence-based verification, and producing a Critical/Corrective/Optimization final assessment. Use for PR reviews, branch reviews, working-tree reviews, self-review, post-implementation QA, and mixed frontend/backend/AI changes."
version: 1.0.0
author: Engineering
license: Proprietary
platforms: [linux, macos, windows]
compatibility: "Requires read access to the code under review and, for runtime verification, access to the applicable safe test environment."
user-invocable: true
allowed-tools: [filesystem-read, filesystem-write-review-artifacts, git-read, shell-test-commands, browser-test-tools, network-read]
required-tools: [filesystem]
required-toolsets: []
required-environment-variables: []
required-credential-files: []
permissions:
  filesystem: read-write
  network: restricted
  browser: interactive
  shell: restricted
  external-writes: confirm
  account-scope: user
metadata:
  tags: [qa, code-review, testing, backtrace, analysis]
  capability: engineering-quality-assurance
  skillset: qa-code-review
  related_skills: []
  resources: [qa-code-review.frontend.md, qa-code-review.backend.md, qa-code-review.ai.md, qa-code-review.episodic-memory.md]
  status: active
---

# QA Code Review

This skill defines the operating procedure for reviewing and testing code before it is accepted as correct. It applies whether the reviewer receives a well-documented pull request or a large working tree with no PR, no ticket, and no explanation of what the developer intended.

The reviewer must **reverse engineer the change before testing it**. The core method is repeated **scan, trace, and backtrace** work: scan the complete changed surface, isolate logical blocks, backtrace each block through callers, inputs, dependencies, state, outputs, and downstream consumers, compare old and new behavior when a baseline exists, reconstruct intent, perform gap analysis, and only then select tests capable of proving correctness.

Frontend, backend, database, AI, model, and device code are not reviewed with the same tests. This skill performs the common analysis first, then routes the reviewer to the appropriate specialized instructions.

## When to Use

Use this skill for:
- PR or pre-merge review;
- branch, commit-range, or working-tree review;
- developer self-review after implementation;
- review without a PR or formal test plan;
- mixed frontend/backend/database/AI work;
- implementation audits where the reviewer must determine what the code was intended to do;
- post-implementation QA before production integration.

Do not invoke the complete workflow for a narrow task that is already fully defined, such as “run the existing unit suite and report failures,” unless the user asks for a broader code review.

## Requirements

Minimum requirement: read access to the code under review.

Use these sources when available:
- `qa-code-review.manifest.md`;
- `qa-code-review.episodic-memory.md`;
- repository/project instructions;
- ticket, issue, specification, design, PR description, or user direction;
- Git history or other baseline;
- repository build and test instructions;
- approved test environments, datasets, credentials, services, devices, and model endpoints.

If runtime assets are unavailable, complete all analysis that can be proven statically and identify the exact evidence gap.

## Authority and Security

The review may read repository files, search symbols, inspect configuration, inspect Git status/history, pull diffs from available history, read relevant issues/PRs when access exists, run approved local/test commands, and create review artifacts in the designated QA workspace.

The review does not by itself authorize production-code edits, commits, pushes, merges, deployments, production database mutations, destructive tests, paid infrastructure creation, production-device flashing, credential changes, or external messages. Those actions require existing authority or confirmation.

Never write raw API keys, passwords, tokens, private keys, session secrets, or other secret values into QA documents or episodic memory. Record only non-secret credential names and approved locations.

## Procedure

The phases below are ordered because later testing decisions depend on earlier scan and backtrace analysis. Each phase ends with a completion condition.

### Phase 1 — Establish the review baseline

Before reading implementation details, establish exactly what is under review.

Determine:
- review identifier;
- artifact/workspace location;
- repository or repositories;
- branch, commit, or working-tree state;
- comparison baseline;
- known ticket/specification;
- whether a PR exists;
- whether uncommitted files exist;
- test authority and environment restrictions.

When Git is available, begin with factual inventory commands appropriate to the repository:

```bash
git status --short
git branch --show-current
git log --oneline --decorate -n 20
git diff --stat
git diff --name-status
```

For a branch compared with its divergence from an integration branch, a three-dot diff may be appropriate:

```bash
git diff main...HEAD --stat
git diff main...HEAD --name-status
git diff main...HEAD
```

Do not assume `main` is the correct baseline. Use `develop`, release branch, tag, commit, or another range when project history requires it. Git reference: https://git-scm.com/docs/git-diff

**Completion:** the reviewer can state exactly what code state is being reviewed and what baseline is being used, or explicitly state that no baseline exists.

### Phase 2 — Scan the complete change surface

Perform a broad scan before deep-diving into one file.

Scan all changed, new, deleted, and renamed material, including:
- source;
- configuration;
- manifests and lockfiles;
- schemas and migrations;
- API/event contracts;
- tests;
- scripts;
- model/checkpoint/config references;
- training/evaluation code;
- infrastructure and CI/CD;
- feature flags;
- documentation that changes expected behavior.

A small diff can have a large effect. Do not equate line count with risk.

**Completion:** every changed file is known and the obvious systems/technologies touched by the change are identified.

### Phase 3 — Group files into logical code blocks

Do not review 100 changed files as 100 unrelated tasks. Group them by the behavior they collectively implement.

A logical block can be a feature, subsystem, pipeline stage, API flow, database operation, model stage, job, integration, or device path.

Example:

```text
Document processing
├── UploadForm.tsx
├── documents.ts
├── documents.py
├── processing_worker.py
├── 042_document_status.sql
├── page_detector.py
└── metadata_extractor.py
```

For each block record:
- files/components;
- apparent purpose;
- entry points;
- dependencies;
- state/data read and written;
- outputs/side effects;
- downstream consumers;
- old implementation or baseline when relevant;
- unknowns.

**Completion:** every material changed file is accounted for inside a logical block or explicitly classified as supporting/unrelated material.

### Phase 4 — Backtrace each block upstream and downstream

This is the central review operation.

Backtrace the code until the reviewer understands where changed behavior originates and where its effects go:

```text
INPUT / TRIGGER
      |
      v
ENTRY POINT
      |
      v
CHANGED LOGIC
      |
      +--> DEPENDENCY
      +--> STATE / DATABASE
      +--> API / MODEL / DEVICE
      |
      v
OUTPUT / SIDE EFFECT
      |
      v
DOWNSTREAM CONSUMER
```

**Backtrace upstream:** identify the caller, trigger, user action, event, route, queue message, callback, scheduler, input data, prior validation/transformation, configuration, auth context, and concurrency/asynchronous conditions.

**Backtrace downstream:** identify called services/functions, database reads/writes, files, caches, events/messages, external APIs, model calls, callbacks, UI state, output contracts, consumers, retries, timeouts, cleanup, and failure paths.

**Backtrace state:** write important transitions explicitly, for example:

```text
created -> queued -> running -> completed
```

or:

```text
socket disconnected -> reconnect -> new socket
                              -> old listener still registered?
```

The reviewer must be able to explain the block's execution path in normal language.

**Completion:** the reviewer can trace from input/trigger through changed code to output and downstream effect.

### Phase 5 — Compare old and new behavior

When a baseline exists, inspect the actual behavioral difference.

Useful Git operations include:

```bash
git diff <baseline>...HEAD -- path/to/file
git show <baseline>:path/to/file
git log -p -- path/to/file
```

Determine:
- what was added, deleted, replaced, or renamed;
- which behavior or contract changed;
- whether validation/error handling changed;
- whether defaults/configuration changed;
- whether schema/data behavior changed;
- whether dependencies changed;
- whether model, prompt, checkpoint, threshold, or preprocessing changed.

Use `git blame` only when historical origin materially helps the technical analysis.

**Completion:** every logical block has a clear before/after explanation when comparison is possible.

### Phase 6 — Reconstruct the intended behavior

If the requirement exists, translate it into testable engineering language.

If it does not, reconstruct intent from the ticket, commits, old/new code, callers, consumers, contracts, tests, UI/design, model-evaluation scripts, and documentation.

For each block write:
- **Apparent intended behavior**
- **Evidence supporting that interpretation**
- **Uncertainty**

Do not treat the developer's implementation as the specification. If unresolved uncertainty changes what “correct” means, obtain clarification before making a definitive QA finding.

**Completion:** each block has a sourced or explicitly reconstructed purpose.

### Phase 7 — Perform gap analysis before runtime testing

Compare intended behavior with the implementation and the surrounding system.

Scan and backtrace for:
- missing requirement;
- unreachable path;
- unhandled branch;
- missing invalid/null/empty/boundary handling;
- missing or unsafe retry;
- missing timeout;
- duplicate callback/listener;
- stale state;
- missing resource cleanup;
- wrong transaction boundary;
- incomplete migration;
- request/response or event-contract mismatch;
- frontend/backend field mismatch;
- model output not validated;
- nonrepresentative AI evaluation;
- missing configuration;
- dependency/runtime mismatch;
- inadequate tests around changed behavior;
- missing recovery/rollback;
- authorization gap;
- performance/resource risk.

Separate **deterministic defects already proven from code** from **risk hypotheses requiring runtime evidence**.

**Completion:** the analysis contains specific gaps, hypotheses, and unknowns tied to the backtrace.

### Phase 8 — Classify modalities and load the right instructions

Load `qa-code-review.frontend.md` when the changed path includes browser UI, client state, routing, forms, events/callbacks, WebSockets/SSE, client API calls, visual conformance, responsiveness, or accessibility.

Load `qa-code-review.backend.md` when it includes APIs, services, databases, migrations, queues, jobs, caches, webhooks, auth, external integrations, concurrency, deployment-facing logic, or device/server interfaces.

Load `qa-code-review.ai.md` when it includes ML, training/evaluation code, LLMs, RAG, NLP, embeddings, computer vision, YOLO, OCR model stages, VLM/multimodal, reinforcement learning, agents/tool use, or generative models.

A block may require more than one specialized document.

**Completion:** each block is mapped to the relevant testing instructions.

### Phase 9 — Define what “working” means

Write verification claims before selecting tools.

Weak:
> Test the API.

Strong:
> A valid authenticated request creates exactly one job, returns the documented response schema, persists a valid state, and creates no job for invalid or unauthorized requests.

Weak:
> Test YOLO.

Strong:
> The candidate detector preserves or improves small-page recall on the approved validation set without an unacceptable precision regression and remains compatible with downstream crop/OCR on target hardware.

Weak:
> Test the UI.

Strong:
> A submission prevents duplicate requests while pending, renders backend validation failures correctly, and navigates only after confirmed success.

**Completion:** every block has explicit success and failure claims that can be proven or disproven.

### Phase 10 — Determine missing inputs and ask targeted questions

The scan and backtrace should determine what is missing.

Examples for frontend:
- approved test account;
- required browsers/devices;
- visual specification;
- staging versus mocks;
- realtime service availability;
- feature flags.

Examples for backend:
- disposable database;
- production-equivalent database version;
- migration rollback authority;
- queue/cache/broker availability;
- sandbox credentials;
- idempotency/retry requirement;
- SLOs.

Examples for AI:
- exact model/checkpoint/prompt;
- approved dataset/test set;
- baseline;
- target hardware/runtime;
- required metrics/thresholds;
- train/validation/test split method;
- RAG corpus/configuration;
- agent tools/permissions.

Read episodic memory before asking. Do not make the user repeat a stable answer already registered and still valid.

**Completion:** all available inputs are known and any blocker is defined precisely.

### Phase 11 — Write the test proposal

Create `02-test-execution-and-evidence.md`.

For every block state:
1. verification claim;
2. proposed test/inspection;
3. why that method is appropriate;
4. required environment, data, credentials, services, or hardware;
5. expected evidence;
6. negative/failure tests;
7. side effects and authorization;
8. unresolved prerequisite.

The architecture and claim choose the test; the familiar tool does not.

**Completion:** the proposal can produce evidence for every material claim.

### Phase 12 — Execute the smallest reliable evidence first

Use the following progression when relevant:

```text
static/backtrace proof
 -> build/type/lint
 -> unit/component
 -> integration/contract
 -> subsystem/model evaluation
 -> end-to-end
 -> performance/robustness/specialized testing
```

This is not a mandatory pyramid. Skip irrelevant layers.

Record:
- exact command or method;
- environment/version;
- inputs/test data;
- result;
- evidence location;
- metrics/logs when relevant;
- limitation.

Keep large raw artifacts under `evidence/`; summarize the fact in the review documents.

**Completion:** every verification claim has evidence, an explicit blocker, or a justified not-applicable decision.

### Phase 13 — Test failure behavior

Do not test only success.

Consider the failure modes that apply:
- invalid or missing input;
- empty result;
- null/undefined state;
- duplicate or concurrent request;
- timeout/disconnect;
- stale data;
- dependency failure;
- malformed dependency response;
- database conflict/deadlock;
- unauthorized user;
- partial operation followed by retry;
- process restart;
- malformed or low-quality model output;
- hardware/resource exhaustion.

Use the specialized documents for modality-specific cases.

**Completion:** important failure paths are tested or documented as evidence gaps.

### Phase 14 — Verify integration boundaries

Cross-check every materially changed interface:

```text
frontend schema <-> backend parser
backend request <-> model input
model output <-> parser
service logic <-> database constraints
producer event <-> queue consumer
device payload <-> server decoder
```

A component can be correct in isolation and fail at its boundary.

**Completion:** material changed contracts have direct integration evidence or a documented blocker.

### Phase 15 — Double-check and triple-check important findings

The reviewer must attempt to disprove their own findings.

For a proposed **Critical** issue:
1. reread the changed code and backtrace;
2. verify the baseline;
3. reproduce the failure when practical;
4. eliminate test setup/environment error;
5. verify the candidate change causes the behavior;
6. rerun or independently verify;
7. document impact.

For a **Corrective** finding, prove a real engineering weakness exists rather than a stylistic preference.

For an **Optimization**, first establish that current behavior is valid.

When practical, Critical findings should have two independent forms of evidence, such as static proof plus runtime reproduction or a model metric plus sample-level error analysis.

**Completion:** no final finding is based on one casual observation, one anomalous run, or personal preference.

### Phase 16 — Classify every verified finding

#### CRITICAL — Must Fix

Use Critical when evidence shows the implementation is unsafe or incorrect for production integration, including:
- required functionality fails;
- breaking contract;
- data corruption/loss;
- security/privacy/authorization failure;
- unsafe migration;
- crash/deployment failure;
- severe concurrency or duplicate side effect;
- required frontend flow unusable;
- required model capability materially regresses;
- agent performs unauthorized/destructive action;
- target device cannot safely execute required behavior.

Every Critical finding must identify location, behavior, evidence, reproduction or deterministic proof, root cause when known, production impact, correction direction, and required retest.

#### CORRECTIVE — Should Fix

Use Corrective for a real defect or material risk that is not currently production-breaking: fragile recovery, incomplete validation, weak test coverage, maintainability/scalability risk, non-critical data inconsistency, non-critical model degradation, or unsafe assumption.

Corrective must not be used for personal style preferences.

#### OPTIMIZATION — Could Improve

Use Optimization when the implementation is valid but can be improved in performance, cost, latency, resource use, readability, maintainability, architecture, cache behavior, model quality, or efficiency.

Optimization is non-blocking.

**Completion:** every finding has one category and evidence supporting that category.

### Phase 17 — Produce the final QA review

Create `03-final-qa-review.md` as a human-readable engineering report.

It must contain:
- **Review Scope** — code/system reviewed, baseline, limitations.
- **What Changed** — logical blocks and intended purposes.
- **Backtrace Summary** — important execution, data, state, model, and integration paths.
- **Testing Performed** — tests/evaluations, rationale, environments/data.
- **Critical Findings** — complete evidence-based descriptions.
- **Corrective Findings** — complete descriptions and risk.
- **Optimization Opportunities** — current valid behavior, proposed improvement, expected benefit.
- **Unverified/Blocked Verification** — exact remaining evidence gaps.
- **Final Disposition** — `READY`, `READY WITH CORRECTIVE ITEMS`, or `NOT READY`.

A technical owner should understand the review without reading raw logs.

**Completion:** final disposition is explicit and every conclusion can be traced to evidence.

### Phase 18 — Update QA episodic memory

Read `qa-code-review.episodic-memory.md`.

Persist only reusable QA knowledge, such as:
- approved test environment;
- reusable test database;
- dataset or golden set;
- benchmark;
- model metric/threshold;
- target hardware;
- framework/version;
- reusable script;
- recurring failure;
- test method proven misleading.

Do not copy the entire review into memory. If a user-supplied item might be reusable but reuse is unclear, ask whether it should be retained.

**Completion:** reusable information is updated or the review explicitly concludes there is nothing new to persist.

## Output Contract

The normal review workspace contains:

```text
<review-workspace>/<review-id>/
├── 01-code-analysis-and-backtrace.md
├── 02-test-execution-and-evidence.md
├── 03-final-qa-review.md
└── evidence/
```

These are populated work products, not blank templates.

### `01-code-analysis-and-backtrace.md`

Must contain:
- review context and baseline;
- complete changed-file scan;
- logical code blocks;
- backtraces;
- old-versus-new comparison;
- reconstructed intent;
- gap analysis;
- code modalities;
- questions/prerequisites;
- verification claims.

### `02-test-execution-and-evidence.md`

Must contain:
- test proposal;
- selected tests and rationale;
- commands/methods;
- environment/data/model versions;
- results;
- evidence references;
- failures and reproduction;
- blocked tests;
- retests.

### `03-final-qa-review.md`

Must contain:
- scope;
- backtrace summary;
- testing summary;
- Critical findings;
- Corrective findings;
- Optimization opportunities;
- blocked/unverified areas;
- final disposition.

The skill does not modify production code unless a separate fix stage is authorized.

## Decision Rules

### Static analysis can be enough when

The property is deterministic and directly provable, for example a removed required field, nonexistent symbol, visible schema mismatch, unconditional throw, invalid route, or committed raw credential. Runtime confirmation is still useful when inexpensive.

### Runtime evidence is normally required when

Correctness depends on timing, browser behavior, network services, database semantics, queues, concurrency, model output quality, hardware, performance, external integrations, or environment configuration.

### Ask the user when

A material requirement cannot be inferred safely or a test requires unavailable acceptance criteria, dataset, target hardware, test credential, environment access, destructive authority, or meaningful external cost.

### Stop and report a blocker when

Required verification would require unauthorized destructive action, unavailable secret material, prohibited production access, or another unsatisfied safety/authority condition.

## Pitfalls

### Reviewing files instead of behavior

A file list is not a system model. Group changes by behavior and backtrace their connections.

### Trusting the implementation as the specification

The developer can implement the wrong thing. Reconstruct intent independently.

### Running all tests before knowing what changed

This generates noise and can miss the exact changed behavior. Define claims first.

### Treating a passing suite as proof

Existing tests can omit the new path or encode obsolete assumptions.

### Calling style preferences defects

A valid implementation does not become Corrective because another reviewer prefers a different pattern.

### Calling an unverified risk Critical

Critical is evidence-based. Investigate until proven or report the risk as unverified.

### Ignoring deleted code

Deleted validation, cleanup, tests, migration logic, or error handling can be more important than new code.

### Ignoring cross-modality boundaries

Frontend/backend/model/database/device boundaries are frequent failure points.

### Using production systems casually

Prefer safe test environments. Production or destructive tests require authority.

### Storing secrets in review documentation

Never store raw secrets in QA reports or episodic memory.

## Verification

The skill succeeded only when:
- the complete change surface was scanned;
- all material changes belong to logical blocks;
- each block was backtraced upstream and downstream;
- old/new behavior was compared when possible;
- intent is sourced or explicitly reconstructed;
- gaps and unknowns are recorded;
- relevant specialized instructions were loaded;
- tests were selected from claims, not habit;
- results contain evidence;
- important findings were rechecked;
- findings are classified as Critical, Corrective, or Optimization;
- final disposition is explicit;
- reusable QA information was considered for episodic memory.

## Resources

| Resource | Purpose | Load condition |
|---|---|---|
| `qa-code-review.manifest.md` | Routing, storage, authority, memory rules. | Always. |
| `qa-code-review.frontend.md` | Browser/UI/client testing. | Frontend behavior identified. |
| `qa-code-review.backend.md` | API/database/server/async/integration testing. | Backend/data behavior identified. |
| `qa-code-review.ai.md` | ML/LLM/CV/RL/agent evaluation. | AI/model behavior identified. |
| `qa-code-review.episodic-memory.md` | Reusable QA knowledge. | Read before planning; update after review. |

## Engineering References

- Google Engineering Practices — Code Review: https://google.github.io/eng-practices/review/
- Google Reviewer Guide: https://google.github.io/eng-practices/review/reviewer/
- Microsoft Azure DevOps — Pull Request Review: https://learn.microsoft.com/en-us/devops/develop/git/git-pull-requests
- OWASP Code Review Guide: https://owasp.org/www-project-code-review-guide/
- Git Diff Documentation: https://git-scm.com/docs/git-diff
