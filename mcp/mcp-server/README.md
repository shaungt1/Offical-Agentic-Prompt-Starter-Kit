---
name: portable-agent-control-framework-mcp
description: "Local MCP server for installing, updating, wiring, inspecting, and migration-planning the Portable Agent Control Framework."
version: 0.4.0
status: active
---

# MCP SERVER

This folder contains a **local stdio Model Context Protocol server** that lets an MCP-capable AI agent work with the framework as an explicit tool instead of relying only on shell commands.

The server is intentionally local and filesystem-oriented.

## TOOLS

| Tool | Purpose | Destructive? |
|---|---|---|
| `framework_inspect` | Validate a framework root and show required-file status | No |
| `framework_install_or_update` | Install/copy a local or Git-hosted framework without nested `.git`; backs up existing destination | Replaces managed destination after backup |
| `framework_wire_agent` | Add the small framework pointer to an agent-control file | Appends only |
| `framework_write_migration_plan` | Inventory existing agent-control files and generate `MIGRATION-PLAN.MD` | No source files moved/deleted |

The migration tool deliberately writes a **plan**, not an automatic bulk migration. Semantic migration still follows:

```text
../../MIGRATION.INSTRUCTIONS.MD
```

## REQUIREMENTS

- Node.js 20+
- npm
- Git CLI only when installing directly from a Git URL

The server uses the current split MCP TypeScript/JavaScript server SDK package:

```text
@modelcontextprotocol/server
```

## INSTALL

```bash
cd mcp/mcp-server
npm install
```

## RUN

```bash
npm start
```

Because this is a stdio server, it waits for an MCP client on stdin/stdout.

Do not add application logs to stdout. The server writes its startup message to stderr.

## TEST WITH MCP INSPECTOR

```bash
npm run inspect
```

or:

```bash
npx @modelcontextprotocol/inspector node src/index.mjs
```

## VS CODE WORKSPACE CONFIGURATION

VS Code supports workspace MCP configuration in `.vscode/mcp.json`.

If this framework is installed under `.agent-framework`:

```json
{
  "servers": {
    "agent-control-framework": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/.agent-framework/mcp/mcp-server/src/index.mjs"
      ],
      "env": {
        "AGENT_FRAMEWORK_HOME": "${workspaceFolder}/.agent-framework"
      }
    }
  }
}
```

If using Admin Local:

```json
{
  "servers": {
    "agent-control-framework": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/.admin-local/shared_toolbox/agent-control-framework/mcp/mcp-server/src/index.mjs"
      ],
      "env": {
        "AGENT_FRAMEWORK_HOME": "${workspaceFolder}/.admin-local/shared_toolbox/agent-control-framework"
      }
    }
  }
}
```

VS Code also supports portable/user MCP configuration outside `.vscode/mcp.json`. Use the location appropriate to your host.

## AGENT USAGE EXAMPLE

After the MCP server is enabled:

```text
Inspect the agent framework installation.

Then create a migration plan for this repository.

Do not move any existing files yet.
```

The agent should call:

```text
framework_inspect
framework_write_migration_plan
```

After review:

```text
Install the framework into .agent-framework and wire AGENTS.md.
```

The agent can call:

```text
framework_install_or_update
framework_wire_agent
```

## UPDATE MODEL

`framework_install_or_update` treats the framework directory as a managed upstream copy.

If the destination already exists, it is renamed to a timestamped backup before the new copy is written.

This is why project-specific changes should generally live outside the managed upstream folder or be tracked as deliberate overlays.

## SECURITY

Local MCP servers can execute code and modify files.

Review this server before trusting it.

The server:

- does not store credentials;
- does not transmit project data to an external service;
- does not delete migration source files;
- prevents the install destination from escaping the declared project root;
- filters `.git/` and `node_modules/` from framework copies;
- defaults install/update to `dryRun: true`;
- backs up an existing managed destination before replacement.

Git-clone installation contacts the Git URL explicitly supplied by the user/agent.
