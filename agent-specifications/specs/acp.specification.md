---
name: acp-specification
description: "Defines ACP integration contracts while requiring the exact ACP protocol and version to be named."
version: 0.1.0
author: Shaun Pritchard
license: "Project-specific"
platforms: [linux, macos, windows]
metadata:
  specification:
    artifact: "ACP.md + protocol runtime files"
    category: integration
    status: draft
    normative: true
    tags: [acp, protocol, agents, interop]
    related_specifications: [agent-specification, tool-specification, vendor-formats-specification]
---

# ACP Specification

## Purpose

`ACP` is used by more than one agent protocol/ecosystem. This specification therefore **does not assume a single ACP meaning**. Any artifact built from it MUST declare the protocol's full name, owner/specification URL, version, transport, and compatibility target before implementation begins.

## Frontmatter Template

```yaml
---
name: <acp-integration-name>
description: "ACP integration between <client> and <agent/service>."
version: 0.1.0
author: <author>
license: <project-license>
protocol: "<full ACP protocol name>"
protocol-owner: <organization-or-project>
protocol-version: <version>
specification: <canonical-spec-url>
transport: <protocol-defined-transport>
platforms: [linux, macos, windows]
metadata:
  tags: [acp, agents, interoperability]
  status: draft
---
```

## Required Sections

| Section | Purpose |
|---|---|
| `Protocol Identity` | Full name, owner, version, canonical spec, and why it is the requested ACP. |
| `Roles` | Client, agent, server, peer, or other roles defined by that ACP. |
| `Transport and Session` | Connection, lifecycle, message/session identity, cancellation, reconnect behavior. |
| `Messages / Methods` | Supported operations and schemas. |
| `Capabilities` | Negotiation/discovery and feature compatibility. |
| `Authentication and Trust` | Identity, authorization, secret handling, and trust boundaries. |
| `Errors and Recovery` | Error model, retries, timeouts, resumability. |
| `Testing` | Conformance and interoperability cases. |
| `Verification` | Successful handshake plus representative end-to-end exchange. |

### Authority and Access

Executable or action-producing artifacts SHOULD declare authority when the runtime supports it. Use the smallest level that works:

| Level | Meaning |
|---|---|
| `read-only` | Inspect context, files, search results, or APIs without mutation. |
| `standard` | Normal project writes and approved tool calls; no administrator elevation. |
| `elevated` | Broader filesystem, shell, browser, or account actions that require explicit authorization. |
| `administrative` | Administrator/root/owner-level changes. Never infer this level; require explicit configuration and confirmation policy. |

External writes, purchases, account changes, messages, form submissions, credential creation, and destructive actions MUST state whether confirmation is required before execution.

## Caveat

Never generate code from the acronym alone. Resolve the exact ACP specification first; otherwise an agent can build a valid implementation of the wrong protocol.

## Verification Checklist

- [ ] Filename and placement match this specification or an explicitly documented vendor transformation.
- [ ] Required frontmatter is present and valid YAML.
- [ ] Required sections contain concrete, non-placeholder content before the artifact is considered complete.
- [ ] Every referenced file, skill, tool, agent, model, or endpoint resolves.
- [ ] Permissions and side effects are no broader than necessary.
- [ ] Inputs, outputs, failure behavior, and completion criteria are testable where applicable.
- [ ] Vendor-specific deviations are documented rather than silently changing the universal contract.
