# Hermes Agent — Reverse Engineering Map

**Repo:** `github.com/NousResearch/hermes-agent`
**Docs:** `https://hermes-agent.nousresearch.com/docs`
**License:** MIT
**Method:** full `git clone`, direct source reading. Every claim below has a file path and usually a line number. Nothing here is inferred from marketing copy.

**Scale:** ~11,300 files. `cli.py` is 1.0 MB. `run_agent.py` is 478 KB. `hermes_state.py` is 793 KB. This is a large, mature codebase, not a demo.

---

## Table of contents

1. [The stack — why so many Python files](#1-the-stack--why-so-many-python-files)
2. [Entry points — where execution starts](#2-entry-points--where-execution-starts)
3. [The prompt system — layers and order](#3-the-prompt-system--layers-and-order)
4. [Progressive disclosure — how context stays small](#4-progressive-disclosure--how-context-stays-small)
5. [Context compression](#5-context-compression)
6. [The self-learning loop — four mechanisms](#6-the-self-learning-loop--four-mechanisms)
7. [Threat-pattern scanner](#7-threat-pattern-scanner)
8. [Plugin system](#8-plugin-system)
9. [Permissions — three independent layers](#9-permissions--three-independent-layers)
10. [Multiplexing gateway](#10-multiplexing-gateway)
11. [Wake word — ONNX and TFLite](#11-wake-word--onnx-and-tflite)
12. [ACP adapter](#12-acp-adapter)
13. [MCP — both directions](#13-mcp--both-directions)
14. [Skills hub and distribution](#14-skills-hub-and-distribution)
15. [Terminal backends](#15-terminal-backends)
16. [What Syncrio would need to host this plugin model](#16-what-syncrio-would-need-to-host-this-plugin-model)
17. [Salvage index — what to lift for your own use](#17-salvage-index--what-to-lift-for-your-own-use)
18. [Glossary](#18-glossary)

---

## 1. The stack — why so many Python files

**Short answer: it is not a Python desktop app. It is an Electron shell that spawns a local Python server and talks to it over WebSocket JSON-RPC.**

Electron is present, you just have to look in `apps/desktop/`. The root `package.json` declares npm workspaces (`apps/*`, `ui-tui`, `web`, `tests-js`) and pins `electron@40.10.2` under `allowScripts`. `apps/desktop/package.json` names the product "Hermes", version 0.17.0, `"main": "dist/electron-main.mjs"`.

### The bridge

`apps/desktop/electron/backend-command.ts` builds the argv:

```
hermes serve --host 127.0.0.1 --port 0
```

- `--port 0` means "let the OS pick a free port"; Electron discovers the actual port and dials it.
- There is a legacy fallback (`dashboardFallbackArgs`) that rewrites `serve` to `dashboard --no-open` for older installs that predate the `serve` subcommand. It detects support by regex-scanning the runtime's own `dashboard.py` source for `add_parser("serve"`.

The renderer never runs Python. It sends JSON-RPC over WebSocket to `tui_gateway/server.py`. Method handlers live in `tui_gateway/methods_session.py`, `methods_tools.py`, `methods_config.py`, `methods_prompt.py`, etc. Transport in `tui_gateway/ws.py` and `transport.py`.

### Why so much Electron code exists anyway

`apps/desktop/electron/` has ~120 non-test modules. Roughly a third of them exist purely to babysit the Python child process:

| File | Job |
|---|---|
| `backend-command.ts` | build the argv, legacy fallback |
| `backend-child.ts` | kill the process correctly — Windows `taskkill /T /F` vs POSIX process-group `kill(-pid)` |
| `backend-health.ts`, `backend-ready.ts`, `backend-probes.ts` | readiness and liveness |
| `bootstrap-runner.ts`, `bootstrap-platform.ts` | first-run install of the Python env |
| `venv-blocker-scan.ts`, `venv-holder-select.ts` | detect processes locking the venv (Windows file-lock hell) |
| `pool-spawn-coordinator.ts`, `pool-eviction.ts`, `pool-limits.ts` | pool of backends, one per profile/session |
| `windows-hermes-path.ts`, `wsl-path-bridge.ts`, `find-git-bash.ts` | Windows and WSL path translation |

The `backend-child.ts` comment is worth quoting because it explains a real bug class:

> On Windows a backend that spawned its own grandchildren (a `hermes` REPL, a pty terminal session, the gateway) survives a plain SIGTERM and keeps files (e.g. the venv shim) locked. So on Windows we tree-kill. On POSIX the backend IS spawned into its own session/process-group (`start_new_session=True`), so `child.kill('SIGTERM')` would only reach the backend and orphan its MCP grandchildren.

### One backend, three frontends

The same Python server process serves all of these:

| Command | Surface |
|---|---|
| `hermes serve` | headless — the desktop app and remote clients |
| `hermes dashboard` | browser web UI |
| `hermes gateway` | Telegram / Discord / Slack / WhatsApp / Signal |
| `hermes` (bare) | terminal TUI (Ink/React, `ui-tui/`) |

`hermes_cli/subcommands/dashboard.py` makes the independence explicit in a comment: `serve` and `dashboard` share the backend but "neither should appear to launch the other."

### Full stack summary

```
Electron 40 + React + Vite  (apps/desktop)
        │  WebSocket JSON-RPC over 127.0.0.1
        ▼
tui_gateway/server.py  ──►  hermes_cli/web_server.py
        │
        ▼
AIAgent  (run_agent.py:467)
        │
        ├── provider adapters (agent/*_adapter.py)
        ├── tools (tools/*.py, model_tools.py, toolsets.py)
        ├── prompt assembly (agent/system_prompt.py + prompt_builder.py)
        ├── memory (tools/memory_tool.py, agent/memory_manager.py)
        └── terminal backends (tools/environments/*.py)
        │
        ▼
SQLite ~/.hermes/state.db  (+ FTS5, + custom C ext native/fts5_cjk)
Config ~/.hermes/config.yaml
```

Other stack facts:

- Python 3.11, managed by **`uv`** (Astral's Rust package manager). The Windows installer bundles `uv.exe` and a portable MinGit.
- Node 22/24/26 for the Electron and TUI workspaces.
- `native/fts5_cjk/fts5_cjk.c` — a hand-written SQLite extension for CJK tokenization in full-text search. Built to `~/.hermes/lib/libfts5_cjk.so`.
- `flake.nix` for Nix packaging; `Dockerfile` (26 KB) and `docker-compose.yml` for containers.
- Termux (Android) is a supported target with a curated dependency extra.

---

## 2. Entry points — where execution starts

Declared in `pyproject.toml` under `[project.scripts]`:

```toml
hermes       = "hermes_cli.main:main"
hermes-agent = "run_agent:main"
hermes-acp   = "acp_adapter.entry:main"
```

Plus the repo-root `./hermes` shim, which just calls `hermes_cli.main:main`.

### Where the LLM-backed agent is actually born

**`run_agent.py:467` — `class AIAgent`.** This is *the agent*. Everything else is a surface that constructs one.

`AIAgent.__init__` is a thin wrapper. The real body was extracted to **`agent/agent_init.py::init_agent()`** (line 536) — about 1,400 lines, 60+ parameters. It handles:

- provider auto-detection and credential resolution
- context-engine bootstrap (`ContextCompressor`)
- toolset resolution
- memory store construction
- guardrail controllers

The actual client object is built at **`agent/agent_init.py:1554`**:

```python
agent.client = agent._create_openai_client(client_kwargs, reason="agent_init", shared=True)
```

So the base transport is the **OpenAI SDK client**, pointed at whatever `base_url` the provider resolves to. Provider-specific behavior is layered as adapters and header injection, not as separate clients. Examples visible in `init_agent`:

- OpenRouter + Claude → injects `x-anthropic-beta: fine-grained-tool-streaming-2025-05-14`
- custom providers can override TLS, extra headers, and even `User-Agent` (for endpoints behind a WAF that rejects the OpenAI SDK's identifying headers)
- Azure Entra ID can pass a *callable* as `api_key` that mints bearer tokens

Native (non-OpenAI-shaped) adapters exist alongside: `agent/anthropic_adapter.py`, `gemini_native_adapter.py`, `bedrock_adapter.py`, `vertex_adapter.py`, `codex_responses_adapter.py`, `azure_identity_adapter.py`.

### The turn loop

**`agent/conversation_loop.py`** — 9,339 lines. Its docstring says it is the ~3,900-line `run_conversation` body extracted out of `run_agent.py`, and `AIAgent.run_conversation` is now a thin forwarder.

One turn goes through: build turn context → preflight compression check → build/restore system prompt → model call → tool dispatch → retries and provider failover → post-response compression check → post-turn hooks → background review spawn.

Supporting modules: `agent/turn_context.py` (builds the per-turn context object), `agent/turn_finalizer.py` (end-of-turn work), `agent/tool_executor.py`, `agent/tool_dispatch_helpers.py`, `agent/error_classifier.py` (failover decisions).

### First instruction sent to the model

The literal first thing in the system prompt is the identity line, from one of two places:

1. **`SOUL.md`** at the repo/profile root, if present.
2. **`DEFAULT_AGENT_IDENTITY`** — `agent/prompt_builder.py:201`.

The shipped `SOUL.md` is one paragraph and it is a *behavior spec*, not a personality:

> You are Hermes Agent, built by Nous Research. Be direct: match the length of your reply to the weight of the ask… No filler ("Great question," "I'd be happy to"), no restating the request back… Depth is earned.

The source comment on `DEFAULT_AGENT_IDENTITY` explains the rewrite:

> the old text was a trait list ("helpful, knowledgeable, direct") — every model already believes that of itself, so it changed nothing. The #1 user complaint it failed to address is verbosity… This version is a behavior spec: a sizing rule, named prohibitions, and an earned-depth escape hatch.

And a maintainer warning not to re-add a thrift instruction:

> The old "targeted and efficient exploration" line was cut deliberately — models UNDER-explore by default and miss useful context; never re-add an exploration-thrift instruction here.

---

## 3. The prompt system — layers and order

**Single assembly point: `agent/system_prompt.py::build_system_prompt_parts()` (line 435).** It returns a dict of three strings, joined with `\n\n` by `build_system_prompt()` (line 1036).

The whole prompt is built **once per session** and cached on `agent._cached_system_prompt`. It is only rebuilt on a compaction/restore boundary. That is the single most important design fact about this system.

### The three tiers

```
┌─────────────────────────────────────────────────────────┐
│ TIER 1 — "stable"     (identical across sessions)        │
│   1. SOUL.md  OR  DEFAULT_AGENT_IDENTITY                 │
│   2. HERMES_AGENT_HELP_GUIDANCE  (or the no-skills var.) │
│   3. TASK_COMPLETION_GUIDANCE                            │
│   4. PARALLEL_TOOL_CALL_GUIDANCE                         │
│   5. per-tool guidance strings                           │
│   6. STEER_CHANNEL_NOTE                                  │
│   7. TOOL_USE_ENFORCEMENT_GUIDANCE   (model-gated)       │
│   8. GOOGLE_MODEL_OPERATIONAL_GUIDANCE / OPENAI_...      │
│   9. Alibaba model-name workaround                       │
│  10. environment hints                                   │
│  11. coding guidance / operating brief                   │
│  12. platform hints  (PLATFORM_HINTS + config overrides) │
├─────────────────────────────────────────────────────────┤
│ TIER 2 — "context"    (changes per working directory)    │
│  13. coding-workspace snapshot (live git state)          │
│  14. caller-supplied system_message                      │
│  15. context files: AGENTS.md, CLAUDE.md, .cursorrules,  │
│      .clinerules — discovered under TERMINAL_CWD         │
├─────────────────────────────────────────────────────────┤
│ TIER 3 — "volatile"   (most likely to change)            │
│  16. SKILLS INDEX  ← names + ≤60-char descriptions ONLY  │
│  17. memory snapshot (MEMORY.md)                         │
│  18. user profile   (USER.md)                            │
│  19. external memory-provider block                      │
│  20. plugin sections (position="after_memory")           │
│  21. timestamp / session id / model / provider / platform│
└─────────────────────────────────────────────────────────┘
```

### Why this exact order

The ordering is entirely about **prompt caching**, and the source says so repeatedly.

For providers with explicit `cache_control` blocks (Anthropic), the whole string is one cache unit and order does not matter. For providers with **implicit longest-prefix caching**, order is everything: when the prompt is rebuilt after compaction, the unchanged stable scaffold ahead of the change stays inside the reused prefix. So the content most likely to differ is rendered last.

The skills index sits at the *front* of the volatile band, not in stable. The comment explains:

> Skills are runtime-mutable… With the index in the stable band, a rebuild that picked up a skill change would bust the cached prefix from the index down, taking the whole scaffold with it. Render it at the FRONT of the volatile band instead… an unchanged index still falls inside the reused prefix, and a changed one only re-prefills from here on.

### The byte-stability discipline

This is the most transferable idea in the whole codebase. Several examples:

**Date, not time.** The timestamp line uses date-only precision:

> Minute-precision changes invalidate prefix-cache KV on every rebuild path… The model can still query the exact wall-clock time via tools when it actually needs it.

But timezone and UTC offset *are* included, because tools that accept instants reject naive datetimes, and without the offset the model has to guess EST vs EDT — "a coin-flip near a DST boundary, and a wrong guess silently writes the record onto the wrong day." Both values are constant for the whole day, so byte-stability holds.

**Long-lived sessions get a second line.** If the current day differs from the session start day (bot-mode forever-chats, messenger channels), a second line is appended: "Today's date (as of the last context rebuild)… trust this over the start date." It refreshes only at compaction, when the cache is already being invalidated — so it costs nothing extra. Same-day sessions skip it entirely and stay byte-identical.

**Timeless mode.** `_bot_chat_timeless_prompt` drops the date entirely for eternal sessions, because "a birth date frozen in the prompt becomes confidently-wrong misinformation within days."

**Mid-session memory writes do not touch the prompt.** See §6.

### Per-platform prompt overrides

`_resolve_platform_hint()` (line 83) reads `platform_hints` from `config.yaml`. Each platform key can carry:

- `replace` — substitute the default hint entirely
- `append` — keep the default, add text
- a bare string — treated as `append`

`replace` wins if both are present. Malformed entries silently fall back to the unmodified default, so a bad config value cannot break prompt assembly or leak across platforms.

### Plugin prompt sections

Plugins can inject bounded context. `hermes_cli/plugins.py::register_system_prompt_section()` (line 3412). Constraints (lines 558–562):

```python
SYSTEM_PROMPT_SECTION_POSITIONS      = frozenset({"after_memory"})   # ONE anchor only
DEFAULT_SYSTEM_PROMPT_SECTION_MAX_CHARS = 4_000
MAX_SYSTEM_PROMPT_SECTION_CHARS         = 4_000
MAX_SYSTEM_PROMPT_SECTIONS              = 32
MAX_SYSTEM_PROMPT_SECTIONS_TOTAL_CHARS  = 8_000
```

Note the asymmetry: one section may be 4,000 chars, but *all* sections together are capped at 8,000. Sections render inside HTML comment fences (`<!-- hermes-plugin-sections:start -->`) with a per-section char-count marker, so a resumed process can reconstruct the stable cache prefix without re-running any plugin code. Content may be a string or a callable receiving a read-only session-info mapping.

Duplicate section ids are rejected with a raise, naming the owning plugin.

---

## 4. Progressive disclosure — how context stays small

This is the direct answer to "how are prompts referenced and attained so they don't all just load in and overflood the context window."

**The system prompt contains an index, not content.**

### The skills index

Built by `agent/prompt_builder.py:1856::build_skills_system_prompt()`. It scans, in precedence order:

1. Project-local trusted dirs — `./.hermes/skills`, `./.agents/skills` at the git root (highest precedence)
2. Local — `~/.hermes/skills/`
3. External dirs — `skills.external_dirs` in `config.yaml` (read-only; they appear in the index but new skills are never written there)

It renders **only `name: description` pairs**, grouped by category.

### The 60-character rule

The description cap is 60 characters, hard, and it is not cosmetic. From `agent/learn_prompt.py`:

> the system-prompt skill index truncates the description to 60 chars and loads it every session, so anything past char 60 is silently cut and never routes. After you write the description, COUNT the characters; if it is over 60, cut it down before saving — do not ship a sentence and hope.

Good: `Search arXiv papers by keyword, author, or ID.` (45)
Bad: `A comprehensive skill that lets the agent search arXiv for...` (123)

The authoring standards also ban marketing words (powerful, comprehensive, seamless, advanced, robust) and repeating the skill name.

**This one number is the entire progressive-disclosure design.** Index entry cost ≈ name + 60 chars. A hundred skills costs a few thousand tokens, not a few hundred thousand.

### Skill anatomy

```
skills/<category>/<skill-name>/
├── SKILL.md          ← YAML frontmatter + markdown body
├── references/       ← session-specific detail, condensed knowledge banks
├── templates/        ← starter files meant to be copied and modified
└── scripts/          ← statically re-runnable actions the skill invokes
```

Frontmatter (from `skills/note-taking/obsidian/SKILL.md`):

```yaml
---
name: obsidian
description: Read, search, create, and edit notes in the Obsidian vault.
version: 1.0.0
author: Teknium (teknium1), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Obsidian, Notes, Markdown, Vault]
    related_skills: []
---
```

`platforms` gates visibility. `related_skills` becomes edges in the learning graph (§6). Skills can also declare `conditions` that gate on available tools/toolsets, so a skill needing `browser_navigate` never appears when the browser toolset is off.

### Loading on demand

Three tools (`model_tools.py:275`): `skills_list`, `skill_view`, `skill_manage`.

- `skill_view(name='x')` loads the full SKILL.md body
- `skill_view(name='x', file_path='references/y.md')` loads one support file

So a book-sized knowledge base becomes a lean index plus per-chapter reference files pulled only when needed. The authoring guidance calls this "the shape popularized by virgiliojr94/book-to-skill."

### The two-layer index cache

1. **In-process LRU dict**, keyed by `(skills_dir, external_dirs, project_dirs, available_tools, available_toolsets, platform_hint, disabled_skills, compact_categories)`
2. **Disk snapshot** — `.skills_prompt_snapshot.json`, validated by an mtime/size manifest. Survives process restarts.

Cold path is a full filesystem scan that writes the snapshot for next time.

Note the cache key includes the *platform hint* — the gateway serves multiple platforms from one process, and per-platform disabled-skill lists must produce distinct entries.

### Category demotion

`compact_categories` (driven by `agent/coding_context.py`) demotes whole categories to a names-only line. The comment is important:

> Nothing is ever hidden: every skill name stays visible and loadable via `skill_view` / `skills_list`; only the descriptions are dropped, and a footer note explains the demotion.

So under a coding posture, non-coding categories shrink to bare names but remain reachable.

### The compaction interaction

When context is compressed, loaded skill bodies are replaced with a `[SKILL_PRUNED]` placeholder. `SKILLS_GUIDANCE` handles the consequence:

> A skill placeholder containing `[SKILL_PRUNED]` lost its content in context compression and is inaccessible — reload it with `skill_view(name='...')` before acting on anything that depends on it. After reloading, ignore any remaining `[SKILL_PRUNED]` markers for that same skill; they are historical artifacts of earlier compactions.

That last sentence prevents an infinite reload loop.

### Other on-demand reference layers

| Mechanism | File | What it does |
|---|---|---|
| `@`-prefix context references | `agent/context_references.py` | Built-in prefixes: `diff staged file folder git url`. Plugins register more via `ContextReferenceProvider`. User types `@issue:123` and only that content is pulled in. |
| `session_search` | `tools/session_search_tool.py` | FTS5 search over past conversations; results loaded on demand, not preloaded |
| `tool_search` | `tools/tool_search.py` | search the tool catalog rather than listing every schema |
| MCP schema cache | `tools/mcp_schema_cache.py` | avoid re-fetching MCP tool schemas every session |
| tool result storage | `tools/tool_result_storage.py` + `tool_output_limits.py` | large tool outputs spilled to disk with a pointer left in context |

---

## 5. Context compression

**`agent/context_compressor.py`** — the default context engine. It is a self-contained class with its **own** OpenAI client, using a cheap auxiliary model to summarize middle turns while protecting head and tail.

### The shape

```
[ HEAD: system prompt + early anchor turns ]   ← protected
[ MIDDLE: summarized by auxiliary model     ]   ← replaced with structured summary
[ TAIL: recent verbatim turns               ]   ← protected by token budget
```

### Key numbers

```python
threshold_percent          = 0.50        # compress at 50% of context window
_SUMMARY_TOKENS_CEILING    = 10_000
LEAN_TAIL_FLOOR_TOKENS     = 10_000
LEAN_TAIL_CAP_TOKENS       = 25_000
max_summary_tokens         = min(context_length * 0.05, 10_000)
```

Tail budget in **lean mode** (the default, "compaction-v2"):

```python
tail_token_budget = max(10_000, min(25_000, int(context_length * 0.025)))
```

The comment explains the intent:

> the verbatim tail is a small recency window, not a context hoard — the upgraded summary (verbatim user messages, constraints section, recovery pointers) carries continuity instead. 2.5% of the window, clamped… so a 1M-window model keeps ~25K instead of ~100-145K.

That is the key trade: **a better summary lets you keep a smaller verbatim tail.**

There is also an absolute cap (`compression.threshold_tokens` in config) that takes the lower of the ratio-based threshold and the cap, plus a `MINIMUM_CONTEXT_LENGTH` floor so tiny-window models never compress into uselessness.

### Summary quality features

From the module docstring:

- structured template with **Resolved / Pending** question tracking
- a "filter-safe summarizer preamble" that frames prior turns as *source material* (so the summarizing model doesn't try to execute them)
- historical section headings ("reference-only") replace "Next Steps" / "Remaining Work" — deliberately, so the summary doesn't read as active instructions
- iterative summary updates — information survives across multiple compactions
- tool-output pruning as a cheap pre-pass before the LLM ever sees it
- scaled summary budget, proportional to compressed content

### Pluggable

`agent/context_engine.py` defines the `ContextEngine` ABC. Selection is config-driven (`context.engine`, default `"compressor"`). Third-party engines drop into `plugins/context_engine/<name>/`. An engine owns: when to compact, how to compact, optional tools it exposes (e.g. `lcm_grep`), and token tracking. Lifecycle: `on_session_start` → `update_from_response` → `should_compress` → `compress` → `on_session_end`.

There is also `docs/micro-compaction.md` and `trajectory_compressor.py` (72 KB, for training-data generation).

---

## 6. The self-learning loop — four mechanisms

This is the headline claim ("the only agent with a built-in learning loop"). It is **four separate systems**, not one.

```
                       ┌──────────────────────┐
       every turn ───► │ 1. memory tool        │──► MEMORY.md / USER.md
                       └──────────────────────┘        (frozen snapshot
                                                        into next session)
                       ┌──────────────────────┐
    every N turns ───► │ 2. memory nudge       │──► injects a reminder
                       └──────────────────────┘
                       ┌──────────────────────┐
       after turn ───► │ 3. background review  │──► forked agent, whitelist
                       │    (daemon thread)    │    of memory+skill tools
                       └──────────────────────┘
                       ┌──────────────────────┐
       when idle  ───► │ 4. curator            │──► pin/archive/consolidate
                       │    (aux model)        │    /patch agent-made skills
                       └──────────────────────┘
```

Plus two recall paths: FTS5 session search, and external memory providers.

### 6.1 Curated memory files

**`tools/memory_tool.py`**, class `MemoryStore` (line 159).

Two markdown files under `~/.hermes/memories/`:

| File | Contents | Default limit |
|---|---|---|
| `MEMORY.md` | agent's own notes — environment facts, project conventions, tool quirks | 2,200 chars |
| `USER.md` | model of the user — preferences, communication style, workflow habits | 1,375 chars |

Entries are separated by `§` (section sign) and may be multiline.

**Limits are in characters, not tokens** — deliberately, "because char counts are model-independent."

#### The frozen-snapshot pattern

This is the single most important mechanic:

> Both are injected into the system prompt as a frozen snapshot at session start. Mid-session writes update files on disk immediately (durable) but do NOT change the system prompt — this preserves the prefix cache for the entire session. The snapshot refreshes on the next session start.

The class keeps two parallel states:

- `_system_prompt_snapshot` — frozen at `load_from_disk()`, never mutated mid-session
- `memory_entries` / `user_entries` — live, mutated by tool calls, persisted to disk

Tool responses always reflect the **live** state, so the model sees its own write succeed; the system prompt keeps showing the **frozen** state, so the cache holds. The gap closes at next session start.

#### The tool

One `memory` tool with an `action` parameter: `add`, `replace`, `remove`. `replace` and `remove` use **short unique substring matching**, not full text and not IDs. Behavioral guidance lives in the tool schema description rather than the system prompt.

#### Capacity handling

When at capacity, the model must consolidate to add. `_MAX_CONSOLIDATION_FAILURES_PER_TURN = 3`. Under the cap, the error tells the model how to self-correct and retry. Over the cap, it returns a **terminal** result:

> Memory consolidation failed N times this turn. Stop retrying memory calls — leave memory unchanged for now and continue with your reply to the user. The fact can be saved in a later turn.

Rationale in the source: "a failed memory side effect must never block the turn's reply."

#### Security

Memory content is scanned with the `strict` scope of the threat scanner (§7), because "memory enters the system prompt as a FROZEN snapshot, so a poisoned entry persists for the entire session and across sessions until" removed. Memory writes **block** on a hit; the user can rewrite the flagged entry.

File locking is cross-platform: `fcntl` on Unix, `msvcrt` on Windows.

### 6.2 Memory nudges

`agent/turn_context.py:869`. Purely mechanical, no LLM involved in the decision:

```python
if (agent._memory_nudge_interval > 0
        and "memory" in agent.valid_tool_names
        and agent._memory_store):
    agent._turns_since_memory += 1
    if agent._turns_since_memory >= agent._memory_nudge_interval:
        should_review_memory = True
        agent._turns_since_memory = 0
```

Default interval is **10 user turns** (`agent/agent_init.py:1903`), configurable via `memory.nudge_interval`. Background-review forks and the curator both set it to `0` so they never recurse.

The counter is seeded from prior turn count on session resume (line 821), so resuming mid-cycle doesn't reset the clock.

The `original_user_message` is preserved separately from the nudged version, so transcripts and memory queries never see the injected text.

### 6.3 Background review — the actual self-improvement engine

**`agent/background_review.py`.**

After a turn, `spawn_background_review()` starts a **daemon thread** that:

1. Forks a second `AIAgent`
2. Inherits the parent's provider, model, base_url, credentials, and **cached system prompt** — so it hits the same prefix cache and the same auth
3. Replays the conversation snapshot
4. Runs with a **tool whitelist limited to memory and skill tools**; everything else is denied at runtime
5. Writes straight to the memory and skill stores
6. Never touches the main conversation or its prompt cache

There is a cancellation handshake (`_BackgroundReviewRun`) with a 2-second timeout so a slow review can't block session teardown.

#### The memory review prompt (line 465)

```
Review the conversation above and consider saving to memory if appropriate.

Focus on:
1. Has the user revealed things about themselves — their persona, desires,
   preferences, or personal details worth remembering?
2. Has the user expressed expectations about how you should behave, their work
   style, or ways they want you to operate?

If something stands out, save it using the memory tool.
If nothing is worth saving, just say 'Nothing to save.' and stop.
```

#### The skill review prompt (line 477)

This is the interesting one. It is long and unusually opinionated. Highlights:

**Bias toward action:**

> Be ACTIVE — most sessions produce at least one skill update, even if small. A pass that does nothing is a missed learning opportunity, not a neutral outcome.

**Target library shape:**

> CLASS-LEVEL skills, each with a rich SKILL.md and a `references/` directory for session-specific detail. Not a long flat list of narrow one-session-one-skill entries. This shapes HOW you update, not WHETHER you update.

**User frustration is a first-class skill signal** — not just a memory signal:

> Frustration signals like 'stop doing X', 'this is too verbose', 'don't format like this', 'why are you explaining', 'just give me the answer', 'you always do Y and I hate it', or an explicit 'remember this' are FIRST-CLASS skill signals… Update the relevant skill(s) to embed the preference so the next session starts already knowing.

**The preference ladder** — prefer the earliest that fits:

1. **Patch a currently-loaded skill.** The one that was actually in play this session. Only if it is curator-managed — bundled, hub, pinned, and user-owned skills are off-limits.
2. **Patch an existing umbrella skill.** Add a subsection, a pitfall, broaden a trigger.
3. **Add a support file** under an existing umbrella — `references/`, `templates/`, or `scripts/`, each with a defined purpose. The umbrella's SKILL.md gains a one-line pointer.
4. **Create a new class-level umbrella** only when nothing covers the class. The name MUST be class-level — "MUST NOT be a specific PR number, error string, feature codename, library-alone name, or 'fix-X / debug-Y / audit-Z-today' session artifact. If the proposed name only makes sense for today's task, it's wrong."

**Read-before-write, enforced by the tool:**

> before you patch or edit an existing skill's SKILL.md, call `skill_view(name)` for that skill during this review… Content quoted earlier in the conversation transcript does NOT count — the guard requires a fresh load within this review… If a write is refused with a read-before-write error, call `skill_view` for the named target once and retry the write once; do not loop.

**Memory vs skills — the division of labor:**

> Memory captures 'who the user is and what the current situation and state of your operations are'; skills capture 'how to do this class of task for this user'. When they complain about how you handled a task, the skill that governs that task needs to carry the lesson.

That distinction is the cleanest statement of the architecture in the whole repo.

### 6.4 The curator

**`agent/curator.py`** — 2,057 lines. Background skill-collection maintenance.

Trigger is **inactivity-based, no cron daemon**: when the agent is idle and the last curator run was longer than `interval_hours` ago, `maybe_run_curator()` spawns a forked `AIAgent`.

Responsibilities:

- auto-transition lifecycle states from derived skill activity timestamps
- spawn a review agent that can **pin / archive / consolidate / patch** agent-created skills via `skill_manage`
- persist state in `.curator_state` (last_run_at, paused, etc.)

**Strict invariants**, quoted verbatim from the docstring:

> - Only touches agent-created skills (see `tools/skill_usage.is_agent_created`)
> - **Never auto-deletes — only archives. Archive is recoverable.**
> - Pinned skills bypass all auto-transitions
> - Uses the auxiliary client; never touches the main session's prompt cache

Those four lines are the safety model for autonomous self-modification, and they are worth copying wholesale.

### 6.5 Cross-session recall

**`tools/session_search_tool.py`** — SQLite **FTS5** full-text search over every past conversation in `~/.hermes/state.db`. Supports `session_search(session_id=..., around_message_id=...)` to pull surrounding context around a hit. Backed by the custom CJK tokenizer extension when built.

`SESSION_SEARCH_GUIDANCE` in the system prompt:

> When the user references something from a past conversation or you suspect relevant cross-session context exists, use `session_search` to recall it before asking them to repeat themselves.

`hermes_cli/web_routers/sessions.py:230` exposes the same search to the UI. There's a fallback ladder (fts5 → trigram → like_scan) so search degrades rather than fails on runtimes without FTS5.

### 6.6 External memory providers

`agent/memory_provider.py` defines the `MemoryProvider` ABC (line 110). `agent/memory_manager.py` (`MemoryManager`, line 433) orchestrates. Nine plugin implementations under `plugins/memory/`:

| Provider | Description from its `plugin.yaml` | Hook |
|---|---|---|
| `honcho` | AI-native memory — cross-session user modeling with dialectic Q&A, semantic search, persistent conclusions | `on_session_end` |
| `hindsight` | long-term memory with knowledge graph, entity resolution, multi-strategy retrieval | `on_session_end` |
| `mem0` | — | `on_session_end` |
| `byterover` | persistent knowledge tree with tiered retrieval via the `brv` CLI | `on_pre_compress` |
| `holographic` | local SQLite fact store with FTS5, trust scoring, HRR-based compositional retrieval | `on_session_end` |
| `supermemory`, `retaindb`, `openviking` | — | varies |

Provider context is sanitized before it reaches the LLM: `agent/context_engine.py::sanitize_memory_context()` redacts secrets and URL credentials, then truncates to `MEMORY_CONTEXT_MAX_CHARS = 6_000` (head 4,000 + tail 1,500 with a truncation marker).

There's also `plugins/memory/query_rewrite.py`, shared query-rewriting logic.

### 6.7 Making learning visible

**`agent/learning_graph.py`** builds a graph for the desktop UI:

- **Nodes:** non-base learned/profile skills + memory chunks from `MEMORY.md`/`USER.md` as first-class nodes
- **Skill→skill edges:** declared `related_skills` in frontmatter
- **Memory→skill edges:** derived from **lexical overlap**

So the graph answers "which learned skills are connected to the things I remember?" `agent/learning_graph_render.py` draws it; `agent/learning_mutations.py` handles edits.

Runnable standalone for edge-density stats: `python -m agent.learning_graph`.

### 6.8 The `/learn` command

`agent/learn_prompt.py::build_learn_prompt()`. Open-ended: point it at a directory, an API doc URL, a workflow you just walked the agent through, or pasted notes.

Notably, **there is no separate distillation engine and no extra model-tool footprint** — it builds one prompt instructing the live agent to gather sources with tools it already has (`read_file`, `search_files`, `web_extract`, the conversation itself) and then author a skill via `skill_manage`. Every surface (CLI `/learn`, gateway `/learn`, dashboard "Learn a skill" panel) calls the same function.

Small sources → one tight SKILL.md. Large prose sources (books, paper stacks, spec corpora) → the knowledge-base layout: lean index + `references/` loaded on demand.

### 6.9 `skill_manage` — the write API

`tools/skill_manager_tool.py:2171`:

```json
"action": { "enum": ["create", "patch", "delete", "write_file", "remove_file"] }
```

- `content` — full SKILL.md text (frontmatter + body) for `create`, or a full rewrite on `patch`
- `category` — optional category subdir for `create`
- `file_path` — starting with `references/`, `templates/`, or `scripts/` for `write_file`

The read-before-write guard is enforced here, not just prompted. `mark_background_review_skill_read()` is how `skill_view` records that a fresh read happened inside the current review.

---

## 7. Threat-pattern scanner

**`tools/threat_patterns.py`** — 289 lines. Single source of truth for prompt-injection / promptware / exfiltration detection.

### Where it's used

Three call sites share this one library:

1. `agent/prompt_builder.py` — context-file scanning (AGENTS.md etc.)
2. `tools/memory_tool.py` — memory writes
3. `agent/tool_dispatch_helpers.py` — tool-result delimiter system

Related but separate guards: `tools/skills_guard.py` (skill installs), `tools/plugin_guard.py`, `tools/self_repo_guard.py`, `tools/tirith_security.py`, `tools/url_safety.py`, `tools/path_security.py`.

### It is regex, not ML

A list of `(regex, pattern_id, scope)` tuples. Compiled once at import into `_COMPILED`, indexed by scope.

### The three scopes

| Scope | Applied to | Behavior |
|---|---|---|
| `all` | everywhere | classic injection, exfiltration |
| `context` | context files + memory + tool results | promptware, C2, role hijack — broader detection |
| `strict` | memory writes + skill installs **only** | aggressive checks, acceptable because the user can intervene |

Scope cascades: `all` lands in every set; `context` implies `strict` also wants it; `strict` is strict-only.

The reason for the split, from the docstring:

> tool results contain web pages, GitHub issues, and MCP responses — content the user did not author — and we want broad detection there, but **blocking is reserved for paths where the user can intervene** (memory writes, skill installs).

So: memory and skills **block**; tool results only **warn**. You can edit a memory entry; you can't edit a scraped web page.

### Attack classes covered

| Class | Example pattern ids |
|---|---|
| Classic injection | `prompt_injection`, `sys_prompt_override`, `disregard_rules`, `bypass_restrictions`, `html_comment_injection`, `hidden_div`, `translate_execute`, `deception_hide` |
| Role / identity hijack | `role_hijack` ("you are now a…"), `role_pretend`, `leak_system_prompt`, `remove_filters`, `fake_update`, `identity_override` ("name yourself X") |
| C2 / promptware | `c2_node_registration`, `c2_heartbeat`, `c2_task_pull`, `c2_network_connect`, `forced_action` |
| Anti-forensics | `anti_forensic_oneliner` ("only use one-liners"), `anti_forensic_disk` ("never write script to disk") |
| Agent-env tampering | `env_var_unset_agent` — `unset $*CLAUDE*/CODEX/HERMES/AGENT/OPENAI/ANTHROPIC*` |
| Known red-team brands | `known_c2_framework` — cobalt strike, sliver, havoc, mythic, metasploit, brainworm; `c2_explicit`, `c2_explicit_long` |
| Exfiltration | `exfil_curl`, `exfil_wget`, `read_secrets` (`.env`, `.netrc`, `.pgpass`, `.npmrc`, `.pypirc`), `send_to_url`, `context_exfil` |
| Persistence | `ssh_backdoor` (`authorized_keys`), `ssh_access`, `hermes_env`, `agent_config_mod`, `hermes_config_mod` |
| Hardcoded secrets | `hardcoded_secret` |

Plus `INVISIBLE_CHARS` — a frozenset of zero-width and bidirectional-override Unicode: ZWSP, ZWNJ, ZWJ, word joiner, invisible times/separator/plus, BOM, LRE/RLE/PDF/LRO/RLO, and the directional isolates U+2066–U+2069.

### The pattern philosophy — this is the transferable part

> Patterns anchor on **C2-specific vocabulary or unambiguous attack behavior, NOT on bossy English**. Phrases like "you are obligated to" or "you must" alone are too common in legitimate instruction-writing (see AGENTS.md, CLAUDE.md, etc.) to flag.

And an explicit warning against adding common words to the brand list:

> do not add common English words here. Every token must be a distinctive offensive-security tool brand, otherwise legitimate AGENTS.md / SOUL.md content false-positives and the whole file is blocked. "praxis" was removed for exactly this reason — it's a common word and a legitimate agent name (Greek for practice/action), not a C2-specific tell.

They even document when they chose to warn rather than block:

> "register as a node" appears in legitimate distributed-systems docs, but in combination with the other patterns the signal is strong; we WARN, not block, so a security researcher reading the Brainworm post in a webpage doesn't break their session.

### Two engineering details worth stealing

**1. Bounded input.**

```python
MAX_SCAN_CHARS = 65_536
```

> Context/tool-result strings can be arbitrarily large, and the scanners are advisory guards rather than archival search; bounding input keeps worst-case runtime predictable while preserving detections near the beginning of injected content.

**2. Bounded filler — anti-bypass without catastrophic backtracking.**

```python
_FILLER = r"(?:\w+\s+){0,8}"
```

Used between key tokens: `ignore\s+{_FILLER}(previous|all|above|prior)\s+{_FILLER}instructions`. This catches "ignore all **prior** instructions" and "ignore **every one of the above** instructions" without letting the regex explode. The docstring notes the earlier version used `(?:\w+\s+)*` which "is ambiguous and can backtrack heavily on adversarial near-misses."

Env-var patterns anchor with `\b` at the end specifically to avoid flagging legitimate vars like `$TRILLIUM_ETAPI_URL` that contain KEY/TOKEN as substrings. `API` was dropped from the alternation entirely because mid-name `API` is ubiquitous in benign var names and every real secret shape already ends in KEY/TOKEN.

### API

```python
scan_for_threats(content: str, scope: str = "context") -> List[str]
first_threat_message(content: str, scope: str = "strict") -> Optional[str]
```

Unicode normalization runs before matching (`import unicodedata`), so homoglyph and decomposition tricks don't slip past.

---

## 8. Plugin system

**Loader: `hermes_cli/plugins.py`** (~4,900 lines). Supporting modules: `plugin_capabilities.py`, `plugin_index.py`, `plugin_packs.py`, `plugin_dev.py`, `agent_plugins.py`, plus `plugins/plugin_storage.py` and `plugins/plugin_utils.py`.

### Discovery — four sources

From the module docstring:

1. **Bundled** — `<repo>/plugins/<name>/` (`memory/` and `context_engine/` subdirs excluded; they have their own discovery paths)
2. **User** — `~/.hermes/plugins/<name>/`
3. **Project** — `./.hermes/plugins/<name>/`, opt-in via `HERMES_ENABLE_PROJECT_PLUGINS`
4. **Pip** — packages exposing the `hermes_agent.plugins` entry-point group

> Later sources override earlier ones on name collision, so a user or project plugin with the same name as a bundled plugin replaces it.

Bundled dir resolution honors `HERMES_BUNDLED_PLUGINS` (set by the Nix wrapper and packaged installs) so read-only store paths win, falling back to the in-repo path in development.

Two directory layouts are supported (`hermes_cli/plugins.py:4669`):

- **Flat** — `<root>/<plugin-name>/plugin.yaml`
- **Category** — `<root>/<category>/<plugin-name>/plugin.yaml`, where the category dir itself has no manifest

There's a depth cap, and a debug mode: `HERMES_PLUGINS_DEBUG=1` surfaces which directories were scanned, which manifests parsed, which plugins were skipped and why, what each `register(ctx)` registered, and full tracebacks on load failure.

### The contract

**Every directory plugin needs exactly two things:**

1. `plugin.yaml` — the manifest
2. `__init__.py` with a `register(ctx)` function

That's it. Simplest real example, `plugins/disk-cleanup/plugin.yaml`:

```yaml
name: disk-cleanup
version: 2.0.0
description: "Auto-track and clean up ephemeral files (test scripts, temp outputs,
  cron logs) created during Hermes sessions. Runs via plugin hooks — no agent
  action required."
author: "@LVT382009 (original), NousResearch (plugin port)"
hooks:
  - post_tool_call
  - on_session_end
```

Manifests can also declare:

```yaml
pip_dependencies:
  - "hindsight-client>=0.6.1"
external_dependencies:
  - name: brv
    install: "curl -fsSL https://byterover.dev/install.sh | sh"
    check: "brv --version"
requires_env: []
requires_plugins: []        # advisory only — never blocks load
capabilities: []            # see §9
```

`requires_plugins` is advisory: a missing dependency never blocks load, so plugins probe at runtime with `ctx.has_plugin(id)`.

Unknown keys are tolerated — `hermes_cli/plugins.py:711` notes the parser has a known field set and anything else in the YAML is ignored, so manifests are forward-compatible.

### `PluginContext` — the entire API surface

`hermes_cli/plugins.py:1458`. Docstring: *"Facade given to plugins so they can register tools and hooks."*

This object **is** the plugin API. Nothing else is exposed. That is what makes capability gating possible — you gate which `ctx` methods are live.

**Registration methods:**

| Method | Line | Registers |
|---|---|---|
| `register_tool` | 1778 | agent tool (delegates to `tools.registry.register()` so plugin tools sit alongside built-ins) |
| `register_hook` | 3387 | lifecycle callback |
| `register_command` | 2179 | slash command |
| `register_cli_command` | 2139 | `hermes <cmd>` subcommand |
| `register_system_prompt_section` | 3412 | bounded system-prompt context (§3) |
| `register_skill` | 3597 | a skill |
| `register_middleware` | 3567 | middleware |
| `register_context_engine` | 2293 | replacement compaction engine |
| `register_context_reference` | 2337 | `@`-prefix provider |
| `register_memory_provider` | 2373 | external memory backend |
| `register_secret_source` | 2735 | credential source |
| `register_redaction_patterns` | 3345 | extra redaction regexes |
| `register_auxiliary_task` | 3213 | background aux-model task |
| `register_approval_transport` | 1740 | approval UI transport |
| `register_platform` | 2928 | messaging platform adapter |
| `register_platform_handler` / `register_telegram_handler` / `register_slack_action_handler` | 3086 / 3163 / 3021 | platform event handlers |
| `register_terminal_environment_provider` | 2670 | terminal backend |
| `register_dashboard_auth_provider` | 2455 | dashboard auth |
| Provider family | 2406–2928 | `image_gen`, `video_gen`, `web_search`, `browser`, `tts`, `transcription` |

**State and config methods:**

- `ctx.plugin_id` — effective registry id for namespacing
- `ctx.get_config(key, default)` — reads `plugins.entries.<plugin_id>.settings.<key>`. **Key is always plugin-relative; no global config paths are exposed.** There's a migration fallback to a former `config` subtree.
- `ctx.has_plugin(id)` — runtime dependency probe
- `ctx.llm` — lazily built **host-owned** LLM facade (`agent/plugin_llm.py`). Plugins don't bring their own client.
- `ctx.state` — durable namespaced storage (`PluginState`, backed by `plugins/plugin_storage.py`)
- `ctx.platform_actions` — lazily built, **capability-gated** platform action facade

### Hooks

`VALID_HOOKS` at `hermes_cli/plugins.py:163` — roughly 40, heavily commented. Grouped:

**Tool lifecycle**
`pre_tool_call`, `post_tool_call`, `transform_tool_result`, `transform_terminal_output`

**LLM lifecycle**
`pre_llm_call`, `post_llm_call`, `transform_llm_output`, `on_stream_start`, `on_stream_delta`, `on_stream_end`, `on_interim_message`

Streaming hooks fire **asynchronously off the token path** (`agent/plugin_stream_hooks.py`) and are observers only — they see immutable normalized payloads and cannot transform the stream.

**API lifecycle**
`pre_api_request`, `post_api_request`, `api_request_error`, `transform_api_error_classification`

The last one lets a provider plugin own its provider's error quirks without core patches. Callbacks receive parsed error context and return a dict with `reason` (a `FailoverReason` name) plus optional `retryable`, `should_compress`, `should_rotate_credential`, `should_fallback`. Cold path — fires only on failure. Privacy note in the source: `error_message`/`error_body` may carry an unredacted provider dump.

**Session lifecycle**
`on_session_start`, `on_session_end`, `on_session_finalize`, `on_session_reset`, `on_skill_lifecycle`, `subagent_start`, `subagent_stop`

**Gateway**
`pre_gateway_dispatch` — fires per inbound `MessageEvent` after the internal-event guard but **before** auth/pairing and dispatch. Returns:

```python
{"action": "skip",    "reason": "..."}   # drop the message, no reply
{"action": "rewrite", "text": "..."}     # replace event.text, continue
{"action": "allow"}  # or None            # normal dispatch
```

**Approval**
`pre_approval_request`, `post_approval_response` — **observers only.** Explicitly documented: *"Plugins cannot veto or pre-answer an approval from these hooks (use `pre_tool_call` to block a tool before it reaches approval)."*

**Verification**
`pre_verify` — fires once per turn when the agent has edited code and is about to stop. A callback can keep the agent going:

```python
{"action": "continue", "message": "<follow-up instruction>"}
```

It also accepts the Claude-Code Stop shape `{"decision": "block", "reason": "..."}`. Bounded by `agent.max_verify_nudges`.

**Kanban**
`kanban_task_claimed`, `kanban_task_completed`, `kanban_task_blocked`, `on_kanban_task_updated`, `on_kanban_dispatch_tick`, worker spawn/exit/stale-claim

These carry an unusually good piece of documentation: **which process each hook fires in.** Kanban workers run as separate `hermes -p <profile> chat -q` subprocesses, so:

- `kanban_task_claimed` → the **dispatcher** process, right before the worker spawns
- `kanban_task_completed` → the **worker** process
- `kanban_task_blocked` → the worker, or whoever drove the block

> A plugin that needs to observe every transition centrally should hook in the dispatcher; one that needs per-task in-session context should hook in the worker.

**Transcription**
`pre_transcription` — mutate `prompt` / `language` / `model` before any STT backend runs. `file_path` is read-only; attempts to change it are logged and dropped. Applied in registration order, last-writer-wins per field.

**Compression**
`on_pre_compress` — used by the byterover memory provider.

### Dispatch semantics — specified per family

This is unusually rigorous and worth copying.

**Transform family — run-all-then-pick-first:**

> every registered callback runs with its failures isolated (an early answer never stops later callbacks), then the first valid result in registration order wins — on conflict the first-registered plugin is the tie-break, and every additional valid-but-losing result is reported with a runtime warning.

That warning matters: a silently-dropped transform is a debugging nightmare, so they surface it.

**Observer family:** return values ignored entirely; every fire site is best-effort so a broken callback can never break the host path.

**Cost rule:**

> every call site short-circuits on `has_hook()`, so when nothing subscribes no payload is built and the hot paths pay one dict probe.

Contracts documented in `docs/plugins/hook-taxonomy.md` and `docs/middleware/README.md`.

### Tool override protection

`PluginToolOverrideError(PermissionError)` — a plugin cannot shadow a built-in tool unless the operator opts in via `plugins.entries.<plugin_id>.allow_tool_override` (or grants the `tools.override` capability).

### Bundled plugin catalog

```
plugins/
├── browser/            browser_use, browserbase, firecrawl
├── context_engine/     (replacement compaction engines)
├── cron_providers/     chronos
├── dashboard_auth/     basic, drain, nous, self_hosted
├── disk-cleanup/       ← simplest complete example
├── google_meet/        audio bridge, meet bot, realtime, node/ subdir
├── hermes-achievements/
├── image_gen/
├── kanban/
├── memory/             byterover, hindsight, holographic, honcho, mem0,
│                       openviking, retaindb, supermemory
├── model-providers/
├── observability/
├── platforms/          messaging adapters
├── security-guidance/
├── spotify/
├── teams_pipeline/
├── video_gen/
└── web/
```

`plugins/google_meet/` is the best "full-featured plugin" reference: it has a `plugin.yaml`, a `SKILL.md`, `tools.py`, `cli.py`, a `process_manager.py`, an `audio_bridge.py`, a `realtime/` package, and a `node/` subdirectory — i.e. a plugin can ship its own Node subprocess.

---

## 9. Permissions — three independent layers

### Layer 1 — Toolsets (what tools exist at all)

`toolsets.py` (39 KB) + `toolset_distributions.py` + `model_tools.py` (77 KB, the schemas).

Named groups of tools, composable from other toolsets. `_HERMES_CORE_TOOLS` is the shared list used by CLI and every messaging platform, so you edit it once.

```python
tools = get_toolset("research")
all_tools = resolve_toolset("full_stack")   # expands composed toolsets
```

A representative gating comment, about desktop-only GUI tools:

> the desktop GUI affordances (`read_terminal`, `open_preview`, …) are deliberately NOT here… They live in the `desktop_ui` toolset and are enabled solely by the GUI gateway for a session whose SOURCE is the desktop app (`tui_gateway/server.py::_load_enabled_toolsets`) — **never keyed on a process env var, which is blind to a desktop client talking to a remote/cloud backend.**

That distinction — *session source*, not *process environment* — is the correct model for any client/server agent.

Toolsets also carry `platform_gate` entries (e.g. computer use only on darwin/win32/linux).

### Layer 2 — Dangerous command approval (what a tool may do)

`tools/approval.py`. Docstring calls it the single source of truth for:

- pattern detection (`DANGEROUS_PATTERNS`, `detect_dangerous_command`)
- per-session approval state, thread-safe, keyed by `session_key`
- approval prompting — CLI interactive + gateway async
- **smart approval** via auxiliary LLM (auto-approve low-risk commands)
- permanent allowlist persisted to `config.yaml`

Four outcomes: `once`, `session`, `always`, `deny` (plus `timeout`, `smart_approve`, `smart_deny`).

**Two security details worth stealing:**

**1. YOLO mode is frozen at import.**

```python
_YOLO_MODE_FROZEN: bool = is_truthy_value(os.getenv("HERMES_YOLO_MODE", ""))
```

> Reading `os.environ` on every call would allow any skill running inside the process to set this variable and instantly bypass all approval checks — a prompt-injection escalation path.

**2. Session identity uses contextvars, not a process global.**

```python
_approval_session_key: contextvars.ContextVar[str]
_approval_turn_id: contextvars.ContextVar[str]
_approval_tool_call_id: contextvars.ContextVar[str]
```

> Gateway runs agent turns concurrently in executor threads, so reading a process-global env var for session identity is racy.

Related: `tools/write_approval.py`, `tools/slash_confirm.py`, `hermes_cli/approval_mode.py`, `hermes_cli/approval_transport.py`, `hermes_cli/approvals_suggest.py`.

### Layer 3 — Plugin capabilities (what a plugin may reach)

`hermes_cli/plugin_capabilities.py`.

**The honest disclaimer, verbatim:**

> **This is NOT a sandbox.** In-process Python plugins remain trusted code — a malicious plugin can import anything, monkey-patch core, and ignore all of this. Capabilities govern the *host API surfaces* Hermes hands out (which registrations succeed, which `ctx` methods are live) and give the user an honest consent + audit trail. Actual isolation is a separate research track.

The registry, 1:1 with pre-existing config gates:

| Capability id | Legacy gate (`plugins.entries.<id>.…`) |
|---|---|
| `tools.override` | `allow_tool_override` |
| `llm.provider_override` | `llm.allow_provider_override` |
| `llm.model_override` | `llm.allow_model_override` |
| `llm.agent_id_override` | `llm.allow_agent_id_override` |
| `llm.profile_override` | `llm.allow_profile_override` |
| `llm.task_override` | `llm.allow_task_override` |
| `gateway.platform_actions` | `allow_platform_actions` |

> We deliberately do not mint capability ids without an enforcing gate.

Legacy `allow_*` keys keep working verbatim — a gate is open when the legacy key is true **or** the capability is granted.

**Consent state** records a hash of the declared capability set plus `granted_at`:

```python
{"hash": capability_set_hash(declared_list),
 "granted_at": "2026-...T...Z"}
```

So an update that *adds* capabilities changes the hash and re-prompts, while a routine version bump does not.

### Computer use — separately gated

`tools/computer_use/`. It shells out to **`cua-driver`** (github.com/trycua/cua) over **MCP stdio**. Hermes runs a dedicated asyncio loop on a background thread and marshals sync calls through it, because the Python `mcp` SDK is async.

Surface: `click`, `type_text`, `hotkey`, `drag`, `scroll`, `screenshot`, `launch_app`, `list_apps`, `list_windows`, `get_window_state`, `move_cursor`, `wait`.

Per-OS readiness differs (`tools/computer_use/permissions.py`):

| OS | What "ready" means |
|---|---|
| macOS | explicit TCC grants — Accessibility + Screen Recording. **Grants attach to cua-driver's own identity (`com.trycua.driver` / `CuaDriver.app`), NOT Hermes** — so no Hermes entitlement is involved, and `grant` launches CuaDriver via LaunchServices so the macOS dialog is attributed correctly. |
| Windows | no TCC toggles; the UIAccess worker (`cua-driver-uia.exe`) may trip SmartScreen on first run. Readiness == driver health. |
| Linux | X11/XWayland assistive control. Readiness == driver health. |

Universal signal: `cua-driver doctor --json`. Folded together with macOS permission detail into one payload for the desktop card, the `hermes computer-use permissions` CLI, and `/api/tools/computer-use/status`.

**Child env sanitization:** cua-driver is a third-party binary and "must never inherit provider API keys" — the source cites issues #53503 / #55709 / #58889 as the lineage for that rule.

Honest risk note in the source: the macOS path uses private SkyLight SPIs that "aren't Apple-public and can break on OS updates"; the Windows path uses stable Win32 APIs (SendInput + UI Automation) and isn't subject to that breakage class.

### Other security surfaces

| File | Purpose |
|---|---|
| `agent/secret_scope.py` | context-local secret resolution (§10) |
| `agent/redact.py` | secret redaction in logs and LLM egress |
| `tools/path_security.py` | path traversal defense |
| `tools/url_safety.py`, `tools/website_policy.py` | outbound URL policy |
| `tools/credential_files.py`, `agent/credential_pool.py`, `credential_persistence.py` | credential handling and rotation |
| `tools/osv_check.py` | OSV vulnerability database checks |
| `tools/spill_safety.py`, `hook_output_spill.py` | safe handling of oversized outputs |
| `agent/ssl_guard.py`, `ssl_verify.py` | CA bundle verification with fallback |
| `agent/estop.py` | emergency stop |
| `docs/security/network-egress-isolation.md` | egress isolation design |

---

## 10. Multiplexing gateway

**Definition, from `docs/design/multiplexing-gateway.md`:** one gateway process serving **every profile** in the install, instead of one process per profile.

Config: `gateway.multiplex_profiles: true` (default `false`). Env override `GATEWAY_MULTIPLEX_PROFILES` accepts explicit truthy/falsy tokens only — a blank or unrecognized value returns "no override," so an empty deployment secret cannot shadow a config opt-in.

### Off vs on

| | Off (default) | On |
|---|---|---|
| Processes | one per profile | **one, total** |
| Per profile | own `.env`, sessions, skills, adapters | own adapters, secrets, sessions, cron ticks |
| Shared | nothing | one event loop, one HTTP listener, one process lock, one status surface |

### The governing constraint

> **profile A's turns must never observe profile B's state.**

Anything that cannot yet be isolated **fails closed** or is documented as a known limitation.

### The mechanism — contextvars, never `os.environ`

Every inbound event composes two context-local scopes before any profile-owned code runs:

```
platform event
   │
   ▼
profile_routes match ──► served-set check ──► SessionSource.profile stamped
   │                                          (gateway/profile_routing.py)
   ▼
_profile_runtime_scope(profile_home)          (gateway/run.py)
   ├── set_hermes_home_override(home)   → config / state.db / skills /
   │                                      memory / sessions resolve here
   └── set_secret_scope(profile .env)   → provider keys, platform tokens
   │
   ▼
agent turn (worker thread via copy_context())
   │
   ▼
scope unwound in finally
```

`_profile_runtime_scope` wraps **every** seam where profile-owned code executes: secondary adapter startup, connect and reconnect, the primary platform event handler, inbound preprocessing, `/model` and session-info resolution, background tasks, and the turn itself. Config reloads run under the default profile's scope so global gateway settings resolve consistently.

Both scopes are `contextvars`, so they propagate into executor worker threads via `copy_context()` and unwind deterministically. **Nothing is written to `os.environ`, ever.**

### Why not just merge the .env files

`agent/secret_scope.py` exists precisely because the obvious implementation is broken:

> the obvious implementation — union all profile `.env` files into `os.environ` — leaks profile A's keys into profile B's turns and into every subprocess spawned with `env=dict(os.environ)`.

That second clause is the one people miss. Any subprocess you spawn inherits the whole environment.

### The fail-closed design

`get_secret(name)` resolves in order: **global allowlist → active scope → fallback.** The fallback is load-bearing:

- multiplexing **off** → reads `os.environ`, so single-profile gateways and every non-gateway caller behave exactly as before
- multiplexing **on**, no scope installed → **raises `UnscopedSecretError`** rather than silently reading the process environment

> An un-migrated call site fails loud at that exact line instead of leaking another profile's value.

`_MULTIPLEX_ACTIVE` is a plain module global, not a contextvar, "because it describes the deployment mode, not a per-task value." Its only job is arming that fail-closed branch. Set once in `GatewayRunner.__init__`.

The global allowlist covers `HERMES_HOME`, `HERMES_PROFILE`, proxy settings, and `API_SERVER_*` listener settings — but **deliberately not `API_SERVER_KEY`**.

### Related gateway machinery

`gateway/` is ~80 modules. Notables:

| File | Purpose |
|---|---|
| `run.py` | `GatewayRunner` — the main loop |
| `platform_registry.py`, `platforms/` | Telegram, Discord, Slack, WhatsApp, Signal adapters |
| `profile_routing.py` | route inbound events to a profile |
| `session.py`, `session_state.py`, `session_context.py` | session lifecycle |
| `hosted_rooms.py` + 7 siblings | multi-agent shared rooms with execution policy and replicas |
| `scale_to_zero.py` | hibernate when idle |
| `delivery.py`, `delivery_ledger.py`, `mirror.py` | message delivery guarantees |
| `wake.py` | wake-word integration at the gateway layer |
| `slash_commands.py`, `slash_access.py` | slash command surface + access control |
| `shutdown_watchdog.py`, `startup_watchdog.py`, `restart_loop_guard.py` | supervision |
| `memory_monitor.py`, `agent_cache_pressure.py`, `disk_status.py` | resource pressure |

---

## 11. Wake word — ONNX and TFLite

**Files:** `tools/wakewords/hey_hermes.onnx` (205 KB) and `hey_hermes.tflite` (207 KB). Same model, two runtimes.

**Implementation:** `tools/wake_word.py`. Gateway integration: `gateway/wake.py`. Desktop UI: `apps/desktop/electron/wake-indicator.ts` and `src/app/wake-indicator/`.

### What the model is

From `tools/wakewords/README.md`:

- **Engine:** [openWakeWord](https://github.com/dscripka/openWakeWord), Apache-2.0
- **Provenance:** trained with the openWakeWord training pipeline on **synthetic TTS-generated speech** — no human recordings. The pipeline emits both `.onnx` and `.tflite` artifacts.
- **Label:** registers as `hey_hermes` (matches the filename)

### The critical runtime detail

The bundled files are **only the keyword classifier.** The shared feature-extraction models are not in the repo:

> openWakeWord's shared feature-extraction models (melspectrogram + embedding) are NOT bundled here — they are fetched once on first use by `tools/wake_word.py` via `openwakeword.utils.download_models()`.

So the pipeline is:

```
mic (16 kHz mono int16)
   → melspectrogram model      ┐ downloaded once,
   → speech embedding model    ┘ shared across all wake words
   → hey_hermes classifier     ← the 205 KB file in this repo
   → score per ~80 ms frame
```

That layered design is why a custom wake word is only ~200 KB: you train a new classifier head, not a new acoustic frontend.

### Three engines, all fully on-device

> no audio leaves the machine for detection

| Engine | Cost | How a custom phrase works |
|---|---|---|
| **openwakeword** (default) | free, no key | bundled `hey_hermes`, or a built-in name (`hey_jarvis`, `alexa`, `hey_mycroft`), or point `wake_word.openwakeword.model` at your own `.onnx`. **Requires training** for a new phrase. |
| **sherpa** | free, no key | sherpa-onnx keyword spotting, **open vocabulary**. Set `wake_word.phrase` to any text; it's tokenized at runtime against a small streaming **zipformer** (~13 MB English model, one-time download). **No training.** |
| **porcupine** | premium | Picovoice. Needs `PORCUPINE_ACCESS_KEY`. Built-in keywords + custom `.ppn` from the Picovoice Console. |

The sherpa option is the practical one for a custom phrase — open vocabulary means you type the words and it works.

### Audio path

```python
SAMPLE_RATE = 16000   # 16 kHz mono int16 — Whisper-native, what both engines expect
```

Reuses the same `sounddevice` capture path as voice mode.

### False-positive controls

```python
_DEFAULT_CONFIRMATION_FRAMES = 3
_FIRE_COOLDOWN_SECONDS       = 2.0
```

The reasoning:

> openWakeWord scores one ~80 ms frame at a time, and a stray phoneme in background conversation can spike a single frame over the threshold. A real utterance of the phrase holds the score high across several consecutive frames, so we require N-in-a-row above threshold before firing. **This is the primary lever against unintended triggers on ambient talk.**

The cooldown stops one "hey hermes" retriggering across frames while the caller is still reacting.

### Dead-mic detection

```python
_SILENCE_PEAK           = 10
_SILENCE_ALERT_SECONDS  = 10
```

An int16 stream whose peak stays ≤10 for 10 consecutive seconds is flagged silent. Why it's needed:

> Desktop push-to-talk and the backend listener use different capture paths, so one can work while the backend-selected stream is all zeros.

### Threading and ownership

- Detector runs on its own **daemon thread**
- Callers `pause()` while a voice turn holds the mic, `resume()` when idle — "two input streams on one device is unreliable cross-platform"
- `WakeWordInUse(RuntimeError)` raised when another surface or process owns the listener
- `wake_surface_enabled` gates which surface (CLI, TUI, or desktop GUI) owns it
- `_START_TIMEOUT_SECONDS = 5.0`

### Zero context cost

> Nothing here mutates agent context or the prompt cache — on wake we hand a plain string to the caller, exactly like a voice transcript.

### Not the same thing: `tools/neutts_samples/`

`jo.txt` + `jo.wav` are a **TTS voice-cloning reference sample** for NeuTTS (`tools/neutts_synth.py`). Opposite direction of the audio pipeline — output, not input. Unrelated to wake word.

The broader voice stack: `tools/voice_mode.py`, `voice_client_config.py`, `transcription_tools.py`, `tts_tool.py`, `tts_streaming.py`, `tts_text_normalize.py`, `audio_container.py`, plus `agent/tts_provider.py` / `tts_registry.py` / `transcription_provider.py` / `transcription_registry.py`, and `docs/streaming-tts.md`.

---

## 12. ACP adapter

**`acp_adapter/`** — 11 files. Entry point `hermes-acp = "acp_adapter.entry:main"`. CLI surface: `hermes acp` (`hermes_cli/subcommands/acp.py`).

**What it is:** exposes Hermes as an **Agent Client Protocol** server, so ACP-speaking editors and clients (Zed and friends) can drive it.

```
acp_adapter/
├── entry.py           CLI entry
├── __main__.py        python -m acp_adapter
├── server.py          the ACP agent server — main surface
├── session.py         session mapping
├── tools.py           tool bridging
├── events.py          event translation
├── permissions.py     ACP permission ↔ Hermes approval bridge
├── edit_approval.py   file-edit approval
├── provenance.py      edit attribution
└── auth.py            authentication
```

### Implemented surface

From the imports in `server.py`, it implements the full modern ACP schema:

- **Lifecycle:** `InitializeResponse`, `AuthenticateResponse`, `NewSessionResponse`, `LoadSessionResponse`, `ResumeSessionResponse`, `ForkSessionResponse`, `ListSessionsResponse`
- **Streaming:** `AgentMessageChunk`, `AgentThoughtChunk` (reasoning surfaced separately from output)
- **Content blocks:** text, `ImageContentBlock`, `AudioContentBlock`, `ResourceContentBlock`, `EmbeddedResourceContentBlock`, `BlobResourceContents`
- **Capabilities:** `AgentCapabilities`, `ClientCapabilities`, `PromptCapabilities`, `SessionCapabilities`, `SessionForkCapabilities`
- **Config:** `SetSessionModelResponse`, `SetSessionModeResponse`, `SetSessionConfigOptionResponse`, `ModelInfo`
- **Commands:** `AvailableCommand`, `AvailableCommandsUpdate`
- **MCP passthrough:** `McpServerStdio`, `McpServerHttp`, `McpServerSse` — it can hand MCP servers through to the underlying agent

Runs a `ThreadPoolExecutor` with `contextvars` propagation (same pattern as the gateway).

### The permission bridge — the reusable part

`acp_adapter/permissions.py` maps ACP permission option ids onto Hermes approval strings:

```python
_OPTION_ID_TO_HERMES = {
    "allow_once":    "once",
    "allow_session": "session",
    "allow_always":  "always",
    "deny":          "deny",
    "deny_always":   "deny",
}
```

Option ids stay stable across both the `allow_permanent=True` and `False` paths even though the presented option list differs.

There's a runtime SDK probe for forward/backward compatibility:

```python
def _permission_option_supports_kind(kind: str) -> bool:
    try:
        PermissionOption(option_id="__probe__", kind=kind, name="probe")
    except Exception:
        return False
    return True
```

It constructs a throwaway option to discover whether the installed ACP SDK accepts a given `kind`, then degrades gracefully. If you build a NeuroFlo ACP adapter against a moving SDK, copy this pattern.

### Related

`agent/acp_openai_bridge.py` (ACP ↔ OpenAI shape translation) and `agent/copilot_acp_client.py` (Hermes as an ACP *client*, consuming another ACP agent). So ACP works in both directions.

---

## 13. MCP — both directions

### Hermes as an MCP server

**`mcp_serve.py`** (38 KB). Invoked as `hermes mcp serve` (`hermes_cli/subcommands/mcp.py:30`). **stdio** transport.

It exposes Hermes' **messaging layer** to any MCP client:

| Tool | |
|---|---|
| `conversations_list` | list conversations across all connected platforms |
| `conversation_get` | one conversation |
| `messages_read` | message history |
| `attachments_fetch` | attachments |
| `events_poll` | poll for live events |
| `events_wait` | block for live events |
| `messages_send` | send a message |
| `permissions_list_open` | open approval requests |
| `permissions_respond` | answer an approval |
| `channels_list` | Hermes-specific extra |

The docstring says the first nine deliberately match OpenClaw's channel-bridge surface.

Client config:

```json
{ "mcpServers": { "hermes": { "command": "hermes", "args": ["mcp", "serve"] } } }
```

**Note what this is not:** it does not expose Hermes' *agent* to MCP clients. It exposes its *inbox*. So Claude Code can read and reply to your Telegram threads through Hermes.

### Hermes as an MCP client

| File | Purpose |
|---|---|
| `tools/mcp_tool.py` | the MCP client tool surface |
| `tools/mcp_oauth.py`, `mcp_oauth_manager.py`, `mcp_dashboard_oauth.py` | OAuth flows for remote MCP servers |
| `tools/mcp_schema_cache.py` | cache tool schemas so they aren't re-fetched every session |
| `tools/mcp_death_supervisor.py` | detect and restart dead MCP child processes |
| `tools/managed_tool_gateway.py` | managed tool routing |
| `tui_gateway/mcp_oauth_sessions.py`, `mcp_rpc_helpers.py` | desktop-side MCP plumbing |
| `apps/desktop/electron/mcp-oauth-callback-ipc.ts` | OAuth callback handling in Electron |
| `optional-mcps/` | **67 pre-configured MCP server definitions** |
| `mcp-research-data/` | research data on MCP servers |

`ctx.get_portable_mcp_servers()` (`hermes_cli/plugins.py:6131`) lets plugins contribute MCP server definitions.

---

## 14. Skills hub and distribution

**`tools/skills_hub.py`** — library module (not an agent tool). CLI surface in `hermes_cli/skills_hub.py`; also the `/skills` slash command.

Provides:

- `GitHubAuth` — shared GitHub API auth (PAT, `gh` CLI, or GitHub App)
- `SkillSource` ABC — interface for all skill registry adapters
- `OptionalSkillSource` — official optional skills shipped in-repo but not activated by default
- `GitHubSource` — fetch skills from **any** GitHub repo via the Contents API
- `HubLockFile` — provenance tracking for installed hub skills
- hub state directory management: **quarantine**, **audit log**, **taps**, index cache

The quarantine + audit log + lockfile combination is a real supply-chain model, not decoration. Installed skills are scanned by `tools/skills_guard.py` (which shares the `strict` threat-pattern scope) before activation.

"Taps" is the Homebrew concept — add a third-party repo as a skill source.

### The two skill trees

| Tree | Status |
|---|---|
| `skills/` | active by default. Categories: apple, autonomous-ai-agents, creative, devops, email, media, note-taking, productivity, research, social-media, software-development, web |
| `optional-skills/` | shipped but inactive. Categories: autonomous-ai-agents, blockchain, communication, creative, data-science, devops, dogfood, email, finance, gaming, health, mcp, migration, mlops, payments, productivity, research, security, smart-home, software-development, web-development, yuanbao |

Also: `tools/skills_sync.py` / `skills_sync_client.py` (sync across machines), `agent/skill_bundles.py`, `agent/skill_commands.py`, `agent/skill_preprocessing.py`, `agent/skill_utils.py`, `tools/skill_usage.py` (tracks use counts, feeds the curator and the learning graph), `skills/index-cache/`.

The README notes compatibility with the **agentskills.io** open standard.

---

## 15. Terminal backends

`tools/environments/` — seven interchangeable execution environments behind one interface (`base.py`):

| Backend | File | Notes |
|---|---|---|
| local | `local.py` | direct subprocess |
| docker | `docker.py` | container |
| ssh | `ssh.py` | remote host |
| singularity | `singularity.py` | HPC container |
| modal | `modal.py`, `managed_modal.py`, `modal_utils.py` | **serverless, hibernates when idle** |
| daytona | `daytona.py` | **serverless, hibernates when idle** |
| vercel sandbox | `vercel_sandbox.py` | ephemeral |

Plus `file_sync.py` and `path_utils.py` for moving files and translating paths across the boundary.

The README's claim — "your agent's environment hibernates when idle and wakes on demand, costing nearly nothing between sessions" — refers to Modal and Daytona.

This matters architecturally: because tools go through this abstraction, a skill written against `read_file`/`search_files` works identically whether the agent is running locally, in Docker, or on a remote VM. `agent/learn_prompt.py` calls this out explicitly as the reason `/learn` has no separate engine.

---

## 16. What Syncrio would need to host this plugin model

The pattern is portable. Six pieces, in dependency order:

### 1. Discovery layer with precedence

Scan N roots for manifests, later overriding earlier on name collision.

```
bundled  →  user (~/.syncrio/plugins)  →  workspace (./.syncrio/plugins)  →  npm/pip entry points
```

Support both flat (`<root>/<name>/manifest`) and category (`<root>/<cat>/<name>/manifest`) layouts with a depth cap. Honor an env override for packaged/read-only installs. Ship a `SYNCRIO_PLUGINS_DEBUG=1` mode that logs every scanned dir, parsed manifest, skip reason, and registration.

### 2. A small manifest

Hermes' working manifest is under 10 fields. Don't over-design:

```yaml
name: my-plugin
version: 1.0.0
description: "One sentence."
hooks: [post_tool_call, on_session_end]
capabilities: [tools.override]
dependencies: {...}
requires_plugins: []      # advisory only
```

Tolerate unknown keys so manifests are forward-compatible.

### 3. One entry function, one context object

```python
def register(ctx): ...
```

**`ctx` must be the entire API surface.** Nothing else exposed. This is what makes capability gating possible at all — you gate which `ctx` methods are live. For CHIP this maps cleanly: `ctx.register_tool`, `ctx.register_hook`, `ctx.register_context_reference` (your `@` prefixes), `ctx.get_config` (plugin-relative only, never global paths), `ctx.state` (namespaced durable storage), `ctx.llm` (**host-owned** — plugins never bring their own client).

### 4. A named hook registry with per-family dispatch semantics

Split hooks into exactly two kinds and never blur the line:

| Kind | Return handling | Failure handling |
|---|---|---|
| **Transform** | run all, isolate failures, first valid in registration order wins, **warn on valid-but-losing results** | isolated |
| **Observer** | return ignored entirely | best-effort, can never break the host |

Document **which process** each hook fires in if you have any multi-process work (Syncrio's sync daemon vs UI vs agent).

Short-circuit on `has_hook()` at every fire site so zero subscribers costs one dict probe.

### 5. Declared capabilities + hashed consent

Only mint a capability id where an enforcing gate already exists. Record `{hash, granted_at}` so adding capabilities in an update re-prompts while a version bump doesn't. Be honest in the docs that in-process plugins are trusted code, not sandboxed.

### 6. Bounded prompt-section injection

If plugins can add to CHIP's system prompt, copy the caps exactly:

- **one** position anchor (Hermes allows only `after_memory`)
- per-section cap (4,000 chars)
- **global** cap across all sections (8,000 chars) — the asymmetry is deliberate
- render inside comment fences with a char-count marker so a resumed process can reconstruct the cached prefix without re-running plugin code
- reject duplicate ids with an error naming the owner
- allow a callable that receives read-only session info

### For CHIP and `.prmt` specifically

The closest analogue to your `.prmt` format is their SKILL.md: **YAML frontmatter + markdown body + optional sibling directories.** The load-bearing design decision is the **60-character description cap**, because that's what goes in the always-loaded index. Everything else loads on demand.

If `.prmt` files are going to be enumerated in a system prompt, define the equivalent hard cap now and enforce it at write time, not at render time. Hermes enforces it in the authoring standards *and* truncates at render — belt and braces — and the guidance explicitly tells the author to count characters rather than "ship a sentence and hope."

The three sibling directories are worth copying verbatim because each has a distinct, stated purpose:

- `references/` — knowledge to read
- `templates/` — files to copy and modify
- `scripts/` — actions to execute

And the umbrella SKILL.md gains a one-line pointer to each, so the index stays the only thing always loaded.

---

## 17. Salvage index — what to lift for your own use

Ranked by value-to-effort for your projects.

| # | Thing | Where | Why |
|---|---|---|---|
| 1 | **Frozen memory snapshot** | `tools/memory_tool.py:159` | Solves "durable writes vs stable prompt cache" in ~30 lines of state management. Directly applicable to CHIP. |
| 2 | **Threat pattern library** | `tools/threat_patterns.py` | 289 self-contained lines, MIT, no dependencies beyond `re`+`unicodedata`. Drop-in for NeuroFlo (PHI exfiltration) and Syncrio (untrusted synced content). |
| 3 | **Three-tier prompt with byte-stability discipline** | `agent/system_prompt.py:435` | The date-not-time trick alone is worth the read. |
| 4 | **60-char index + on-demand load** | `agent/prompt_builder.py:1856` | The whole progressive-disclosure design. |
| 5 | **Plugin `ctx` facade + hook taxonomy** | `hermes_cli/plugins.py:1458, 163` | The blueprint for Syncrio's plugin layer. |
| 6 | **Capability model with hashed consent** | `hermes_cli/plugin_capabilities.py` | Honest, small, auditable. |
| 7 | **Curator invariants** | `agent/curator.py:1–20` | Four lines that make autonomous self-modification safe: agent-created only, never delete (archive), pinned bypasses, aux client only. |
| 8 | **Context-local secret scope, fail-closed** | `agent/secret_scope.py` + `docs/design/multiplexing-gateway.md` | Correct multi-tenant secret isolation. Relevant if NeuroFlo ever serves multiple orgs from one process. |
| 9 | **Approval: frozen YOLO + contextvar session key** | `tools/approval.py` | Two specific injection-escalation defenses. |
| 10 | **ACP permission bridge + SDK probe** | `acp_adapter/permissions.py` | Direct template for your NeuroFlo ACP adapter. |
| 11 | **Terminal backend abstraction** | `tools/environments/base.py` | Seven backends, one interface. Skills become portable. |
| 12 | **Lean tail compaction math** | `agent/context_compressor.py:2605` | 2.5% clamped to [10K, 25K]. Better summary buys smaller tail. |
| 13 | **Skills hub supply chain** | `tools/skills_hub.py` | Quarantine + audit log + lockfile + taps. |
| 14 | **Session-source-not-env-var gating** | `toolsets.py` comment | Correct model for any client/server agent where the client may be remote. |
| 15 | **Wake word layering** | `tools/wake_word.py` + `tools/wakewords/README.md` | 200 KB per wake word because the acoustic frontend is shared. Sherpa gives open-vocabulary with no training. |

**Two files to read in full if you read nothing else:** `tools/threat_patterns.py` (289 lines) and `agent/system_prompt.py` (1,172 lines). Between them they contain most of the transferable engineering judgment in the repo.

**Two documents to read:** `docs/design/multiplexing-gateway.md` and the module docstring of `agent/curator.py`.

**License:** MIT — you can lift code directly, with attribution.

---

## 18. Glossary

| Term | Meaning in this codebase |
|---|---|
| **AIAgent** | The agent class. `run_agent.py:467`. Every surface constructs one. |
| **Auxiliary client / model** | A cheap/fast second model used for summarization, curation, smart approval, and title generation. Deliberately never touches the main session's prompt cache. `agent/auxiliary_client.py`. |
| **Background review** | A forked agent on a daemon thread that reviews the turn and writes memory/skills. Whitelisted to memory+skill tools. |
| **Bot Mode / Bot Chat** | An effectively eternal session. Gets the "timeless prompt" treatment (no date). |
| **Capability** | A declared, consent-gated permission for a plugin. Maps 1:1 to an existing config gate. Not a sandbox. |
| **Compaction / compression** | Summarizing the middle of a conversation while protecting head and tail. Triggers a system-prompt rebuild. |
| **Context engine** | Pluggable strategy for context management. Default is `ContextCompressor`. |
| **Context files** | `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.clinerules` discovered under the working directory and injected into tier 2. |
| **Context reference** | An `@`-prefix that pulls specific content into a turn on demand. Built-ins: `diff staged file folder git url`. |
| **Curator** | Inactivity-triggered background maintenance of agent-created skills. Pin/archive/consolidate/patch. Never deletes. |
| **Frozen snapshot** | Memory as it existed at session start. What goes in the system prompt. Never mutated mid-session. |
| **Gateway** | The process serving messaging platforms. Also the JSON-RPC/WebSocket server behind `serve` and `dashboard`. |
| **Hosted room** | A shared multi-agent room with execution policy, peers, and replicas. `gateway/hosted_room*.py`. |
| **Kanban** | Built-in task board (`~/.hermes/kanban.db`) with a dispatcher that spawns worker subprocesses per task. |
| **Lean tail** | Compaction-v2 default: verbatim tail capped at 2.5% of window, [10K, 25K]. |
| **MoA** | Mixture of Agents. `agent/moa_loop.py`, `moa_trace.py`. Multiple models composed behind one facade. |
| **Multiplexing** | One gateway process serving every profile, with contextvar-isolated homes and secrets. |
| **Nudge** | A turn-counted injected reminder to review memory. Default every 10 user turns. |
| **Profile** | An isolated Hermes identity — own `~/.hermes` home, config, state.db, skills, memory, secrets. |
| **Prompt cache / prefix cache** | Provider-side KV reuse. The reason the system prompt is built once per session and ordered stable→volatile. |
| **`[SKILL_PRUNED]`** | Marker left where a loaded skill body was dropped during compaction. Signals the model to `skill_view` it again. |
| **SOUL.md** | The identity file. Overrides `DEFAULT_AGENT_IDENTITY` as the first line of the system prompt. |
| **Skill** | A directory with SKILL.md (frontmatter + markdown) plus optional `references/`, `templates/`, `scripts/`. |
| **Skills index** | The names + ≤60-char descriptions rendered into the system prompt. The content is *not* included. |
| **Tap** | A third-party GitHub repo registered as a skill source (Homebrew terminology). |
| **Toolset** | A named, composable group of tools. Gated by platform, session source, and config. |
| **Trajectory** | A recorded agent run, used for training-data generation. `agent/trajectory.py`, `trajectory_compressor.py`, `batch_runner.py`. |
| **`UnscopedSecretError`** | Raised when multiplexing is on and a secret is read with no profile scope installed. The fail-closed guard. |

---

## Appendix A — File map by concern

```
ENTRY POINTS
  hermes                         repo-root shim
  hermes_cli/main.py             `hermes` — all subcommands
  run_agent.py:467               class AIAgent  ← the agent itself
  acp_adapter/entry.py           `hermes-acp`
  mcp_serve.py                   `hermes mcp serve`
  hermes_bootstrap.py            bootstrap
  hermes_startup_watchdog.py     startup supervision

PROMPTING
  agent/system_prompt.py:435     build_system_prompt_parts  ← THE assembly point
  agent/prompt_builder.py:201    DEFAULT_AGENT_IDENTITY     ← first instruction
  agent/prompt_builder.py:1856   build_skills_system_prompt ← the index
  SOUL.md                        identity override
  agent/prompt_cache*.py         cache boundary/scope/policy

MEMORY + LEARNING
  tools/memory_tool.py:159       MemoryStore (frozen snapshot)
  agent/memory_manager.py:433    MemoryManager
  agent/memory_provider.py:110   MemoryProvider ABC
  agent/background_review.py:465 review prompts ← the learning loop
  agent/curator.py               skill maintenance + invariants
  agent/learn_prompt.py          /learn + authoring standards
  agent/learning_graph.py        "learning made visible"
  agent/turn_context.py:869      nudge trigger
  tools/session_search_tool.py   FTS5 cross-session recall
  plugins/memory/*               9 external providers

CONTEXT
  agent/context_compressor.py    default engine
  agent/context_engine.py        ContextEngine ABC
  agent/context_references.py    @-prefix providers
  agent/conversation_compression.py
  trajectory_compressor.py       training-data compression

SECURITY
  tools/threat_patterns.py       ← shared scanner, 289 lines
  tools/approval.py              dangerous commands
  tools/skills_guard.py          skill installs
  tools/plugin_guard.py          plugin loads
  agent/secret_scope.py          contextvar secrets, fail-closed
  agent/redact.py                redaction
  hermes_cli/plugin_capabilities.py

PLUGINS
  hermes_cli/plugins.py:163      VALID_HOOKS
  hermes_cli/plugins.py:1458     PluginContext
  hermes_cli/plugins.py:558      prompt-section limits
  plugins/disk-cleanup/          simplest complete example
  plugins/google_meet/           most complete example

DESKTOP
  apps/desktop/electron/main.ts
  apps/desktop/electron/backend-command.ts   ← the Python bridge
  apps/desktop/electron/backend-child.ts     ← process teardown
  tui_gateway/server.py                       ← the JSON-RPC server

VOICE
  tools/wake_word.py             3 engines
  tools/wakewords/               hey_hermes.onnx / .tflite
  gateway/wake.py
  tools/voice_mode.py, tts_*.py, transcription_tools.py

INTEROP
  acp_adapter/                   Hermes as ACP server
  agent/copilot_acp_client.py    Hermes as ACP client
  mcp_serve.py                   Hermes as MCP server
  tools/mcp_tool.py              Hermes as MCP client
  optional-mcps/                 67 server configs
```

## Appendix B — Open questions / not yet read

Things I have not opened, in case they matter later:

- `hermes_state.py` (793 KB) and its 6 siblings — the state/persistence layer. Almost certainly worth a pass if you care about the session DB schema.
- `cli.py` (1.0 MB) — appears to be a legacy/monolithic CLI surface distinct from `hermes_cli/`.
- `agent/verify/`, `agent/monitoring/`, `agent/lsp/` — verification loop, observability, language-server integration.
- `evals/`, `batch_runner.py`, `mini_swe_runner.py` — the research/eval side.
- `docs/rfcs/2026-07-plugin-architecture-lessons-pi-opencode.md` — likely a good post-mortem on plugin design.
- `AGENTS.md` (95 KB) — the maintainer instruction file for agents working on this repo. Probably the single densest source of design rationale in the project.
