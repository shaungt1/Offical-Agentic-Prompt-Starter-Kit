---
name: vendor-formats-specification
description: "Maps universal artifacts to vendor-native filenames, locations, frontmatter, and runtime behavior."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "vendor-formats.specification.md"
    category: vendor
    status: draft
    normative: true
    tags: [vendors, compatibility, translation, paths]
    related_specifications: [agent-specification, skill-specification, prompt-specification, instructions-specification]
---

# Vendor Formats Specification

## Purpose

This file is the translation layer between the universal specifications and vendor-native conventions. Vendor formats change frequently; the universal semantic artifact remains the source of truth. Before publishing a vendor-specific file, verify current official documentation for the target runtime.

## Location Strategy

| Environment | Native or recommended control area | What to do with this Specs library |
|---|---|---|
| Admin Local | `.admin-local/` | Preferred private portable briefcase: `.admin-local/Agents/Specs/`. Note that Admin Local excludes the directory from Git. |
| Shared vendor-neutral repo | `AGENTS.md`, `Specs/` or `.agents/` | Commit `Specs/` (or `.agents/Specs/`) and point `AGENTS.md` to it. |
| GitHub Copilot / VS Code | `.github/` | Keep shared Specs at `.github/Specs/` if desired; native artifacts use `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/`, etc. |
| Claude Code | `.claude/` plus `CLAUDE.md` | Specs may live at `.claude/Specs/`; translate applicable rules/skills to Claude-native locations. |
| Other vendor | Vendor config root or repository `Specs/` | Prefer repository `Specs/` when no stable native spec-library directory exists. |

Admin Local: https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local

## Common Artifact Mapping

| Universal semantic artifact | Common vendor form(s) | Transformation notes |
|---|---|---|
| Repository agent instructions | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `QWEN.md`, `.hermes.md`/`HERMES.md`, `replit.md` | Preserve architecture, commands, constraints, and precedence; vendor names/auto-load behavior differ. |
| Agent override | `AGENTS.override.md` where supported; local/vendor override mechanisms elsewhere | Override stays a variant of the agent specification. State parent and precedence. |
| Custom agent | `.github/agents/<name>.agent.md` (Copilot) and vendor agent directories | Translate tool aliases, model fields, handoffs, user-invocable flags, and delegation syntax. |
| Skill | `<skill>/SKILL.md` | Agent Skills portable core is strongest common denominator. Vendors add metadata/tool gating. |
| Instructions | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, `.claude/rules/*.md`, etc. | Translate scope (`applyTo`, globs, path rules) and precedence. |
| Rule | `.claude/rules/*.md`, `.cursor/rules/*.mdc`, scoped instruction files | Preserve rule semantics; activation metadata differs. |
| Prompt | `.github/prompts/*.prompt.md` and vendor prompt/command systems | Translate variables, agent/model/tool fields, invocation behavior. |
| Command | `commands/<name>.md` or vendor slash-command directory | Filename/invocation and argument syntax vary. |
| Workflow | `.windsurf/workflows/*.md` or vendor automation/workflow system | Keep universal workflow state, branches, gates, outputs, and verification. |
| Plan | `PLAN.md`, `PLANS.md`, vendor task/plan files | Preserve progress, decisions, validation, and resume state. |
| Identity / soul / memory family | `IDENTITY.md`, `SOUL.md`, `USER.md`, `MEMORY.md`, vendor memory systems | Only use filenames natively recognized by that runtime when current documentation confirms support. |
| Hook | `hooks.json` / vendor lifecycle hook config | Translate event names, payload schema, blocking/failure policy, and command syntax. |
| MCP | `.vscode/mcp.json`, vendor MCP config, runtime config | Preserve server name, transport, startup/auth, tools/resources/prompts. Path/schema is vendor-specific. |

## Vendor Profiles

### GitHub Copilot / VS Code

Common forms include `.github/agents/*.agent.md`, `.github/prompts/*.prompt.md`, `.github/instructions/*.instructions.md`, `.github/copilot-instructions.md`, and `.github/skills/<skill>/SKILL.md`. Use vendor-supported frontmatter for fields such as `description`, `name`, `tools`, `model`, `target`, `handoffs`, `agent`, and `argument-hint`. Keep unsupported house metadata in a linked manifest/reference or under metadata only when the runtime safely ignores it.

### Claude Code

Use `CLAUDE.md` for persistent project context, `.claude/rules/*.md` for modular/scoped rules, and `.claude/skills/<skill>/SKILL.md` when using Agent Skills-compatible skills. Keep the universal specification as the authoring source and translate only the loading/scoping syntax.

### Hermes Agent

Hermes supports rich `SKILL.md` metadata and project context files. Its authoring conventions are a useful reference for version/author/license/platform/tags/relationships, but repository-specific validators, scripts, and tool names are **not universal** and must not be copied into unrelated projects.

### OpenClaw-style Workspaces

Workspace files may include `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, memory files, bootstrap/boot files, and other runtime-specific controls. Verify current runtime support before assuming a historical filename is still loaded automatically; the universal specs remain valid even when the vendor implements the concept through a different mechanism.

### Cursor / Windsurf / Gemini / Qwen / Replit / Other Agents

Map their root context/rule/workflow files to the matching universal specification. Keep legacy files such as `.cursorrules` or `.windsurfrules` only for compatibility when the target runtime still supports them; prefer the vendor's current modular mechanism.

## Transformation Rules

1. **Never change semantics silently.** If a vendor cannot represent a field, record where that information moves or state that the feature is unsupported.
2. **Do not broaden permissions during translation.** A missing vendor permission field does not imply unrestricted access.
3. **Keep identifiers stable** across universal and vendor forms when possible.
4. **Preserve links** from capability → skill set → skill and agent/workflow → tool/model dependencies.
5. **Verify current docs** before relying on a vendor-specific filename, path, field, or runtime feature.

## Reference Sources

- Agent Skills: https://agentskills.io/specification
- Hermes skill authoring: https://github.com/NousResearch/hermes-agent/blob/main/skills/software-development/hermes-agent-skill-authoring/SKILL.md
- Awesome Copilot agents: https://github.com/github/awesome-copilot/blob/main/instructions/agents.instructions.md
- Awesome Copilot prompts: https://github.com/github/awesome-copilot/blob/main/instructions/prompt.instructions.md
- Awesome Copilot skills: https://github.com/github/awesome-copilot/blob/main/instructions/agent-skills.instructions.md
- VS Code agent customization: https://code.visualstudio.com/docs/agent-customization/overview
- Admin Local: https://marketplace.visualstudio.com/items?itemName=shaun-pritchard.admin-local

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
