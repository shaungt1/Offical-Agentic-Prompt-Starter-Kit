# QA Code Review Episodic Memory

| Field | Value |
|---|---|
| Document | QA Code Review Episodic Memory |
| Version | 1.0.0 |
| Scope | Persistent reusable QA knowledge for frontend, backend, and AI code reviews |
| Parent | `qa-code-review.manifest.md` |
| Update Policy | Read before review planning; update after any review or conversation that establishes reusable QA information |
| Registry | Must be registered in the repository/company `memory/episodic` index |

# IMPORTANT — THIS MEMORY MUST BE MAINTAINED

The QA Code Review system is expected to learn from repeated reviews.

This file records **reusable facts, resources, conventions, and lessons that materially change how future QA code reviews should be performed**. It exists so an engineer or agent does not repeatedly ask for the same dataset, rediscover the same test database, use the wrong metric after the correct metric was already established, forget the target device, rerun a known-invalid evaluation approach, or lose a company-specific testing convention that the user already supplied.

This is not a general notebook and it is not a copy of every final review. The memory should remain compact, factual, and operational.

## Mandatory Read Rule

Before proposing tests for a QA code review, inspect this memory for information relevant to the analyzed code.

The following list explains the kinds of information that should be retrieved because each item can materially change the review plan:

- approved frontend test accounts and credential references;
- supported browser or device matrix;
- test/staging environment URLs and restrictions;
- Postgres or other integration-database conventions;
- migration testing and rollback policy;
- model validation datasets and test sets;
- benchmark names and exact variants;
- YOLO or other model confidence/IoU thresholds;
- target Jetson, GPU, CPU, NPU, mobile, embedded, or server hardware;
- LLM golden evaluation sets;
- RAG corpora and retrieval configurations;
- prompt-evaluation harnesses;
- required quality metrics and release gates;
- load-test SLOs;
- recurring defects and failure modes;
- preferred or prohibited test frameworks;
- reusable testing scripts.

Do not load unrelated entries into working context when the memory becomes large. Search or select the entries relevant to the current system, project, or modality.

## Mandatory Update Rule

During any QA review or discussion with the user, actively identify information that appears reusable.

If the user says something equivalent to any of the statements below, the reviewer must consider the information for episodic memory:

- “Always use this dataset to test this model.”
- “This is our staging database.”
- “These are the browsers we support.”
- “Use mAP50-95 and recall for this detector.”
- “This is the test account.”
- “For this API, 500 ms p95 is our limit.”
- “Do not use that benchmark anymore.”
- “We found Playwright retries were hiding this race.”
- “This model runs on Jetson Orin Nano.”
- “Use these 200 golden prompts whenever the extraction prompt changes.”
- “We only run destructive migrations against the cloned staging database.”

### When reuse is clear

Record or update the appropriate memory entry without forcing the user to repeat the information later.

### When reuse is uncertain

Ask the user explicitly:

> Should I retain this as a reusable QA convention or resource for future code reviews?

Do not silently assume that every conversational detail should become persistent memory.

## What Belongs in QA Episodic Memory

The sections below define the major classes of reusable information that belong here. The purpose is not to create bureaucracy; it is to preserve the exact facts that prevent wasted testing time or inconsistent QA decisions.

### Testing environments

Record:

- environment name;
- URL or host when non-secret;
- purpose;
- access method;
- restrictions;
- production-equivalence notes;
- reset or cleanup instructions.

Example:

```markdown
## Frontend staging environment

**Scope:** frontend  
**Status:** active  
**Established:** 2026-09-03  
**Source:** user instruction

### Context

Use this environment for browser and E2E validation of the web application.

### Reusable instruction/resource

- URL: `https://staging.example.internal`
- Reset: seeded nightly
- Restriction: do not run load tests against this environment

### Why it exists

The environment mirrors production authentication and API integration but has non-production test data.

### Usage

Use it for integration/E2E tests that require the real frontend/backend boundary. Do not use it for destructive or load testing.
```

### Databases

Record:

- database engine and version;
- safe test-instance reference;
- connection environment-variable name;
- schema/migration tooling;
- reset/seed procedure;
- test-data rules;
- destructive-test policy.

Do not record a raw connection password.

Example:

```markdown
## PostgreSQL integration database

**Scope:** backend/database
**Status:** active
**Established:** 2026-09-03
**Source:** project specification

### Reusable instruction/resource

- Engine: PostgreSQL 18
- Credential reference: `QA_POSTGRES_URL` in the approved local credential store
- Reset script: `.admin-local/scripts/reset-qa-db.sh`
- Rule: migrations may be applied and rolled back only on this disposable database
```

### Credentials and API access

Record only:

- credential or environment-variable name;
- approved credential-store path or secret-manager reference;
- service;
- purpose;
- environment;
- permission/scope.

**Never record the raw secret value in this Markdown.**

Example:

```markdown
## OpenAI evaluation credential

**Scope:** ai/llm
**Status:** active
**Established:** 2026-09-03
**Source:** user instruction

### Reusable instruction/resource

- Variable: `OPENAI_API_KEY`
- Location: approved QA credential store
- Use: model evaluations
- Restriction: never print, log, or copy the value into review evidence
```

### Test accounts

Record:

- account role or purpose;
- non-sensitive account identifier when safe;
- credential reference location;
- environment;
- reset requirements.

Do not record raw passwords or session tokens.

### Datasets, test sets, and golden sets

Record:

- name;
- location;
- immutable version, hash, date, or snapshot identifier;
- intended model or task;
- split;
- labeling notes;
- exclusions;
- required metrics;
- permissions or licensing restrictions.

Example:

```markdown
## Book-page detector validation set

**Scope:** ai/computer-vision
**Status:** active
**Established:** 2026-09-03
**Source:** user instruction

### Reusable instruction/resource

- Location: `s3://company-ml-evals/book-pages/validation-v4/`
- Version: `validation-v4-2026-08-14`
- Purpose: release evaluation for the page detector
- Required metrics: precision, recall, F1, mAP50, mAP50-95
- Required slices: small-page, low-light, rotated
- Rule: never train or fine-tune on this set
```

### Metrics and thresholds

Record metrics only when they are established project requirements or a reusable review convention.

Example:

```markdown
## Page detector release metrics

**Scope:** ai/computer-vision
**Status:** active
**Established:** 2026-09-03
**Source:** product requirement

### Reusable instruction/resource

- Primary metric: recall on the small-page slice
- Secondary metrics: mAP50-95 and precision
- Thresholds: record the approved values here when established

### Why it exists

The product depends on detecting small physical book pages; aggregate mAP alone can conceal a critical small-object recall regression.
```

Do not invent a threshold and then persist it as company policy.

### Benchmarks

Record:

- benchmark name;
- version or release;
- harness;
- exact task variant;
- purpose;
- model configuration;
- whether it is release-gating or informational.

Example:

```markdown
## LLM coding comparison

**Scope:** ai/llm/coding
**Status:** active
**Established:** 2026-09-03
**Source:** user instruction

### Reusable instruction/resource

- Benchmark: SWE-bench Verified
- Purpose: external coding-capability comparison
- Rule: not a substitute for the internal repository evaluation set
- Harness/version: record at each run
```

### Hardware and runtime

Record:

- target CPU, GPU, NPU, device, or board;
- RAM or VRAM constraints;
- OS/runtime;
- inference engine;
- required performance limits;
- device-test method.

This is especially important for CV, embedded AI, edge inference, and local LLM systems because a model that performs well on a desktop GPU may be unusable on the production target.

### Test frameworks and tools

Record:

- preferred framework;
- version or pinning rule;
- configuration path;
- when it should be used;
- known limitations;
- whether it is required or merely preferred.

Example:

```markdown
## Frontend E2E framework

**Scope:** frontend
**Status:** active
**Established:** 2026-09-03
**Source:** engineering standard

### Reusable instruction/resource

- Framework: Playwright
- Configuration: `playwright.config.ts`
- Rule: prefer semantic role and label locators
- Realtime testing: use WebSocket/frame inspection and observable state rather than arbitrary sleeps
```

### Reusable scripts

Record:

- script path;
- purpose;
- input/output;
- dependencies;
- side effects;
- safe environment;
- maintenance owner when known.

A script that deterministically resets a QA database or calculates a standard model metric can be much more valuable than regenerating the same command on every review.

### Known failure modes

Record recurring facts such as:

- reconnect registers a duplicate callback;
- migration fails when legacy null rows exist;
- camera v2 produces rotated frames;
- provider fallback returns a different JSON field;
- model silently truncates above the configured input size;
- queue retries can deliver messages more than once.

Explain the condition that triggers the failure and the verification future reviewers should run.

### Invalid or misleading approaches

One of the most valuable memory classes is: **we tried this and it did not prove what we thought it proved**.

Example:

```markdown
## Do not use aggregate mAP alone for the page detector

**Scope:** ai/computer-vision
**Status:** active
**Established:** 2026-09-03
**Source:** QA review finding

### Context

A detector release showed higher aggregate mAP but materially lower recall on small pages.

### Reusable instruction/resource

Always report small-page recall as a separate release slice together with aggregate mAP.

### Why it exists

The aggregate metric hid the exact failure mode that affects the production use case.

### Usage

Every future page-detector review must include the approved small-page slice.
```

## What Does Not Belong

The following list is intentionally explicit because permanent memory is a poor place for secrets, raw evidence, and one-off noise.

Do not store:

- raw API keys;
- passwords;
- bearer tokens;
- private keys;
- session cookies;
- one-time secrets;
- full production data;
- PII or sensitive user records;
- large raw logs;
- screenshots containing secrets;
- every test pass/fail;
- one-off review findings with no reusable value;
- speculative advice;
- unverified assumptions.

Raw evidence belongs in the individual review workspace, not permanent episodic memory.

## Required Memory Entry Format

Write entries as complete, human-readable operational notes. Each entry must include enough context to prevent a future reviewer from applying the resource to the wrong system.

Use this structure:

```markdown
## <Short operational title>

**Scope:** frontend | backend | database | ai | llm | cv | rl | cross-cutting  
**Status:** active | deprecated | superseded  
**Established:** YYYY-MM-DD  
**Source:** user instruction | review finding | project specification | external standard

### Context

Explain when this information applies.

### Reusable instruction/resource

State the actual resource, metric, dataset, environment, test method, or rule.

### Why it exists

Explain the evidence or rationale briefly enough that a future reviewer understands why this was retained.

### Usage

Explain how a future reviewer should apply it.

### References

Link to the relevant repository path, review ID, ticket, dataset, benchmark, or source.
```

The file may use compact tables inside an entry when they improve clarity, but an entry must never be only a cryptic label/value pair with no explanation.

## Update Existing Entries Instead of Duplicating Them

Before adding an entry:

1. search this memory for the same system, resource, dataset, model, or test convention;
2. update an existing entry when the new information supersedes or extends it;
3. do not create several slightly different entries for the same resource;
4. preserve historical rationale when changing an important rule;
5. mark obsolete information as **deprecated** or **superseded** and point to the replacement.

## Conflict Resolution

When reusable information conflicts, apply the following authority order unless the repository's governance defines another order:

1. current explicit user or technical-owner instruction;
2. current project specification;
3. current approved engineering standard;
4. current episodic-memory entry;
5. historical review note.

Do not overwrite a conflict silently. Update the entry with the new authority, date, and reason.

## Registration in the Main Episodic Memory Index

This QA memory must be registered in the company's or repository's episodic-memory index.

The conceptual location is:

```text
memory/
└── episodic/
    ├── index.md
    └── qa-code-review...
```

The exact filesystem structure may differ by repository specification. Follow the repository's memory specification when it exists.

A suitable index entry is:

```markdown
| QA Code Review | `qa-code-review.episodic-memory.md` | Reusable QA environments, datasets, benchmarks, metrics, tools, test conventions, hardware, and lessons spanning frontend, backend, database, and AI reviews. |
```

If no episodic-memory index exists, do not invent a conflicting memory architecture in the repository. Surface that registration is required and follow the project's memory authoring specification or obtain the location from the user.

## Reading Strategy When Memory Becomes Large

Do not inject the entire file into every review if the runtime supports search or targeted retrieval.

Retrieve entries using identifiers such as:

- component or system name;
- project;
- modality;
- model name;
- dataset;
- test framework;
- database;
- environment;
- hardware;
- ticket or review family.

The current review should receive only the reusable context it needs.

## Worked Examples

### Example A — The user supplies a dataset

User instruction:

> Use `book-pages-validation-v4` for every detector release. Never train on it.

The reviewer should:

- record the dataset location and version;
- record that it is release validation data;
- record the explicit rule that it must never be training data;
- record required metrics if the user defines them;
- use it for future detector reviews.

### Example B — The user supplies an API key

User instruction:

> Use this OpenAI key for evals.

The reviewer should:

- place the key only in the approved secure credential mechanism when authorized;
- record the credential reference such as `OPENAI_API_KEY` and its approved location;
- never copy the key value into the episodic memory or review report.

### Example C — The review discovers a misleading metric

Review evidence shows:

> Overall mAP improved, but small-object recall fell enough to break the product.

The reviewer should preserve a future rule requiring the small-object recall slice and reference the review that established the rule.

### Example D — A one-off local setup failure

Review evidence shows:

> `test_create_document` failed once because the local Docker daemon was stopped.

Do not add this to long-term memory unless it reveals a recurring environment setup requirement that future reviewers need to know.

## End-of-Review Memory Check

Before declaring a QA review complete, explicitly determine:

- Did the user provide a reusable environment?
- Did the user provide a dataset, validation set, or golden set?
- Did the user specify a benchmark or benchmark variant?
- Did the user establish a metric or threshold?
- Did the user specify target hardware or runtime?
- Did the user specify a testing framework or required version?
- Did the review discover a recurring failure mode?
- Did the review prove an existing test or metric is misleading?
- Did the review create a reusable test script?
- Did the review establish a restriction that future reviewers need?
- Did any existing memory entry become invalid?

If yes, update memory or ask the user whether an ambiguous item should be retained.

## Verification

The episodic memory is correctly maintained when:

- it contains only reusable QA knowledge;
- each entry explains scope and context;
- secret values are absent;
- stale entries are deprecated or superseded;
- new user-defined reusable resources are captured;
- the memory is registered in the main episodic-memory index;
- future reviewers can locate the relevant resource without rereading old review reports.
