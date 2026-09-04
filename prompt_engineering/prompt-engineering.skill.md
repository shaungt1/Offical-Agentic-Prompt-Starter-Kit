---
name: prompt-engineering
description: Use when designing, improving, debugging, or reviewing any prompt, agent instruction, or LLM pipeline stage. Routes to the two Advanced Prompt Engineering Frameworks compendiums (49 methods), selects the right framework from the index table by failure mode, and applies its template from the source document.
version: 1.0.0
author: Sean / NeuroFlo
license: MIT
metadata:
  hermes:
    tags: [prompt-engineering, frameworks, reasoning, agents, llm, reference]
    related_skills: [hermes-agent-skill-authoring]
---

# Advanced Prompt Engineering Frameworks

## Overview

This skill turns two reference documents into an operating procedure. The documents are a two-volume compendium of 49 validated prompt engineering frameworks, each entry containing the mechanism, its parts, when to use and avoid it, pros and cons, the source paper, a fill-in template, and a worked example. This skill does not restate that content; it indexes it. The job here is selection and routing: identify the failure mode or goal of the prompt being built, pick the matching framework from the Quick Reference table, then open the cited entry in the source document and apply its template.

Source documents (entry numbers map directly to sections inside them):

- Volume One, entries 1-31: `agent-specifications/prompt_engineering/Advanced_Prompt_Engineering_Frameworks.md`
- Volume Two, entries 32-49: `agent-specifications/prompt_engineering/Advanced_Prompt_Engineering_Frameworks_Vol2.md`

## When to Use

- User asks to write, improve, optimize, or debug a prompt, system prompt, or agent instruction
- User asks "which prompting technique should I use for X" or names a framework (ReAct, CoT, ToT, etc.)
- Building any LLM pipeline stage: extraction, RAG, evaluation, agent loop, summarization, code generation
- A prompt is failing in a diagnosable way (hallucination, missed conditions, wrong math, format drift, injection risk)
- Designing evals, judges, or automated prompt optimization

Don't use for:

- General coding tasks with no prompt design component
- Model selection, fine-tuning, or infrastructure questions (these documents cover prompting only)
- Simple one-line prompts where any framework would be overhead; answer directly

## Quick Reference: Framework Index

Columns: what the method does, when to apply it, when NOT to apply it. Read = entry number in the volume named above (1-31 = Vol 1, 32-49 = Vol 2). Citation = source paper arXiv ID, full references at the end of each volume.

| # | Method | What it does | Use when | Do NOT use when | Citation |
|---|--------|--------------|----------|-----------------|----------|
| 1 | ReAct | Thought/Action/Observation tool loop | Answer needs live/external data, multi-step tool use | Pure reasoning, no tools; latency-critical | 2210.03629 |
| 2 | Chain of Thought | Written step-by-step reasoning before answer | Multi-step logic, math, planning | Simple lookups; adds tokens for nothing | 2201.11903 |
| 3 | Self-Consistency | Sample N chains, majority-vote the answer | Short comparable answers where errors are costly | Long-form output; tight budget (N-times cost) | 2203.11171 |
| 4 | Self-Ask | Explicit follow-up sub-questions, optionally answered by search | Multi-hop factual composition, RAG query decomposition | Single-fact or non-factual tasks | 2210.03350 |
| 5 | PoT / PAL | Reasoning written as executable code | Anything a calculator could check | No computation exists; no sandbox available | 2211.12588 |
| 6 | ReWOO | Plan all tool calls upfront, execute, solve once | Tool calls predictable from task; ReAct too costly | Each step depends on prior result | 2305.18323 |
| 7 | Tree of Thoughts | Branch, score, prune candidate reasoning paths | Search-shaped problems, first idea usually wrong | Routine tasks; cost multiplies per node | 2305.10601 |
| 8 | Graph of Thoughts | Split, solve in parallel, merge (map-reduce reasoning) | Decomposable tasks needing recombination | Sequential or small problems | 2308.09687 |
| 9 | Skeleton of Thought | Outline first, expand points in parallel | Long list-decomposable answers, latency matters | Later parts depend on earlier parts | 2307.15337 |
| 10 | Buffer of Thoughts | Retrieve and instantiate stored solution templates | Recurring problem families at scale | One-off questions; no template infra | 2406.04271 |
| 11 | Self-Discover | Model composes its own reasoning plan, reused per instance | Many instances of one task type | Single questions; nothing to amortize | 2402.03620 |
| 12 | Least-to-Most | Decompose to subproblem ladder, solve in order | Compositional depth exceeds any example | Decomposition itself is the hard part | 2205.10625 |
| 13 | Plan-and-Solve | Understand, plan, then execute (zero-shot) | Default upgrade of "think step by step" | Reasoning-tuned models already planning | 2305.04091 |
| 14 | Step-Back | State governing principle first, then apply | Principle-governed domains (law, physics, compliance) | Shallow lookups, creative tasks | 2310.06117 |
| 15 | Reflexion | Fail, write lesson, retry with lesson in context | Objective checker exists (tests, validators) | No reliable evaluator; reflection degrades | 2303.11366 |
| 16 | Self-Refine | Draft, dimension-specific critique, revise | Quality-graded prose/code style | Factual/logical correctness fixes | 2303.17651 |
| 17 | Chain of Verification | Draft, verify claims independently, rewrite | Long-form factual output, hallucination risk | Reasoning/creative tasks; facts past cutoff | 2309.11495 |
| 18 | Constitutional Critique | Audit and revise against written principles | Policy, brand voice, compliance enforcement | Constitutions past ~10 rules dilute | 2212.08073 |
| 19 | System 2 Attention | Strip noise/opinions, answer from cleaned input | Leading questions, sycophancy risk, noisy input | Clean trusted inputs | 2311.11829 |
| 20 | RAG Prompting | Ground answer in delimited retrieved context with citations | Answers must come from a specific corpus | Parametric knowledge suffices | 2005.11401 |
| 21 | Generated Knowledge | Model generates facts first, answers from them | Commonsense tasks, no retriever available | High-stakes factuality (facts unverified) | 2110.08387 |
| 22 | Chain of Density | Iteratively densify fixed-length summary | Hard length budgets, executive summaries | Readability-first narrative summaries | 2309.04269 |
| 23 | Few-Shot ICL | Teach task and format by examples | Exact format control, subtle boundaries | Simple tasks; context budget tight | 2005.14165 |
| 24 | Role/Expert Prompting | Persona plus professional standards clause | Voice, rigor, terminology, audience fit | Expecting accuracy gains (style only) | 2305.14688 |
| 25 | Multi-Agent Debate | Agents critique each other, judge rules | High-stakes judgments, blind-spot risk | Routine tasks; agents times rounds cost | 2305.14325 |
| 26 | Prompt Chaining | Fixed pipeline, one transformation per prompt | Testable multi-step production workflows | Steps cannot be fixed in advance (use ReAct) | 2110.01691 |
| 27 | Rephrase and Respond | Restate question precisely, then answer | Ambiguous user-facing questions | Well-specified programmatic inputs | 2311.04205 |
| 28 | APE | LLM writes candidate instructions, scored selection | Labeled eval set exists, prompt runs at scale | No scorable eval set | 2211.01910 |
| 29 | OPRO | Iterative prompt hill-climbing from score history | Squeezing a fixed high-volume prompt slot | No trustworthy scorer; overfit risk | 2309.03409 |
| 30 | DSPy | Declared signatures compiled into optimized prompts | Multi-stage pipelines, model migrations expected | Single prompts; no training examples | 2310.03714 |
| 31 | Meta Prompting | Abstract solution templates; conductor writes expert prompts | Stable task shapes; heterogeneous subtasks | Well-served by a single direct prompt | 2401.12954 |
| 32 | Chain of Draft | CoT with ~5-word steps, ~8% of tokens | CoT correct but too expensive at volume | Trace must be human-audited | 2502.18600 |
| 33 | Re-Reading (RE2) | Repeat the question verbatim before answering | Model misses stated conditions | Short questions; huge documents | 2309.06275 |
| 34 | Thread of Thought | Segment-by-segment walkthrough of messy context | Long mixed contexts, scattered evidence | Short or clean contexts | 2311.08734 |
| 35 | Analogical Prompting | Model generates its own worked exemplars | Few-shot quality without exemplar curation | Narrow known distribution (curate instead) | 2310.01714 |
| 36 | Contrastive CoT | Labeled correct AND wrong exemplars | One recurring, nameable reasoning error | Failure mode cannot be characterized | 2311.09277 |
| 37 | Active Prompting | Annotate only highest-uncertainty examples | Limited annotation budget for exemplars | One-off prompts; DSPy already bootstrapping | 2302.12246 |
| 38 | Chain-of-Table | Table operations as the reasoning chain | Table QA, row-column alignment lost in prose | One-row lookups; SQL alone suffices | 2401.04398 |
| 39 | Chain of Code | Real interpreter plus LM-simulated semantic functions | Tasks mixing exact computation with judgment | Purely numeric (PoT) or purely semantic | 2312.04474 |
| 40 | HyDE | Embed a fake answer document for retrieval | Terse queries, vocabulary mismatch, zero-shot retrieval | Tuned retriever already strong | 2212.10496 |
| 41 | Chain-of-Note | Per-document relevance notes, sanctioned abstention | Noisy retrieval; abstention beats wrong answers | Casual retrieval; simple RAG clause enough | 2311.09210 |
| 42 | Universal Self-Consistency | Model selects most-consistent of N free-form samples | Voting reliability on long-form outputs | Short answers (code-vote instead, #3) | 2311.17311 |
| 43 | Mixture-of-Agents | Layered proposers, aggregator synthesizes best draft | Quality-critical output, multiple models available | Latency-sensitive or high-volume paths | 2406.04692 |
| 44 | LLM-as-a-Judge / G-Eval | Structured criterion scoring with bias mitigations | Any scalable evaluation; metric for #15/28/29/30 | Sole arbiter of high-stakes calls uncalibrated | 2303.16634 |
| 45 | Decomposed Prompting | Decomposer routes subtasks to reusable handlers | Sub-skills recur across tasks; recursion needed | Linear one-offs (use #12 or #26) | 2210.02406 |
| 46 | Directional Stimulus | Per-instance keyword hints steer generation | Outputs must include specific elements | No per-instance targets exist | 2302.11520 |
| 47 | EmotionPrompt | Stakes/emotion framing appended to prompt | A/B testing last percent on a frozen model only | Long-lived production prompts (decays) | 2307.11760 |
| 48 | Spotlighting | Mark untrusted content as data, never instructions | ANY untrusted text enters context (RAG, email, web) | Never skip; only scale mode to risk | 2403.14720 |
| 49 | SimToM | Filter context to what a person knows, answer from that | Audience-calibrated output, theory-of-mind | Omniscient answering is wanted | 2311.10227 |

## Procedure

1. **Diagnose before selecting.** Name the dominant failure mode or goal in one sentence (hallucination, missed conditions, cost, format drift, injection exposure, no eval). The "Use when" column is keyed to failure modes, not topics.
2. **Select from the table.** Pick the single best-matching framework. If two match, prefer the cheaper one (lower entry cost noted in "Do NOT use when") and check the decision matrices at the end of each volume for tie-breaks.
3. **Read the full entry.** Open the volume and entry number from the Read mapping. Do not apply a framework from the table row alone; the entry contains the parts, the caveats, and the template.
4. **Apply the template.** Copy the entry's reusable template and fill the bracketed sections. Keep the entry's rules verbatim (loop formats, extraction cues, delimiters) since orchestration code parses them.
5. **Compose in the canonical stack when building pipelines:** input cleaning (#19 or #27) then reasoning (one framework) then verification (#15, #17, or #18), with #48 wrapping any untrusted content. Add at most one expensive layer (#3, #7, #25, #43).
6. **Measure.** If the change matters, score it with #44 before and after. If no eval set exists and the prompt will run at scale, build the judge first; it is the dependency of #15, #28, #29, and #30.

## Common Pitfalls

1. **Stacking expensive frameworks.** Self-Consistency times ToT times Debate multiplies cost ruinously. Fix: one expensive layer maximum, everything else single-pass.
2. **Applying a framework from the table row without reading the entry.** The rows are routing keys, not instructions. Fix: step 3 is mandatory.
3. **Self-correction without an external checker.** #15/#16 without objective feedback can degrade answers (arXiv:2310.01798). Fix: verify an evaluator exists before adding retry loops.
4. **Optimizing without an eval set.** #28-30 pointed at vibes select fluent prompts, not effective ones. Fix: build #44 first, hold out a test split.
5. **Treating persona (#24) or emotion (#47) as accuracy tools.** They move style, not correctness, and #47 decays across model versions. Fix: structural frameworks for correctness; A/B #47 only.
6. **Skipping #48 on retrieved or user-supplied text.** Every RAG and browsing pipeline is an injection surface. Fix: delimit untrusted content and declare it data in the trusted zone, always.
7. **Verbose CoT in high-volume paths.** Paying full CoT tokens where #32 matches accuracy at a fraction of the cost. Fix: default batch pipelines to Chain of Draft and measure.

## Verification Checklist

- [ ] Failure mode named in one sentence before framework selection
- [ ] Framework chosen from the table, tie-broken by cost
- [ ] Full entry read in the correct volume (1-31 Vol 1, 32-49 Vol 2)
- [ ] Template applied with formats, cues, and delimiters preserved verbatim
- [ ] At most one expensive layer in the final composition
- [ ] Untrusted content wrapped per #48 wherever present
- [ ] Result scored with #44, or judge construction queued if no eval exists
