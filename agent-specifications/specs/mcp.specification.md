---
name: mcp-specification
description: "Defines Model Context Protocol integration packages, servers, tools, resources, prompts, auth, and validation."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "MCP.md + runtime MCP configuration"
    category: integration
    status: draft
    normative: true
    tags: [mcp, tools, resources, prompts, protocol]
    related_specifications: [tool-specification, plugin-specification, agent-specification, vendor-formats-specification]
---

# MCP Specification

## Purpose

Use this specification when an agent is asked to design or implement a Model Context Protocol (MCP) server/client integration. `MCP.md` is the human/agent construction contract; the implementation must also produce the vendor/runtime configuration files required by the chosen MCP host.

## Frontmatter Template

```yaml
---
name: <mcp-package-name>
description: "MCP integration exposing <domain/capabilities>."
version: 0.1.0
author: <author>
license: <project-license>
protocol: mcp
protocol-version: <target-version-or-negotiated>
transport: <stdio|streamable-http|vendor-supported>
language: <typescript|python|java|other>
platforms: [linux, macos, windows]
permissions:
  filesystem: <none|read-only|read-write>
  network: <none|restricted|full>
  shell: <none|restricted|full>
  external-writes: <blocked|confirm|allowed>
metadata:
  tags: [mcp, <domain>]
  status: draft
---
```

## Required Sections

| Section | Required content |
|---|---|
| `Scope` | Server/client purpose, host(s), protocol target, and non-goals. |
| `Transport` | stdio/HTTP transport, process lifecycle, ports/URLs if applicable. |
| `Capabilities` | Which MCP primitives are exposed: tools, resources, prompts, sampling/other supported features. |
| `Tool Contracts` | Each tool's schema, side effects, permissions, and error behavior; link `TOOL.md` when complex. |
| `Resources` | URI patterns, data sensitivity, freshness, pagination, and read semantics. |
| `Prompts` | Prompt names/arguments and what context they assemble, if prompts are exposed. |
| `Authentication` | Credential source, secret handling, OAuth/token/service-account flow where applicable. |
| `Configuration` | Environment variables, config files, startup command, host registration. |
| `Security` | Trust boundaries, validation, least privilege, network policy, prompt-injection/data handling. |
| `Testing` | Schema tests, protocol handshake, success/failure cases, read-back for mutations. |
| `Verification` | Exact evidence that the host can discover and successfully call the server. |

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Implementation Rules

1. Choose the official or maintained SDK for the implementation language when one exists; pin or document the tested version.
2. Keep protocol transport separate from domain logic so tools can be tested without an MCP host.
3. Validate every external input before performing filesystem, shell, database, browser, or account mutations.
4. Return structured, actionable errors. Do not hide authentication, permission, or schema failures behind generic exceptions.
5. For network-accessing tools, state allowed hosts/domains or why unrestricted egress is required.
6. For write tools, define confirmation/idempotency/read-back behavior before implementation.
7. Produce host-specific configuration only after the universal server contract is defined.

## Output Package

A complete MCP deliverable SHOULD include source code, dependency manifest, MCP host configuration example, `.env.example` containing names only (never secrets), tests, and `MCP.md` or equivalent README documenting the contract.

See `mcp/mcp-server/` in this repository for a working reference implementation of this specification (a local stdio server exposing `framework_inspect`, `framework_install_or_update`, `framework_wire_agent`, and `framework_write_migration_plan`).

## Framework Note

LangChain, LlamaIndex, agent SDKs, or model providers MAY be used inside the implementation when they add real value, but MCP does not require them. Do not make a framework dependency part of the protocol unless the requested server actually needs it.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
