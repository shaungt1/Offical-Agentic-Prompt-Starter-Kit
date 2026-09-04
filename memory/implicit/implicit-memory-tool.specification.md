# Implicit Memory Tool Specification
## Retrieval, Persistence, Revision, and Audit Interface

**Status:** Implementation specification  
**Version:** 1.0  
**Placeholder used by agent instructions:** `[IMPLICIT_MEMORY_TOOL]`  
**Subsystem:** `../IMPLICIT_MEMORY.md`  
**Operational instructions:** `../implicit-memory.instructions.md`  
**Normative memory format:** `../../agent-specifications/specs/implicit-memory.specification.md`

---

# 1. Purpose

`[IMPLICIT_MEMORY_TOOL]` is the persistence and retrieval interface for the Implicit Memory subsystem.

The model decides **whether something is worth learning and what it means**.

The tool decides **how that decision is safely stored, retrieved, changed, deleted, synchronized, and traced**.

The tool must not require the model to fabricate numerical confidence scores.

---

# 2. Required Operations

A conforming implementation should expose these conceptual operations:

```text
retrieve
get
add
update
supersede
remove
```

Optional operations:

```text
list
audit
sync
attach_evidence
```

The host may use different function names, but the adapter must preserve these semantics.

---

# 3. `retrieve`

## Purpose

Return the smallest useful set of active implicit memories relevant to the current situation.

## Conceptual input

```yaml
query: "<natural-language description of the current request or decision>"
scope:
  user: "<optional>"
  project: "<optional>"
  domain: "<optional>"
  task: "<optional>"
  mode: "<optional>"
limit: "<host-selected reasonable limit>"
include_superseded: false
```

## Required behavior

- search active implicit memories;
- consider semantic relevance;
- apply structural scope filters where available;
- exclude superseded, retired, or deleted entries by default;
- preserve stable record IDs;
- return actionable fields including `applies_when`, `action`, and `exceptions`;
- avoid returning unrelated memories merely because their wording is similar.

Retrieval may use Markdown search, relational full-text search, vector similarity, graph-assisted retrieval, or a hybrid method.

Hybrid retrieval is recommended at scale because semantic similarity and exact scope filters solve different problems.

---

# 4. `get`

Retrieve one complete record by stable ID.

```yaml
id: "<memory-id>"
```

Return the full current record and change metadata when available.

---

# 5. `add`

Create a new active implicit-memory record.

```yaml
record:
  title: "<concise title>"
  kind: "<record kind>"
  scope: "<scope>"
  conclusion: "<what was learned>"
  applies_when: "<activation condition>"
  action: "<future behavioral consequence>"
  exceptions: "<conditions where it should not apply>"
  reconsider_when: "<review triggers>"
  basis: "<why this conclusion exists>"
  related: []
  source_refs: []
```

Before persistence, verify that the record is valid, non-duplicate, and appropriately scoped.

---

# 6. `update`

Revise an existing record while preserving its stable identity.

```yaml
id: "<memory-id>"
changes:
  "<field>": "<new value>"
reason: "<why the memory is changing>"
source_refs: []
```

Preserve change traceability when the host supports it.

Typical updates include narrowing scope, changing an action, adding an exception, correcting a conclusion, or improving provenance.

---

# 7. `supersede`

Replace an older conclusion with a materially different current conclusion while preserving lineage.

```yaml
old_id: "<existing-memory-id>"
replacement:
  title: "<title>"
  kind: "<kind>"
  scope: "<scope>"
  conclusion: "<new conclusion>"
  applies_when: "<activation>"
  action: "<action>"
  exceptions: "<exceptions>"
  reconsider_when: "<review triggers>"
  basis: "<basis>"
reason: "<why the old conclusion no longer governs>"
source_refs: []
```

Required behavior:

1. create the replacement;
2. mark the old record superseded;
3. link old and new IDs in both directions;
4. exclude the old record from normal retrieval.

---

# 8. `remove`

Delete or retire a record.

```yaml
id: "<memory-id>"
reason: "<why it is being removed>"
mode: "<delete | retire>"
```

### Delete
Use when policy or explicit user instruction requires removal. The record must not remain retrievable through vector indexes, caches, or audit copies in violation of deletion requirements.

### Retire
Use when the memory should stop affecting behavior but legitimate historical trace may remain.

---

# 9. Optional `attach_evidence`

Associate supporting, contradicting, or qualifying evidence with a memory.

```yaml
memory_id: "<id>"
evidence:
  type: "<user-statement | episode | file | tool-result | external-source | outcome | reflection | other>"
  reference: "<source ID or URI if available>"
  summary: "<what the evidence contributes>"
  relation: "<supports | contradicts | qualifies | supersedes>"
```

Simple file-backed deployments may keep the evidence summary directly in `Basis` instead.

---

# 10. Optional `audit`

Return or record meaningful lifecycle events:

```text
created
updated
qualified
superseded
retired
deleted
```

Logging every retrieval is optional and may create unnecessary volume.

If application telemetry is stored, prioritize meaningful events such as corrected application, contradictory outcome, or use in a major decision.

---

# 11. File-Backed Mode

For small deployments, operate directly on:

```text
memory/implicit/implicit.memory.md
```

Recommended mutation sequence:

```text
read current file
    ↓
parse records
    ↓
apply one explicit operation
    ↓
validate
    ↓
write temporary file
    ↓
atomic replace
```

Avoid blind string replacement when structured parsing is available.

---

# 12. Database-Backed Mode

For larger deployments, use a relational database as the authoritative store, optionally combined with a vector index for semantic retrieval.

## Suggested table: `implicit_memory`

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | UUID / text | Stable identifier |
| `title` | text | Human-readable short name |
| `kind` | text | Preference, strategy, derived fact, etc. |
| `scope_json` | JSON/JSONB | User/project/task/domain scope |
| `conclusion` | text | What was learned |
| `applies_when` | text | Activation condition |
| `action` | text | Behavioral consequence |
| `exceptions` | text | When not to apply |
| `reconsider_when` | text | Review triggers |
| `basis` | text | Grounding summary |
| `status` | text | `active`, `superseded`, `retired` |
| `supersedes_id` | UUID/text nullable | Prior record |
| `superseded_by_id` | UUID/text nullable | Replacement record |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last revision |
| `created_by` | text nullable | Actor/process |
| `updated_by` | text nullable | Actor/process |

A vector embedding may be stored separately or in a connected vector system, but the embedding is not the semantic source of truth.

---

# 13. Suggested Evidence Table

```text
implicit_memory_evidence
```

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | UUID/text | Evidence ID |
| `memory_id` | UUID/text | Related memory |
| `evidence_type` | text | User statement, episode, tool result, etc. |
| `source_ref` | text nullable | Source identifier |
| `summary` | text | Concise contribution |
| `relation` | text | Supports, contradicts, qualifies, supersedes |
| `observed_at` | timestamp nullable | When observed |
| `created_at` | timestamp | When attached |

Prefer source references over copying sensitive raw material when possible.

---

# 14. Suggested Change-History Table

```text
implicit_memory_history
```

| Column | Suggested type | Purpose |
|---|---|---|
| `id` | UUID/text | History event |
| `memory_id` | UUID/text | Memory affected |
| `operation` | text | Add, update, supersede, retire, remove |
| `before_json` | JSON/JSONB nullable | Previous representation |
| `after_json` | JSON/JSONB nullable | New representation |
| `reason` | text | Why change occurred |
| `source_refs_json` | JSON/JSONB | Supporting references |
| `actor` | text nullable | Agent/user/process |
| `created_at` | timestamp | Operation time |

Deletion policy must override audit retention when required.

---

# 15. Indexing and Retrieval Safety

Typical relational indexes:

```text
status
kind
updated_at
supersedes_id
```

Index frequently queried scope properties.

For semantic retrieval, embed useful fields such as title, conclusion, scope, activation, and action.

Do not retrieve solely by vector similarity. A semantically similar memory from the wrong user, project, or scope must never be applied.

---

# 16. Source of Truth

Choose one authoritative mode.

## File authoritative
`implicit.memory.md` is authoritative. Search indexes and databases are derived.

## Database authoritative
The database is authoritative. `implicit.memory.md` is a generated projection or export.

Do not allow both to accept unsynchronized independent writes.

---

# 17. Synchronization

When the database is authoritative and a Markdown projection is maintained:

1. commit the database mutation;
2. regenerate or patch the Markdown projection;
3. report projection failure separately;
4. mark stale projections clearly.

---

# 18. Tool Response Contract

Mutating operations should return:

```yaml
success: true
operation: "<operation>"
memory_id: "<id>"
status: "<active | superseded | retired | deleted>"
message: "<concise result>"
```

Failures should return:

```yaml
success: false
error_code: "<stable code>"
message: "<human-readable explanation>"
retryable: true
```

The model must not infer success from silence.

---

# 19. Required Failure Handling

Handle at least:

- unknown ID;
- duplicate add;
- validation failure;
- unavailable persistence;
- file write conflict;
- database transaction failure;
- concurrent/stale update;
- unauthorized write;
- deletion restriction;
- synchronization failure;
- malformed record.

Optimistic versioning or equivalent conflict detection is recommended where concurrent writes are possible.

---

# 20. Security and Privacy

Treat implicit memory as persistent user or project data.

Implement:

- access control;
- user/project isolation;
- deletion;
- export where required;
- sensitive-data handling;
- encryption according to host requirements;
- protection against cross-user retrieval.

Semantic similarity must never bypass authorization scope.

---

# 21. Placeholder Binding

Until an implementation exists, agent instructions refer to:

```text
[IMPLICIT_MEMORY_TOOL]
```

The application developer must bind that placeholder to the actual host tool.

Example adapter mappings:

```text
[IMPLICIT_MEMORY_TOOL.retrieve]  → memory_search(...)
[IMPLICIT_MEMORY_TOOL.add]       → memory_create(...)
[IMPLICIT_MEMORY_TOOL.update]    → memory_update(...)
[IMPLICIT_MEMORY_TOOL.supersede] → memory_supersede(...)
[IMPLICIT_MEMORY_TOOL.remove]    → memory_delete(...)
```

These names are examples only.

---

# 22. Minimum Conformance

A minimal implementation can:

```text
retrieve relevant active memory
add
update
supersede
remove or retire
preserve stable identity
exclude superseded memory from normal retrieval
report success or failure truthfully
```

Everything beyond this is an enhancement.

---

# 23. Design Principle

> **The model determines meaning. The tool manages state.**

Do not move semantic judgment into persistence code unless the host deliberately adds a separate evaluator.
