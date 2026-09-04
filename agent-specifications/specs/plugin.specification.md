---
name: plugin-specification
description: "Defines packaged agent/runtime plugins and their included resources."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "PLUGIN.md + vendor manifest"
    category: integration
    status: draft
    normative: true
    tags: [plugin, packaging, extensions]
    related_specifications: [manifest-specification, mcp-specification, skill-specification, tool-specification]
---

# PLUGIN.md + vendor manifest Specification

## Purpose

A plugin packages one or more agent-system components—tools, skills, prompts, hooks, MCP servers, references, configuration, or UI/runtime code—behind a coherent installation and lifecycle boundary.

## When to Create

Create a plugin when components must be installed, versioned, configured, enabled/disabled, or distributed together. Do not use a plugin merely as a folder around one Markdown instruction when a skill or prompt is sufficient.

## Naming and Placement

House contract: `PLUGIN.md` at the plugin root plus the vendor-required manifest/configuration. Vendor manifests remain implementation files and should link back to the plugin contract.

## Frontmatter Template

```yaml
---
name: <plugin-name>
description: "Packaged extension that adds <capabilities>."
version: 0.1.0
author: <author>
license: <project-license>
platforms: [linux, macos, windows]
entrypoint: <optional-runtime-entrypoint>
permissions:
  network: restricted
  external-writes: confirm
metadata:
  tags: [plugin, <domain>]
  includes: [skills, tools, hooks, references]
---
```

### Frontmatter Properties

| Property | Requirement | Meaning |
|---|---|---|
| `name` | REQUIRED | Plugin package identifier. |
| `description` | REQUIRED | What the package adds and when it is useful. |
| `version` | REQUIRED | Release version. |
| `author` | REQUIRED | Maintainer. |
| `license` | REQUIRED | Distribution license. |
| `platforms` | RECOMMENDED | Actual supported platforms. |
| `entrypoint` | OPTIONAL | Runtime entrypoint if the plugin executes code. |
| `permissions` | REQUIRED when active | Aggregate authority; component-specific permissions may be narrower. |
| `metadata.includes` | RECOMMENDED | Kinds of resources included. |

## Required Body Structure

| Section | Purpose |
|---|---|
| `Overview` | Package purpose and boundaries. |
| `Contents` | Table of bundled components and paths. |
| `Installation` | Install/enable procedure and prerequisites. |
| `Configuration` | Non-secret settings and secret names. |
| `Permissions` | Aggregate and component-specific access. |
| `Lifecycle` | Startup/shutdown/update/uninstall behavior. |
| `Compatibility` | Hosts/vendors/versions. |
| `Verification` | How installation and representative capability are proven. |

## Optional Sections

| Section | Use when |
|---|---|
| `Migration` | Use across breaking versions. |
| `Security` | Required for network, credentials, external writes, or code execution. |
| `Troubleshooting` | Use for common install/runtime failures. |

## Construction Rules

- Use clear Markdown headings, tables for schemas or registries, and numbered steps only when order matters.
- Write direct instructions that change agent behavior. Replace vague advice such as “use best practices” with an observable rule or completion criterion.
- Keep portable semantics in the main document. Put vendor-only fields or paths behind an explicit vendor note or adapter.
- Use repository-relative links. Do not hard-code a developer's machine path into a committed artifact.
- Declare dependencies, tools, network access, secrets, external writes, and destructive side effects instead of assuming them.
- Prefer least privilege. Read-only is the default when a task can succeed without write, shell, browser-transaction, administrator, or destructive access.
- Separate required sections from optional sections. Do not create empty headings merely to satisfy a template.
- If a vendor runtime does not recognize a house field, retain the semantic value in `metadata` or translate it in the vendor-specific form.

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Relationships and Transformations

| Related artifact | Rule |
|---|---|
| manifest | Vendor manifest describes package metadata in machine-readable form. |
| mcp | A plugin may bundle/register an MCP server. |
| skill/tool | Plugin components retain their own contracts. |





## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
