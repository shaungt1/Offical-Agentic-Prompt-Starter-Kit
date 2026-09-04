# QA Code Review — AI / ML / Model Testing Instructions

| Field | Value |
|---|---|
| Document | AI QA Code Review Instructions |
| Version | 1.0.0 |
| Parent | `qa-code-review.skill.md` |
| Scope | ML, LLM, RAG, NLP, embeddings, CV, YOLO, VLM, agents, RL, generative models, and AI-serving pipelines |
| Status | Active |
| Benchmark Note | Public benchmarks and leaderboards change frequently; verify the current benchmark version, harness, and model configuration at review time. |

## Purpose

AI QA is not “run accuracy and see if it looks good.” The reviewer must determine what capability the system claims to provide, what model, data, prompt, retrieval, tool, or runtime configuration actually produces that capability, what evaluation set represents the target use case, what metrics correspond to the cost of errors, what baseline the candidate must be compared against, and whether the evaluation itself is trustworthy.

AI systems also contain large amounts of deterministic software around the model: preprocessing, tokenization, schemas, feature construction, prompts, retrieval, reranking, tool calls, parsers, thresholds, caches, model routing, fallbacks, device/runtime code, and postprocessing. Those components should use deterministic software tests whenever the property being checked is deterministic. Nondeterminism is not an excuse to turn every test into an LLM-judge evaluation.

This document intentionally covers the main practical AI modalities in one place. If the company later performs the same model evaluation frequently, that section can be split into a dedicated skill while this document remains the routing reference.

## 1. Determine the Actual AI Task Before Selecting a Metric

Architecture names do not determine QA metrics.

A Transformer, attention-based model, CNN, diffusion architecture, graph model, mixture-of-experts model, or recurrent model can perform very different tasks. The reviewer must classify the **task and system behavior**, then select an evaluation method that measures that behavior.

The table below illustrates the distinction.

| System under review | What should actually be evaluated |
|---|---|
| Transformer classifier | classification errors, calibration, production slices, latency |
| Transformer LLM | task quality, generation behavior, instruction following, structured output, latency/cost |
| YOLO detector | object classification and localization |
| Vision Transformer | classification, detection, embedding, or multimodal task depending on how it is used |
| Embedding model | retrieval, similarity, clustering, ranking, downstream task quality |
| RAG system | retrieval, context assembly, generation, grounding, citations, end-to-end answer quality |
| Tool-using LLM | task completion, tool selection, arguments, side effects, state, recovery |
| Reinforcement-learning policy | rollout success, reward, constraints, stability across seeds/environments |
| Diffusion image/video model | prompt adherence, perceptual/domain quality, consistency, safety, latency |
| OCR pipeline | detection/crop quality, recognition error, reading order, downstream extraction |

Do not invent an “attention score” merely because the implementation contains attention. Evaluate what the attention-based system is required to accomplish.

### Completion condition

The reviewer can state the AI task in one sentence and can explain why the selected metrics measure that task.

## 2. Record the Exact Candidate Configuration

Before computing a score, identify the exact system being evaluated.

Record, when applicable:

- model family and name;
- model checkpoint or immutable artifact identifier;
- model architecture and configuration;
- tokenizer or processor version;
- weights precision or quantization;
- runtime or inference engine;
- system, developer, and prompt-template versions;
- generation parameters;
- tool definitions;
- retrieval and reranking configuration;
- decision thresholds;
- preprocessing;
- postprocessing;
- target hardware;
- relevant library versions;
- training code/configuration when training changed;
- dataset versions and splits;
- current production or other baseline model.

A score without reproducible configuration is weak evidence. If two reviewers cannot reconstruct the same model configuration, they cannot reliably compare results.

## 3. Write the Evaluation Claim Before Running the Evaluation

The evaluation must test a specific claim.

Examples:

> The candidate page detector improves or preserves recall for small pages without causing an unacceptable precision regression on the approved release-validation set.

> The fine-tuned classifier reduces false negatives for the fraud class while preserving the accepted false-positive rate.

> The new LLM extraction prompt improves field completeness without increasing schema failures or unsupported values.

> The new RAG configuration improves answer correctness while preserving retrieval latency and does not increase unsupported factual claims.

> The updated agent completes the workflow more often without increasing unauthorized, duplicate, or unnecessary tool actions.

The metric, dataset, and test environment must actually be capable of proving or disproving the claim.

OpenAI's evaluation guidance emphasizes task-specific evaluation, representative production distributions, continuous evaluation, logging, automated scoring where useful, and calibration of automated graders against human judgment. It also warns against generic “vibe-based” evaluation.

Reference: https://developers.openai.com/api/docs/guides/evaluation-best-practices

## 4. Perform Dataset and Split QA Before Trusting Model Metrics

A sophisticated metric applied to a contaminated or unrepresentative test set can produce a confident but invalid conclusion.

### 4.1 Verify split integrity

Determine exactly how training, validation, and test sets were created.

Check for:

- exact duplicates across splits;
- near-duplicates;
- frames from the same video spread across train and test;
- pages from the same document spread across train and test when document-level independence is required;
- records from the same user/device/session split across sets when that creates leakage;
- temporal leakage;
- future information used to generate labels or features;
- augmented copies crossing splits;
- benchmark/test examples present in fine-tuning data;
- prompt/evaluation contamination.

The independence unit must match the generalization claim. If the product must generalize to new videos, splitting individual frames randomly is generally misleading because near-identical frames can occur in both training and evaluation.

### 4.2 Inspect label quality

Review:

- annotation instructions;
- class taxonomy;
- ambiguous labels;
- missing labels;
- incorrect labels;
- box and mask quality;
- entity-span boundaries;
- inconsistent units;
- inter-annotator disagreement when available;
- source or annotator bias;
- changes in labeling policy over time.

Sample actual records, especially false positives, false negatives, rare classes, and edge conditions.

### 4.3 Verify production representativeness

Compare the evaluation distribution with expected production conditions.

Relevant dimensions can include:

- class frequency;
- language;
- domain;
- source;
- device or camera;
- image resolution;
- lighting;
- blur;
- orientation;
- text length;
- document type;
- user behavior;
- sensor conditions;
- time period;
- noise and corruption.

A public benchmark can measure broad capability while being a poor release gate for a specialized product.

### 4.4 Version the data

Record an immutable dataset version, hash, snapshot, or extraction date. If the data is generated from a query, preserve the query/filter and date when practical.

### Completion condition

The reviewer can defend why the evaluation data is independent enough, labeled well enough, and representative enough for the claim being made.

## 5. Compare Candidate and Baseline Under Equivalent Conditions

When an existing system exists, do not evaluate the candidate in isolation.

Possible baselines include:

- current production model;
- previous checkpoint;
- previous prompt;
- previous retrieval configuration;
- simple heuristic;
- established model or public benchmark result when scientifically comparable.

Run candidate and baseline with equivalent:

- test set;
- preprocessing;
- prompt/template;
- decoding parameters;
- retrieval configuration;
- metric implementation;
- randomization policy;
- target hardware when performance is compared.

Do not compare a vendor's headline score with a local score unless the benchmark version, harness, prompt/few-shot format, reasoning setting, tool access, and scorer are comparable.

## 6. Classification Models

Classification includes binary, multi-class, and multi-label prediction.

The table below defines common metrics. Use the metrics that reflect the error costs of the actual product rather than selecting one because it is popular.

| Metric | Meaning | When it matters |
|---|---|---|
| Accuracy | fraction of predictions that are correct | useful when classes and error costs are reasonably balanced |
| Precision | TP / (TP + FP) | important when false positives are costly |
| Recall / sensitivity | TP / (TP + FN) | important when missed positives are costly |
| Specificity | TN / (TN + FP) | useful when correct rejection of negatives matters |
| F1 | harmonic mean of precision and recall | useful single summary when both matter |
| Macro F1 | mean of per-class F1 | important for imbalanced multi-class tasks |
| Weighted F1 | frequency-weighted per-class F1 | overall summary; can conceal rare-class weakness |
| ROC-AUC | ranking discrimination across thresholds | useful for threshold-independent discrimination; can look optimistic under extreme imbalance |
| PR-AUC / Average Precision | precision-recall tradeoff | often more informative for rare positive classes |
| Confusion matrix | full error distribution by predicted/true class | required for important class changes |
| Calibration | whether confidence matches observed correctness frequency | required when probabilities drive decisions |

### Operating threshold

If the production system uses a threshold, evaluate performance at that threshold and examine nearby thresholds. A model can have a strong ROC-AUC and still perform poorly at the operating point.

### Slice analysis

Inspect at least the slices that matter to production:

- per class;
- rare class;
- business-critical class;
- confidence range;
- data source;
- language/domain;
- device;
- difficult environmental condition.

Do not allow overall accuracy to conceal the exact class the product depends on.

## 7. Regression Models

Regression metrics emphasize different kinds of error.

| Metric | Meaning and caveat |
|---|---|
| MAE | mean absolute error; interpretable in target units |
| MSE | mean squared error; penalizes large errors strongly |
| RMSE | square root of MSE; target units with large-error emphasis |
| R² | variance explained relative to a baseline; not sufficient alone |
| MAPE | relative percentage error; problematic when true values are near zero |
| sMAPE | symmetric percentage variant; still requires interpretation |
| Quantile/pinball loss | quantile forecasting or uncertainty |
| Interval coverage | whether prediction intervals achieve expected coverage |

Inspect residuals and error by target range. A low mean error can hide catastrophic error in a narrow but critical range.

## 8. Ranking, Recommendation, and Information Retrieval

For ranking and retrieval, the position of the relevant item matters.

Common metrics include:

- Precision@K;
- Recall@K;
- Hit Rate@K;
- Mean Reciprocal Rank (MRR);
- Mean Average Precision (MAP);
- nDCG@K;
- coverage/diversity/novelty when product-relevant;
- query latency and index cost.

For embeddings and retrieval systems, evaluate on the actual query/document distribution whenever possible.

Public resources:

- BEIR: https://github.com/beir-cellar/beir
- MTEB/MMTEB: https://github.com/embeddings-benchmark/mteb
- MTEB documentation and leaderboards: https://docs.mteb.org/

MTEB provides broad multilingual and multimodal embedding evaluations. Use the subset matching the product task rather than reporting a single average across unrelated tasks.

## 9. Anomaly Detection

Do not use raw accuracy when almost every record is normal.

Evaluate:

- precision;
- recall;
- F1;
- PR-AUC;
- false-alert rate per relevant unit such as hour, device, or million events;
- detection delay;
- misses by anomaly type;
- operating threshold;
- drift of normal behavior.

The evaluation distribution should reflect realistic class imbalance.

## 10. NLP — Text Classification, Intent, and Sequence Labeling

### Text classification

Use the classification metrics above and slice by:

- language;
- domain;
- text length;
- class;
- noise;
- code switching when relevant;
- tokenization edge cases.

### Named Entity Recognition and span extraction

Use entity or span-level:

- precision;
- recall;
- F1;
- per-entity-type results;
- strict boundary errors;
- relaxed matching only when the product actually accepts partial boundaries.

Be explicit about label scheme and matching rules such as IOB2 or BILOU.

`seqeval` is a common implementation for sequence-labeling precision, recall, and F1:
https://github.com/chakki-works/seqeval

### Tokenization and normalization QA

Backtrace preprocessing because an NLP system can appear to have a model failure when the actual defect is tokenization or offset mapping.

Inspect:

- Unicode normalization;
- casing;
- whitespace;
- punctuation;
- emoji;
- accents and diacritics;
- languages without whitespace segmentation;
- special tokens;
- truncation;
- maximum sequence length;
- padding;
- token-to-character offsets;
- preprocessing parity between training and inference.

## 11. Machine Translation

Use multiple signals because one overlap metric does not fully represent translation quality.

Common evaluation signals include:

- BLEU;
- chrF or chrF++;
- COMET or another approved learned metric;
- terminology accuracy;
- omission/addition errors;
- human domain review;
- hallucination checks.

SacreBLEU provides standardized BLEU, chrF, TER, test-set/tokenization signatures, and significance testing:
https://github.com/mjpost/sacrebleu

A BLEU result is not comparable unless the test set, tokenization, and metric configuration are compatible.

## 12. Summarization

Useful signals include:

- ROUGE-1;
- ROUGE-2;
- ROUGE-L;
- semantic similarity metrics where appropriate;
- factual consistency;
- completeness or coverage;
- omission rate;
- compression and length;
- human or rubric evaluation for usefulness.

ROUGE is an overlap metric. It does **not** prove factuality. A summary can closely match reference wording while still introducing a consequential factual error.

Reference implementation:
https://github.com/google-research/google-research/tree/master/rouge

For LLM-generated summaries, also apply the LLM evaluation instructions later in this document.

## 13. Embeddings and Semantic Search

Evaluate embedding models using the downstream task they support.

For search/retrieval:

- Recall@K;
- Precision@K;
- MRR;
- nDCG@K;
- latency;
- index size;
- memory;
- reranking behavior when applicable.

For classification or clustering, evaluate those downstream tasks directly.

MTEB/MMTEB and BEIR are useful for broad comparison, but a product-specific query/relevance set is usually more important for regression testing.

Sources:
- https://docs.mteb.org/
- https://github.com/embeddings-benchmark/mteb
- https://github.com/beir-cellar/beir

## 14. Computer Vision — Image Classification

Use:

- accuracy;
- per-class precision;
- per-class recall;
- per-class F1;
- confusion matrix;
- macro metrics under imbalance;
- calibration if confidence is consumed;
- production slice analysis.

Inspect actual images corresponding to false positives and false negatives.

Potential slices include:

- camera or device;
- resolution;
- lighting;
- blur;
- occlusion;
- viewpoint;
- background;
- rare class;
- environmental condition.

## 15. Object Detection and YOLO

Object detection requires both classification and localization evidence.

### Core metrics

The table below defines the metrics a reviewer should understand before approving a detector.

| Metric | What it measures |
|---|---|
| IoU | overlap between predicted and ground-truth bounding boxes |
| Precision | proportion of predicted objects that are correct |
| Recall | proportion of actual objects that were detected |
| F1 | balance between precision and recall at an operating point |
| AP | area under a class/condition precision-recall curve |
| mAP | mean AP across classes or evaluation conditions |
| mAP@0.50 / mAP50 | AP at IoU 0.50 |
| mAP@0.50:0.95 / mAP50-95 | AP averaged across increasingly strict IoU thresholds |
| mAR | mean average recall where the evaluation defines it |
| Latency/FPS | inference throughput and timing |

Ultralytics documents IoU, precision, recall, F1, mAP50, mAP50-95, and speed metrics for YOLO evaluation:
https://docs.ultralytics.com/guides/yolo-performance-metrics

### Required detector review information

Record:

- model checkpoint;
- input image size;
- confidence threshold;
- NMS and IoU settings;
- validation/test set;
- class map;
- precision;
- recall;
- F1;
- mAP50;
- mAP50-95;
- per-class results;
- inference latency;
- preprocessing and postprocessing.

### Sample-level error analysis

Inspect actual examples of:

- false positive;
- false negative;
- localization error;
- duplicate detection;
- class confusion;
- low-confidence correct detection;
- high-confidence wrong detection.

### Production-relevant slices

Where applicable, evaluate:

- small, medium, and large objects;
- low light;
- glare and backlight;
- blur and motion;
- occlusion;
- rotation;
- viewpoint;
- clutter and crowding;
- camera and device;
- background;
- edge of frame;
- rare class.

An aggregate mAP improvement can hide a recall collapse in the exact class or environmental condition the product depends on.

## 16. Segmentation

Common segmentation metrics include:

- IoU per class;
- mean IoU;
- Dice coefficient/F1;
- pixel accuracy where useful;
- boundary-specific metrics when edge quality is important.

Inspect overlays. A scalar score can hide fragmented masks, systematic boundary offsets, holes, merged objects, or missing small regions.

If masks feed another pipeline stage, validate the downstream crop, measurement, or geometry generated from them.

## 17. Tracking

Select metrics appropriate to the tracker and product.

Common signals include:

- HOTA;
- IDF1;
- MOTA;
- detection precision and recall;
- identity switches;
- track fragmentation;
- track lifetime;
- latency and FPS.

Inspect videos or sequences around identity switches, occlusion, crossing objects, and reappearance. A global score can hide behavior that is unacceptable for a specific use case.

## 18. OCR and Document-Vision Pipelines

OCR is normally a pipeline, not one model.

Backtrace:

```text
image
 -> document/page detection
 -> crop or rectification
 -> text-region detection
 -> text recognition
 -> reading order/layout
 -> postprocessing
 -> downstream extraction
```

Test stages separately when possible.

Useful metrics include:

- page or text-region detection precision and recall;
- IoU for regions;
- Character Error Rate (CER);
- Word Error Rate (WER);
- exact field accuracy for structured extraction;
- reading-order correctness;
- downstream task success.

If OCR output feeds an LLM, isolate OCR quality first so an LLM failure is not incorrectly blamed on vision and a vision failure is not hidden by an LLM's ability to guess.

## 19. Vision-Language and Multimodal Models

A VLM can generate fluent text while failing to correctly perceive the image. Separate the capabilities.

Trace and test:

1. visual perception;
2. OCR or visual text recognition;
3. spatial grounding;
4. counting;
5. multimodal reasoning;
6. language generation;
7. end-to-end task success.

Test relevant difficult cases:

- requested object is absent;
- small object;
- small or faint text;
- crop/resolution change;
- orientation;
- chart or table;
- count;
- spatial relation;
- multiple images;
- visually ambiguous example;
- grounding box/coordinate when the system produces localization.

Public benchmark resources include:

- MMMU / MMMU-Pro: https://github.com/MMMU-Benchmark/MMMU
- MathVista: https://github.com/lupantech/MathVista
- MMBench: https://github.com/open-compass/MMBench
- Stanford HELM / vision evaluations: https://crfm.stanford.edu/helm/

Use public benchmarks for broad capability comparison. Use a product-specific multimodal set for release regression.

## 20. LLM Application Evaluation

LLM evaluation must be task-specific and configuration-specific.

OpenAI's current evaluation guidance emphasizes evaluating early and often, using task-specific evals, matching production distributions, logging examples, automating scoring where appropriate, and calibrating automated scoring against human judgment.

Reference:
https://developers.openai.com/api/docs/guides/evaluation-best-practices

### 20.1 Record the exact LLM configuration

Include:

- provider;
- model;
- model snapshot/version when available;
- system and developer instructions;
- prompt template and version;
- tools;
- response schema;
- reasoning/temperature/sampling settings when exposed;
- maximum output;
- context limits;
- retrieval settings;
- fallback model;
- retry and timeout policy.

A prompt change and a model change are both behavioral changes.

### 20.2 Use deterministic assertions first

For structured tasks, use deterministic validation for deterministic properties:

- valid JSON;
- JSON Schema;
- Pydantic/Zod or equivalent schema;
- required fields;
- type;
- enum;
- range;
- exact ID format;
- prohibited fields;
- downstream parser compatibility.

Do not use an LLM judge to determine whether a JSON object satisfies a schema.

### 20.3 Maintain a product evaluation set

A useful golden/product eval set should contain:

- common production cases;
- difficult cases;
- historical failures;
- ambiguous cases;
- long inputs;
- multilingual cases when supported;
- negative/no-answer cases;
- adversarial/confusing cases when relevant.

Each case must define what makes the result acceptable.

### 20.4 Evaluate open-ended quality with explicit criteria

Possible criteria include:

- correctness;
- completeness;
- relevance;
- groundedness;
- instruction following;
- format;
- domain terminology;
- tone when required;
- safety or other product constraints.

Use human/expert labels for high-value subjective claims. Automated LLM grading is useful at scale only when the grader/rubric is calibrated enough to represent the desired human judgment.

OpenAI references:
- https://developers.openai.com/api/docs/guides/evals
- https://developers.openai.com/api/docs/guides/graders

### 20.5 Account for nondeterminism

When repeated outputs vary enough to affect the conclusion, run multiple trials and report:

- pass rate;
- mean or median score;
- variance;
- worst-case or tail failures;
- category-specific failures.

Do not approve a behavior because one generation looked excellent.

### 20.6 Run regression comparison

Run baseline and candidate against the same cases and comparable configuration.

Record:

- overall delta;
- per-category delta;
- newly failing cases;
- fixed cases;
- latency;
- token use;
- cost;
- schema/tool failures.

## 21. RAG Evaluation

RAG must be decomposed. A final answer score alone cannot tell whether the defect is retrieval, context assembly, or generation.

Backtrace:

```text
question
 -> query construction
 -> retrieval
 -> reranking
 -> context selection/assembly
 -> prompt
 -> generation
 -> citation or source mapping
 -> final answer
```

### Retrieval evaluation

When relevance labels exist, use metrics such as:

- Recall@K;
- Precision@K;
- MRR;
- nDCG.

Also inspect:

- no-result queries;
- wrong-source retrieval;
- duplicate chunks;
- chunk boundaries;
- metadata filters;
- stale index;
- tenant or access-control filters;
- reranking effects.

### Generation and grounding evaluation

Evaluate:

- answer correctness;
- relevance;
- completeness;
- support by retrieved context;
- citation correctness;
- unsupported factual claims;
- refusal or no-answer behavior when context is insufficient.

Do not call a RAG answer grounded because it contains citations. Verify that the cited or retrieved content actually supports the associated claim.

Useful frameworks and references:

- Ragas: https://github.com/explodinggradients/ragas
- DeepEval: https://github.com/confident-ai/deepeval
- Promptfoo: https://github.com/promptfoo/promptfoo

Framework metrics must still be validated against the product's meaning of correctness.

## 22. Fine-Tuned and Newly Trained LLMs

When a review concerns a trained or fine-tuned language model, inspect both training and evaluation.

Review:

- dataset provenance;
- dataset version;
- train/validation/test separation;
- benchmark contamination;
- prompt/chat formatting;
- tokenizer;
- loss curves;
- overfitting;
- checkpoint selection;
- training seeds;
- hyperparameters;
- learning-rate schedule;
- evaluation during training;
- catastrophic regression in required general capability;
- target-task improvement;
- inference configuration.

A fine-tuned model should normally be evaluated on:

1. the exact target task;
2. important general capabilities that must not regress;
3. product format and behavioral constraints;
4. target inference hardware and runtime;
5. latency, memory, and cost.

Do not declare training successful because training loss decreased.

## 23. Public LLM Benchmarks and Comparison Sources

Public benchmarks are primarily tools for comparing model capabilities. They are not substitutes for product-specific release evaluations.

The table below gives a current set of widely used sources. Benchmark versions and leaderboards evolve, so the reviewer must verify the current release and harness at the time of comparison.

| Benchmark or source | Primary purpose | QA use |
|---|---|---|
| HELM Capabilities | transparent multi-scenario language-model evaluation | broad reproducible capability comparison |
| LiveBench | refreshed objective language/reasoning/coding/math/data tasks | current general capability comparison with reduced static contamination risk |
| Humanity's Last Exam (HLE) | extremely difficult expert-level broad/multimodal questions | frontier reasoning/knowledge signal |
| MMLU-Pro | challenging multi-domain academic/reasoning questions | broad knowledge and reasoning |
| GPQA | difficult graduate-level science QA | advanced scientific reasoning/knowledge |
| IFEval | objectively checkable instruction-following constraints | instruction-following |
| SWE-bench Verified | real GitHub software issues evaluated by executable tests | coding-agent/software-engineering capability |
| LM Arena | human pairwise preference across model arenas | comparative human preference signal |
| lm-evaluation-harness | reproducible runner for many academic tasks | standardized benchmark execution |

Sources:

- HELM: https://crfm.stanford.edu/helm/
- HELM Capabilities: https://crfm.stanford.edu/helm/capabilities/
- LiveBench: https://livebench.ai/
- LiveBench repository: https://github.com/livebench/livebench
- Humanity's Last Exam: https://lastexam.ai/
- MMLU-Pro: https://github.com/TIGER-AI-Lab/MMLU-Pro
- GPQA: https://github.com/idavidrein/gpqa
- SWE-bench: https://www.swebench.com/
- LM Arena: https://lmarena.ai/leaderboard
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

### Rule for comparing with OpenAI or another provider

If the user says “compare my model with OpenAI,” do not pull a random online chart and compare unrelated numbers.

First identify:

- exact provider model;
- exact benchmark;
- exact benchmark version;
- exact task subset;
- harness;
- prompt and few-shot configuration;
- reasoning settings when relevant;
- tool access;
- date;
- scorer;
- whether the published number is directly reproducible.

Then reproduce the same benchmark locally when access and licensing permit or compare through a neutral benchmark/leaderboard using compatible settings.

A result from a different harness is context, not a scientifically direct comparison.

## 24. Long-Context Evaluation

If the model or application depends on a long context window, test whether the model **uses** the context correctly. Merely accepting a large token count is not proof of usable long-context reasoning.

Test relevant cases such as:

- required fact near beginning;
- required fact near middle;
- required fact near end;
- multiple facts that must be combined;
- distractors;
- needle or passkey retrieval;
- long-document question answering;
- summarization;
- code navigation;
- context truncation;
- context compaction;
- latency;
- memory;
- “lost in the middle” behavior.

The lm-evaluation-harness includes long-context task support such as LongBench and InfiniteBench variants depending on release:
https://github.com/EleutherAI/lm-evaluation-harness

Use product-sized inputs, not only synthetic maximum-context cases.

## 25. Structured Output and Function Arguments

When a system depends on structured output or function/tool arguments, measure deterministic contract behavior.

Evaluate:

- JSON validity;
- schema compliance;
- required fields;
- semantic argument correctness;
- invalid enum or range;
- wrong IDs;
- malformed date/time;
- unsafe downstream query or command construction;
- retry/repair behavior;
- partial/truncated output.

lm-evaluation-harness includes JSONSchema Bench tasks that score JSON validity and schema compliance:
https://github.com/EleutherAI/lm-evaluation-harness/tree/main/lm_eval/tasks/jsonschema_bench

Product-specific schemas remain more important than the public benchmark.

## 26. AI Agents and Tool-Using Systems

Evaluate the complete **observable** trajectory. Do not require hidden chain-of-thought.

Backtrace:

```text
user task
 -> model decision
 -> tool selection
 -> tool arguments
 -> tool result
 -> state update
 -> next action
 -> final outcome
```

Test:

- task completion;
- correct tool;
- correct arguments;
- unnecessary tool calls;
- permission denial;
- tool timeout;
- malformed tool output;
- retry;
- duplicate stateful action;
- partial completion;
- restart/resume;
- state and memory;
- multi-agent handoff;
- conflicting agents;
- cost;
- token usage;
- tool-call count;
- final answer truthfully representing what actually happened.

OpenAI's agent-evaluation guidance describes using traces, datasets, graders, and eval runs to identify workflow-level regressions:
https://developers.openai.com/api/docs/guides/agent-evals

### Critical agent failures

Examples include:

- agent reports success without performing the action;
- unauthorized action;
- duplicated payment, message, delete, purchase, or record creation;
- incorrect tool applied to a real system;
- corrupt state after retry;
- injected tool/retrieval content causes a forbidden action;
- hidden failure is swallowed while the agent claims success.

## 27. Coding Agents

For coding agents, test on real repository tasks in addition to general model benchmarks.

SWE-bench evaluates systems against real GitHub software issues using executable tests and provides variants including Verified:
https://www.swebench.com/

For an internal coding agent, maintain a private regression set containing:

- representative repositories;
- issue types;
- framework/language diversity;
- tool restrictions;
- build/test behavior;
- company coding conventions;
- tasks that previously failed.

Strong public benchmark performance does not prove performance on the company's internal stack.

## 28. Reinforcement Learning

RL evaluation requires multiple independent runs or seeds when training and rollout behavior is stochastic.

Record:

- environment and version;
- observation space;
- action space;
- reward;
- termination and truncation;
- wrappers;
- policy and checkpoint;
- seeds;
- number of runs;
- training budget;
- evaluation episodes;
- baseline.

Gymnasium provides a maintained RL environment API with explicit `reset`, `step`, termination, and truncation semantics:
https://gymnasium.farama.org/

### Core RL metrics

Use task-specific success metrics plus statistical summaries.

Common signals include:

- episodic return;
- success rate;
- episode length;
- safety or constraint violations;
- sample efficiency;
- training wall time;
- compute;
- stability;
- catastrophic failures.

For multi-task or multi-seed comparisons, useful statistical reporting includes:

- interquartile mean (IQM);
- stratified bootstrap confidence intervals;
- performance profiles;
- probability of improvement;
- optimality gap.

The `rliable` project documents these methods. Its GitHub repository was archived in 2025, so treat it as a methodological reference and reference implementation rather than assuming it is an actively maintained production dependency.

Reference: https://github.com/google-research/rliable

### RL evaluation rules

Do not:

- report only the best seed;
- silently discard failed runs;
- compare different environment versions;
- report a mean with no uncertainty when variance is material;
- use reward as the only metric when reward can be exploited without completing the intended task;
- repeatedly tune against the final test benchmark and then call it unbiased.

## 29. Time-Series and Forecasting Models

For forecasting, use temporal evaluation rather than random splitting when the production problem is future prediction.

Possible metrics include:

- MAE;
- RMSE;
- MASE;
- sMAPE;
- MAPE with caution around zero;
- pinball/quantile loss;
- interval coverage;
- calibration;
- horizon-specific error.

Backtest over multiple historical windows when possible.

Inspect:

- seasonality;
- regime shifts;
- missing periods;
- leakage from future covariates;
- short versus long forecast horizon;
- extreme events.

## 30. Generative Image and Video Models

Quality is multi-dimensional and often partly subjective. Define the actual product claim.

Possible dimensions include:

- prompt adherence;
- visual quality;
- identity or character consistency;
- spatial composition;
- text rendering;
- temporal consistency;
- motion;
- domain correctness;
- diversity;
- safety;
- latency and cost.

Use a combination of:

- task-specific automatic metrics;
- paired human preference;
- structured human rubric;
- fixed prompt set;
- visual failure slices;
- domain-specific detectors or OCR where appropriate.

Stanford HELM includes image-generation evaluation work such as HEIM:
https://crfm.stanford.edu/helm/

Do not use a single FID, CLIP-like, or model-judge score as the sole product release gate unless evidence shows that metric aligns with the product's human-quality requirements.

## 31. Audio and Speech Models

### Automatic Speech Recognition

Evaluate:

- Word Error Rate;
- Character Error Rate;
- language;
- accent or speaker slices when appropriate;
- background noise;
- microphone/device;
- SNR;
- streaming latency;
- real-time factor;
- punctuation;
- diarization when part of the product.

### Text-to-Speech and generative speech

Evaluate:

- intelligibility;
- pronunciation;
- speaker similarity when required;
- prosody;
- naturalness;
- MOS or structured human rating;
- streaming stability;
- latency.

Use target microphones, codecs, sample rates, and environmental noise when those conditions are part of the product.

## 32. Model Serving and Target Hardware

A model is not production-ready merely because offline metrics pass.

On the target hardware or a representative environment measure:

- model load time;
- first-token or first-result latency;
- steady-state latency;
- throughput;
- RAM;
- VRAM;
- CPU/GPU/NPU utilization;
- power and thermal behavior when device-bound;
- batch behavior;
- concurrency;
- OOM/resource failure;
- quantization effect;
- model file size;
- restart behavior;
- fallback behavior.

For edge CV, run the real preprocessing, camera resolution, model, and postprocessing chain on the target device when possible.

A model can improve accuracy and still be a Critical regression if it cannot run inside the production memory/latency envelope.

## 33. Validate the Evaluation Harness Itself

The evaluator can be wrong.

Before trusting a benchmark or internal harness:

- sample actual tasks;
- run a known baseline;
- inspect scorer;
- inspect answer extraction;
- verify tool and network permissions;
- verify referenced files/resources are reachable;
- check for unintended answer leakage;
- check contamination risk;
- record benchmark version;
- record prompts and few-shot examples;
- validate automated graders against human judgment when subjective.

OpenAI published a 2026 playbook for trustworthy third-party evaluations discussing broken tasks, contamination, reward hacking, and shortcuts:
https://openai.com/index/trustworthy-third-party-evaluations-foundations/

If a harness defect changes the conclusion, the QA report must state that explicitly.

## 34. Statistical Significance and Uncertainty

Do not overstate tiny score differences.

When appropriate use:

- confidence intervals;
- bootstrap;
- paired tests;
- randomization tests;
- repeated trials;
- multiple training seeds;
- per-sample paired comparisons;
- effect size;
- error bars.

The correct statistical method depends on the metric and task.

SacreBLEU supports paired bootstrap and paired approximate randomization for translation metric comparison:
https://github.com/mjpost/sacrebleu

For RL, `rliable` documents bootstrap confidence intervals and probability-of-improvement style reporting.

A 0.2-point improvement is not automatically meaningful merely because it is positive.

## 35. AI Finding Classification

### Critical AI examples

An AI finding is Critical when evidence proves the candidate violates a required capability, invalidates the evaluation, or makes the production system unsafe or unusable.

Examples:

- evaluation test set leaked into training, invalidating the release claim;
- required precision, recall, task success, or other accepted metric materially regresses below a release gate;
- critical CV class or environmental slice has an unacceptable miss rate;
- model output schema breaks a downstream system;
- RAG systematically produces unsupported answers where grounding is a required property;
- agent performs unauthorized or destructive action;
- model cannot run on production hardware/runtime;
- context, latency, memory, or resource behavior violates a required production limit;
- a safety or domain requirement defined as a release gate fails.

### Corrective AI examples

Examples include:

- important slice regresses but remains above accepted release requirement;
- confidence calibration is weak but confidence is advisory rather than action-driving;
- eval set is too thin in a known condition and should be expanded;
- automated grader needs stronger calibration before becoming a CI gate;
- model serving has inefficient resource usage likely to become a scale problem;
- a failure is recoverable but poorly surfaced.

### Optimization AI examples

Examples include:

- higher precision or recall beyond requirement;
- lower latency;
- lower token cost;
- lower VRAM;
- improved quantization;
- improved retrieval index;
- more efficient prompt;
- broader benchmark coverage.

## 36. Required Evidence in the Final AI Review

For every model or AI-system change include the applicable evidence below.

This list is intentionally explicit because model results cannot be reproduced without the configuration and data that produced them.

- exact model/checkpoint/configuration;
- exact dataset, split, and version;
- baseline;
- metric definitions;
- thresholds;
- aggregate results;
- per-class and slice results;
- representative sample-level failures;
- multiple-run or multiple-seed uncertainty when material;
- benchmark and harness version;
- prompt/retrieval/tool configuration;
- target hardware and resource measurements;
- deterministic surrounding-software tests;
- unresolved evidence gaps.

## Worked Example — YOLO Page Detector

Suppose the change replaces `page_detector_v3.pt` with `page_detector_v4.pt`.

First backtrace the production pipeline:

```text
camera frame
 -> resize and normalize
 -> YOLO inference
 -> confidence threshold / NMS
 -> page box
 -> crop
 -> OCR
```

The review should then prove:

1. approved validation set is independent from training;
2. annotation quality is acceptable;
3. v3 and v4 use the same preprocessing and comparable thresholds;
4. precision, recall, F1, mAP50, and mAP50-95 are compared;
5. required slices are compared, especially small pages, low light, and rotation if those are production conditions;
6. false negatives and false positives are visually inspected;
7. candidate boxes remain compatible with crop/OCR;
8. target-device latency and memory are measured;
9. repeated inference does not leak resources.

If v4 raises aggregate mAP but misses materially more small pages and the product primarily sees small pages, the overall score does not justify approval.

## Worked Example — Fine-Tuned LLM Extractor

Backtrace:

```text
document text
 -> prompt template
 -> fine-tuned model
 -> structured JSON
 -> schema validator
 -> database
```

The review should evaluate:

1. schema validity deterministically;
2. field-level accuracy on a labeled extraction set;
3. missing-field rate;
4. extra or hallucinated values;
5. long and noisy input;
6. baseline model versus fine-tuned candidate;
7. repeated trials when output variance matters;
8. latency, token use, and cost;
9. downstream parser and database compatibility.

Only use an LLM judge for criteria that cannot be expressed reliably through deterministic or reference-based checks.

## Sources

The following references are intended to be loaded on demand when the corresponding AI modality is under review.

### General ML, NLP, and retrieval

- Hugging Face Evaluate: https://github.com/huggingface/evaluate
- MTEB/MMTEB: https://github.com/embeddings-benchmark/mteb
- MTEB Documentation: https://docs.mteb.org/
- BEIR: https://github.com/beir-cellar/beir
- SacreBLEU: https://github.com/mjpost/sacrebleu
- seqeval: https://github.com/chakki-works/seqeval
- Google ROUGE implementation: https://github.com/google-research/google-research/tree/master/rouge

### LLM and agent evaluation

- OpenAI Evaluation Best Practices: https://developers.openai.com/api/docs/guides/evaluation-best-practices
- OpenAI Evals: https://developers.openai.com/api/docs/guides/evals
- OpenAI Graders: https://developers.openai.com/api/docs/guides/graders
- OpenAI Agent Evals: https://developers.openai.com/api/docs/guides/agent-evals
- OpenAI Trustworthy Third-Party Evaluations: https://openai.com/index/trustworthy-third-party-evaluations-foundations/
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Stanford HELM: https://crfm.stanford.edu/helm/
- LiveBench: https://livebench.ai/
- Humanity's Last Exam: https://lastexam.ai/
- SWE-bench: https://www.swebench.com/
- LM Arena: https://lmarena.ai/leaderboard
- Ragas: https://github.com/explodinggradients/ragas
- DeepEval: https://github.com/confident-ai/deepeval
- Promptfoo: https://github.com/promptfoo/promptfoo

### Computer vision and multimodal

- Ultralytics YOLO Metrics: https://docs.ultralytics.com/guides/yolo-performance-metrics
- MMMU/MMMU-Pro: https://github.com/MMMU-Benchmark/MMMU
- MathVista: https://github.com/lupantech/MathVista
- MMBench: https://github.com/open-compass/MMBench
- Stanford HELM multimodal/image evaluation: https://crfm.stanford.edu/helm/

### Reinforcement learning

- Gymnasium: https://gymnasium.farama.org/
- rliable methodology/reference implementation: https://github.com/google-research/rliable
