# The Advanced Prompt Engineering Framework Compendium

## A Practitioner's Reference to the Frameworks Every Professional AI Engineer Should Know

This document is a working reference for advanced prompt engineering frameworks. A prompt engineering framework, for the purposes of this document, is a repeatable, named structure for instructing a large language model (LLM), meaning a neural network trained to predict and generate text, so that the model reasons, acts, verifies, or formats its output in a controlled and measurably better way. Each entry below follows the same anatomy so you can scan, compare, and apply them quickly:

1. **What it is and how it works**, explained in plain language before any jargon is used.
2. **The parts**, broken down so you know what each component does and why it exists.
3. **When to use it and when to avoid it**, because every framework has a cost profile.
4. **Pros and cons**, stated bluntly.
5. **Source**, the paper or publication the technique originates from.
6. **A modular, copy-paste template** with bracketed fill-in sections.
7. **A worked, concrete example** for the load-bearing frameworks.

The frameworks are organized into seven families. Family one covers agentic and tool-using frameworks, where the model interleaves thinking with real-world actions. Family two covers reasoning elicitation, where the prompt forces the model to show and structure its intermediate thinking. Family three covers search-structured reasoning, where multiple reasoning paths are generated, scored, and pruned. Family four covers decomposition, where a hard problem is split into tractable subproblems. Family five covers self-correction and verification, where the model critiques and repairs its own output. Family six covers knowledge and retrieval augmentation, where external or generated facts are injected before answering. Family seven covers automated and meta-level prompt optimization, where prompts themselves become the object being engineered. A closing section gives a decision matrix for choosing among them.

One general rule before the catalog begins. A modern reasoning-tuned model (Claude, GPT-class reasoning models, Qwen3 in thinking mode) already performs an internal version of several of these techniques. The frameworks below still matter for three reasons: they give you explicit control and auditability, they work on smaller and self-hosted models that do not reason internally, and they compose into pipelines (agents, RAG systems, evaluators) where you need the structure exposed as text you can parse.

---

# FAMILY ONE: AGENTIC AND TOOL-USE FRAMEWORKS

---

## 1. ReAct (Reason + Act)

### What it is and how it works

ReAct is a prompting framework in which the model alternates between writing out a short piece of reasoning (a Thought), issuing a call to an external tool (an Action), and reading the tool's real output (an Observation), looping until it has enough grounded information to produce a Final Answer. The core insight of the original paper is that reasoning and acting reinforce each other: reasoning helps the model decide which action to take and how to interpret results, while acting fetches real facts that keep the reasoning anchored to reality instead of the model's imperfect memory. This loop is the direct ancestor of essentially every modern tool-calling agent, including function calling APIs, LangChain agents, and coding agents like Claude Code. When you configure an agent with tools today, you are running a productized ReAct loop.

### The parts, and why each exists

The framework has five components, each with a specific job. The **role and goal statement** tells the model what kind of agent it is and what success looks like, which constrains the space of actions it will consider. The **tool registry** enumerates every tool with its exact call syntax and, critically, a plain-language description of when to use it, because the model selects tools by matching the task against those descriptions. The **rules block** prevents the two classic failure modes: guessing instead of using a tool, and drifting out of the required format so your parser breaks. The **Thought/Action/Observation loop format** is the machine-readable protocol; your orchestration code detects an Action line, executes the real tool, and injects the result back as the Observation. The **Final Answer terminator** is the stop condition your code watches for.

### When to use it, and when not to

Use ReAct whenever the answer depends on information the model cannot reliably know: live data, private databases, file systems, APIs, calculators, or search. Use it for multi-step tasks where each step's result determines the next step. Avoid it for pure reasoning tasks with no external dependency (use Chain of Thought instead), and avoid it when latency and token cost matter more than grounding, because every loop iteration is another model call. If all tool calls can be planned upfront without seeing intermediate results, use ReWOO (entry 16) instead, since it is dramatically cheaper.

### Pros and cons

The benefits are reduced hallucination because facts come from tools rather than memory, full transparency because you can read every Thought, and natural error recovery because a failed tool call becomes an Observation the model can reason about and retry. The costs are token expense from repeated looping, latency that scales linearly with the number of steps, and sensitivity to tool descriptions, since a badly described tool will be misused or ignored.

### Source

Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models," ICLR 2023, arXiv:2210.03629.

### Reusable template

```
You are [agent role, e.g., a clinical operations assistant] whose goal is to
[measurable objective, e.g., answer billing questions using verified data only].

### TOOLS
1. [ToolName1]: use when [condition]. Syntax: ToolName1[input]
2. [ToolName2]: use when [condition]. Syntax: ToolName2[input]

### RULES
- Never state a fact a tool could verify without first calling that tool.
- If an Observation is insufficient, reformulate and call again.
- Use only the exact loop format below. Do not skip steps.

### FORMAT
Thought: [what is missing, and which tool resolves it]
Action: ToolName[input]
Observation: [tool output is inserted here by the system; wait for it]
(repeat Thought/Action/Observation as needed)
Thought: I now have everything required.
Final Answer: [complete answer, citing the observations it rests on]

Begin!
User request: [the actual task]
```

### Worked example (real use case: medical billing code lookup agent)

This is the template filled in for an operative-note coding assistant, the kind of system that must never guess a code.

```
You are a surgical billing assistant whose goal is to return the correct CPT
code for a described procedure, verified against the code database.

### TOOLS
1. CPTSearch: use when you need candidate codes for a procedure description.
   Syntax: CPTSearch[procedure keywords]
2. CPTDetail: use when you must confirm the full descriptor and bundling rules
   for one specific code. Syntax: CPTDetail[code]

### RULES
- Never output a CPT code that CPTDetail has not confirmed.
- If search returns multiple candidates, inspect each before deciding.
- Use only the exact loop format below.

### FORMAT
Thought / Action / Observation loop, ending in Final Answer.

Begin!
User request: What CPT code applies to a laparoscopic appendectomy?
```

A real run then looks like this, with your code executing each Action:

```
Thought: I need candidate codes for laparoscopic appendectomy.
Action: CPTSearch[laparoscopic appendectomy]
Observation: 44970 (laparoscopy, surgical, appendectomy); 44950 (open appendectomy)
Thought: 44970 matches the laparoscopic approach. Confirm its descriptor.
Action: CPTDetail[44970]
Observation: 44970: Laparoscopy, surgical, appendectomy. No add-on required.
Thought: Confirmed. I have everything required.
Final Answer: CPT 44970, laparoscopic surgical appendectomy, confirmed against
the code database. 44950 applies only to the open approach.
```

---

## 2. Chain of Thought (CoT), with the Zero-Shot variant

### What it is and how it works

Chain of Thought prompting instructs or demonstrates to the model that it should produce intermediate reasoning steps in natural language before committing to an answer, instead of jumping straight from question to conclusion. It works because a transformer generates one token at a time, and each generated token becomes context for the next; writing out steps lets the model spend more computation on the problem and condition its final answer on its own verified intermediate results. The original formulation is few-shot, meaning the prompt contains two to eight worked examples that each show a question, a written-out reasoning chain, and an answer, teaching the model the pattern by demonstration. The zero-shot variant, discovered by Kojima et al., showed that simply appending a trigger phrase such as "Let's think step by step" elicits the same behavior with no examples at all.

### The parts, and why each exists

Few-shot CoT has three components. The **exemplars** are the worked examples, and their quality matters more than their quantity; each must show reasoning of the same shape as the target problem, because the model imitates the structure it sees. The **target question** is posed in identical format to the exemplars so the pattern transfers. The **answer extraction cue**, such as "Therefore, the answer is:", gives your parsing code a stable anchor. Zero-shot CoT replaces the exemplars with a single **trigger phrase** and typically adds a second extraction pass ("Therefore, the final answer is") to pull the answer out of the reasoning text.

### When to use it, and when not to

Use CoT for arithmetic, logic, multi-hop reasoning, planning, and any task where the path to the answer has more than one step. Prefer few-shot CoT when you need the reasoning to follow a specific house format, such as a fixed diagnostic sequence or a legal analysis structure, and zero-shot CoT when you need generality with zero setup cost. Avoid CoT for simple retrieval or classification tasks where it only adds tokens, and be aware that on reasoning-tuned models an explicit CoT instruction is often redundant because the model already deliberates internally; there it serves mainly to make the reasoning visible and auditable.

### Pros and cons

CoT delivers large accuracy gains on multi-step problems, produces an auditable reasoning trace, and requires no tooling. Its weaknesses are that the written reasoning can be confabulated (a plausible-looking chain justifying a wrong answer), it increases token usage, and its benefit only emerges reliably on sufficiently capable models.

### Source

Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," NeurIPS 2022, arXiv:2201.11903. Zero-shot variant: Kojima et al., "Large Language Models are Zero-Shot Reasoners," NeurIPS 2022, arXiv:2205.11916.

### Reusable template (few-shot)

```
Answer the question by reasoning step by step, following the format of the
examples exactly.

Q: [example question 1]
Reasoning: [step 1]. [step 2]. [step 3].
Therefore, the answer is: [answer 1]

Q: [example question 2]
Reasoning: [steps]
Therefore, the answer is: [answer 2]

Q: [real question]
Reasoning:
```

### Worked example (real use case: firmware regression triage)

```
Diagnose the root cause category by reasoning step by step, following the
example format exactly.

Q: Detection recall dropped from 91% to 60% after an OTA update that changed
JPEG quality from 90 to 60.
Reasoning: The model was unchanged, so weights are not the cause. Input image
quality changed, which degrades small-object features. Recall loss without
precision loss is consistent with missed detections from input degradation.
Therefore, the answer is: input pipeline regression.

Q: Recall dropped from 80% to 20% after a firmware release that modified the
frame pre-processing crop and the NPU quantization calibration set.
Reasoning:
```

The model then produces a stepwise chain (two changed variables, which one dominates, what evidence would separate them) and ends with the extraction cue your pipeline parses.

---

## 3. Self-Consistency

### What it is and how it works

Self-consistency is a decoding-and-aggregation strategy layered on top of Chain of Thought. Instead of generating one reasoning chain, you sample the same CoT prompt multiple times at a nonzero temperature (temperature is the randomness setting of the sampler; higher values produce more diverse outputs), collect the final answers from each independent chain, and take a majority vote. The insight is that a hard problem admits many valid reasoning paths that converge on the correct answer, while incorrect paths tend to scatter across many different wrong answers, so agreement is evidence of correctness.

### The parts, and why each exists

There are four components. The **base CoT prompt** is any chain-of-thought prompt from entry 2. The **sampling configuration** sets temperature (typically 0.5 to 0.8) and the number of samples (typically 5 to 40), which trades cost against reliability. The **answer extractor** pulls the final answer token span from each chain, which is why the extraction cue in your CoT format matters. The **aggregator** performs the majority vote, or a weighted vote if you also score chain quality.

### When to use it, and when not to

Use self-consistency when a single wrong answer is expensive and the answer is short and comparable, such as a number, a code, a class label, or a multiple-choice option, because voting requires exact or near-exact matching of answers. It is the cheapest reliability multiplier available for math, extraction, and classification. Avoid it for long-form generation, where outputs cannot be voted on directly, and skip it when budget is tight, since cost multiplies by the sample count.

### Pros and cons

It reliably adds accuracy on top of CoT (the paper reports gains up to 17 points on GSM8K), requires no new prompt engineering, and yields a confidence signal for free (the vote margin). The cons are the N-times cost multiplier and its restriction to tasks with discrete, comparable answers.

### Source

Wang et al., "Self-Consistency Improves Chain of Thought Reasoning in Language Models," ICLR 2023, arXiv:2203.11171.

### Reusable template (orchestration pseudocode plus prompt)

```
PROMPT (sent N times, temperature 0.7):
  [Your CoT prompt from entry 2]
  End with exactly: "Therefore, the answer is: <answer>"

ORCHESTRATION:
  answers = []
  repeat N times:
      chain = call_model(PROMPT)
      answers.append(extract_after("Therefore, the answer is:", chain))
  final = majority_vote(answers)
  confidence = count(final) / N
```

### Worked example (real use case: ICD-10 extraction reliability)

For an operative note where a single miscoded diagnosis is costly, send the same CoT extraction prompt ten times at temperature 0.7. Suppose the returned codes are K35.80 eight times, K35.20 once, and K37 once. The vote selects K35.80 with 0.8 confidence; anything below your confidence threshold (for example 0.7) is routed to human review. This converts a raw model into a system with a tunable precision knob.

---

## 4. Self-Ask

### What it is and how it works

Self-Ask structures the model's reasoning as an explicit sequence of self-posed follow-up questions and answers before the final answer. The model literally writes "Follow up: [sub-question]" then "Intermediate answer: [answer]" repeatedly, then "So the final answer is: [answer]". Because every sub-question is isolated on its own line, each one can optionally be intercepted and answered by a search engine instead of the model, which makes Self-Ask a natural bridge between pure reasoning and retrieval. It excels at compositional questions, meaning questions whose answer requires combining two or more facts, such as "Who was president when the transistor was invented?"

### The parts, and why each exists

The **exemplar** demonstrates the exact follow-up format, which the model imitates. The **"Are follow up questions needed here:" line** forces an explicit decision to decompose rather than answer directly, which is the mechanism that prevents premature guessing. The **Follow up / Intermediate answer pairs** decompose the question into single-fact lookups. The optional **search interception** replaces each Intermediate answer with a real retrieval call.

### When to use it, and when not to

Use it for multi-hop factual questions, especially with a search tool attached, and in RAG systems where query decomposition improves retrieval. Avoid it for single-fact questions and for non-factual reasoning, where CoT is a better fit.

### Pros and cons

It sharply improves compositional question accuracy, produces a trace that doubles as a retrieval plan, and is trivially easy to parse. Its scope is narrow: it helps factual composition, not calculation or open-ended synthesis.

### Source

Press et al., "Measuring and Narrowing the Compositionality Gap in Language Models," EMNLP Findings 2023, arXiv:2210.03350.

### Reusable template

```
Question: [example compositional question]
Are follow up questions needed here: Yes.
Follow up: [sub-question 1]
Intermediate answer: [fact 1]
Follow up: [sub-question 2]
Intermediate answer: [fact 2]
So the final answer is: [composed answer]

Question: [real question]
Are follow up questions needed here:
```

### Worked example (real use case: compliance research)

```
Question: Does the state where our newest school district customer operates
require two-party consent for onboard audio recording?
Are follow up questions needed here: Yes.
Follow up: In which state does the newest school district customer operate?
Intermediate answer: [answered by CRM lookup: Virginia]
Follow up: Is Virginia a two-party consent state for audio recording?
Intermediate answer: [answered by search: Virginia is one-party consent]
So the final answer is: No, Virginia requires only one-party consent, so
onboard audio recording with operator consent is permissible there.
```

---

## 5. Program of Thoughts (PoT) and Program-Aided Language Models (PAL)

### What it is and how it works

Program of Thoughts and PAL are two independently published frameworks with the same core move: instead of asking the model to compute an answer in natural language, you ask it to express its reasoning as executable code, typically Python, and then a real interpreter runs the code to produce the answer. The division of labor is the whole point. The LLM is excellent at translating a problem into a formal program but unreliable at arithmetic and bookkeeping; the interpreter is perfect at arithmetic and bookkeeping but cannot understand the problem. PoT and PAL let each side do only what it is good at. The two papers differ mainly in framing and benchmarks, so this document treats them as one technique.

### The parts, and why each exists

The **role instruction** tells the model to solve by writing code, not by computing in prose, which suppresses its urge to do mental math. The **variable naming convention**, requiring semantically meaningful variable names that mirror the problem's entities, keeps the program readable and is shown in the PAL paper to improve correctness because the names function as embedded reasoning. The **execution harness** is your code that extracts the program, runs it in a sandbox, and captures the printed result. The **answer contract**, such as "store the result in a variable named answer," gives the harness a deterministic extraction point.

### When to use it, and when not to

Use it for anything numerical: math word problems, financial calculations, unit conversions, date arithmetic, statistics over provided data. It is the correct default whenever an answer could be checked by a calculator. Avoid it where no formal computation exists (interpretation, judgment, writing) and in environments where you cannot safely execute model-written code.

### Pros and cons

Numerical answers become exactly correct rather than approximately plausible, errors become debuggable because you can read the program, and the technique composes cleanly with CoT (reason first, then codify). The costs are the need for a sandboxed interpreter, a security surface (never execute untrusted generated code outside a sandbox), and inapplicability to non-computable questions.

### Source

Chen et al., "Program of Thoughts Prompting," TMLR 2023, arXiv:2211.12588. Gao et al., "PAL: Program-aided Language Models," ICML 2023, arXiv:2211.10435.

### Reusable template

```
Solve the problem by writing Python, not by computing in your head.

RULES
- Use variable names that mirror the entities in the problem.
- Comment each step with the reasoning it implements.
- Store the final result in a variable named answer, then print(answer).
- Output only the code block.

PROBLEM
[the real problem, including any data tables]
```

### Worked example (real use case: GPU cost decision)

```
Solve the problem by writing Python, not by computing in your head.
[rules as above]

PROBLEM
A workstation GPU costs $2,850 and draws 230 W under load. Cloud rental of an
equivalent card is $0.79/hour. Electricity is $0.13/kWh. At 6 hours of load
per day, after how many days does owning become cheaper than renting?
```

The model returns a short program (`purchase_cost`, `hourly_rental`, `hourly_power_cost`, a breakeven division) and the interpreter prints the exact day count, with every assumption visible and editable in the code.

---

## 6. ReWOO (Reasoning Without Observation)

### What it is and how it works

ReWOO restructures the ReAct loop to remove its main cost driver. In ReAct, the full conversation history including every observation is re-sent to the model at every step, so token cost grows quadratically with step count. ReWOO instead splits the agent into three stages that each run once. A Planner reads the task and emits the entire plan upfront as a list of tool calls with placeholder variables (#E1, #E2) standing in for results not yet known, and later steps may reference earlier placeholders as inputs. A Worker, which is plain orchestration code, executes every tool call and fills in the placeholders. A Solver then receives the original task plus all filled evidence and writes the final answer in a single model call.

### The parts, and why each exists

The **Planner prompt** must teach the placeholder syntax, because the plan's value comes from expressing dependencies between steps (#E2 can take #E1 as input) without seeing any actual results. The **evidence variables (#E1...#En)** are the mechanism that decouples planning from execution. The **Worker** is deliberately not a model; it is deterministic code, which is what makes the pipeline cheap and parallelizable, since independent tool calls can run concurrently. The **Solver prompt** reunites task and evidence for synthesis.

### When to use it, and when not to

Use ReWOO when the tool calls needed are predictable from the task alone, such as fixed research pipelines, multi-source lookups, and report generation, and whenever token cost or latency of a ReAct agent is hurting you; the paper reports comparable accuracy at roughly one fifth of the tokens. Avoid it when each step's choice genuinely depends on the previous step's result, such as exploratory debugging or navigation, where upfront planning is impossible and ReAct's adaptivity is worth its cost.

### Pros and cons

Massive token and latency savings, parallel tool execution, and a clean separation that lets you use a small model for planning and a strong model for solving. The con is brittleness under uncertainty: if the plan is wrong, there is no mid-course correction without adding a replanning wrapper.

### Source

Xu et al., "ReWOO: Decoupling Reasoning from Observations for Efficient Augmented Language Models," 2023, arXiv:2305.18323.

### Reusable template

```
PLANNER PROMPT:
For the task below, write a complete plan as numbered steps. Each step has:
Plan: [what this step accomplishes and why]
#E<n> = ToolName[input, which may reference earlier #E variables]
Tools: [ToolName1: description] [ToolName2: description]
Task: [the task]

SOLVER PROMPT (after your code executes all steps):
Task: [the task]
Evidence: #E1 = [result1]  #E2 = [result2] ...
Using only this evidence, produce the final answer.
```

### Worked example (real use case: competitor pricing brief)

Planner output for "Compare the published per-seat pricing of Vendor A and Vendor B and state which is cheaper for a 40-seat team":

```
Plan: Get Vendor A pricing page content.
#E1 = WebFetch[vendor-a.com/pricing]
Plan: Get Vendor B pricing page content.
#E2 = WebFetch[vendor-b.com/pricing]
Plan: Compute 40-seat totals from both pages.
#E3 = Calculator[extract per-seat prices from #E1 and #E2, multiply by 40]
```

The worker runs #E1 and #E2 in parallel, then #E3, and the Solver writes the comparison in one call. Total model calls: two, regardless of tool count.

---

# FAMILY TWO: SEARCH-STRUCTURED REASONING

---

## 7. Tree of Thoughts (ToT)

### What it is and how it works

Tree of Thoughts generalizes Chain of Thought from a single line of reasoning into a search tree. At each step, the model generates several candidate next thoughts instead of one, a separate evaluation pass scores each candidate for promise, and a search algorithm (breadth-first or depth-first search, the standard tree-exploration procedures from computer science) decides which branches to expand and which to prune. This gives the model what a single forward generation lacks: the ability to look ahead, compare alternatives, and backtrack out of dead ends. On the Game of 24 arithmetic puzzle, the original paper lifted GPT-4 from 4% success with CoT to 74% with ToT, which remains one of the most dramatic single-technique gains in the literature.

### The parts, and why each exists

The **thought decomposition** defines what one "thought" is for your problem (an equation step, a plan fragment, a paragraph), and it must be small enough to evaluate but large enough to be meaningful. The **generator prompt** asks for k diverse candidate next thoughts from a given state, which creates the branching. The **evaluator prompt** scores a state (as a value like sure/likely/impossible, or by voting across states), which is what makes pruning possible; without evaluation, a tree is just expensive brainstorming. The **search controller** is your orchestration code implementing BFS or DFS with a beam width (how many branches survive each level) and a depth limit.

### When to use it, and when not to

Use ToT for problems where the first idea is often wrong and exploration pays: puzzle solving, constrained generation (a plan meeting many simultaneous constraints), mathematical search, and design-space exploration. It can also be simulated cheaply in a single prompt by instructing the model to propose three approaches, critique each, and pursue the best, which captures a useful fraction of the benefit at a fraction of the cost. Avoid full ToT for routine tasks; the cost is one model call per generated and per evaluated node, which multiplies quickly.

### Pros and cons

ToT delivers step-change accuracy on search-shaped problems, makes exploration explicit and auditable, and lets you tune the cost-quality tradeoff via beam width and depth. The cons are heavy token cost, orchestration complexity, and dependence on the evaluator, since a weak evaluator prunes good branches.

### Source

Yao et al., "Tree of Thoughts: Deliberate Problem Solving with Large Language Models," NeurIPS 2023, arXiv:2305.10601.

### Reusable template (single-prompt simulation)

```
Task: [the problem]

Work through this as a deliberate search:
STEP 1: Propose [3] genuinely different approaches, one paragraph each.
STEP 2: Evaluate each approach against [the success criteria], score 1-10,
        and state its main failure risk.
STEP 3: Select the best approach. If its score is below [7], combine the
        strongest elements of two approaches instead.
STEP 4: Execute the selected approach fully.
STEP 5: Verify the result satisfies [criteria]; if not, backtrack to the
        next-best approach and execute it.
```

### Worked example (real use case: architecture selection)

```
Task: Choose a sync architecture for delivering operative notes to mobile
clients that may be offline for hours, with HIPAA-grade audit requirements.

STEP 1: Propose 3 genuinely different approaches (e.g., CRDT-based sync,
server-authoritative polling with delta tokens, event-sourced replication).
STEP 2: Evaluate each against: offline tolerance, audit completeness,
operational complexity on a two-person team. Score 1-10 each.
STEP 3: Select or hybridize.
STEP 4: Specify the chosen design: components, data flow, failure handling.
STEP 5: Verify against all three criteria explicitly; backtrack if any fails.
```

The output shows three branches, explicit scores, a pruning decision, and a verified survivor, which is exactly the audit trail a design review wants.

---

## 8. Graph of Thoughts (GoT)

### What it is and how it works

Graph of Thoughts extends the tree into an arbitrary directed graph: thoughts are vertices, dependencies are edges, and, unlike a tree, branches can merge. This unlocks two operations trees cannot express. Aggregation combines several partial solutions into one better solution, and refinement loops feed a thought back through improvement passes, forming cycles. The canonical demonstration is merge-sort-style problem solving: split a large input into chunks, solve each chunk in its own branch, then aggregate the branch results into a final merged answer. The paper showed GoT beating ToT on sorting quality by 62% while cutting cost by over 31%, precisely because divide-solve-merge maps naturally onto a graph and unnaturally onto a tree.

### The parts, and why each exists

The **graph of operations** is your explicit plan of the reasoning topology: which thoughts get generated, split, aggregated, refined, and in what order. The **transformation prompts** implement each operation type (generate, aggregate two thoughts into one, refine a thought given feedback). The **scoring prompt** ranks thoughts so aggregation picks the best inputs. The **controller** is orchestration code walking the graph. In practice you rarely need the full published framework; the durable idea is the map-reduce pattern for LLM reasoning, decompose, solve in parallel, merge with an aggregation prompt.

### When to use it, and when not to

Use GoT when the problem decomposes into parts whose solutions must be recombined: sorting or deduplicating large sets, summarizing many documents into one synthesis, merging independently drafted sections, ensembling multiple solution attempts into a best-of composite. Avoid it when the problem is genuinely sequential or small enough for CoT, because the orchestration overhead is substantial.

### Pros and cons

It is the most expressive reasoning topology, enables parallelism, and is often cheaper than ToT for decomposable tasks because branches are smaller. The cons are the highest implementation complexity in this family and the need to hand-design the graph per task class.

### Source

Besta et al., "Graph of Thoughts: Solving Elaborate Problems with Large Language Models," AAAI 2024, arXiv:2308.09687. See also Besta et al., "Demystifying Chains, Trees, and Graphs of Thoughts," arXiv:2401.14295 for the unifying taxonomy.

### Reusable template (aggregation pattern, the 90% case)

```
STAGE 1 (run once per chunk, in parallel):
  [Task instruction] applied to CHUNK [i]: [chunk content]
  Output a partial result in [exact format].

STAGE 2 (aggregation call):
  Below are [N] partial results produced independently for the same task.
  Merge them into a single result that:
  - resolves conflicts by [rule, e.g., preferring the majority or most recent]
  - removes duplicates
  - preserves [what must not be lost]
  Partial results:
  [1] ... [2] ... [N] ...
```

### Worked example (real use case: multi-document synthesis)

To synthesize ten vendor security whitepapers into one comparison, run Stage 1 ten times in parallel ("Extract: encryption at rest, BAA availability, audit certifications, in this exact JSON schema"), then run one Stage 2 aggregation call that merges the ten JSON fragments, resolves conflicting claims by flagging them, and emits the final comparison table. Two prompt designs, eleven calls, full parallelism.

---

## 9. Skeleton of Thought (SoT)

### What it is and how it works

Skeleton of Thought targets latency rather than accuracy. The model is first asked to produce only a skeleton, a numbered list of three-to-five-word points outlining the answer. Then each skeleton point is expanded in a separate, parallel model call. Because the expansions are independent, they run concurrently, and the paper reports up to 2.39x end-to-end speedups. A useful secondary effect is structural: forcing an outline first tends to produce better-organized long answers.

### The parts, and why each exists

The **skeleton prompt** demands brevity and a strict numbered format ("3-10 points, 3-5 words each"), because the skeleton is a routing artifact, not content. The **point-expanding prompt** receives the original question, the full skeleton for context, and the single point to expand, keeping expansions coherent with the whole. The **assembler** concatenates expansions in order.

### When to use it, and when not to

Use SoT for long, list-decomposable answers where latency matters: product FAQs, report sections, documentation generation, anything user-facing where time-to-complete-answer is felt. Avoid it for reasoning tasks where later parts depend on earlier parts (math, code with shared state), where independence is violated and quality degrades.

### Pros and cons

Large real latency wins with no model changes and improved answer structure. Cons: only fits decomposable content, expansions cannot reference each other, and total token cost rises slightly.

### Source

Ning et al., "Skeleton-of-Thought: Prompting LLMs for Efficient Parallel Generation," ICLR 2024, arXiv:2307.15337.

### Reusable template

```
CALL 1 (skeleton):
Question: [question]
Provide only the skeleton of the answer: a numbered list of [3-8] points,
3 to 5 words each. No elaboration.

CALL 2..N (parallel, one per point):
Question: [question]
Full skeleton: [skeleton]
Expand ONLY point [k] ("[point text]") into [2-4] sentences. Do not repeat
other points.
```

---

## 10. Buffer of Thoughts (BoT)

### What it is and how it works

Buffer of Thoughts adds memory across problems. It maintains a meta-buffer, a library of thought-templates, which are distilled, high-level solution patterns extracted from previously solved problems (for example, "for constraint-satisfaction puzzles: enumerate variables, propagate constraints, backtrack on conflict"). When a new problem arrives, the system retrieves the most relevant template, instantiates it with the problem's specifics, and reasons along the instantiated structure. A buffer-manager distills newly solved problems back into templates, so the library grows. Conceptually, BoT is retrieval-augmented generation where the retrieved objects are reasoning strategies rather than facts.

### The parts, and why each exists

The **problem distiller prompt** extracts the task's essential structure so retrieval matches on structure, not surface wording. The **meta-buffer** is the template store (in practice, a vector database over template descriptions). The **instantiation prompt** binds the abstract template to the concrete problem. The **buffer-manager prompt** generalizes a completed solution into a reusable template, which is the learning loop.

### When to use it, and when not to

Use BoT in production systems that face recurring problem families, coding assistants, support triage, diagnostic pipelines, where paying once to distill a strategy and reusing it beats re-deriving it every time; the paper reports both accuracy gains (51% on Checkmate-in-One) and cost around 12% of multi-query methods like ToT. It is overkill for one-off questions and requires infrastructure (storage, retrieval, curation).

### Pros and cons

Accumulating competence, strong accuracy at low marginal cost, and single-query efficiency. Cons: engineering overhead, template quality governs everything, and a polluted buffer degrades the whole system.

### Source

Yang et al., "Buffer of Thoughts: Thought-Augmented Reasoning with Large Language Models," NeurIPS 2024, arXiv:2406.04271.

### Reusable template (minimal in-prompt version)

```
You maintain a library of solution strategies. Relevant strategy retrieved
for this problem:

STRATEGY: [name]
WHEN IT APPLIES: [problem signature]
STEPS: 1) [abstract step] 2) [abstract step] 3) [abstract step]

Instantiate this strategy for the concrete problem below, mapping each
abstract step to the problem's specifics, then execute it.

PROBLEM: [problem]
```

This same shape is what Claude's "Skills" system and similar production features implement: retrieved procedural knowledge injected as a template before solving.

---

## 11. Self-Discover

### What it is and how it works

Self-Discover has the model compose its own reasoning structure before solving. It draws from a published catalog of 39 atomic reasoning modules, short descriptions such as "break the problem into subproblems," "use critical thinking," "think about analogous problems." In a first stage, run once per task type, the model SELECTs the relevant modules, ADAPTs their generic wording to the task domain, and IMPLEMENTs them as a concrete, ordered reasoning plan in JSON. In the second stage, that plan is prepended to every instance of the task and the model simply follows it. The paper shows it beating CoT on hard reasoning benchmarks while using 10 to 40 times less compute than self-consistency, because the expensive structure-discovery happens once and amortizes over all instances.

### The parts, and why each exists

The **module catalog** is the raw material of reasoning styles; you can use the paper's 39 or your own domain list. **SELECT** filters to what the task needs. **ADAPT** rewrites modules in the task's vocabulary so they bind tightly. **IMPLEMENT** converts prose into an executable key-value plan, which is what makes stage two mechanical. The **solving prompt** is just "follow this structure step by step."

### When to use it, and when not to

Use it when you process many instances of one task type and want a tailored reasoning procedure without hand-writing it: grading rubrics, review checklists, extraction procedures, evaluation harnesses. It is also an excellent meta-tool for generating the reasoning scaffolds you then freeze into system prompts. Skip it for one-off questions, where the two-stage overhead has nothing to amortize against.

### Pros and cons

Task-tailored structure, one-time discovery cost, transferable plans (structures discovered with a large model work when executed by smaller models). Cons: an extra pipeline stage, and discovered structures need human review before production freezing.

### Source

Zhou et al., "Self-Discover: Large Language Models Self-Compose Reasoning Structures," NeurIPS 2024, arXiv:2402.03620.

### Reusable template

```
STAGE 1 (once per task type):
Task description: [task type and one example]
Reasoning modules available: [paste module list]
1) SELECT the modules essential for this task.
2) ADAPT each selected module's description to this specific domain.
3) IMPLEMENT the adapted modules as an ordered JSON reasoning plan:
   {"step_1": "...", "step_2": "...", ...}

STAGE 2 (every instance):
Follow this reasoning structure step by step, filling each key with your
actual reasoning, then give the final answer.
Structure: [JSON plan from stage 1]
Instance: [the actual input]
```

---

# FAMILY THREE: DECOMPOSITION FRAMEWORKS

---

## 12. Least-to-Most Prompting

### What it is and how it works

Least-to-Most prompting splits problem solving into two explicit phases: first the model is asked to decompose a complex problem into an ordered list of simpler subproblems, then the subproblems are solved strictly in order, with each solved subproblem and its answer appended to the context before the next is attempted. The name describes the direction of travel, from the least complex prerequisite to the most complex final question. Its signature strength, demonstrated in the paper, is easy-to-hard generalization: taught on short examples, models using least-to-most solved compositional tasks far longer than anything in the prompt (99% on the SCAN benchmark versus 16% for CoT), because each step only ever requires bridging a small gap.

### The parts, and why each exists

The **decomposition prompt** produces the subproblem ladder, and its exemplars should demonstrate decomposition only, not solving, so the two skills stay separated. The **sequential solving loop** feeds subproblem k the accumulated answers of 1..k-1, which is the mechanism that carries progress forward. The **final composition** is usually just the last subproblem's answer.

### When to use it, and when not to

Use it for compositional problems where difficulty comes from depth of chaining rather than any single step: multi-stage math, nested queries, procedural transformations, curriculum-style tutoring. Prefer it over plain CoT when problems at inference time are systematically harder or longer than any example you can show. Avoid it when decomposition itself is the hard part and the model splits badly; then Plan-and-Solve or ToT may serve better.

### Pros and cons

Excellent length and complexity generalization, clean intermediate checkpoints, and subproblems can even be routed to different models or tools. Cons: multiple sequential calls add latency, and an early wrong sub-answer propagates forward uncorrected unless you add verification.

### Source

Zhou et al., "Least-to-Most Prompting Enables Complex Reasoning in Large Language Models," ICLR 2023, arXiv:2205.10625.

### Reusable template

```
CALL 1 (decompose):
To solve "[problem]", list the subproblems that must be answered first,
in order from simplest to the final question. Output a numbered list only.

CALL 2..N (solve sequentially):
[problem statement]
Already solved:
Q1: [subproblem 1]  A1: [answer 1]
...
Next question: [subproblem k]. Answer it using the results above.
```

### Worked example (real use case: data pipeline debugging)

Problem: "Why does the nightly ETL job produce 3% fewer rows on Mondays?" Decomposition call yields: 1) What is the row count by weekday for the last month? 2) Which pipeline stage shows the Monday deficit first? 3) What is different about that stage's Monday inputs? 4) What is the root cause? Each is then solved in order, with SQL results pasted in as answers, and the final sub-answer is the diagnosis.

---

## 13. Plan-and-Solve Prompting

### What it is and how it works

Plan-and-Solve is the zero-shot upgrade of "let's think step by step." Instead of that single trigger, the prompt instructs the model to first understand the problem and devise a plan, and only then carry the plan out step by step. The paper's extended variant (PS+) adds explicit directives to extract relevant variables and to calculate intermediate results carefully, which measurably reduces the calculation and missing-step errors that plague plain zero-shot CoT. It is the highest ratio of benefit to implementation effort in this document: one sentence of prompt, no examples, no orchestration.

### The parts, and why each exists

The **comprehension directive** ("first understand the problem") forces a restatement pass that catches misreads. The **planning directive** separates strategy from execution so the model commits to an approach before generating steps. The **execution directive** ("carry out the plan step by step") is the CoT engine. The **PS+ additions** (extract variables and numerals; compute intermediates carefully) patch the two dominant error classes found in the paper's analysis.

### When to use it, and when not to

Use it as your default zero-shot reasoning instruction anywhere you would have written "think step by step," especially for math and structured problems with no exemplars available. It is also the right pattern to embed in agent system prompts ("plan before acting"). It adds little on reasoning-tuned models that already plan internally, and it is redundant when you are using a heavier framework like ToT.

### Pros and cons

Free to adopt, measurable gains over zero-shot CoT, and a plan section that improves auditability. Cons: gains are modest compared to search-based methods, and the plan can be superficial if the task is unfamiliar.

### Source

Wang et al., "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models," ACL 2023, arXiv:2305.04091.

### Reusable template

```
[Problem]

Let's first understand the problem and extract the relevant variables and
their values. Then let's devise a complete plan to solve it. Then let's
carry out the plan, solving step by step and computing intermediate results
carefully. Finally, state the answer as: "Answer: [value]".
```

---

## 14. Step-Back Prompting

### What it is and how it works

Step-Back prompting inserts an abstraction step before problem solving: the model is first asked a step-back question, a more general question about the principles or concepts underlying the specific problem, answers it, and only then attacks the original problem grounded in those retrieved principles. For a physics question about a specific gas under specific conditions, the step-back question is "what physical law governs pressure, volume, and temperature?" The mechanism is that models often hold the correct general knowledge but fail to invoke it when buried in surface details; abstraction surfaces the right knowledge first. The paper reports gains such as +7 points on physics and up to +27% on multi-hop QA benchmarks.

### The parts, and why each exists

The **step-back question generator** ("what general principle or higher-level concept is this an instance of?") performs the abstraction, and it can be a separate call or a section of one prompt. The **principle answer** becomes injected context, functioning like retrieval from the model's own knowledge. The **grounded solving step** requires the final reasoning to explicitly apply the stated principle, which prevents the model from ignoring its own abstraction.

### When to use it, and when not to

Use it for knowledge-intensive domains where problems are instances of stable principles: physics, chemistry, law, medicine, regulatory questions, and detail-heavy multi-hop questions. Avoid it for shallow lookups and for creative tasks with no governing principle to retrieve.

### Pros and cons

Cheap (one extra step), strong on principle-governed domains, and the surfaced principle makes the answer checkable by a domain expert at a glance. Cons: an incorrectly chosen principle steers the whole answer wrong, and it adds nothing on trivial questions.

### Source

Zheng et al., "Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models," ICLR 2024, arXiv:2310.06117.

### Reusable template

```
Question: [specific question]

Step 1 (step back): What general principle, rule, or concept governs
questions of this type? State it precisely.

Step 2 (apply): Using the principle from Step 1 explicitly, reason through
the specific question and give the final answer.
```

### Worked example (real use case: HIPAA feature review)

```
Question: Can our mobile app cache operative note text locally so it is
readable while offline?

Step 1 (step back): What does HIPAA's Security Rule require for electronic
protected health information at rest on end-user devices?

Step 2 (apply): Apply that requirement to local caching: state what caching
design would satisfy it (encryption at rest, access controls, remote wipe),
and answer whether and how offline caching is permissible.
```

---

# FAMILY FOUR: SELF-CORRECTION AND VERIFICATION FRAMEWORKS

---

## 15. Reflexion

### What it is and how it works

Reflexion turns failure into a learning signal without touching model weights. An agent attempts a task, receives an outcome signal (a failed unit test, a wrong answer, an environment error), and is then prompted to write a verbal reflection: a short analysis of why the attempt failed and what to do differently. That reflection is stored in an episodic memory buffer and injected into the context of the next attempt, so trial two begins already knowing trial one's lesson. The loop repeats until success or a retry budget is exhausted. The paper's headline result is 91% pass@1 on the HumanEval coding benchmark, versus 80% for GPT-4 without reflection, and the pattern now underlies most self-healing coding agents.

### The parts, and why each exists

The **Actor** is the base prompt attempting the task. The **Evaluator** produces the outcome signal, and its quality bounds the whole system; unit tests and compilers are ideal evaluators because they are objective, while an LLM judge is usable but noisier. The **Self-Reflection prompt** is the heart: it must demand a causal diagnosis ("why did this fail") and a concrete revised strategy ("what will I change"), not an apology or a restatement. The **episodic memory** carries reflections across attempts, capped at the last few to control context growth. The **retry loop** is orchestration with a maximum-attempts budget.

### When to use it, and when not to

Use Reflexion whenever an objective checker exists: code against tests, SQL against schemas, structured outputs against validators, agent tasks against environment success flags. It is the correct backbone for any generate-check-fix pipeline. Avoid it where no reliable evaluator exists, because reflecting on a noisy or wrong signal actively degrades performance; published follow-up work (Huang et al., "Large Language Models Cannot Self-Correct Reasoning Yet," arXiv:2310.01798) shows self-correction without external feedback often makes answers worse.

### Pros and cons

Large, reliable gains on checkable tasks, no fine-tuning, and a readable log of what the system learned. Cons: multiplies cost by the retry count, requires a trustworthy evaluator, and reflections can overfit the specific test rather than the actual goal (reward hacking in miniature).

### Source

Shinn et al., "Reflexion: Language Agents with Verbal Reinforcement Learning," NeurIPS 2023, arXiv:2303.11366.

### Reusable template

```
ATTEMPT PROMPT:
Task: [task]
Lessons from previous attempts (may be empty):
[reflection 1] [reflection 2]
Produce your solution.

EVALUATION: [run tests / validator; capture failure output]

REFLECTION PROMPT:
Your solution failed. Task: [task]
Your solution: [output]
Failure evidence: [test output / error]
Write a reflection with exactly two parts:
1) ROOT CAUSE: the specific reason it failed.
2) REVISED STRATEGY: the concrete change you will make next attempt.
Keep it under 100 words. This will be shown to your next attempt.
```

### Worked example (real use case: self-healing code generation)

Attempt 1 writes a parser; the test harness returns "IndexError on empty input line 14." The reflection call returns: "ROOT CAUSE: I indexed fields[0] without checking for blank lines. REVISED STRATEGY: skip empty lines before splitting and add a guard clause." Attempt 2 receives that reflection in-context and passes. Your orchestration is a while-loop with three prompts and a test runner, which is exactly how production coding agents implement their fix loops.

---

## 16. Self-Refine

### What it is and how it works

Self-Refine is Reflexion's sibling for tasks with no objective checker. The same model plays three roles in sequence: it generates an initial output, then critiques that output against stated quality dimensions as if it were a reviewer, then revises the output to address each point of the critique, iterating for a fixed number of rounds or until the critique finds nothing material. The paper shows humans prefer Self-Refine outputs over single-pass outputs in roughly 90% of cases across writing, code readability, and dialogue tasks. The critical design detail is that the critique must be dimension-specific and actionable; a generic "make it better" pass produces cosmetic edits.

### The parts, and why each exists

The **generation prompt** produces the draft. The **feedback prompt** is the load-bearing part: it names the exact dimensions to critique (accuracy, structure, tone, edge cases) and demands specific, located, actionable feedback, because vague critique yields vague revision. The **refine prompt** receives draft plus critique and must address every point or justify not doing so, which prevents silent dropping. The **stopping rule** caps iterations (two or three rounds capture most of the gain; more invites drift and over-polishing).

### When to use it, and when not to

Use it for quality-graded outputs: prose, documentation, emails, designs, code style, summaries. It is the cheapest quality lift for generation tasks and works in a single conversation. Do not use it to fix factual or logical correctness, per the self-correction caveat above; without external feedback the model cannot reliably detect its own reasoning errors, and iteration can entrench them.

### Pros and cons

Consistent quality improvement, zero infrastructure, works on any model. Cons: cannot create correctness, roughly triples token cost per round, and successive rounds hit diminishing returns fast.

### Source

Madaan et al., "Self-Refine: Iterative Refinement with Self-Feedback," NeurIPS 2023, arXiv:2303.17651.

### Reusable template

```
ROUND 0: [Generation prompt for the task]

FEEDBACK PROMPT:
Review the draft below strictly against these dimensions:
1) [dimension, e.g., factual precision]  2) [structure]  3) [tone for audience]
For each dimension give: verdict, the specific locations at issue, and the
concrete fix. If a dimension needs no change, say "no change".
Draft: [draft]

REFINE PROMPT:
Revise the draft to implement every fix in the feedback. Do not change
anything the feedback did not flag. Feedback: [feedback]  Draft: [draft]

(Repeat feedback/refine up to [2] times or until all verdicts are "no change".)
```

---

## 17. Chain of Verification (CoVe)

### What it is and how it works

Chain of Verification is a four-stage anti-hallucination protocol aimed at factual claims. The model drafts an answer; then it generates a list of verification questions, one per checkable claim in the draft; then, crucially, it answers each verification question independently, without the draft in context, so the check is not biased by the very text being checked; finally it rewrites the answer keeping only claims that survived verification. The independence of stage three is the entire trick: a model shown its own draft tends to confirm it, while the same model asked the bare factual question often answers correctly, and CoVe exploits that gap. The paper demonstrates large reductions in hallucinated entities on list-style and long-form factual tasks.

### The parts, and why each exists

The **baseline draft** surfaces the claims. The **verification planner** converts each claim into a standalone question, and questions must be self-contained because stage three sees nothing else. The **independent execution** stage answers each question in a fresh context (separate calls in the strict "factored" variant, which performs best). The **final revision** cross-checks draft against verification answers and drops or corrects failed claims, ideally marking what was removed.

### When to use it, and when not to

Use CoVe for factual long-form output where hallucination is the primary risk and no retrieval system is available: biographies, historical summaries, technical fact sheets, listicles. If you have retrieval or search, ground the verification answers in it and CoVe becomes stronger still. Skip it for reasoning or creative tasks, and note it verifies facts the model can know, not facts past its knowledge cutoff.

### Pros and cons

Meaningful hallucination reduction with no external systems, and the verification Q&A doubles as an audit artifact. Cons: three-to-four times the calls of a single answer, and it cannot rescue claims the model simply does not know.

### Source

Dhuliawala et al., "Chain-of-Verification Reduces Hallucination in Large Language Models," ACL Findings 2024, arXiv:2309.11495.

### Reusable template

```
CALL 1: [Question]. Draft a complete answer.

CALL 2: List every independently checkable factual claim in the draft as a
standalone verification question (self-contained, no pronouns).
Draft: [draft]

CALL 3 (one fresh call per question, draft NOT included):
Answer precisely and concisely: [verification question k]

CALL 4: Rewrite the draft so it is consistent with the verification answers
below. Remove or correct any claim they contradict; do not add new claims.
Draft: [draft]  Verifications: [Q/A pairs]
```

---

## 18. Constitutional Self-Critique (Critique-and-Revise Against Principles)

### What it is and how it works

This framework, distilled from Anthropic's Constitutional AI training method into a runtime prompting pattern, evaluates and revises an output against an explicit written set of principles, the "constitution." The model generates a draft, is then prompted to critique the draft specifically for violations of each listed principle, and finally revises to remove the violations. It differs from Self-Refine in one decisive way: the evaluation criteria are externally fixed, written rules rather than the model's own taste, which makes the process consistent, auditable, and adjustable by editing the rule list. In production this is how teams enforce brand voice, legal constraints, safety policies, and style guides at generation time.

### The parts, and why each exists

The **constitution** is a short, numbered list of testable principles; each must be concrete enough that a violation is identifiable ("no unverifiable superlatives" works, "be good" does not). The **critique prompt** walks the draft principle by principle and cites violations with locations, forcing coverage. The **revision prompt** fixes cited violations only, preserving everything compliant. Optionally a **loop** repeats until the critique is clean.

### When to use it, and when not to

Use it wherever outputs must comply with written policy: regulated communications, customer-facing copy, medical or legal adjacent text, agent behavior constraints, and as the output filter stage of any pipeline. It is also the honest way to encode "company voice." Avoid over-long constitutions; past roughly ten principles, coverage per principle degrades.

### Pros and cons

Deterministic, auditable criteria; policy changes are one-line edits; excellent fit for compliance. Cons: only as good as the written principles, adds a critique-revise round of cost, and mechanical rule-following can flatten style if principles are drafted clumsily.

### Source

Bai et al., "Constitutional AI: Harmlessness from AI Feedback," 2022, arXiv:2212.08073 (the training-time origin of the runtime pattern).

### Reusable template

```
CONSTITUTION
1. [principle, e.g., Every quantitative claim must cite its source.]
2. [principle, e.g., No promises about timelines.]
3. [principle, e.g., Reading level: educated non-specialist.]

CALL 1: [Generation task]

CALL 2: Audit the draft against each constitution principle in order. For
each: PASS, or VIOLATION with quoted location and required fix.

CALL 3: Revise the draft to resolve every violation. Change nothing else.
```

---

## 19. System 2 Attention (S2A)

### What it is and how it works

System 2 Attention attacks a different failure mode: distraction. LLMs are measurably swayed by irrelevant context, leading questions, and embedded opinions ("I think the answer is X, but check for me"), because soft attention attends to everything present. S2A adds a filtering pass: the model first rewrites the input, extracting only the parts genuinely relevant to the task and stripping opinions, flattery, and noise, and then answers using only the cleaned rewrite. The name is a nod to Kahneman's System 2, deliberate attention replacing reflexive attention. The paper shows it restores accuracy on questions contaminated with misleading hints and reduces sycophancy, the tendency to agree with a stated opinion.

### The parts, and why each exists

The **extraction prompt** performs the rewrite, with explicit instructions to separate useful facts from opinions and irrelevant text, because naming the contaminant classes is what makes the filter effective. The **clean-context answering prompt** operates on the rewrite alone, which is the step that actually removes the influence; answering with both original and rewrite present forfeits most of the benefit.

### When to use it, and when not to

Use it when inputs are adversarial or noisy: user questions embedding a presumed answer, documents mixing narrative with data, form submissions with rambling free text, and any evaluation setting where sycophancy corrupts judgments (grading, review, fact-checking). It also functions as a lightweight prompt-injection dampener for content passed through it, though it is not a security control. Skip it for clean, trusted inputs, where it is pure overhead.

### Pros and cons

Cuts sycophancy and distraction measurably, simple two-call structure, composes in front of any other framework. Cons: the filter can occasionally discard something relevant, doubles input processing cost, and adds latency.

### Source

Weston and Sukhbaatar, "System 2 Attention (is something you might need too)," 2023, arXiv:2311.11829.

### Reusable template

```
CALL 1 (filter):
Rewrite the input below, keeping only information relevant to answering the
core question. Remove stated opinions, suggested answers, flattery, and
unrelated text. Output: CONTEXT: [relevant facts]  QUESTION: [neutral question]

Input: [raw user input]

CALL 2 (answer):
[Paste only the CONTEXT and QUESTION from call 1.] Answer the question.
```

---

# FAMILY FIVE: KNOWLEDGE AND RETRIEVAL FRAMEWORKS

---

## 20. Retrieval-Augmented Generation (RAG) Prompting

### What it is and how it works

Retrieval-Augmented Generation is the architecture in which relevant documents are fetched from an external store (a vector database queried by embedding similarity, a search engine, or both) and injected into the prompt as grounding context, and the model is instructed to answer from that context. The retrieval half is an infrastructure problem; what belongs in this document is the prompting half, which determines whether the retrieved context actually governs the answer. A well-engineered RAG prompt does four things: delimits the context unambiguously, restricts the model to that context, defines the behavior when the context is insufficient (say so, rather than improvise), and requires citations back to specific passages so every claim is traceable.

### The parts, and why each exists

The **context block with delimiters** (XML tags or fenced sections) prevents the model from confusing instructions with data and gives citation anchors. The **grounding instruction** ("answer only from the provided context") overrides the model's default of blending context with parametric memory. The **insufficiency clause** ("if the context does not contain the answer, state that explicitly") is the single highest-value line in RAG prompting, because the default failure mode is confident fabrication when retrieval misses. The **citation requirement** makes answers verifiable and exposes retrieval failures immediately.

### When to use it, and when not to

Use it whenever answers must come from a specific corpus: internal documentation, medical references, legal texts, product manuals, codebase knowledge. Combine with Self-Ask (entry 4) for query decomposition and with CoVe (entry 17) using retrieval-grounded verification for maximum factuality. It is unnecessary when the model's parametric knowledge suffices and freshness does not matter.

### Pros and cons

Grounded, current, citable answers over private data without retraining. Cons: quality is bounded by retrieval quality (garbage in, confident garbage out), long contexts cost tokens and can bury the relevant passage, and retrieved text is an injection surface that must be treated as data, never as instructions.

### Source

Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," NeurIPS 2020, arXiv:2005.11401, plus the practitioner grounding-prompt patterns that grew around it.

### Reusable template

```
You answer strictly from the provided context.

<context>
[Passage 1, id=P1] ...
[Passage 2, id=P2] ...
</context>

RULES
- Use only the context above. Do not use outside knowledge.
- Cite the passage id after every claim, like [P1].
- If the context is insufficient to answer, reply exactly:
  "The provided context does not contain this information," and state what
  is missing.

QUESTION: [user question]
```

---

## 21. Generated Knowledge Prompting

### What it is and how it works

Generated Knowledge prompting is retrieval augmentation without a retriever: the model is first asked to generate relevant facts about the question's topic, and those generated facts are then placed in the prompt as context for answering. It sounds circular but is not, because generation of declarative facts and application of facts under a question's framing are different operations, and models are more accurate at the first. Surfacing knowledge as explicit text lets the answering step condition on it directly, which the paper shows improves commonsense reasoning benchmarks. Step-Back prompting (entry 14) is the principle-level special case of the same move.

### The parts, and why each exists

The **knowledge generation prompt** asks for numbered facts about the topic, deliberately not mentioning the final question's angle, so the facts are unbiased. Generating **multiple knowledge sets** and answering with each, then voting (a self-consistency hybrid), is the paper's strongest configuration. The **integration prompt** presents facts plus question and requires the answer to use them.

### When to use it, and when not to

Use it for commonsense and knowledge-adjacent questions when you have no retrieval infrastructure, and as a cheap warm-up stage before reasoning in domains the model knows well. Prefer real RAG when a trustworthy corpus exists, since generated knowledge inherits the model's errors; every generated fact is still a potential hallucination.

### Pros and cons

Zero infrastructure, decent gains on commonsense tasks, composes with voting. Cons: facts are unverified model output, so this must never be the factuality backstop in high-stakes systems.

### Source

Liu et al., "Generated Knowledge Prompting for Commonsense Reasoning," ACL 2022, arXiv:2110.08387.

### Reusable template

```
CALL 1: Generate [4] numbered, factual statements about [topic of the
question], independent of any particular question about it.

CALL 2:
Knowledge: [facts from call 1]
Question: [question]
Answer the question, explicitly using the knowledge above where relevant.
```

---

## 22. Chain of Density (CoD)

### What it is and how it works

Chain of Density is a specialized iterative framework for summarization that controls the information density of the result. The model first writes a deliberately sparse summary of a fixed length, then repeats a cycle: identify one to three informative entities from the source that the current summary is missing, and rewrite the summary to include them without increasing its length, forcing compression through abstraction and fusion rather than growth. After several iterations the summary holds far more information per token. The paper found human preference peaks around the middle iterations, denser than a naive summary but before the text becomes overpacked.

### The parts, and why each exists

The **fixed length constraint** is the engine; density can only rise if length cannot. The **missing-entity identification step** makes each iteration's addition explicit and auditable. The **rewrite-and-fuse step** performs the compression. Emitting **all iterations as JSON** lets you select the density level you want downstream.

### When to use it, and when not to

Use it for executive summaries, abstracts, alert digests, and any summary destined for a hard length budget where every token must earn its place. Avoid it for narrative or explanatory summaries meant to be easy reading, since high density trades away readability.

### Pros and cons

Precise density control, auditable additions, and a selectable quality ladder in one call. Cons: single-purpose (summarization only) and the final iterations can become dense past the point of comfortable reading.

### Source

Adams et al., "From Sparse to Dense: GPT-4 Summarization with Chain of Density Prompting," EMNLP New Frontiers in Summarization Workshop 2023, arXiv:2309.04269.

### Reusable template

```
Article: [text]

Write a summary in exactly [4] sentences, then improve it [4] times.
Each iteration:
1) List 1-3 informative entities from the article missing from the summary.
2) Rewrite the summary to include them WITHOUT increasing sentence count,
   using compression and fusion, never dropping previously included entities.
Output JSON: [{"missing_entities": "...", "denser_summary": "..."}, ...]
```

---

# FAMILY SIX: STRUCTURAL AND CONTROL FRAMEWORKS

---

## 23. Few-Shot In-Context Learning (ICL)

### What it is and how it works

Few-shot in-context learning is the foundational mechanism most other frameworks build on: you place a handful of input-output example pairs in the prompt, and the model infers the task, the format, and the decision boundary from them, performing the transformation on new inputs without any weight updates. It was the headline discovery of the GPT-3 paper and remains the single most reliable way to control output format and to teach judgment calls that are hard to articulate as rules. The examples do double duty, defining both what to do and exactly how the output must look, which is why parsing-critical pipelines lean on it.

### The parts, and why each exists

The **task instruction** frames what the examples demonstrate, because examples alone can be ambiguous. The **exemplars** carry the signal, and four properties dominate their effectiveness: format consistency (identical delimiters and structure across all examples, which the model will mirror exactly), coverage (include the edge cases and at least one example of each output class, including the "none of the above" case), label correctness, and recency bias awareness (models weight later examples more, so put the most representative last). The **input slot** presents the new case in precisely the exemplar format.

### When to use it, and when not to

Use it whenever output format must be exact, whenever the task involves classification or extraction with subtle boundaries, and whenever a rule is easier to show than to state. Three to eight well-chosen examples typically saturate the benefit. Use zero-shot instead when the task is simple and token budget is tight, and be careful with reasoning tasks: examples of wrong reasoning styles can anchor the model into them.

### Pros and cons

Highest-precision format control available, teaches tacit judgment, works on every model. Cons: consumes context, examples can silently encode bias, and performance is sensitive to example choice and order, which is exactly the sensitivity that automated optimizers (entries 26 to 28) exploit and fix.

### Source

Brown et al., "Language Models are Few-Shot Learners," NeurIPS 2020, arXiv:2005.14165.

### Reusable template

```
[Task instruction: what the mapping is and the output rules.]

Input: [example input 1]
Output: [example output 1]

Input: [example input 2 covering a different class]
Output: [example output 2]

Input: [edge case, e.g., where the correct output is "NONE"]
Output: NONE

Input: [real input]
Output:
```

---

## 24. Role and Expert Prompting (Persona Prompting, ExpertPrompting)

### What it is and how it works

Role prompting assigns the model an identity ("You are a board-certified coding auditor with fifteen years of CPT compliance experience") before the task. The mechanism is conditioning: the persona shifts the model's output distribution toward the vocabulary, caution level, structure, and standards associated with that role in its training data. The ExpertPrompting refinement showed that detailed, task-specific expert descriptions, ideally generated per task rather than generic ("you are a helpful assistant"), measurably improve answer quality. Honest framing matters here: recent evaluations find persona effects on raw factual accuracy are small and inconsistent on strong models, while effects on tone, terminology, thoroughness, framing, and audience fit are large and reliable. Treat it as a style-and-standards control, not an accuracy hack.

### The parts, and why each exists

The **identity statement** sets domain and seniority. The **standards clause** is the underused part: naming the professional standards the role implies ("apply NCCI bundling edits; flag ambiguity rather than guessing") converts the persona from costume into checklist. The **audience statement** ("writing for a hospital CFO") controls register independently of the expert identity.

### When to use it, and when not to

Use it to set voice, rigor, terminology, and perspective, and in multi-agent systems (entry 25) where distinct personas create genuinely different viewpoints. Do not rely on it to make a model factually smarter, and never let a persona instruction override safety or accuracy requirements.

### Pros and cons

Cheap, immediate control over style and professional framing; the standards clause adds real rigor. Cons: negligible accuracy gains on strong models, risk of overconfident tone matching the persona, and stacking many persona traits dilutes all of them.

### Source

Xu et al., "ExpertPrompting: Instructing Large Language Models to be Distinguished Experts," 2023, arXiv:2305.14688.

### Reusable template

```
You are [specific role with seniority and domain].
You apply these professional standards: [standard 1]; [standard 2];
[behavior under uncertainty, e.g., flag rather than guess].
Your audience is [who], so calibrate depth and terminology accordingly.

Task: [task]
```

---

## 25. Multi-Agent Debate

### What it is and how it works

Multi-agent debate runs several model instances (or one model in several roles) against the same problem, then makes them exchange and critique each other's answers over one or more rounds before a final answer is produced by convergence or by a judge. The mechanism is that independent attempts make partially uncorrelated errors, and forcing each agent to read and respond to the others' reasoning surfaces those errors in a way solitary self-critique does not; Du et al. showed accuracy gains on math and reasoning plus reduced hallucination, and the pattern generalizes into adversarial forms (a proposer versus a dedicated red-team critic) that are now standard for design and security review. It is the runtime cousin of self-consistency: voting exchanges only answers, debate exchanges reasoning.

### The parts, and why each exists

The **agent prompts** should differ in perspective (different personas from entry 24, or different solution strategies) to decorrelate errors; identical agents mostly agree with themselves. The **debate round format** shows each agent the others' answers and requires it to critique specifics and then update or defend its own, which is the error-surfacing step. The **termination rule** is either convergence, a fixed round count (two rounds capture most of the gain), or a **judge prompt** that weighs the final positions and rules.

### When to use it, and when not to

Use it for high-stakes judgments where blind spots are the risk: architecture reviews, security assessments, medical or legal reasoning checks, evaluating contentious claims. The proposer-critic special case is the practical default: one agent builds, one agent attacks, a third rules. Avoid it for routine tasks; cost scales as agents times rounds, and debate can also converge confidently on a shared wrong answer, so it complements rather than replaces external verification.

### Pros and cons

Catches single-viewpoint blind spots, produces an argument record, and maps naturally onto review workflows. Cons: among the most expensive patterns here, needs decorrelated agents to work, and majority pressure can suppress a lone correct agent.

### Source

Du et al., "Improving Factuality and Reasoning in Language Models through Multiagent Debate," ICML 2024, arXiv:2305.14325.

### Reusable template (proposer-critic-judge)

```
CALL 1 (Proposer): [Persona A]. Produce the best solution to: [problem].
Justify each major decision.

CALL 2 (Critic): [Persona B, adversarial expert]. Attack the proposal below.
Find concrete flaws: failure modes, hidden assumptions, cheaper alternatives.
No praise. Proposal: [call 1 output]

CALL 3 (Proposer rebuttal): Address each criticism: concede and revise, or
refute with reasoning. Output the revised solution.

CALL 4 (Judge): [Neutral senior persona]. Given the proposal, critique, and
rebuttal, deliver the final verdict and the final recommended solution.
```

---

## 26. Prompt Chaining (Sequential Decomposition Pipelines)

### What it is and how it works

Prompt chaining decomposes a complex job into a fixed pipeline of simple prompts, where each prompt performs one operation and its output becomes the next prompt's input. Instead of one mega-prompt asking for extraction, analysis, drafting, and formatting simultaneously, you run four small prompts in sequence. Each stage does one thing, so each stage can be short, testable, and independently improved, and intermediate outputs become inspection points where validation code or a human can intervene. This is less a research technique than the load-bearing engineering pattern of production LLM systems; nearly every serious pipeline is a chain with other frameworks from this document installed as stages.

### The parts, and why each exists

The **stage decomposition** follows one rule: one transformation per prompt, because mixing tasks in one prompt lets errors in one contaminate the others and makes failures undiagnosable. The **interface contracts** define each stage's exact output format (JSON schemas earn their keep here) so downstream stages parse reliably. The **validators** between stages are ordinary code checking the contract before the next call, catching failures at the cheapest possible point. The **routing logic** optionally branches the chain based on a classification stage, which is how you build triage systems.

### When to use it, and when not to

Use it for any multi-step production workflow: document processing, report generation, data enrichment, email triage, evaluation pipelines. Choose chaining over a single big prompt when you need testability, when different stages suit different models (cheap model classifies, strong model drafts), or when any stage needs human review. Choose an agent (ReAct) instead when the steps cannot be fixed in advance.

### Pros and cons

Debuggability, stage-level quality control, model mixing for cost, and graceful human-in-the-loop insertion. Cons: latency accumulates across stages, contracts add engineering overhead, and errors still propagate forward if validators are weak.

### Source

An engineering pattern rather than a single paper; systematized in Wu et al., "AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts," CHI 2022, arXiv:2110.01691.

### Reusable template

```
STAGE 1 (extract): From the input below, output JSON exactly matching:
{"field1": ..., "field2": ...}. Input: [raw input]
   [validator: JSON parses, required fields present]

STAGE 2 (analyze): Given [stage 1 JSON], determine [decision] using
[criteria]. Output JSON: {"decision": ..., "rationale": ...}
   [validator: decision is in the allowed set]

STAGE 3 (produce): Using [stage 2 JSON], write [final artifact] for
[audience] in [format].
```

---

## 27. Rephrase and Respond (RaR)

### What it is and how it works

Rephrase and Respond has the model restate and expand the user's question in its own words before answering it, in the same response or in a two-step version where the rephrased question from one call is answered by a second. The mechanism is disambiguation: human questions are routinely underspecified or oddly framed, and a model that first normalizes the question into its clearest form answers the clarified version instead of guessing at the fuzzy one. The paper shows consistent gains across tasks, and the two-step variant lets a strong model rephrase for a cheaper answering model. It also mitigates known failure cases where question framing itself misleads the model.

### The parts, and why each exists

The **rephrase instruction** ("rephrase and expand the question, resolving ambiguities") performs the normalization, and "expand" matters because it pulls implicit constraints into the open. The **respond instruction** binds the answer to the rephrased question. The **two-step split** additionally exposes the rephrasing so a user or pipeline can confirm the interpretation before spending the answer.

### When to use it, and when not to

Use it at the front of user-facing systems where question quality is uncontrolled, and pair it with S2A (entry 19): S2A removes noise, RaR resolves ambiguity. Skip it for well-specified programmatic inputs, where it adds tokens and can occasionally over-interpret a question that was already precise.

### Pros and cons

Cheap, one-line adoption, real gains on ambiguous input, and the visible rephrasing doubles as an interpretation check. Cons: mild cost overhead and a small risk of reframing the question into something the user did not ask, which is why exposing the rephrase is good practice.

### Source

Deng et al., "Rephrase and Respond: Let Large Language Models Ask Better Questions for Themselves," 2023, arXiv:2311.04205.

### Reusable template

```
[User question]

First, rephrase and expand the question above to make it fully precise:
resolve ambiguities and state implicit assumptions explicitly.
Then answer the rephrased question.
Format:
Rephrased question: ...
Answer: ...
```

---

# FAMILY SEVEN: AUTOMATED AND META-LEVEL PROMPT OPTIMIZATION

---

## 28. Automatic Prompt Engineer (APE)

### What it is and how it works

APE treats the instruction itself as the object to optimize, using an LLM to write it. Given a small set of input-output demonstrations of the target task, a generator model is asked to propose many candidate instructions that would produce those outputs from those inputs; each candidate is then scored by actually running it on a held-out set of examples and measuring accuracy; the best survives, optionally after a resampling round that asks the model for variations of the current winners. APE's most famous artifact is discovering that "Let's work this out in a step by step way to be sure we have the right answer" outperforms the human-written "Let's think step by step," a concrete demonstration that machine-searched prompts beat hand-written ones.

### The parts, and why each exists

The **demonstration set** defines the task by example, because the generator infers the instruction from what maps inputs to outputs. The **candidate generator prompt** ("I gave a friend an instruction; based on these input-output pairs, the instruction was:") produces the search population. The **scoring harness** is real execution against held-out labeled examples, which is what keeps selection honest; scoring by vibes selects fluent prompts, not effective ones. The **iterate/resample loop** performs local search around winners.

### When to use it, and when not to

Use it when you have a labeled evaluation set and a prompt that will run at scale, where a few points of accuracy are worth an offline search. It is the entry point to the whole optimization family. Without a scorable eval set, none of this family applies, which is itself the lesson: build the eval first.

### Pros and cons

Finds instructions humans would not write, fully automatic given an eval set, and one-time offline cost. Cons: requires labeled data, optimizes only the instruction string (not structure), and winners can overfit small eval sets.

### Source

Zhou et al., "Large Language Models Are Human-Level Prompt Engineers," ICLR 2023, arXiv:2211.01910.

### Reusable template (the loop, runnable by hand or in code)

```
GENERATE: "A model was given an instruction and produced these outputs from
these inputs: [10 input/output pairs]. Write 10 different candidate
instructions that would produce this behavior."

SCORE: run each candidate on [20 held-out pairs]; accuracy per candidate.

RESAMPLE: "Here are the two best instructions and their scores: [...].
Write 5 variations of each that might score higher."

Repeat SCORE/RESAMPLE [2] times; ship the winner.
```

---

## 29. OPRO (Optimization by PROmpting)

### What it is and how it works

OPRO generalizes APE into iterative optimization with the LLM as the optimizer. Each round, the optimizer model receives a meta-prompt containing the task description and a scored trajectory, the list of previously tried prompts sorted by their measured accuracy, and is asked to propose new prompts that will score higher; the proposals are evaluated on the task, appended to the trajectory, and the loop repeats. The model effectively performs gradient-free hill climbing in prompt space, using the score history as its gradient signal. OPRO produced "Take a deep breath and work on this problem step-by-step," which beat prior zero-shot triggers on GSM8K, and the same machinery optimizes anything expressible as text with a score.

### The parts, and why each exists

The **meta-prompt** carries three things: the task, the scored history (ascending order, so the best sit in the recency-favored position), and the request for improvements; the visible score trajectory is what lets the model infer what direction "better" points. The **evaluator** is the same honest execution harness as APE. The **trajectory memory** caps at the top twenty or so entries to fit context while preserving the signal.

### When to use it, and when not to

Use OPRO when squeezing maximum performance from a fixed prompt slot in a high-volume system, and when the thing being optimized is not just an instruction but any scored text (queries, agent policies, rubric wordings). Same prerequisite as APE: a trustworthy scorer, or the loop optimizes noise.

### Pros and cons

Stronger optima than one-shot generation, works on any scoreable text, and simple to implement (one loop, two prompts). Cons: many evaluation runs cost real money, convergence is not guaranteed, and overfitting to the eval set grows with iterations, so hold out a final test set.

### Source

Yang et al., "Large Language Models as Optimizers," ICLR 2024, arXiv:2309.03409.

### Reusable template (meta-prompt)

```
Your task is to write an instruction that maximizes accuracy on: [task].

Previously tried instructions and their scores (higher is better):
score 61: "[prompt A]"
score 68: "[prompt B]"
score 74: "[prompt C]"

Write [4] new instructions different from all of the above that you predict
will score higher than 74. Output them as a numbered list, nothing else.
```

---

## 30. DSPy (Programmatic Prompt Optimization)

### What it is and how it works

DSPy is a framework, not a prompt: it replaces hand-written prompt strings with declared programs. You specify each LLM step as a signature, a typed declaration of inputs and outputs such as "question, context -> answer," compose signatures into a pipeline in Python, define a metric that scores end-to-end outputs, and then run a compiler (optimizers such as BootstrapFewShot or MIPROv2) that automatically generates, tests, and selects the instructions and few-shot examples for every step to maximize your metric. The philosophy is the same shift compilers brought to programming: you declare what each stage must do, and the system searches for how to say it, and re-searches automatically when you swap models. It industrializes entries 23, 28, and 29 into one toolchain.

### The parts, and why each exists

**Signatures** declare stage contracts, decoupling intent from wording. **Modules** (Predict, ChainOfThought, ReAct) wrap signatures in a reasoning strategy, so techniques from this document become one-line choices. The **metric** defines success and drives everything; a weak metric compiles a weak pipeline. The **optimizer/compiler** performs the search, bootstrapping few-shot demos from your data and proposing instructions, and its output is an ordinary set of optimized prompts you can inspect and export.

### When to use it, and when not to

Use it for production pipelines with measurable outcomes, multiple LLM stages, and expected model migrations, where hand-tuning every stage after every model swap is unsustainable. Overkill for single prompts and unusable without training examples and a metric.

### Pros and cons

Prompts become reproducible build artifacts, model portability becomes a recompile, and multi-stage pipelines get jointly optimized. Cons: a framework dependency and learning curve, compilation costs eval runs, and debugging happens one level removed from the actual prompt text.

### Source

Khattab et al., "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines," ICLR 2024, arXiv:2310.03714. See also Fernando et al., "Promptbreeder," arXiv:2309.16797, for the evolutionary-search cousin of this family.

### Reusable template (minimal working shape)

```python
import dspy

class ExtractCode(dspy.Signature):
    """Extract the correct CPT code from an operative note."""
    note: str = dspy.InputField()
    cpt_code: str = dspy.OutputField(desc="five-digit CPT code only")

program = dspy.ChainOfThought(ExtractCode)

def metric(example, pred, trace=None):
    return example.cpt_code == pred.cpt_code

optimizer = dspy.MIPROv2(metric=metric)
compiled = optimizer.compile(program, trainset=examples)
```

---

## 31. Meta Prompting (Structure-Oriented and Conductor Variants)

### What it is and how it works

Meta prompting is an umbrella for two related, frequently confused ideas, both worth knowing. The structure-oriented variant (Zhang et al.) prioritizes the syntax and skeleton of a task over content examples: rather than few-shot examples full of specifics, the prompt supplies an abstracted template of how problems of this type are solved ("Problem: [statement]. Approach: identify [X], apply [Y], verify [Z]. Solution: [form]"), which is token-cheaper than few-shot and avoids anchoring on example content. The conductor variant (Suzgun and Kalai) turns one LLM into an orchestra: a conductor prompt receives the task, decides which expert personas are needed, generates a fresh specialized prompt for each expert, calls itself in each expert role, and integrates their outputs, dynamically writing the prompts that a human engineer would otherwise write per subtask. The common thread, and the reason they share a name, is prompts about prompts: the model operates on the structure of prompting itself. The everyday practical corollary is using a strong model to draft and iterate the prompts you deploy, which is the single most common professional workflow this family describes.

### The parts, and why each exists

In the structural variant, the **abstract template** carries the reasoning shape and the **placeholder vocabulary** keeps it content-free so it generalizes. In the conductor variant, the **conductor prompt** owns decomposition, expert selection, and integration; the **generated expert prompts** are disposable, task-specific instructions; the **integration step** reconciles expert outputs and owns the final answer.

### When to use it, and when not to

Use structural meta prompting when token budget is tight and the task family has a stable solution shape (math, proofs, structured analysis). Use the conductor when tasks are heterogeneous and you cannot pre-write every specialist prompt, effectively an in-context multi-agent system without infrastructure. Use the everyday corollary always: have your best model write and critique your production prompts against this document's frameworks.

### Pros and cons

Structural: token-efficient, content-unbiased; but requires a well-understood task shape. Conductor: adaptive specialist coverage with zero pre-built agents; but the conductor is a single point of failure and cost is several calls per task.

### Source

Zhang et al., "Meta Prompting for AI Systems," 2023, arXiv:2311.11482. Suzgun and Kalai, "Meta-Prompting: Enhancing Language Models with Task-Agnostic Scaffolding," 2024, arXiv:2401.12954.

### Reusable template (conductor)

```
You are the Conductor. For the task below:
1) Decompose it into subtasks.
2) For each subtask, define an expert (role + a complete, specific prompt
   you write for them, including their input and required output format).
3) Execute each expert prompt in turn, writing the expert's answer.
4) Integrate all expert outputs into the final deliverable, resolving
   conflicts and noting uncertainty.

Task: [task]
```

---

# CHOOSING A FRAMEWORK: THE DECISION MATRIX

The catalog above is a toolbox, and tools are chosen by the shape of the failure you are trying to prevent. The matrix below maps the dominant failure mode of a task to the frameworks that address it, which is how these techniques get selected in practice.

| Dominant problem | Reach for | Entries |
|---|---|---|
| Model does not know the facts | ReAct, RAG, Self-Ask with search | 1, 20, 4 |
| Model knows but reasons sloppily | CoT, Plan-and-Solve, Step-Back | 2, 13, 14 |
| Single answers are too unreliable | Self-Consistency, Multi-Agent Debate | 3, 25 |
| First idea is usually wrong; search needed | Tree of Thoughts, Graph of Thoughts | 7, 8 |
| Problem too big for one pass | Least-to-Most, Prompt Chaining, GoT aggregation | 12, 26, 8 |
| Arithmetic and computation errors | Program of Thoughts / PAL | 5 |
| Hallucinated facts in long output | Chain of Verification, RAG | 17, 20 |
| Output quality (not correctness) too low | Self-Refine, Chain of Density | 16, 22 |
| Output violates policy or voice | Constitutional Self-Critique | 18 |
| Failing attempts should teach the next one | Reflexion | 15 |
| Noisy, biased, or leading inputs | System 2 Attention, Rephrase and Respond | 19, 27 |
| Agent costs too much in tokens | ReWOO, Skeleton of Thought | 6, 9 |
| Same task family recurs at scale | Buffer of Thoughts, Self-Discover | 10, 11 |
| Format and judgment must be exact | Few-Shot ICL | 23 |
| Voice, rigor, perspective control | Role/Expert Prompting | 24 |
| The prompt itself is the bottleneck | APE, OPRO, DSPy, Meta Prompting | 28-31 |

Three composition rules close the document, because production systems almost never run one framework alone. First, structure composes vertically: S2A or RaR cleans the input, a reasoning framework produces the answer, and a verification framework (CoVe, Constitutional critique, Reflexion) guards the output; that three-layer stack is the canonical production pattern. Second, cost composes multiplicatively: self-consistency times ToT times debate is ruinous, so add exactly one expensive layer where the stakes justify it and keep everything else single-pass. Third, evaluation precedes optimization: the entire seventh family, and honestly the disciplined use of every other family, depends on having a scored evaluation set, so the highest-leverage prompt engineering act on any serious system is building the eval harness first, then letting measurements, not taste, choose among the frameworks in this document.

---

# CONSOLIDATED SOURCE LIST

1. Yao et al., ReAct, arXiv:2210.03629 (ICLR 2023)
2. Wei et al., Chain-of-Thought, arXiv:2201.11903 (NeurIPS 2022)
3. Kojima et al., Zero-Shot CoT, arXiv:2205.11916 (NeurIPS 2022)
4. Wang et al., Self-Consistency, arXiv:2203.11171 (ICLR 2023)
5. Press et al., Self-Ask, arXiv:2210.03350 (EMNLP Findings 2023)
6. Chen et al., Program of Thoughts, arXiv:2211.12588 (TMLR 2023)
7. Gao et al., PAL, arXiv:2211.10435 (ICML 2023)
8. Xu et al., ReWOO, arXiv:2305.18323
9. Yao et al., Tree of Thoughts, arXiv:2305.10601 (NeurIPS 2023)
10. Besta et al., Graph of Thoughts, arXiv:2308.09687 (AAAI 2024)
11. Besta et al., Demystifying Chains, Trees, and Graphs of Thoughts, arXiv:2401.14295
12. Ning et al., Skeleton-of-Thought, arXiv:2307.15337 (ICLR 2024)
13. Yang et al., Buffer of Thoughts, arXiv:2406.04271 (NeurIPS 2024)
14. Zhou et al., Self-Discover, arXiv:2402.03620 (NeurIPS 2024)
15. Zhou et al., Least-to-Most, arXiv:2205.10625 (ICLR 2023)
16. Wang et al., Plan-and-Solve, arXiv:2305.04091 (ACL 2023)
17. Zheng et al., Step-Back Prompting, arXiv:2310.06117 (ICLR 2024)
18. Shinn et al., Reflexion, arXiv:2303.11366 (NeurIPS 2023)
19. Madaan et al., Self-Refine, arXiv:2303.17651 (NeurIPS 2023)
20. Huang et al., LLMs Cannot Self-Correct Reasoning Yet, arXiv:2310.01798
21. Dhuliawala et al., Chain-of-Verification, arXiv:2309.11495 (ACL Findings 2024)
22. Bai et al., Constitutional AI, arXiv:2212.08073
23. Weston & Sukhbaatar, System 2 Attention, arXiv:2311.11829
24. Lewis et al., Retrieval-Augmented Generation, arXiv:2005.11401 (NeurIPS 2020)
25. Liu et al., Generated Knowledge Prompting, arXiv:2110.08387 (ACL 2022)
26. Adams et al., Chain of Density, arXiv:2309.04269
27. Brown et al., Few-Shot Learners (GPT-3), arXiv:2005.14165 (NeurIPS 2020)
28. Xu et al., ExpertPrompting, arXiv:2305.14688
29. Du et al., Multiagent Debate, arXiv:2305.14325 (ICML 2024)
30. Wu et al., AI Chains, arXiv:2110.01691 (CHI 2022)
31. Deng et al., Rephrase and Respond, arXiv:2311.04205
32. Zhou et al., APE, arXiv:2211.01910 (ICLR 2023)
33. Yang et al., OPRO, arXiv:2309.03409 (ICLR 2024)
34. Khattab et al., DSPy, arXiv:2310.03714 (ICLR 2024)
35. Fernando et al., Promptbreeder, arXiv:2309.16797
36. Zhang et al., Meta Prompting for AI Systems, arXiv:2311.11482
37. Suzgun & Kalai, Meta-Prompting (Conductor), arXiv:2401.12954
38. Schulhoff et al., The Prompt Report: A Systematic Survey of Prompting Techniques, arXiv:2406.06608 (the broadest single survey of this field, cataloging 58 text techniques)
39. Sahoo et al., A Systematic Survey of Prompt Engineering in LLMs, arXiv:2402.07927
