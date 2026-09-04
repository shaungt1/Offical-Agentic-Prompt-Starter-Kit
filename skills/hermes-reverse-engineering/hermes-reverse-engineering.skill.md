---
name: hermes-reverse-engineering
description: Use when mining the NousResearch/hermes-agent repo for reusable architecture — prompt layering, agent memory and self-learning loops, prompt-injection scanning, plugin/hook systems, capability permissions, context compaction, multi-tenant secret isolation, wake-word audio, or ACP/MCP interop. Gives the entry points, file paths, and extraction order so an agent can go straight to the right file instead of crawling 11,300 files. Not for using Hermes as a product, and not for questions answerable from its public docs.
version: 1.0.0
author: Sean
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [ReverseEngineering, AgentArchitecture, PromptEngineering, Memory, Plugins, Security, Salvage]
    related_skills: []
---

# Hermes Agent Reverse Engineering

## Overview

`NousResearch/hermes-agent` is an MIT-licensed, production-grade AI agent — roughly 11,300 files, with individual modules over 1 MB. It is one of the few open agent codebases where the hard problems have actually been solved and the reasoning is written down in the source comments: prompt-cache stability, durable memory that doesn't invalidate the cache, autonomous self-modification with safety invariants, prompt-injection defense that doesn't false-positive on ordinary instruction files, and multi-tenant secret isolation that fails closed.

**It is a parts bin, not a dependency.** The license permits direct lifting with attribution. The value is in specific, self-contained modules and in the design judgment recorded around them — not in adopting the framework.

The problem is scale. Naively exploring 11,300 files burns an entire context window and finds nothing. This skill exists to skip that: it names the files that matter, in the order worth reading them, and points at a companion document that already reverse-engineers the major subsystems in depth.

**Companion document:** `hermes-reverse-engineering.md` (same folder) — ~11,400 words, 18 sections plus appendices, every claim cited to a file path and usually a line number. **Read the relevant section there before opening source.** It will usually answer the question outright.

**Snapshot:** repo cloned and read 2026-09-03. Desktop app at v0.17.0. Line numbers below are from that snapshot and will drift; the file paths are stable.

## When to Use

- Deciding how to layer a system prompt so provider prefix caching survives across turns
- Building durable agent memory that persists across sessions without busting the prompt cache
- Designing a self-improving loop (agent writes its own skills/memory) with safety rails
- Adding prompt-injection or exfiltration scanning to untrusted content — files, tool results, synced data, scraped pages
- Designing a plugin/extension system: manifests, discovery precedence, hooks, dispatch semantics
- Building a permission or capability model for third-party extensions
- Implementing context compaction and needing real numbers, not guesses
- Isolating secrets per tenant/profile in one process
- Adding an on-device wake word, or ACP/MCP interop in either direction
- Deciding how a desktop shell should host a long-lived local backend process

**Don't use for:**

- Installing, configuring, or operating Hermes as a product → `https://hermes-agent.nousresearch.com/docs`
- Questions the public docs answer — check docs first, they're maintained
- Vendoring the whole framework. That's not what this is for.
- Anything requiring a live repo read when the companion doc already covers it. Read the doc first.

## Quick Reference

Highest value-to-effort salvage targets, ranked:

| # | What | Where | Take it for |
|---|---|---|---|
| 1 | Frozen memory snapshot | `tools/memory_tool.py:159` | Durable writes + stable prompt cache, ~30 lines of state logic |
| 2 | Threat pattern library | `tools/threat_patterns.py` | 289 lines, zero deps past `re`+`unicodedata`, genuinely drop-in |
| 3 | Three-tier prompt assembly | `agent/system_prompt.py:435` | Cache-ordered prompt layering + byte-stability discipline |
| 4 | Index-not-content disclosure | `agent/prompt_builder.py:1856` | The 60-char rule; how 100 skills cost a few thousand tokens |
| 5 | Plugin `ctx` facade + hooks | `hermes_cli/plugins.py:1458` and `:163` | Blueprint for any extension layer |
| 6 | Capability + hashed consent | `hermes_cli/plugin_capabilities.py` | Honest, small, auditable permission model |
| 7 | Curator safety invariants | `agent/curator.py:1-20` | Four lines that make autonomous self-modification safe |
| 8 | Context-local secret scope | `agent/secret_scope.py` | Fail-closed multi-tenant secrets, never touches `os.environ` |
| 9 | Approval hardening | `tools/approval.py` | Frozen-at-import bypass flag; contextvar session identity |
| 10 | ACP permission bridge | `acp_adapter/permissions.py` | Template for an ACP adapter, incl. runtime SDK probing |
| 11 | Terminal backend abstraction | `tools/environments/base.py` | Seven execution targets behind one interface |
| 12 | Lean-tail compaction math | `agent/context_compressor.py:2605` | Real numbers: 2.5% clamped to [10K, 25K] |
| 13 | Skills supply chain | `tools/skills_hub.py` | Quarantine + audit log + lockfile + taps |
| 14 | Desktop→backend process bridge | `apps/desktop/electron/backend-command.ts`, `backend-child.ts` | Electron spawning a local server, and killing it correctly |
| 15 | Wake-word layering | `tools/wake_word.py` + `tools/wakewords/README.md` | ~200 KB per wake word; open-vocabulary option needs no training |

## Getting the Source

```bash
git clone --depth 1 https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
```

Shallow clone is enough. Full history is large and rarely needed — though commit messages and the issue numbers cited throughout the source are unusually good if you're chasing *why* a design exists.

Size traps — do not `cat` these:

```
cli.py               1.0 MB      hermes_state.py     793 KB
run_agent.py         478 KB      hermes_state_search  117 KB
AGENTS.md             95 KB      hermes_state_schema   90 KB
```

Use `sed -n 'START,ENDp'`, `grep -n`, or `head` on anything over ~50 KB.

Useful orientation commands:

```bash
du -sh */ | sort -hr | head -20            # where the mass is
grep -rn "class AIAgent" run_agent.py      # the agent itself
grep -n "^def \|^class " agent/system_prompt.py
sed -n '1,40p' <any-module>                # docstrings carry the rationale
```

## The Four-File Read

If time is short, read these four and stop. Between them they hold most of the transferable judgment in the project.

1. **`tools/threat_patterns.py`** — 289 lines, whole file. The pattern philosophy section explains why patterns anchor on C2-specific vocabulary and never on bossy English ("you must" is ubiquitous in legitimate instruction files). Also the two anti-DoS techniques: `MAX_SCAN_CHARS` and bounded filler `(?:\w+\s+){0,8}` between key tokens.

2. **`agent/system_prompt.py`** — 1,172 lines. Read the module docstring, then `build_system_prompt_parts()` at line 435, then the volatile-tier block around line 905. The comments explain every ordering decision in terms of cache behavior.

3. **`docs/design/multiplexing-gateway.md`** — short. The clearest statement of correct multi-tenant secret isolation, including why the obvious implementation (union all `.env` files into `os.environ`) leaks into every spawned subprocess.

4. **`agent/curator.py`, docstring only (lines 1–20)** — four invariants that make an agent modifying its own capabilities safe: agent-created content only, never delete (archive is recoverable), pinned bypasses everything, auxiliary client only.

## Subsystem Map

Where each concern lives. **Full treatment for each is in the companion doc — the section numbers below refer to it.**

| Concern | Start here | Companion §|
|---|---|---|
| Stack / why Python under Electron | `apps/desktop/electron/backend-command.ts` | §1 |
| Entry points, agent construction | `run_agent.py:467`, `agent/agent_init.py:536` | §2 |
| Prompt layering and cache order | `agent/system_prompt.py:435` | §3 |
| Progressive disclosure / skill index | `agent/prompt_builder.py:1856` | §4 |
| Context compaction | `agent/context_compressor.py` | §5 |
| Memory + self-learning (4 mechanisms) | `tools/memory_tool.py`, `agent/background_review.py:465`, `agent/curator.py` | §6 |
| Prompt-injection scanning | `tools/threat_patterns.py` | §7 |
| Plugin system | `hermes_cli/plugins.py:163`, `:1458` | §8 |
| Permissions (3 layers) | `toolsets.py`, `tools/approval.py`, `hermes_cli/plugin_capabilities.py` | §9 |
| Multi-tenant isolation | `agent/secret_scope.py` | §10 |
| Wake word | `tools/wake_word.py` | §11 |
| ACP interop | `acp_adapter/` | §12 |
| MCP, both directions | `mcp_serve.py`, `tools/mcp_tool.py` | §13 |
| Skill distribution / supply chain | `tools/skills_hub.py` | §14 |
| Execution backends | `tools/environments/` | §15 |
| Porting the plugin model | — | §16 |
| Ranked salvage list | — | §17 |
| Glossary of internal terms | — | §18 |
| File map by concern | — | Appendix A |

## Extraction Playbook

When lifting a subsystem:

1. **Read the companion doc section first.** It usually answers the question without a repo read.
2. **Read the target module's docstring.** This codebase puts design rationale in docstrings and comments, not in separate docs. The *why* is almost always inline.
3. **Grep for the issue numbers.** Comments cite issues like `#64714`, `#95681`. They mark places where a naive implementation already failed in production. Those comments are the most valuable text in the repo.
4. **Check the sibling guards.** Security-relevant modules travel in groups — `threat_patterns.py` has `skills_guard.py`, `plugin_guard.py`, `self_repo_guard.py`, `path_security.py`, `url_safety.py` around it. Lifting one without the others may leave a gap.
5. **Check the tests.** `tests/` mirrors the source tree and is 45 MB. A test file is often the fastest spec for a module's contract.
6. **Keep the comments when you copy.** They explain constraints that aren't obvious from the code, and they're the attribution.
7. **Attribute.** MIT requires the license and copyright notice to travel with substantial portions.

## Areas the Companion Doc Does Not Yet Cover

Pointers only. Open these when a question lands in their territory.

**`AGENTS.md` (95 KB, repo root)** — the maintainer instruction file for agents working *on* this repo. Likely the densest source of design rationale in the project: skill-authoring standards, review criteria, house style, hard rules. Read in slices, not whole. Probably the highest-value unread file.

**`hermes_state.py` (793 KB) + siblings** — `hermes_state_schema.py`, `_search.py`, `_common.py`, `_registry.py`, `_portability.py`, `_holders.py`. The full session/persistence layer over SQLite. Go here for the session DB schema, message storage, FTS5 indexing, and state portability between machines. `hermes_state_search.py` is the one to read for search architecture.

**`cli.py` (1.0 MB)** — a large CLI surface distinct from the `hermes_cli/` package. Relationship between the two is unclear from a skim; check before assuming either is authoritative.

**`agent/verify/` + `agent/verify_hooks.py` + `verification_evidence.py` + `verification_stop.py`** — the evidence-based verification loop: how the agent decides it's actually done rather than claiming it is. Directly relevant to any agent that edits code. Pairs with the `pre_verify` plugin hook.

**`agent/monitoring/` + `gateway/` observability + `docs/observability/`** — metrics, relay-shared metrics, monitoring design.

**`agent/lsp/`** — language-server integration. Read if you want real symbol resolution rather than grep-based code navigation.

**Kanban subsystem** — `hermes_cli/kanban_db.py`, `tools/kanban_tools.py`, `gateway/kanban_watchers.py`, `docs/hermes-kanban-v1-spec.pdf`, `docs/kanban/multi-gateway.md`. A task board where a dispatcher spawns isolated worker subprocesses per task, with heartbeats, stale-claim reclaim, structured handoffs, and blocking on genuine ambiguity. This is a complete multi-agent work-distribution design and it is worth a dedicated pass if you're orchestrating parallel agents.

**Hosted rooms** — `gateway/hosted_room*.py` (8 modules). Multi-agent shared rooms with execution policy, peers, replicas, and policy checkpoints.

**`docs/rfcs/2026-07-plugin-architecture-lessons-pi-opencode.md`** — a post-mortem on plugin architecture lessons. Read before designing your own extension layer; it likely documents what they'd do differently.

**`docs/rfcs/plugin-config-state-bridge.md`, `docs/ADR.md`, `docs/middleware/README.md`, `docs/relay-connector-contract.md`, `docs/session-lifecycle.md`, `docs/profile-routing.md`, `docs/micro-compaction.md`, `docs/streaming-tts.md`, `docs/state-db-recovery.md`** — small, targeted design docs. Cheap to read, high signal.

**`evals/`, `batch_runner.py`, `mini_swe_runner.py`, `trajectory_compressor.py`, `datagen-config-examples/`** — the research side: batch trajectory generation and compression for training tool-calling models. Relevant only if you're generating training data.

**`native/fts5_cjk/fts5_cjk.c`** — hand-written SQLite extension for CJK tokenization in full-text search. Small and self-contained; useful if you need multilingual FTS.

**`agent/moa_loop.py`, `moa_trace.py`** — Mixture of Agents: multiple models composed behind a single client facade.

**`.env.example` (26 KB) and `cli-config.yaml.example` (113 KB)** — the complete configuration surface, annotated. Faster than reading config parsers when you want to know what's tunable.

## Common Pitfalls

1. **Reading source before reading the companion doc.** The doc is cited to line numbers and answers most questions directly. Opening `run_agent.py` first burns context for nothing. → Check the subsystem map above, read that section, then open source only if the answer isn't there.

2. **`cat` on a multi-hundred-KB file.** `cli.py` alone will end the session. → Always `grep -n` to locate, then `sed -n 'START,ENDp'` to read a window.

3. **Trusting line numbers.** They're from the 2026-09-03 snapshot and drift with every commit. → Grep for the symbol name or a distinctive comment phrase instead of seeking to a line.

4. **Copying code without the comments.** The comments encode production failures — why a value is frozen at import, why a regex is bounded, why an ordering exists. Stripped code silently loses the constraint. → Keep them; they're also the attribution.

5. **Lifting one guard from a guard family.** `threat_patterns.py` is shared by three scanners and sits beside five sibling guards. Taking the pattern library without a call site that actually blocks writes gives you detection with no enforcement. → Check what calls it before assuming coverage.

6. **Assuming the capability model is a sandbox.** The source states plainly that it is not: in-process plugins are trusted code that can import anything and monkey-patch core. Capabilities gate the *host API surface* and provide consent and audit. → If you need real isolation, that's a separate problem; don't inherit a false sense of security.

7. **Porting the plugin system with a leaky context object.** The whole capability model works only because `ctx` is the complete API surface. If extensions can reach around it to globals or internals, the gates are decoration. → One facade, nothing else exposed.

8. **Adopting the framework instead of the parts.** This is a large opinionated system with its own config, state DB, profile model, and process supervision. Vendoring it wholesale imports all of that. → Take modules and ideas.

9. **Ignoring the MIT obligation.** Substantial portions require the license and copyright notice to travel with them. → Include them.

10. **Treating the 60-char description cap as cosmetic.** It exists because that text loads into every session's prompt and is truncated at render. Over-length descriptions are silently cut and never route. → Any index-style disclosure system needs its own hard cap, enforced at write time.

## Verification Checklist

Before considering an extraction complete:

- [ ] Read the relevant companion-doc section before opening source
- [ ] Located the symbol by grep, not by a possibly-drifted line number
- [ ] Read the target module's docstring for stated invariants and constraints
- [ ] Checked for sibling guards / companion modules that travel with it
- [ ] Checked `tests/` for the module's contract
- [ ] Preserved explanatory comments, especially any citing issue numbers
- [ ] Confirmed whether the piece assumes Hermes-specific infrastructure (`get_hermes_home()`, `cfg_get()`, the state DB, contextvar scopes) and stubbed or replaced those
- [ ] Verified any security-relevant piece has a real enforcement call site, not just detection
- [ ] MIT license and copyright notice carried with substantial portions
- [ ] Noted the snapshot date, so a future reader knows how stale the reference is
