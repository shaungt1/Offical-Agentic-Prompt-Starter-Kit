# QA Code Review — Backend Testing Instructions

| Field | Value |
|---|---|
| Document | Backend QA Code Review Instructions |
| Version | 1.0.0 |
| Parent | `qa-code-review.skill.md` |
| Scope | APIs, services, databases, migrations, queues, workers, caches, integrations, infrastructure-facing server behavior |
| Status | Active |

## Purpose

This document defines how to review backend code after the main QA skill has scanned and backtraced the change. Backend correctness is rarely proven by one unit test because backend behavior crosses contracts, persistent state, databases, concurrency, network dependencies, authentication, asynchronous jobs, resource limits, and deployment configuration.

The reviewer must identify which backend boundaries actually changed and test those boundaries directly. A database migration should be tested against a production-equivalent database and representative existing data when practical; an API should be tested for contract and authorization behavior; an asynchronous worker should be tested for retry and idempotency; a queue consumer should be tested for duplicate and malformed messages; and a performance-sensitive endpoint should be tested against explicit service goals rather than arbitrary latency numbers.

The purpose of this document is therefore not “run backend tests.” It is to explain what backend properties must be traced and which forms of evidence prove those properties.

## 1. Backtrace the Backend Request and Data Flow

Before running tests, write the complete server-side execution chain for each changed logical block.

Example:

```text
HTTP POST /documents
   |
   v
authentication
   |
   v
request validation
   |
   v
service.create_document()
   |
   +---- database transaction
   |        |
   |        +---- insert document
   |        +---- insert processing job
   |
   +---- publish queue message
   |
   v
HTTP response
```

Backtrace the path through:

- entry routes or RPC handlers;
- middleware;
- authentication;
- authorization;
- validation and serialization;
- business logic;
- database access;
- caches;
- queues and event buses;
- file/object storage;
- external services;
- model services;
- workers and callbacks;
- response serialization;
- logging, metrics, and error handling.

For asynchronous behavior, trace both producer and consumer. A queue publish is not the end of the behavior; the consumer and downstream side effects are part of the code path.

### Completion condition

The reviewer can explain the complete server-side path from external trigger through persistence and downstream side effects.

## 2. Run Existing Static and Unit Verification First

Run the repository's existing:

- build or compile;
- type checking;
- lint/static rules that detect correctness or security issues;
- unit suite;
- dependency checks when configured;
- schema/code generation checks when applicable.

Unit tests are strongest for deterministic business logic. They are weaker evidence for database, network, broker, filesystem, cloud, or concurrency semantics when those dependencies are mocked.

Do not treat formatting preferences as QA defects.

## 3. Review API Contracts Explicitly

For every changed HTTP, GraphQL, gRPC, RPC, or service interface, compare the complete contract:

```text
documented/expected contract
        |
        v
request parser / validator
        |
        v
business logic
        |
        v
response serializer
        |
        v
actual consumer expectation
```

Verify:

- method or operation;
- route, RPC, query, or mutation name;
- path parameters;
- query parameters;
- request body schema;
- field types;
- required versus optional;
- defaults;
- enum and range constraints;
- headers;
- authentication;
- response status;
- response schema;
- error schema;
- pagination;
- versioning;
- backward compatibility;
- content type;
- idempotency contract;
- timeout behavior;
- streaming behavior.

Do not inspect only the provider. Backtrace at least one material consumer whenever a breaking change is possible.

### Contract testing

Consumer-driven contract tools such as Pact can be useful when independently deployed consumers and providers must preserve interaction expectations. Pact describes contracts as executable expectations between consumers and providers; those tests do not replace the provider's own functional testing.

Reference: https://docs.pact.io/

## 4. Test Positive, Negative, and Boundary API Behavior

The matrix below defines categories that should be considered for any materially changed API. It is a selection guide, not a demand to execute irrelevant cases.

| Area | Cases to consider |
|---|---|
| Valid input | ordinary request, valid boundary values, optional fields |
| Invalid input | missing required fields, wrong types, invalid enum/range, malformed JSON |
| Authentication | anonymous, expired, invalid token/session |
| Authorization | owner vs non-owner, permitted vs forbidden role/function |
| Object access | valid ID, nonexistent ID, other user's or tenant's ID |
| Duplicate/retry | same request repeated, idempotency key repeated |
| Resource limits | oversized payload, expensive query/filter, rate-limit behavior |
| Dependency | downstream timeout, 4xx/5xx, malformed response |
| Concurrency | simultaneous operations on the same resource where relevant |

OWASP's API Security Top 10 provides current categories for API-specific risks including object-level authorization, authentication, property-level authorization, resource consumption, function-level authorization, sensitive business flows, SSRF, misconfiguration, inventory, and unsafe API consumption.

Reference: https://owasp.org/API-Security/editions/2023/en/0x11-t10/

## 5. Authentication and Authorization Review

Backtrace every security decision to the actual data and action being protected.

Verify:

- authentication occurs at the correct boundary;
- authorization checks the requested resource or operation, not just the route;
- tenant boundaries;
- user ownership;
- privileged/admin functions;
- role-based and attribute-based decisions;
- object identifiers supplied by users;
- property-level write/read permission;
- service-to-service identity;
- token and session expiry;
- impersonation or delegation if supported.

A valid 200 response for an authorized user is not enough. Attempt the operation with a user who should not be allowed to perform it.

When IDs are user-controlled, specifically test cross-user or cross-tenant access where applicable.

## 6. Input Validation and Normalization

Backtrace untrusted input before it reaches sensitive operations.

Inspect and test:

- data types;
- lengths;
- min/max;
- enum values;
- path and filenames;
- URLs;
- filters and queries;
- ORM and SQL construction;
- shell or subprocess arguments;
- templates;
- deserialization;
- uploaded files;
- archive extraction;
- webhooks;
- model-generated values used as backend inputs.

Check normalization consistency.

Example:

```text
" User@Example.com "
 -> trim?
 -> lowercase?
 -> uniqueness check?
 -> stored value?
```

If uniqueness/security depends on canonical form, validation and normalization must use the same semantics everywhere.

## 7. Database Schema and Referential Integrity

When schema, ORM, migration, or persistence code changes, inspect the **actual database rules**, not only application models.

Verify:

- primary keys;
- foreign keys;
- unique constraints;
- not-null constraints;
- check constraints;
- exclusion constraints when relevant;
- defaults;
- generated columns;
- indexes;
- cascades;
- row-level security or policies;
- data types;
- enums and domains;
- cardinality.

For PostgreSQL, the current documentation describes constraints and schema modification:
- https://www.postgresql.org/docs/current/ddl.html
- https://www.postgresql.org/docs/current/ddl-alter.html

Test invalid data that the database is expected to reject. If integrity is important, do not rely only on application validation.

### Referential-integrity questions

For each changed relationship, ask:

- Can a child exist without the parent?
- What happens when the parent is deleted?
- What happens when the parent key changes?
- Is cascade behavior intended?
- Can duplicate relationship rows exist?
- Does a uniqueness constraint reflect the real business identity?
- Does the ORM relationship match the database foreign key?
- Can legacy rows violate the new expectation?

## 8. Database Migration Testing

A migration is production code and must be treated as such.

For every material migration determine:

- starting schema/version;
- target schema/version;
- existing-data assumptions;
- expected row count/volume;
- locks acquired;
- transaction behavior;
- forward migration;
- rollback or down migration if supported;
- compatibility while old and new application versions overlap;
- backfill strategy;
- default behavior;
- index creation impact;
- column conversion behavior;
- destructive operations.

### Required migration sequence when applicable

The sequence below exists because testing only an empty database misses the exact failures that occur against production history.

1. Create or restore a representative pre-migration database.
2. Load representative existing rows, including edge cases and legacy data.
3. Apply the migration.
4. Verify schema.
5. Verify transformed data.
6. Verify constraints.
7. Run application or integration tests against the migrated database.
8. Test rollback when rollback is an operational requirement.
9. Re-apply when the release process requires forward-after-rollback confidence.
10. Evaluate lock duration or migration runtime on large tables when material.

Do not approve a production migration solely because it works on an empty database.

### Real database versus fake

Testcontainers can provide disposable real database instances in a known state. Its database-container guidance is useful when an in-memory substitute does not reproduce production database semantics.

References:
- https://testcontainers.com/
- https://java.testcontainers.org/modules/databases/

## 9. Transactions, Concurrency, and Isolation

Backtrace transaction boundaries rather than assuming the ORM handles them correctly.

Determine:

- which operations must be atomic;
- where transaction begins;
- where it commits;
- where it rolls back;
- which reads and writes can race;
- lock ordering;
- isolation level;
- serialization/deadlock retry behavior;
- whether external network calls occur inside long transactions.

Test relevant concurrency cases:

- two clients update the same record;
- read-modify-write race;
- duplicate creation;
- job claimed by two workers;
- balance or inventory decrement;
- “check then insert” uniqueness race;
- row lock held during slow external call;
- deadlock;
- serialization failure and retry.

PostgreSQL documents explicit locks and deadlocks and recommends consistent lock ordering to reduce deadlock risk:
https://www.postgresql.org/docs/current/explicit-locking.html

Do not assume a unit test using a mocked repository proves transaction correctness.

## 10. Asynchronous Jobs and Workers

Backtrace the complete job lifecycle:

```text
producer
 -> queue payload
 -> broker
 -> consumer
 -> processing
 -> side effect
 -> acknowledgement
```

Verify:

- payload schema and version;
- serialization;
- required fields;
- duplicate message;
- out-of-order message;
- malformed or poison message;
- retry count;
- retry backoff;
- dead-letter handling;
- idempotency;
- partial side effect before failure;
- worker restart;
- acknowledgement semantics;
- visibility timeout or lease;
- observability.

The critical question is:

> What happens if the exact same message is processed twice?

If duplicate processing can charge twice, insert twice, email twice, delete twice, provision twice, or corrupt state, the review must prove how duplicates are prevented or tolerated.

## 11. Webhooks and External Callbacks

Webhooks are untrusted network inputs and frequently use at-least-once delivery.

Verify:

- signature or authentication;
- timestamp/replay protection when applicable;
- schema validation;
- unknown event types;
- duplicate delivery;
- out-of-order delivery;
- retry behavior;
- idempotency;
- fast acknowledgement versus long-running processing;
- downstream failure;
- safe logging.

Test duplicate delivery because many providers do not guarantee exactly-once execution.

## 12. Server-Side WebSockets, SSE, and Streaming

For server realtime behavior test:

- connection authentication;
- subscription authorization;
- handshake;
- client disconnect;
- server disconnect;
- malformed frame/message;
- oversized message;
- rate/resource consumption;
- broadcast targeting;
- tenant isolation;
- reconnect and session semantics;
- heartbeat and timeout;
- cleanup;
- duplicate subscription;
- backpressure;
- server restart.

If both client and server changed, coordinate with `qa-code-review.frontend.md` and prove the actual boundary.

## 13. Cache Review

Backtrace the cache against the source of truth:

```text
source of truth
 -> cache lookup
 -> miss
 -> populate
 -> read
 -> write/change
 -> invalidation
 -> expiry
```

Test relevant states:

- cold cache;
- warm cache;
- stale entry;
- invalidation after write;
- concurrent cache fill;
- serialization/version change;
- key collision;
- tenant/user key scoping;
- cache outage;
- fallback to source;
- negative caching;
- TTL expiry.

A cache optimization becomes a correctness or security problem when stale or cross-user data can be served.

## 14. External Services and APIs

For each changed external dependency identify its contract and failure behavior.

Test or simulate:

- successful response;
- timeout;
- DNS/connection failure;
- 4xx;
- 429 rate limit;
- 5xx;
- malformed body;
- unexpected schema;
- partial response;
- slow response;
- retry;
- fallback;
- circuit breaker when implemented.

Check whether retries are safe. Retrying an idempotent lookup is very different from retrying an order, payment, email, or account-creation call.

Do not let integration tests silently call production services.

## 15. Error Handling and Recovery

Backtrace every changed `try/catch`, exception handler, error middleware, result type, retry handler, and failure callback.

Verify:

- errors are not silently swallowed;
- client receives an appropriate response;
- internal details and secrets are not leaked;
- partial transactions roll back;
- failed jobs are visible and recoverable;
- retryable and terminal errors are distinguished;
- cleanup occurs;
- logging provides enough context;
- alerts and metrics exist when the system requires them.

A broad handler such as `except Exception: return None` can convert a visible failure into silent corruption. Inspect what the caller does with that `None`.

## 16. Configuration, Environment, and Secrets

Review every changed configuration boundary:

- environment variables;
- defaults;
- required versus optional;
- dev/test/staging/prod differences;
- secret references;
- startup validation;
- feature flags;
- URLs and ports;
- TLS/certificate requirements;
- config reload behavior;
- fallback defaults.

Test startup with missing required configuration when that behavior changed.

Never place raw secrets in source, review reports, logs, screenshots, or episodic memory.

## 17. Observability as QA Evidence

For distributed backend behavior, return values alone may not show what actually occurred.

Use existing logs, traces, and metrics when available to verify:

- service-to-service calls;
- database operations;
- queue publication and consumption;
- retries;
- exception paths;
- latency;
- state transitions;
- request correlation.

OpenTelemetry semantic conventions provide common naming and structure for traces, metrics, logs, HTTP, database, messaging, RPC, and exceptions:
- https://opentelemetry.io/docs/concepts/semantic-conventions/
- https://opentelemetry.io/docs/specs/semconv/general/trace/

Do not add instrumentation solely to satisfy this review unless the lack of observability is itself an engineering gap requiring correction.

## 18. Performance and Load Testing

Run load or performance tests when the change can materially affect latency, throughput, resource consumption, concurrency, or an explicit SLO.

Define the claim first.

Examples:

- p95 or p99 latency at expected load;
- throughput;
- error rate;
- queue lag;
- database query latency;
- connection pool saturation;
- CPU;
- memory;
- model inference latency;
- rate-limit behavior.

k6 supports thresholds that encode pass/fail criteria for metrics such as latency percentiles and error rates:
- https://grafana.com/docs/k6/latest/using-k6/thresholds/
- https://grafana.com/docs/k6/latest/testing-guides/

Use project SLOs or justified acceptance requirements. Do not copy arbitrary public numbers and call them company gates.

Begin with a small smoke load to validate the script before stressing a shared environment.

## 19. Contract Testing

Use contract testing when independently deployed components depend on a stable interaction contract.

Contract-sensitive changes include:

- field removal or rename;
- type change;
- enum change;
- status change;
- request shape;
- response shape;
- asynchronous event schema;
- message version.

A useful contract test encodes what the real consumer expects and verifies the provider can satisfy it.

Pact reference: https://docs.pact.io/

Contract tests do not replace internal provider tests or end-to-end validation.

## 20. Test Environment Strategy

Prefer the closest safe environment to production semantics.

A real disposable dependency often provides stronger evidence than an in-memory fake for:

- PostgreSQL/MySQL/Mongo;
- Redis;
- Kafka/RabbitMQ/NATS;
- object stores;
- search engines.

Testcontainers can provide repeatable containerized dependencies:
https://testcontainers.com/getting-started/

Mocks remain useful for:

- deterministic failure injection;
- rare responses;
- unit isolation.

When a fake differs materially from production, state the limitation.

## 21. Infrastructure and Deployment-Facing Changes

When backend work includes Docker, Kubernetes, cloud configuration, deployment scripts, CI/CD, or service startup, verify:

- syntax and validation;
- build/image creation;
- dependency versions;
- ports and network;
- health/readiness;
- environment and secret references;
- filesystem permissions;
- startup and shutdown;
- migration order;
- rolling-version compatibility;
- resource requirements when applicable;
- deployment rollback path;
- logs and metrics after startup.

A service that works locally but cannot start under the actual deployment configuration is a release-blocking defect.

## 22. IoT and Firmware Interfaces

When backend code communicates with firmware or devices, the review must identify the hardware-specific boundary.

At minimum determine:

- target MCU, board, or device;
- build toolchain or firmware version;
- protocol;
- message format;
- byte order and encoding;
- timing constraints;
- memory/flash limits when firmware changes are involved;
- interrupt or concurrency behavior;
- watchdog/recovery;
- OTA/update and rollback;
- power-loss behavior;
- hardware-in-the-loop or simulator availability.

For server/device boundary changes, test the encoded payload and the real consumer/producer when hardware or a validated simulator is available.

Deep embedded QA may justify a later dedicated document. Until then, explicitly identify hardware claims that remain unverified by server-only testing.

## 23. Backend Security Review

Use security references after the backtrace identifies the actual attack surface. Do not turn security review into a generic checkbox list detached from the changed code.

Primary sources:

- OWASP Code Review Guide: https://owasp.org/www-project-code-review-guide/
- OWASP API Security Top 10: https://owasp.org/API-Security/

Review changed behavior for:

- authentication;
- authorization;
- injection;
- SSRF;
- unsafe deserialization;
- secret exposure;
- sensitive logging;
- resource exhaustion;
- unsafe file paths;
- unsafe uploads/archive extraction;
- insecure defaults;
- third-party trust assumptions;
- excessive data exposure.

## 24. Backend Finding Classification

### Critical backend examples

Use Critical when evidence proves a production-breaking or security/data-integrity defect such as:

- broken authorization;
- migration corrupts or loses existing data;
- transaction can double-charge or double-create;
- API breaking change affects current consumer;
- service cannot start or deploy;
- queue retry duplicates a destructive side effect;
- secret exposure;
- injection path;
- concurrency defect corrupts required state;
- cross-tenant cache or data leakage.

### Corrective backend examples

Examples include:

- weak retry/backoff;
- missing negative integration test for a meaningful path;
- error lacks enough observability;
- inefficient locking can become a scale problem;
- validation should be reinforced with a database constraint;
- recoverable dependency failure has poor diagnostics.

### Optimization backend examples

Examples include:

- index or query improvement when current behavior is correct;
- caching improvement;
- connection reuse;
- refactor;
- optional expanded load testing;
- resource reduction.

## 25. Evidence Required in the Final Backend Review

The final QA review should identify, when applicable:

- runtime and framework versions;
- database and version;
- test environment;
- API requests and responses;
- migration results;
- data-integrity checks;
- transaction and concurrency evidence;
- queue and webhook behavior;
- contract results;
- observability evidence;
- performance results;
- integration dependencies that were real versus mocked;
- blocked or unavailable tests.

## Worked Example — Asynchronous Document Processing

Suppose the changed code includes:

```text
POST /documents/{id}/analyze
analysis_service.py
analysis_jobs table
worker.py
```

The backtrace should reveal:

```text
request
 -> authorization
 -> validate document
 -> DB transaction
     -> set status queued
     -> create job row
 -> publish queue message
 -> worker claims message
 -> set running
 -> process
 -> set completed or failed
```

A robust backend review then tests, when applicable:

1. valid authorized request;
2. unauthorized document access;
3. nonexistent document;
4. duplicate request;
5. database failure before publish;
6. publish failure after database operation;
7. duplicate queue message;
8. worker crash after partial work;
9. retry;
10. final state consistency;
11. failure observability.

That evidence is materially stronger than “endpoint returns 202.”

## Sources

The sources below provide deeper implementation detail when the corresponding backend behavior is present.

- OWASP API Security Top 10: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP Code Review Guide: https://owasp.org/www-project-code-review-guide/
- PostgreSQL Data Definition and Constraints: https://www.postgresql.org/docs/current/ddl.html
- PostgreSQL Modifying Tables: https://www.postgresql.org/docs/current/ddl-alter.html
- PostgreSQL Locking and Deadlocks: https://www.postgresql.org/docs/current/explicit-locking.html
- Testcontainers: https://testcontainers.com/
- Testcontainers Database Containers: https://java.testcontainers.org/modules/databases/
- Pact Contract Testing: https://docs.pact.io/
- pytest Parametrization: https://docs.pytest.org/en/stable/how-to/parametrize.html
- OpenTelemetry Semantic Conventions: https://opentelemetry.io/docs/concepts/semantic-conventions/
- OpenTelemetry Trace Semantic Conventions: https://opentelemetry.io/docs/specs/semconv/general/trace/
- k6 Thresholds: https://grafana.com/docs/k6/latest/using-k6/thresholds/
- k6 Testing Guides: https://grafana.com/docs/k6/latest/testing-guides/
