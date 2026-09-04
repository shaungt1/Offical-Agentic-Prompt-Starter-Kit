---
type: implicit-memory
version: "1.0"
mutable: true
agent_writable: true
human_editable: true
persistence: long-term
status: active
---

# Implicit Memory Store

> **Dynamic resource. This file is intended to change over time.**

This file contains active implicit-memory records when the system operates in **file-backed mode**.

When a database or memory service is authoritative, this file may instead be a synchronized human-readable projection or index. The host must not allow the file and database to evolve independently as competing sources of truth.

Operational behavior: `implicit-memory.instructions.md`  
Normative format: `../../agent-specifications/Specs/implicit-memory.specification.md`

---

## Storage Rules

1. Store only future-useful, adequately grounded conclusions.
2. Do not store raw transcripts here.
3. Do not invent numerical confidence scores.
4. Keep conclusions scoped to the evidence supporting them.
5. Include an actionable future consequence whenever one exists.
6. Update existing records instead of creating near-duplicates.
7. Qualify conclusions when meaningful exceptions appear.
8. Supersede or remove conclusions that should no longer guide behavior.
9. Do not retain user-revoked information as active memory.
10. Keep the store readable by humans and agents.

---

# Active Implicit Memories

_No implicit-memory records have been added yet._

Use the structure below unless the normative specification defines a newer required form.

<!--
## <Concise Memory Title>

**ID:** <stable-id>
**Kind:** <preference | strategy | derived-fact | behavioral-default | failure-avoidance | environmental | contextual | other>
**Scope:** <where this conclusion applies>
**Status:** active
**Created:** <ISO-8601 timestamp if available>
**Updated:** <ISO-8601 timestamp if available>
**Supersedes:** <optional prior memory ID>

### Conclusion

<What was learned?>

### Applies When

<What future condition makes this relevant?>

### Action

<What should the agent do differently when it applies?>

### Exceptions

<When should this conclusion not be applied?>

### Reconsider When

<What evidence, event, change, or expiry should cause review?>

### Basis

<Concise explanation of the evidence, observations, episodes, tool results,
or reflection that support this conclusion. Reference source IDs when available.>

### Related

<Optional related memories, episodes, evidence, files, or specifications.>
-->

---

# Superseded / Retired Records

In small file-backed deployments, superseded records may be moved here when an audit trail is required.

They must not be returned during normal active-memory retrieval.

In database-backed deployments, historical records should normally be maintained through the persistence layer rather than duplicated here.
