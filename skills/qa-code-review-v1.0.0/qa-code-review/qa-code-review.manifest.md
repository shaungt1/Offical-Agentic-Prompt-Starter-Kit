# QA Code Review Manifest

| Field | Value |
|---|---|
| Document | QA Code Review Manifest |
| Version | 1.0.0 |
| Status | Active |
| Scope | Human and agent-assisted QA code review |
| Primary Skill | `qa-code-review.skill.md` |
| Supplemental Instructions | Frontend, Backend, AI |
| Persistent QA Knowledge | `qa-code-review.episodic-memory.md` |

## Purpose

This manifest is the entry point for conducting a complete QA code review. It does not replace engineering judgment and it does not prescribe one testing framework for every repository. Its purpose is to force a repeatable review sequence: first determine what changed and why, then scan and backtrace the implementation, then determine what kind of code is present, then select the appropriate testing instructions, then test each isolated block and its integrations, and finally produce an evidence-based review.

The review must never begin with “run all tests” as the first action. A test suite can pass while the reviewer misunderstands the change, while important code is not covered, while a model is evaluated against the wrong dataset, or while a frontend works only in one happy-path state. The reviewer must first understand the system well enough to know what must be proven.

The governing sequence is:

```text
ANALYZE
   |
   v
SCAN + BACKTRACE
   |
   v
CATEGORIZE THE CHANGED SYSTEM
   |
   v
PROPOSE WHAT MUST BE VERIFIED
   |
   v
SELECT FRONTEND / BACKEND / AI INSTRUCTIONS
   |
   v
EXECUTE TESTS + COLLECT EVIDENCE
   |
   v
RECHECK / REPRODUCE IMPORTANT FINDINGS
   |
   v
CLASSIFY: CRITICAL / CORRECTIVE / OPTIMIZATION
   |
   v
FINAL QA REVIEW
   |
   v
UPDATE EPISODIC MEMORY WHEN REUSABLE INFORMATION WAS LEARNED
```

## Required Documents

The QA Code Review system consists of the following six instruction files. They are deliberately separated so the reviewer can load the general procedure once and load specialized testing detail only after the code has been categorized.

| Document | Purpose | When It Is Loaded |
|---|---|---|
| `qa-code-review.manifest.md` | Entry point, routing, storage, memory rules, and overall execution order. | Always first. |
| `qa-code-review.skill.md` | Full instructions for scanning, diffing, reverse engineering, backtracing, gap analysis, testing proposal, execution discipline, findings, and final review. | Always. |
| `qa-code-review.frontend.md` | Explicit frontend/UI/browser testing instructions. | When the analyzed change contains frontend code or browser-visible behavior. |
| `qa-code-review.backend.md` | Explicit backend, API, database, async, integration, infrastructure-facing, and server-side testing instructions. | When the analyzed change contains backend/server/data/integration behavior. |
| `qa-code-review.ai.md` | Explicit AI/ML/LLM/CV/VLM/NLP/RL/agent evaluation instructions and benchmark guidance. | When the analyzed change contains AI or model behavior. |
| `qa-code-review.episodic-memory.md` | Rules for recording reusable company/project QA knowledge discovered during reviews or supplied by the user. | Read before test planning; update after review when applicable. |

A mixed implementation can require all three specialized documents. For example, a document-processing product may contain a React upload page, a FastAPI endpoint, PostgreSQL tables, a queue worker, a YOLO page detector, OCR, and an LLM extraction layer. The reviewer must not pretend that one kind of test proves the entire chain.

## Before Starting: Resolve Review Configuration

Before touching the review, determine whether the repository or user has already defined the information below. Do not ask questions that are already answered by a project specification, repository instruction, ticket, current conversation, or episodic memory. If a required value is not known, obtain it before the value becomes necessary.

### Review configuration checklist

This checklist exists because the reviewer needs a stable baseline and a safe place to work. Missing configuration should be surfaced early rather than discovered after tests have already modified data or generated artifacts in the wrong place.

- **Review identifier.** Prefer an existing Jira, Azure Boards, GitHub issue, Asana task, Linear issue, or other work-item identifier. If none exists, ask whether the user wants a custom review name. If the user delegates naming, generate a concise identifier from the date and scope, such as `2026-09-03-document-vision-review`.
- **Artifact location.** Determine where analysis and test evidence should be stored. Prefer a local excluded review workspace when the user has one.
- **Source baseline.** Determine what the current code should be compared against: `main`, `develop`, a release branch, a tag, a commit, or an earlier local state.
- **Specification or intended behavior.** Locate the ticket, acceptance criteria, design document, PR description, implementation notes, or user instruction. If none exists, the skill requires intent reconstruction through scan/backtrace analysis.
- **Test authority.** Determine whether normal local tests are authorized and whether any tests may touch staging, cloud services, external APIs, databases, hardware, or paid model endpoints.
- **Credential location.** Determine where approved test credentials are stored. Record only the credential name/location, never secret values, in QA documentation.
- **Destructive-test policy.** Determine whether database writes, migration rollback, load tests, device flashing, data deletion, cloud provisioning, or other side effects require confirmation.
- **Target environment.** Identify supported browsers/devices, production database type/version, target hardware, model runtime, operating system, deployment environment, or other environment assumptions relevant to the changed code.

### Completion condition

Configuration is sufficiently resolved when the reviewer can identify the review, knows where to write review artifacts, knows the baseline or can explicitly document that no baseline exists, and knows whether any planned test requires additional authorization.

## Preferred Review Workspace: Admin Local

When available, use **Admin Local** as the default private engineering briefcase for review artifacts.

Admin Local is a VS Code extension that creates a `.admin-local/` workspace and uses Git's local exclude mechanism so the directory can remain on disk without being committed to the repository. This is useful for review notes, temporary scripts, test-data references, prompts, logs, screenshots, evidence, and analysis that should not become production source code.

Reference: [Admin Local — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local)

The recommended review directory is:

```text
.admin-local/
└── qa-code-review/
    └── <review-id>/
        ├── 01-code-analysis-and-backtrace.md
        ├── 02-test-execution-and-evidence.md
        ├── 03-final-qa-review.md
        └── evidence/
```

These are review outputs, not blank templates. The main skill explains the content that must actually be written into them.

If Admin Local is not installed, use the user-specified location. Acceptable alternatives include another repository-local excluded directory, an agent workspace, a cloud workspace, or an external review directory. Do not place transient QA analysis inside production source directories merely because no better location was chosen.

## Required Execution Order

### Step 1 — Read QA episodic memory

Read `qa-code-review.episodic-memory.md` before deciding how to test. It may define reusable test datasets, model benchmarks, preferred test accounts, target hardware, test-database conventions, framework versions, known failure modes, or other project-specific facts.

Do not assume remembered information is permanently correct. If a memory item conflicts with current code, a current specification, or current user direction, use the newer authoritative information and update or supersede the old memory entry.

### Step 2 — Run the main QA review skill

Load `qa-code-review.skill.md` and perform the complete initial analysis. This stage must scan the repository, identify the changed surface, pull or reconstruct diffs when a baseline exists, group changes into logical blocks, backtrace each block through callers, dependencies, state, data, outputs, and consumers, reconstruct intended behavior, and identify gaps.

The output of this stage is `01-code-analysis-and-backtrace.md`.

### Step 3 — Determine the code modalities

The code analysis must determine which specialized instructions are actually required.

| Observed change | Required instruction |
|---|---|
| Browser UI, React/Vue/Angular/Svelte, client state, routing, forms, browser callbacks, WebSockets/SSE, visual behavior, responsiveness | `qa-code-review.frontend.md` |
| API, service, database, schema, migration, queue, cache, webhook, worker, auth, server process, integration, deployment-facing logic | `qa-code-review.backend.md` |
| Machine learning, LLM, RAG, embeddings, NLP, computer vision, YOLO, VLM, reinforcement learning, agent behavior, generative media | `qa-code-review.ai.md` |

Do not load a specialized instruction merely because the repository contains that technology somewhere. Load it when the reviewed change touches that modality or when the backtrace shows the change can materially affect it.

### Step 4 — Produce the testing proposal

Before running complex or invasive tests, produce the proposed test plan as the opening section of `02-test-execution-and-evidence.md`.

For every logical code block, state:

1. what behavior must be proven;
2. what failure modes must be ruled out;
3. what evidence is already available from static analysis and backtracing;
4. which runtime test, integration check, or model evaluation is needed;
5. which environment, data, credentials, services, or hardware are needed;
6. whether the test can run now;
7. whether approval or additional information is required.

If the user already authorized normal local testing, do not stop for ceremonial approval. Request confirmation when the test creates meaningful side effects, costs money, changes external systems, requires unknown credentials or data, or relies on an acceptance criterion that cannot be inferred safely.

### Step 5 — Execute testing block by block

Test each logical block in a controlled order, starting with the smallest reliable verification and moving outward toward integrations and end-to-end behavior.

Do not allow one passing end-to-end test to replace unit or contract evidence when internal behavior is material. Likewise, do not allow passing unit tests to replace a real integration test when the defect risk lies in a database, network, model, browser, device, or external-service boundary.

### Step 6 — Recheck important findings

Every proposed finding must be verified before it is placed in the final review.

For a **Critical** finding, use at least two independent forms of evidence when practical. Examples include:

- static/backtrace proof plus a reproducible runtime failure;
- a diff showing a broken contract plus an integration test demonstrating the break;
- a database constraint/backtrace issue plus a transaction test;
- a model regression metric plus sample-level error analysis;
- a frontend state/race analysis plus a browser reproduction.

If runtime verification is impossible and the failure is not deterministically proven from code, describe it as an **unverified risk requiring validation**, not a proven Critical defect.

### Step 7 — Produce the final review

Create `03-final-qa-review.md`.

The final review must classify verified findings into exactly three engineering categories:

| Class | Definition | Required action |
|---|---|---|
| **CRITICAL — Must Fix** | A verified defect can break required functionality, cause a breaking change, corrupt or lose data, violate security/privacy/authorization, fail deployment, materially regress a required AI capability, create unsafe actions, or otherwise make production integration unacceptable. | Do not approve production integration until resolved and retested. |
| **CORRECTIVE — Should Fix** | A real defect, weakness, or material engineering risk exists but is not currently expected to cause an immediate production-breaking failure. | Correct, schedule, or explicitly accept with rationale. |
| **OPTIMIZATION — Could Improve** | The implementation is valid, but another design, test, model, or configuration could improve performance, cost, clarity, maintainability, throughput, resource use, or quality. | Non-blocking. |

The final disposition is:

- **READY** — no unresolved Critical findings.
- **READY WITH CORRECTIVE ITEMS** — no unresolved Critical findings; Corrective items remain.
- **NOT READY** — one or more unresolved Critical findings remain.

### Step 8 — Update episodic memory

After completing the review, determine whether the user supplied or the review discovered reusable QA information.

Examples include preferred datasets, a required YOLO validation set, a known Postgres test database, a browser/device matrix, test account references, a required benchmark, a required model threshold, preferred tooling, a reusable test script, a known failure pattern, or a previously misleading test method.

If reuse is obvious, update `qa-code-review.episodic-memory.md` according to its rules. If the user supplied information that could plausibly be reused but did not say whether it should become persistent QA knowledge, ask the user whether to retain it.

**Never write raw passwords, API keys, tokens, private keys, or secret values into episodic-memory Markdown. Store only the approved secret name, environment-variable name, credential-store location, or other non-secret reference.**

## Review Authority

The QA review is authorized to perform ordinary read-oriented engineering analysis necessary to understand the code. This includes reading repository files, scanning directories, searching symbols, reading configuration, inspecting Git status/history, pulling Git diffs from available repository history, reading issue or PR descriptions when access is authorized, and reading test output.

The review may create and update review artifacts in the designated QA workspace.

The review does **not** imply authorization to:

- modify production code;
- commit or push changes;
- merge branches;
- deploy services;
- mutate production databases;
- rotate or create credentials;
- send external messages;
- incur material cloud or model costs;
- flash production hardware;
- perform destructive security or load tests.

Those actions require authority already granted by the user/project or separate confirmation.

## Final Completion Gate

The QA Code Review workflow is complete only when the reviewer can answer all of the following questions with evidence:

1. What changed?
2. Why was it changed or what behavior was it intended to produce?
3. What code, data, models, services, devices, or users can the change affect?
4. What did the scan and backtrace reveal about its execution and dependencies?
5. What had to be proven for the change to be considered correct?
6. Which tests or evaluations were selected, and why were they the appropriate tests?
7. What evidence was produced?
8. Which findings are Critical, Corrective, or Optimization?
9. What remains unverified, if anything?
10. Is the implementation READY, READY WITH CORRECTIVE ITEMS, or NOT READY?
11. Did the review produce reusable QA information that belongs in episodic memory?

## Sources and Standards

This workflow is informed by the following engineering references:

- [Git `git-diff` documentation](https://git-scm.com/docs/git-diff) — change comparison and diff ranges.
- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/) — review scope and code-health principles.
- [Google Engineering Practices: How to do a code review](https://google.github.io/eng-practices/review/reviewer/) — reviewer procedure and review focus.
- [Microsoft Azure DevOps: Pull requests and review feedback](https://learn.microsoft.com/en-us/devops/develop/git/git-pull-requests) — review context and feedback.
- [OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/) — secure manual code review.
- [Admin Local — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local) — local Git-excluded engineering workspace.
