# Implicit Memory Instructions
## Executable Natural-Language Instructions for Dynamic Agent Learning

**Type:** Agent instruction set  
**Version:** 1.0  
**Mutable:** No  
**Applies to:** Agents using the Implicit Memory subsystem  
**Subsystem overview:** `IMPLICIT_MEMORY.md`  
**Mutable memory:** `implicit.memory.md`  
**Tool contract:** `implicit-memory-tool.specification.md`  
**Normative specification:** `../../agent-specifications/specs/implicit-memory.specification.md`

---

# 1. Instruction Purpose

These instructions define **when and how an agent should use implicit memory**.

The objective is not to make the agent analyze every turn in depth. The objective is to make the agent continuously capable of noticing information that may have future value, while spending almost no additional reasoning when nothing important occurred.

Implicit memory exists to preserve **revisable, future-useful conclusions** that can improve later behavior, reasoning, prediction, efficiency, continuity, or error prevention.

Do not store information merely because it was observed.  
Do not treat stored implicit memory as permanent truth.  
Do not force information through a fixed processing pipeline.  
Use only the reasoning necessary for the situation.

---

# 2. Compact Master-Prompt Hook

```text
IMPLICIT MEMORY CHECK

Before each meaningful response or action, consider whether relevant implicit
memory may affect the present situation. Retrieve only relevant active implicit
memory when needed. Apply it only when its scope and activation conditions fit.
Current explicit instructions, applicable higher-authority rules or permissions,
and verified current evidence override conflicting implicit memory.

After each meaningful interaction, ask:

"Did anything occur that could materially improve future reasoning or behavior
after the current context is gone?"

If no, take no implicit-memory action.

If yes, load and follow:
memory/implicit/implicit-memory.instructions.md

Do not force information through a fixed memory pipeline. Use only the reasoning
necessary for the situation. Evidence may support a memory update directly
without first becoming an episodic memory.
```

---

# 3. Two Runtime Responsibilities

There are only two always-relevant responsibilities:

```text
BEFORE
    Could learned memory matter here?

AFTER
    Did anything happen worth learning from?
```

Everything else is conditional.

---

# 4. Apply Check — Before Responding or Acting

Before a meaningful response, recommendation, plan, tool action, or decision:

1. Consider whether previously learned implicit memory could materially affect the current situation.
2. If relevant memory may exist, retrieve the smallest useful set through `[IMPLICIT_MEMORY_TOOL.retrieve]`.
3. Check whether each retrieved memory actually applies to the current scope.
4. Check whether current instructions, current evidence, or higher-authority rules override it.
5. Apply only the portions that remain relevant.
6. Ignore memories that are irrelevant.
7. Reconsider memories that current evidence makes questionable.

**Retrieval is not obedience.** A retrieved memory is context for judgment.

---

# 5. Learning Check — After a Meaningful Interaction

After a meaningful user message, tool result, action outcome, correction, decision, or external observation, ask:

> **Did anything occur that could materially improve future reasoning or behavior after the current context is gone?**

If clearly no:

```text
NOOP
```

Do not create memory merely to satisfy this framework.

If yes or plausibly yes, use the smallest amount of analysis necessary to decide whether anything should change.

---

# 6. Recognition Cues

These cues indicate that further memory analysis may be useful. They are examples, not a mandatory checklist.

## Direct human cues

### Correction
The user explicitly says an assumption, behavior, interpretation, or memory is wrong or incomplete.

### Preference declaration
The user communicates a preference likely to matter again.

### Preference withdrawal
The user changes or removes a prior preference.

### Commitment
The user establishes an ongoing expectation, convention, or working relationship.

### Goal change
The intended outcome changes enough to affect previous conclusions.

### Priority change
The balance among speed, cost, quality, detail, risk, autonomy, or another objective changes.

### Forget or revoke request
The user explicitly asks that retained information no longer be used or stored.

---

## Evidence and outcome cues

### Verified new evidence
A trusted file, tool, API, test, document, or other source changes what should be believed or done.

### Contradiction
New information conflicts with an existing implicit conclusion.

### Meaningful outcome
An action succeeds, fails, or behaves unexpectedly in a reusable way.

### Successful strategy
A method repeatedly works in a particular context.

### Failure pattern
A method repeatedly fails, produces poor results, or is rejected.

### Application feedback
Applying an implicit memory provides evidence that the memory is correct, incomplete, too broad, or harmful.

### Prediction mismatch
What the agent expected based on memory materially differs from reality.

---

## Pattern and context cues

### Repetition
Similar behavior or evidence recurs enough to suggest a pattern.

### Cross-context recurrence
The same pattern appears independently in separate tasks or sessions.

### Preference drift
Recent behavior increasingly differs from a previously stable preference.

### Exception discovery
A generally useful conclusion is found not to apply under a meaningful condition.

### Contextual distinction
A broad conclusion is discovered to depend on task, project, person, mode, environment, or situation.

### Environmental change
Software, tools, teams, policies, resources, or other operating conditions change.

### Constraint change
Budget, time, hardware, access, permissions, staffing, or other limits change.

### Expiration or staleness
Information was useful before but its valid period has ended.

---

## Reflective and elicited cues

### Synthesis
Several pieces of information jointly reveal a useful conclusion that no single event established.

### Reflection
Reviewing previous behavior or memory reveals a better interpretation or strategy.

### Proactive elicitation
A deliberately asked question resolves a meaningful uncertainty with likely future value.

---

# 7. Value Test

Ask:

> **Would retaining this conclusion materially improve something I may do later after the current evidence is no longer in active context?**

Look for one or more of these forms of value:

- **Behavioral** — changes what the agent should do or how it should communicate.
- **Reasoning** — improves interpretation, judgment, planning, or decision-making.
- **Predictive** — helps anticipate likely intent, preferences, constraints, or outcomes.
- **Efficiency** — prevents rediscovery, redundant questions, or unnecessary work.
- **Continuity** — preserves useful understanding across sessions or long-running work.
- **Error prevention** — prevents a known mistake, failure, or rejected behavior from recurring.

If none applies, use `NOOP` or keep the information only in active context.

---

# 8. Grounding Test

Before storing or changing a conclusion, identify what supports it.

Grounding may come from:

- explicit user statement;
- verified external evidence;
- tool output;
- direct observed outcome;
- repeated episodes;
- retrieved project evidence;
- existing persistent memory;
- reflection across several sources.

Do not invent numerical confidence scores unless a separate empirical system actually computes them.

Use qualitative evidence judgment instead:

```text
direct and explicit
repeated and consistent
mixed or context-dependent
isolated
ambiguous
contradicted
```

Weak or ambiguous grounding usually means `CONTEXT`, `EPISODE`, or `NOOP` rather than a broad persistent conclusion.

---

# 9. Durability Test

Ask:

> **Would this still be useful if the current conversation disappeared right now?**

If no: `CONTEXT`.

If the event matters but the learned conclusion remains uncertain: `EPISODE`.

If it contains durable future value: continue evaluating implicit persistence.

---

# 10. Scope Test

Keep the conclusion as narrow as necessary and as broad as the evidence supports.

Avoid:

> The user hates long answers.

Prefer:

> During early exploratory discussion, the user prefers concise responses until asking for a formal document.

Possible scope dimensions:

```text
user
project
task type
domain
tool
environment
communication mode
time period
relationship
```

Do not generalize a local observation into a global trait without evidence.

---

# 11. Existing-Memory Test

Before adding a memory:

1. retrieve related active memories using `[IMPLICIT_MEMORY_TOOL.retrieve]`;
2. determine whether the conclusion already exists;
3. update or qualify the existing record instead of creating a near-duplicate when appropriate.

---

# 12. Allowed Memory Actions

Choose the smallest accurate action.

## `NOOP`
Nothing changes.

## `CONTEXT`
Useful now but not worth persistence.

## `EPISODE`
Worth recording as something that happened, but not enough to justify a durable derived conclusion.

## `ADD`
Create a new implicit conclusion.

## `UPDATE`
Revise an existing conclusion while preserving its conceptual identity.

## `QUALIFY`
Keep the conclusion but narrow its scope or add an exception.

## `SUPERSEDE`
Replace an older conclusion with a materially different current one while preserving lineage.

## `REMOVE`
Delete or retire a conclusion that is wrong, stale, revoked, harmful, or no longer valuable.

Healthy memory must be able to shrink.

---

# 13. Constructing an Actionable Memory

A useful record should preserve:

```text
Conclusion
Applies When
Action
Exceptions
Reconsider When
Basis
```

### Conclusion
What was learned?

### Applies When
What future situation makes this relevant?

### Action
What should the agent do differently because of it?

### Exceptions
When would applying this conclusion be wrong?

### Reconsider When
What future evidence should cause review?

### Basis
Why does this conclusion currently exist?

Optional properties may include kind, scope, related memory IDs, source references, created/updated timestamps, and supersession lineage.

---

# 14. Derive an Action, Not Just a Belief

After deriving a conclusion, ask:

> **If this becomes relevant later, what should I actually do differently?**

Possible action directives include:

- choose a different default;
- avoid a known failure pattern;
- ask clarification only under a specific ambiguity;
- retrieve a known source;
- prefer an effective workflow;
- adjust detail level;
- verify an assumption before acting;
- respect a learned boundary;
- change the order of operations.

Do not over-prescribe. The action should be just specific enough to improve future behavior.

---

# 15. Activation and Exceptions

Define **when** the memory applies and **when it should not**.

Example:

```text
Applies When:
The user is exploring architecture and has not requested concrete deliverables.

Action:
Remain conversational and consolidate concepts.

Exception:
If the user explicitly requests files, create them without asking again.
```

---

# 16. Reconsideration

Every durable conclusion should be open to review.

Useful reconsideration signals include:

- explicit user correction;
- repeated contradictory behavior;
- repeated failed application;
- verified environmental change;
- new authoritative evidence;
- expiry or staleness.

Do not wait for scheduled reflection when direct contradictory evidence already exists.

---

# 17. Evidence Does Not Need an Episode

An episode is one source, not a required gate.

Valid paths include:

```text
Verified evidence → UPDATE
Correction → REMOVE
Repeated episodes → REFLECTION → ADD
Tool result → SUPERSEDE
Interaction → NOOP
```

Do not manufacture intermediate records just to satisfy the framework.

---

# 18. Proactive Elicitation

The agent may occasionally ask one lightweight question when the answer is likely to improve future assistance.

## Default maximum
At most once per day initially.

This is a maximum, not a quota.

## Ask only when

- a recurring uncertainty exists;
- the answer could change future behavior;
- the user is not in an urgent workflow;
- the answer is not already known;
- the question is easy to answer;
- the question will not distract from the current task.

Useful probe areas include interaction mode, recurring workflow, autonomy boundaries, decision criteria, tradeoffs, success criteria, terminology, and recurring friction.

If the user objects or asks for the probing to stop, reduce or disable it.

Lack of criticism may justify leaving the probe cadence unchanged, but **must not be treated as evidence that an unrelated implicit conclusion is true**.

---

# 19. Reflection / Dreams

Do not perform deep reflection after every response.

Reflection is appropriate when:

- related episodes accumulate;
- contradictions remain unresolved;
- the same mistake repeats;
- preferences appear to drift;
- memories overlap or conflict;
- a milestone ends;
- the host schedules an idle consolidation cycle.

Reflection may ask:

```text
What keeps recurring?
What repeatedly fails?
What continues to work?
Which conclusions are stale?
Which memories conflict?
Which conclusions are too broad?
Which exceptions are emerging?
Which memories no longer provide value?
Is there a useful conclusion that no single episode exposed?
```

`NOOP` is a valid reflection result.

---

# 20. Applying Retrieved Memory

Retrieval does not mean automatic application.

For each retrieved memory:

1. verify its scope;
2. verify its activation condition;
3. check current explicit instructions;
4. check current evidence;
5. consider exceptions;
6. apply only if still appropriate.

Possible results:

```text
APPLY
IGNORE
CLARIFY
RECONSIDER
```

---

# 21. Learning From Application

When applying a memory produces a meaningful outcome, that outcome can become evidence.

- If successful, no update may be needed.
- If partly successful, use `QUALIFY` or `UPDATE`.
- If repeatedly harmful or wrong, use `UPDATE`, `SUPERSEDE`, or `REMOVE`.

A memory may be conceptually correct but have a bad action directive. Fix the smallest part that is wrong.

---

# 22. Authority Boundary

Implicit memory may influence learned defaults, strategies, preferences, and interpretations.

It must not independently override:

- system safety constraints;
- permissions;
- authorization;
- legal authority;
- explicit current instructions;
- authoritative policies;
- immutable application configuration.

If an implicit conclusion suggests changing one of these, produce a proposal for the proper authority instead of silently changing it.

---

# 23. Persistence

When persistence is warranted:

1. construct the smallest correct record or patch;
2. call the corresponding operation on `[IMPLICIT_MEMORY_TOOL]`;
3. verify the tool result;
4. do not claim success if persistence failed;
5. synchronize `implicit.memory.md` when the host uses a human-readable projection.

See `tools/implicit-memory-tool.specification.md`.

---

# 24. If No Tool Exists

Do not pretend to save memory.

Fallback order:

1. If `implicit.memory.md` is writable and authoritative, update it.
2. If the host provides another persistence adapter, use it.
3. Otherwise create a memory-change proposal for the runtime and continue without claiming persistence.

---

# 25. Retrieval

Retrieve narrowly using the current request, task, project, domain, or decision context.

Return only active records by default.

Do not load the full store unless an audit or reflection explicitly requires it.

---

# 26. Dynamic Memory Means Removal

Memory quality is not measured by growth.

Remove, retire, or supersede:

- stale conclusions;
- duplicates;
- unused conclusions with no remaining value;
- conclusions contradicted by better evidence;
- user-revoked information.

---

# 27. Examples

## Temporary instruction
“Call me sir today.”

Result: `CONTEXT` or `EPISODE`, not a permanent preference.

## Durable working preference
“While we are discussing architecture, don't start making a dozen files unless I ask.”

Result: `ADD` or `UPDATE` a scoped actionable conclusion.

## Direct tool evidence
A verified tool shows an API no longer exists.

Result: `UPDATE` or `SUPERSEDE`; no episode is required.

## One ambiguous preference
The user selects green once instead of red.

Result: usually `NOOP` or `EPISODE`.

## Preference drift
Repeated current interactions prioritize reliability over lowest cost despite an older opposite conclusion.

Result: `RECONSIDER`, then `UPDATE` or `SUPERSEDE` if warranted.

## Bad memory action
A memory causes unnecessary clarification questions.

Result: update the **Action** or **Exceptions** rather than deleting a still-valid underlying conclusion.

---

# 28. Completion Rule

Stop the evaluation when the smallest necessary result is complete:

```text
NOOP
CONTEXT
EPISODE
ADD
UPDATE
QUALIFY
SUPERSEDE
REMOVE
```

Do not continue reflecting after the required action is complete.

---

# 29. Final Principle

> **Learn what matters, retain what helps, apply it when relevant, and revise it when reality changes.**

The subsystem exists to improve future behavior, not to maximize stored information.
