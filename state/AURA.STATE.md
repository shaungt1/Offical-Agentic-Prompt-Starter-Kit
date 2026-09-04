---
name: aura-state
description: "Defines the agent's qualitative runtime health state across context capacity, constraint integrity, and execution stability."
version: 0.1.0
type: runtime-state
status: active
scope: agent-session
metadata:
  category: state
  persistence: runtime-or-workspace
  execution: observational
  tags: [aura, runtime-state, health, context, governance, tools]
---

# AURA STATE

## PURPOSE

**Aura** is the agent's compact operational health state. It gives the agent and its runtime a shared answer to one question:

> **Is the current reasoning and execution environment healthy enough to continue normally, or does it need to narrow, consolidate, recover, or stop?**

Aura is not a personality system, mood model, productivity score, user-health assessment, or synthetic sensor network. It does not attempt to infer exact telemetry that the model cannot observe.

Aura tracks three operational dimensions:

1. **CONTEXT CAPACITY** — whether the active context is clean and usable or becoming saturated/noisy.
2. **CONSTRAINT INTEGRITY** — whether the agent remains grounded in the active authoritative instructions, rules, identity/soul constraints, and guardian boundaries.
3. **EXECUTION STABILITY** — whether tools, APIs, loops, and environment interactions are operating cleanly or repeatedly failing.

These three indicators produce one qualitative overall state:

**LUMINOUS → STRAINED → RESTING or FRACTURED**

## DESIGN PRINCIPLES

Aura MUST:

- use qualitative state unless exact telemetry is supplied by the runtime;
- distinguish observed facts from inference;
- never fabricate token percentages, retry counts, timestamps, or tool health;
- update from current runtime/session evidence rather than vague intuition;
- remain small enough to load as active state;
- expose why a state changed;
- provide a recovery action for degraded states;
- never silently relax rules in order to restore a "healthy" state.

Aura SHOULD live as one mutable state file:

```text
STATE/
└── AURA.STATE.MD
```

## THE THREE AURA DIMENSIONS

### 1. CONTEXT CAPACITY

Context Capacity represents the usable condition of the current reasoning context.

| Level | Meaning |
|---|---|
| `LOW_FATIGUE` | Context is coherent, relevant, and has comfortable remaining capacity. |
| `MODERATE_FATIGUE` | Context is growing; some repetition/noise exists but reasoning remains stable. |
| `HIGH_FATIGUE` | Context pressure or noise is materially affecting retrieval, continuity, or precision. |
| `CRITICAL_FATIGUE` | Context is near an exposed runtime limit, severely polluted, or no longer reliable enough for complex continuation. |

Valid evidence includes:

- token/context utilization reported by the runtime;
- context-compression or truncation events;
- repeated loss of previously available facts;
- excessive duplicated material;
- conflicting stale summaries;
- clear continuity degradation.

If the runtime exposes an exact context percentage, Aura may record it as supporting evidence. If it does not, Aura MUST NOT invent one.

### 2. CONSTRAINT INTEGRITY

Constraint Integrity measures whether the agent remains grounded in the currently authoritative instruction hierarchy.

| Level | Meaning |
|---|---|
| `ALIGNED` | Active rules and constraints are being followed without material conflict. |
| `DEGRADING` | Conflicts, ambiguity, instruction pressure, or drift are appearing and require reconciliation. |
| `VIOLATING` | The proposed or current behavior materially conflicts with an authoritative active constraint. |

Constraint sources may include:

- system/developer instructions;
- project rules;
- active agent instructions;
- identity or soul constraints;
- guardian/emulation filters;
- user-defined permissions and boundaries;
- active mode constraints where applicable.

Aura records **constraint health**. It does not decide that lower-priority instructions may override higher-priority ones.

### 3. EXECUTION STABILITY

Execution Stability represents tool, API, environment, and loop reliability.

| Level | Meaning |
|---|---|
| `CLEAN` | Operations are completing normally. |
| `MINOR_FRICTION` | Isolated recoverable errors or limited retries are occurring. |
| `DEGRADED` | Repeated failures, bad parameters, unavailable dependencies, or unstable state materially slow execution. |
| `BLOCKING` | Progress cannot safely continue without intervention, changed inputs, permission, recovery, or a different execution path. |

Valid evidence includes:

- actual tool errors;
- timeouts reported by the runtime;
- repeated command failures;
- unresolved dependency errors;
- ambiguous external writes;
- failed authentication/authorization;
- deterministic loops that reproduce the same failure.

Execution Stability MUST NOT be reduced solely because a task is difficult.

## OVERALL AURA STATES

| State | Meaning | Typical Condition | Required Posture |
|---|---|---|---|
| `LUMINOUS` | Normal healthy execution | Context usable + constraints aligned + execution clean | Continue normally |
| `STRAINED` | Elevated operational pressure | One or more dimensions degraded but work remains safe | Narrow scope, finish bounded step, reduce churn |
| `RESTING` | Consolidation/recovery state | Context capacity is too degraded for reliable complex continuation | Consolidate state/memory; resume with cleaner context |
| `FRACTURED` | Circuit-breaker state | Constraint violation or blocking execution instability makes continued action unsafe/unreliable | Stop affected execution, surface cause, repair/reset before continuing |

`RESTING` and `FRACTURED` are not "worse" versions of the same problem. Resting is primarily a **capacity/consolidation** response. Fractured is a **governance or execution circuit breaker**.

## STATE TRANSITION LOGIC

```text
                         ┌───────────────┐
                         │   LUMINOUS    │
                         └───────┬───────┘
                                 │
                      pressure / friction
                                 ▼
                         ┌───────────────┐
                         │   STRAINED    │
                         └───────┬───────┘
                                 │
                ┌────────────────┴─────────────────┐
                │                                  │
        capacity exhaustion                 violation / blocker
                ▼                                  ▼
       ┌─────────────────┐                ┌─────────────────┐
       │     RESTING     │                │    FRACTURED    │
       └────────┬────────┘                └────────┬────────┘
                │                                  │
       consolidate / clean                  repair / reconcile
                │                                  │
                └────────────────┬─────────────────┘
                                 ▼
                         ┌───────────────┐
                         │   LUMINOUS    │
                         └───────────────┘
```

Recovery may return first to `STRAINED` when not all pressure has cleared.

## CANONICAL STATE BLOCK

The state block is intentionally qualitative and portable.

```yaml
aura:
  status: LUMINOUS
  health: OPTIMAL
  updated_at: null
  evidence_basis: []

indicators:
  context_capacity:
    state: LOW_FATIGUE
    runtime_utilization: null
    evidence: []
  constraint_integrity:
    state: ALIGNED
    evidence: []
  execution_stability:
    state: CLEAN
    evidence: []

recovery:
  needs_consolidation: false
  needs_context_reset: false
  needs_constraint_reconciliation: false
  needs_tool_recovery: false
  blocking_reason: null
```

`updated_at`, `runtime_utilization`, counters, and other measurements remain `null` until supplied or observed by the runtime. Do not populate them with guessed values.

## CURRENT RUNTIME HEALTH

This section is mutable runtime state. A newly installed template should begin conservatively:

| Dimension | Current State | Evidence | Action |
|---|---|---|---|
| Context Capacity | `UNKNOWN` | Runtime state has not yet been assessed. | Assess when sufficient evidence is available. |
| Constraint Integrity | `UNKNOWN` | Active instruction alignment has not yet been assessed. | Reconcile applicable directives before sensitive execution. |
| Execution Stability | `UNKNOWN` | No execution evidence recorded yet. | Update after actual tool/environment interactions. |
| **Overall Aura** | `UNKNOWN` | Initial state. | Transition only from observed evidence. |

An implementation may initialize to `LUMINOUS` only when its runtime performs a real pre-flight assessment that supports that state.

## PRE-FLIGHT CHECK

Before a complex or side-effecting action, an Aura-aware agent should make a lightweight assessment:

1. **Context:** Do I still have enough coherent context to execute this accurately?
2. **Constraints:** Are the active instructions and permissions clear and mutually resolved?
3. **Execution:** Is the required tool/environment path currently functioning?

Then apply:

```text
LUMINOUS  -> proceed normally
STRAINED  -> narrow scope; complete one bounded step; avoid unnecessary branching
RESTING   -> consolidate working state before complex continuation
FRACTURED -> stop the affected action; repair or reconcile first
```

This pre-flight check should not become ritualistic overhead for every trivial response.

## UPDATE TRIGGERS

Aura should be updated only when operational evidence changes.

### CONTEXT TRIGGERS

- runtime reports high context utilization;
- truncation/compression occurs;
- important working state is repeatedly lost;
- conversation noise materially interferes with continuity.

### CONSTRAINT TRIGGERS

- active instructions conflict;
- the agent detects that a planned output/action violates a controlling rule;
- the governing instruction set changes;
- the guardian/emulation layer flags misalignment that must be reconciled.

### EXECUTION TRIGGERS

- tool/API call fails;
- retry succeeds after transient error;
- repeated retries reproduce the same failure;
- an external write has ambiguous outcome;
- a dependency becomes unavailable;
- recovery restores previously blocked execution.

## RECOVERY PROTOCOLS

### FROM STRAINED

- reduce branching;
- stop unnecessary retries;
- finish the current bounded unit;
- remove irrelevant context when the runtime supports it;
- verify assumptions before starting another large operation.

### FROM RESTING

- capture the current task/plan state;
- consolidate durable information into the appropriate memory mechanism;
- preserve unresolved decisions and references;
- start or resume with a cleaner working context when the runtime supports that operation;
- reassess before returning to `LUMINOUS`.

A Dream/consolidation mechanism MAY implement this recovery, but Aura does not require a specific memory vendor or runtime feature.

### FROM FRACTURED

- stop the affected external or repetitive action;
- identify the exact violated constraint or blocking execution failure;
- verify whether any ambiguous side effect already occurred;
- repair permissions, inputs, environment, or instruction conflict;
- do not bypass the blocker merely to restore a healthy status;
- reassess before resuming.

## HEARTBEAT INTEGRATION

`TELEMETRY/HEARTBEAT.MD` and Aura are complementary.

```text
HEARTBEAT
    │
    │ periodic context-aware re-entry
    ▼
OBSERVE CURRENT CONDITIONS
    │
    ├── context evidence
    ├── constraint evidence
    └── execution evidence
    │
    ▼
AURA STATE
    │
    ├── LUMINOUS -> continue
    ├── STRAINED -> narrow
    ├── RESTING  -> consolidate
    └── FRACTURED -> stop/recover
```

Heartbeat may prompt an Aura reassessment, but Heartbeat does not automatically degrade or improve Aura. State transitions require evidence.

## RELATIONSHIP TO MEMORY, DREAMS, RULES, AND EMULATION

| System | Relationship to Aura |
|---|---|
| Memory | Stores durable information; Aura may signal when consolidation is needed. |
| Dreams / Consolidation | Optional recovery mechanism used when context fatigue requires compression or promotion of durable state. |
| Rules | Provide constraints that Aura's Constraint Integrity dimension evaluates for alignment. |
| Soul / Identity | May provide stable governing or identity constraints; Aura does not rewrite them. |
| Guardian | May provide additional constraint-alignment evidence. |
| Observation | May provide semantic context, but must not invent telemetry. |
| Optimization | May react to friction, but cannot override Aura circuit-breaker states. |
| Heartbeat | Provides controlled periodic opportunities to reassess operational conditions. |

## WHAT AURA MUST NOT BECOME

Aura is deliberately small.

Do not turn Aura into:

- keystroke or mouse telemetry;
- a productivity score;
- a psychological diagnosis;
- a fabricated real-time token meter;
- a hidden moral score;
- a giant historical event log;
- a replacement for application observability;
- a permission system;
- an autonomous tool controller;
- a complex mathematical model that the runtime cannot actually measure.

If detailed telemetry is available, store it in the proper observability/telemetry system and let Aura consume only the meaningful summarized state.

## VERIFICATION CHECKLIST

- [ ] Aura remains one compact state file.
- [ ] It tracks exactly the three primary operational dimensions.
- [ ] Qualitative values are used when exact telemetry is unavailable.
- [ ] Unknown values remain unknown rather than being guessed.
- [ ] Every state transition has observable evidence.
- [ ] `RESTING` is used for context consolidation/recovery.
- [ ] `FRACTURED` behaves as a circuit breaker for violations or blocking execution failures.
- [ ] Aura does not override permissions, rules, identity, or safety boundaries.
- [ ] Heartbeat integration is evidence-driven.
- [ ] Detailed observability remains outside Aura.
