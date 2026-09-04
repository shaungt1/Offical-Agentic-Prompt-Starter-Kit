---
name: heartbeat
description: "Defines a recurring, context-aware runtime pulse that re-enters an active agent session to perform a bounded check without interrupting current work."
version: 0.1.0
type: runtime-instruction
status: active
scope: session
metadata:
  category: telemetry
  persistence: runtime-dependent
  execution: runtime-triggered
  tags: [heartbeat, session, recurring-check, telemetry, runtime]
---

# HEARTBEAT

## PURPOSE

A **Heartbeat** is a recurring, context-aware runtime instruction used to re-enter an active agent session at controlled intervals so the agent can inspect a condition, detect meaningful change, or perform a bounded follow-up while preserving the context of the current working session.

A Heartbeat is **not** a general scheduler, cron job, background daemon, workflow, or autonomous task generator. Its defining characteristic is that the recurring check depends on the **current session's context**. If the work can run independently in a fresh isolated context, use a scheduler, automation, cron job, workflow, or task system instead.

The Heartbeat contract is runtime-neutral. A vendor may expose it as a slash command, session timer, automation primitive, hook, or scheduler-backed event. The implementation may differ, but the behavioral rules in this document remain the same.

## CORE OBJECTIVES

A conforming Heartbeat should:

1. **Preserve session context.** Re-enter the same logical working context when the recurring check depends on prior conversation, state, or decisions.
2. **Never interrupt active work.** Fire only at a safe turn boundary or other runtime-defined idle point.
3. **Prioritize direct user input.** A new user request always takes precedence over a queued Heartbeat.
4. **Coalesce missed intervals.** Do not replay a backlog of stale checks after a long busy or offline period unless explicitly configured.
5. **Avoid invented work.** If nothing meaningful changed, report that briefly or remain silent according to the configured no-change policy.
6. **Respect existing permissions.** A Heartbeat does not grant new tools, credentials, write access, administrator privileges, or external-action authority.
7. **Remain bounded.** Each firing should perform the smallest check needed to satisfy its directive and then stop.
8. **Expose lifecycle state.** The runtime should be able to represent whether the Heartbeat is active, paused, disabled, expired, or cleared.
9. **Fail safely.** Repeated errors, blocked tools, or ambiguous side effects must not become an infinite retry loop.
10. **Remain observable.** The agent should be able to explain what the Heartbeat is watching, why it fired, and what changed.

## HEARTBEAT VS. SCHEDULED JOB

| Property | HEARTBEAT | SCHEDULED / CRON / AUTOMATION JOB |
|---|---|---|
| Primary context | Current working session | Usually isolated or newly created execution context |
| Best use | "Keep watching this while we work" | Standing reports, deliveries, maintenance, independent checks |
| Conversation history | Required or materially useful | Usually unnecessary |
| Interruption policy | Wait for safe/idle boundary | Runs according to scheduler |
| Missed intervals | Normally coalesced | Runtime-specific |
| Scope | Usually one session or working thread | May be global, project-wide, or persistent |
| Default output | Report meaningful change; avoid busywork | Deliver configured result |
| Replacement | New heartbeat may replace current session heartbeat | Multiple independent jobs may coexist |

**Selection rule:** use a Heartbeat when the recurring instruction materially depends on the active session. Use a scheduled job when the work is self-contained.

## RUNTIME CONTRACT

A runtime may use different field names, but it should be able to represent the following properties:

| Property | Required | Purpose |
|---|---|---|
| `directive` | YES | The bounded instruction executed on each firing. |
| `interval` or `cadence` | YES | How often the runtime should consider firing. |
| `status` | YES | `active`, `paused`, `disabled`, `expired`, or `cleared`. |
| `scope` | YES | Session, thread, workspace, agent, or another explicitly defined scope. |
| `last_fired` | RECOMMENDED | Last successful or attempted firing time. |
| `next_due` | RECOMMENDED | Next eligible firing time when the runtime exposes it. |
| `no_change_policy` | RECOMMENDED | What to do when nothing meaningful changed. |
| `error_policy` | RECOMMENDED | How failures, retries, and escalation are handled. |
| `expiration` | OPTIONAL | Condition or time after which the Heartbeat stops. |
| `evidence_source` | OPTIONAL | Tool, file, endpoint, state record, or source the check reads. |
| `notification_policy` | OPTIONAL | When the user should actually be interrupted or notified. |

## CANONICAL RUNTIME STATE EXAMPLE

This example is a portable logical representation. A runtime may store the same data elsewhere.

```yaml
heartbeat:
  status: active
  scope: session
  cadence: "15m"
  directive: "Check the current deployment and report only meaningful state changes."
  no_change_policy: "brief"
  error_policy:
    max_consecutive_failures: 2
    on_limit: "pause-and-report"
  expiration:
    condition: "deployment reaches a terminal state"
  runtime:
    last_fired: null
    next_due: null
    consecutive_failures: 0
```

Do not fabricate timestamps, counters, runtime persistence, or next-fire values when the host environment does not expose them.

## FIRING BEHAVIOR

### 1. PRE-FIRE GATE

Before running the directive:

- Confirm the Heartbeat is active.
- Confirm the cadence or trigger is due according to the host runtime.
- Confirm the agent is at a safe execution boundary.
- Yield to queued direct user input.
- Check whether the Heartbeat has expired or its completion condition is already satisfied.
- Check the current Aura state when `STATE/AURA.STATE.MD` is available. A `FRACTURED` state blocks nonessential Heartbeat execution until the blocking condition is resolved.

### 2. EXECUTE THE BOUNDED CHECK

Perform only the work necessary to answer the Heartbeat directive.

Use existing tools only when they are already authorized. A Heartbeat does not elevate privileges or bypass confirmation requirements.

### 3. COMPARE FOR MEANINGFUL CHANGE

When prior state is available, compare the newly observed state with the previous meaningful result.

Examples of meaningful change include:

- a deployment moves from running to succeeded or failed;
- a requested approval arrives;
- a monitored task becomes blocked or complete;
- an expected file, artifact, result, or response appears;
- an external system changes in a way that affects the active work.

Repeatedly rediscovering the same state is not meaningful change.

### 4. REPORT OR REMAIN QUIET

Apply the configured no-change policy:

| Policy | Behavior |
|---|---|
| `silent` | Produce no user-facing interruption when nothing changed, if the runtime supports silent handling. |
| `brief` | State that there is no meaningful change and stop. |
| `always-report` | Report every check only when the user or application explicitly requires it. |

### 5. RE-ANCHOR OR COMPLETE

After a firing:

- update runtime state if supported;
- re-anchor the next interval according to the runtime's timer semantics;
- clear or expire the Heartbeat when its terminal condition is satisfied;
- pause and surface the problem when the failure policy is reached.

## CONCURRENCY AND MESSAGE-FLOW RULES

A Heartbeat MUST NOT:

- interrupt an in-progress agent/tool turn;
- inject itself into the middle of another tool transaction;
- outrank direct user input;
- mutate the system instruction layer merely to fire;
- create a burst of missed historical firings after a long idle/offline period by default;
- perform a blind retry after an ambiguous external write;
- create new tasks simply because the session is quiet.

A Heartbeat SHOULD behave like a normal bounded turn or equivalent runtime event at a safe message boundary.

## ERROR AND LOOP CONTROL

| Condition | Required behavior |
|---|---|
| One transient read failure | Retry only when the operation is safe and the retry policy allows it. |
| Repeated identical failure | Stop retrying, update Aura execution stability, and report the blocker. |
| Ambiguous external write | Verify whether the action succeeded before any retry. |
| Tool unavailable | Report or defer; do not invent the result. |
| Permission missing | Stop and request authorization through the normal permission path. |
| Session context degraded | Prefer consolidation/reset guidance rather than repeated low-confidence checking. |
| Heartbeat objective complete | Clear or expire the Heartbeat. |

## AURA INTEGRATION

Heartbeat and Aura serve different purposes:

- **Heartbeat** decides **when a context-aware recurring check should re-enter the session**.
- **Aura** describes **whether the agent's current reasoning and execution environment is healthy enough to proceed normally**.

A Heartbeat may update Aura only from observable evidence. Examples:

- repeated tool failures may increase execution static;
- context pressure reported by the runtime may increase context fatigue;
- detected conflict with active rules may degrade constraint integrity.

Heartbeat MUST NOT invent Aura measurements simply because an interval elapsed.

## EXAMPLES

### CONTEXT-DEPENDENT WATCH

> Every 15 minutes, check whether the current CI run we are discussing has completed. Report only when its state changes or when it reaches a terminal result.

This is a Heartbeat because the check depends on the current thread, current branch/PR, and current working context.

### INDEPENDENT DAILY REPORT

> Every morning at 8:00 AM, send me a market report.

This is normally **not** a Heartbeat. It is a scheduled automation because it does not require the current conversation to remain active.

## IMPLEMENTATION GUIDANCE

A platform with native Heartbeat support should map these semantics to its native primitive.

A platform without native Heartbeat support may implement an equivalent only if it can preserve the required context and safe message boundaries. If the fallback creates a fresh isolated session, represent it as a scheduled job or workflow instead of pretending it is a Heartbeat.

Vendor-specific command syntax, database keys, aliases, CLI commands, and storage internals do not belong in this portable root contract.

## VERIFICATION CHECKLIST

- [ ] The recurring directive depends on current session context.
- [ ] The runtime never interrupts an active turn.
- [ ] Direct user input has priority.
- [ ] Missed intervals do not create a stale backlog by default.
- [ ] No-change behavior is explicit.
- [ ] Tool permissions are inherited, never elevated.
- [ ] Retry and loop limits are defined.
- [ ] Terminal/expiration behavior is defined.
- [ ] Runtime values are not fabricated when unavailable.
- [ ] Aura integration uses observable evidence only.
