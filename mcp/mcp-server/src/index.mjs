import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const SERVER_NAME = 'portable-agent-control-framework';
const SERVER_VERSION = '0.4.0';
const POINTER_BEGIN = '<!-- BEGIN PORTABLE AGENT CONTROL FRAMEWORK -->';
const POINTER_END = '<!-- END PORTABLE AGENT CONTROL FRAMEWORK -->';

function textResult(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: 'text', text }] };
}

function resolveUnder(projectRoot, relativePath) {
  const project = path.resolve(projectRoot);
  const candidate = path.resolve(project, relativePath);
  const rel = path.relative(project, candidate);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Destination must remain under the project root: ${relativePath}`);
  }
  return candidate;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyFramework(sourceRoot, destinationRoot) {
  const source = path.resolve(sourceRoot);
  const destination = path.resolve(destinationRoot);

  await fs.cp(source, destination, {
    recursive: true,
    force: true,
    filter: (src) => {
      const rel = path.relative(source, src);
      if (!rel) return true;
      const parts = rel.split(path.sep);
      if (parts.includes('.git')) return false;
      if (parts.includes('node_modules')) return false;
      if (parts.includes('.admin-local')) return false;
      if (parts.includes('.DS_Store')) return false;
      if (rel.endsWith('.zip')) return false;
      return true;
    }
  });
}

async function runGitClone(url, destination) {
  await new Promise((resolve, reject) => {
    const child = spawn('git', ['clone', '--depth', '1', url, destination], {
      stdio: ['ignore', 'ignore', 'pipe']
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git clone failed (${code}): ${stderr.trim()}`));
    });
  });
}

function looksLikeGitUrl(value) {
  return /^(https?:\/\/|git@|ssh:\/\/|git:\/\/)/.test(value);
}

async function stageSource(source) {
  if (!source) {
    const envRoot = process.env.AGENT_FRAMEWORK_HOME;
    if (!envRoot) throw new Error('source is required unless AGENT_FRAMEWORK_HOME is set.');
    return { root: path.resolve(envRoot), cleanup: async () => {} };
  }

  if (!looksLikeGitUrl(source)) {
    const local = path.resolve(source);
    if (!(await exists(local))) throw new Error(`Source path does not exist: ${local}`);
    return { root: local, cleanup: async () => {} };
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-framework-mcp-'));
  const repo = path.join(tmp, 'repo');
  await runGitClone(source, repo);
  return {
    root: repo,
    cleanup: async () => fs.rm(tmp, { recursive: true, force: true })
  };
}

function controlFileFor(vendor) {
  switch (vendor) {
    case 'agents':
    case 'cursor':
      return 'AGENTS.md';
    case 'copilot':
      return '.github/copilot-instructions.md';
    case 'claude':
      return 'CLAUDE.md';
    case 'qwen':
      return 'QWEN.md';
    case 'gemini':
      return 'GEMINI.md';
    default:
      throw new Error(`Unsupported wire target: ${vendor}`);
  }
}

async function wirePointer(projectRoot, frameworkPath, vendor, explicitControlFile) {
  const controlRelative = explicitControlFile || controlFileFor(vendor);
  const controlPath = resolveUnder(projectRoot, controlRelative);
  await fs.mkdir(path.dirname(controlPath), { recursive: true });

  const current = (await exists(controlPath)) ? await fs.readFile(controlPath, 'utf8') : '';
  if (current.includes(POINTER_BEGIN)) {
    return { controlFile: controlPath, changed: false, reason: 'pointer already present' };
  }

  const block = `

${POINTER_BEGIN}

## Shared Agent Control Framework

Framework root: \`${frameworkPath}\`

When creating, modifying, discovering, or validating an agent-control artifact:

1. Read \`${frameworkPath}/README.md\` when repository-level routing is needed.
2. Read the applicable root manifest before creating a duplicate.
3. Follow the corresponding specification under \`${frameworkPath}/agent-specifications/specs/\`.
4. Load only the documents relevant to the current task.
5. Preserve vendor-native entry files when the runtime requires them.
6. For existing customizations, follow \`${frameworkPath}/MIGRATION.INSTRUCTIONS.md\`.

${POINTER_END}
`;

  await fs.writeFile(controlPath, current + block, 'utf8');
  return { controlFile: controlPath, changed: true };
}

const MCP_SERVER_ENTRY_NAME = 'agent-control-framework';

async function writeMcpConfig(projectRoot, destination, target) {
  const serverJsPath = `${destination}/mcp/mcp-server/src/index.mjs`;
  const targets = target === 'both' ? ['claude', 'vscode'] : [target];
  const results = [];

  for (const t of targets) {
    const controlRelative = t === 'claude' ? '.mcp.json' : '.vscode/mcp.json';
    const controlPath = resolveUnder(projectRoot, controlRelative);
    const body = t === 'claude'
      ? {
          mcpServers: {
            [MCP_SERVER_ENTRY_NAME]: {
              command: 'node',
              args: [serverJsPath],
              env: { AGENT_FRAMEWORK_HOME: destination }
            }
          }
        }
      : {
          servers: {
            [MCP_SERVER_ENTRY_NAME]: {
              type: 'stdio',
              command: 'node',
              args: [`\${workspaceFolder}/${serverJsPath}`],
              env: { AGENT_FRAMEWORK_HOME: `\${workspaceFolder}/${destination}` }
            }
          }
        };

    if (await exists(controlPath)) {
      const current = await fs.readFile(controlPath, 'utf8');
      if (current.includes(MCP_SERVER_ENTRY_NAME)) {
        results.push({ controlFile: controlPath, changed: false, reason: 'already references agent-control-framework' });
        continue;
      }
      results.push({
        controlFile: controlPath,
        changed: false,
        reason: 'file already exists with unrelated content; add this block by hand instead of overwriting it',
        suggestedBlock: body
      });
      continue;
    }

    await fs.mkdir(path.dirname(controlPath), { recursive: true });
    await fs.writeFile(controlPath, JSON.stringify(body, null, 2) + '\n', 'utf8');
    results.push({ controlFile: controlPath, changed: true });
  }

  return results;
}

async function frameworkSummary(frameworkRoot) {
  const root = path.resolve(frameworkRoot);
  const expected = [
    'README.md',
    'agent-specifications/specs',
    'skills/SKILLS.md',
    'rules/RULES.md',
    'modes/MODES.md',
    'instructions/INSTRUCTIONS.md',
    'task/TASKS.md',
    'agents/AGENTS.md',
    'tools/TOOLS.md',
    'memory/MEMORY.md',
    'emulation/EMULATION.MANIFEST.md',
    'telemetry/HEARTBEAT.md',
    'state/AURA.STATE.md'
  ];

  const checks = [];
  for (const rel of expected) {
    checks.push({ path: rel, exists: await exists(path.join(root, rel)) });
  }

  return {
    frameworkRoot: root,
    valid: checks.every((x) => x.exists),
    checks
  };
}

async function walkFiles(root, maxDepth = 5) {
  const out = [];
  async function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.agent-framework') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full, depth + 1);
      else out.push(full);
    }
  }
  await walk(root, 0);
  return out;
}

function classifyArtifact(rel) {
  const norm = rel.replaceAll('\\', '/');
  const base = path.basename(norm);

  if (/\/SKILL\.md$/i.test('/' + norm)) return { type: 'Skill', canonical: 'skills/<skill-name>/SKILL.md', action: 'REVIEW/COPY' };
  if (/\.instructions\.md$/i.test(base) || norm.startsWith('.claude/rules/') || norm.startsWith('.cursor/rules/')) {
    return { type: 'Instruction/Rule', canonical: 'instructions/ or rules/', action: 'CLASSIFY' };
  }
  if (/\.prompt\.md$/i.test(base) || norm.startsWith('.github/prompts/')) {
    return { type: 'Prompt', canonical: 'prompt_engineering/', action: 'REVIEW/COPY' };
  }
  if (/^(AGENTS(\.override)?\.md|CLAUDE(\.local)?\.md|QWEN\.md|GEMINI\.md|replit\.md)$/i.test(base) ||
      norm === '.github/copilot-instructions.md') {
    return { type: 'Vendor Entry File', canonical: 'KEEP IN PLACE + POINTER', action: 'KEEP/ADAPT' };
  }
  if (norm.startsWith('_tasks/') || norm.startsWith('task/') || norm.startsWith('docs/tasks/')) {
    return { type: 'Task', canonical: 'task/', action: 'REVIEW/COPY' };
  }
  if (norm.startsWith('workflows/')) return { type: 'Workflow', canonical: 'workflows/', action: 'REVIEW' };
  if (norm.includes('mcp.json')) return { type: 'MCP Configuration', canonical: 'KEEP NATIVE / tools references', action: 'KEEP/REGISTER' };
  if (norm.startsWith('rules/')) return { type: 'Rule', canonical: 'rules/', action: 'REVIEW' };
  if (norm.startsWith('skills/')) return { type: 'Skill-related', canonical: 'skills/', action: 'REVIEW' };
  if (norm.startsWith('memory/') || /^MEMORY\.md$/i.test(base)) return { type: 'Memory', canonical: 'memory/', action: 'REVIEW' };
  return null;
}

async function writeMigrationPlan(projectRoot, outputRelative) {
  const project = path.resolve(projectRoot);
  const files = await walkFiles(project);
  const rows = [];

  for (const full of files) {
    const rel = path.relative(project, full).replaceAll('\\', '/');
    const classified = classifyArtifact(rel);
    if (classified) rows.push({ source: rel, ...classified });
  }

  const output = resolveUnder(project, outputRelative || 'MIGRATION-PLAN.md');
  const lines = [
    '# MIGRATION PLAN',
    '',
    '> Generated by the local Portable Agent Control Framework MCP server. This is a dry-run inventory. Review `MIGRATION.INSTRUCTIONS.md` before applying changes.',
    '',
    '| Source | Detected Type | Canonical Mapping | Proposed Action | Decision / Notes |',
    '|---|---|---|---|---|'
  ];

  for (const row of rows) {
    lines.push(`| \`${row.source}\` | ${row.type} | \`${row.canonical}\` | ${row.action} |  |`);
  }

  if (rows.length === 0) lines.push('| _No recognized agent-control artifacts found_ |  |  |  |  |');

  await fs.writeFile(output, lines.join('\n') + '\n', 'utf8');
  return { output, count: rows.length, artifacts: rows };
}

function createServer() {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    'framework_inspect',
    {
      description: 'Validate a Portable Agent Control Framework root and report whether key manifests/specifications exist.',
      inputSchema: z.object({
        frameworkRoot: z.string().optional().describe('Framework root. Defaults to AGENT_FRAMEWORK_HOME.')
      })
    },
    async ({ frameworkRoot }) => {
      const root = frameworkRoot || process.env.AGENT_FRAMEWORK_HOME;
      if (!root) throw new Error('frameworkRoot is required unless AGENT_FRAMEWORK_HOME is set.');
      return textResult(await frameworkSummary(root));
    }
  );

  server.registerTool(
    'framework_install_or_update',
    {
      description: 'Copy a local or Git-hosted framework into a project without copying nested .git metadata. Existing destination is backed up before replacement.',
      inputSchema: z.object({
        source: z.string().optional().describe('Local directory or Git URL. Defaults to AGENT_FRAMEWORK_HOME.'),
        projectRoot: z.string(),
        destination: z.string().default('.agent-framework'),
        wire: z.enum(['none', 'agents', 'copilot', 'claude', 'qwen', 'gemini', 'cursor']).default('none'),
        dryRun: z.boolean().default(true)
      })
    },
    async ({ source, projectRoot, destination, wire, dryRun }) => {
      const project = path.resolve(projectRoot);
      if (!(await exists(project))) throw new Error(`Project root does not exist: ${project}`);

      const destinationRoot = resolveUnder(project, destination);
      if (dryRun) {
        return textResult({
          dryRun: true,
          source: source || process.env.AGENT_FRAMEWORK_HOME || null,
          projectRoot: project,
          destination: destinationRoot,
          wire
        });
      }

      const staged = await stageSource(source);
      try {
        let backup = null;
        if (await exists(destinationRoot)) {
          const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
          backup = `${destinationRoot}.backup-${stamp}`;
          await fs.rename(destinationRoot, backup);
        }

        await fs.mkdir(path.dirname(destinationRoot), { recursive: true });
        await copyFramework(staged.root, destinationRoot);

        const manifest = {
          framework_version: SERVER_VERSION,
          installed_at: new Date().toISOString(),
          source: source || process.env.AGENT_FRAMEWORK_HOME || staged.root,
          project_root: project,
          destination,
          install_method: 'mcp-copy-no-nested-git'
        };
        await fs.writeFile(path.join(destinationRoot, '.agent-framework-install.json'), JSON.stringify(manifest, null, 2) + '\n');

        let wired = null;
        if (wire !== 'none') wired = await wirePointer(project, destination, wire);

        return textResult({
          installed: true,
          destination: destinationRoot,
          backup,
          wired,
          validation: await frameworkSummary(destinationRoot)
        });
      } finally {
        await staged.cleanup();
      }
    }
  );

  server.registerTool(
    'framework_wire_agent',
    {
      description: 'Append the small framework routing pointer to an existing or new vendor-native agent control file.',
      inputSchema: z.object({
        projectRoot: z.string(),
        frameworkPath: z.string().default('.agent-framework'),
        vendor: z.enum(['agents', 'copilot', 'claude', 'qwen', 'gemini', 'cursor']),
        controlFile: z.string().optional().describe('Optional project-relative control file override.')
      })
    },
    async ({ projectRoot, frameworkPath, vendor, controlFile }) => {
      return textResult(await wirePointer(path.resolve(projectRoot), frameworkPath, vendor, controlFile));
    }
  );

  server.registerTool(
    'framework_write_migration_plan',
    {
      description: 'Inventory recognized agent-control files in an existing project and write a non-destructive migration-plan Markdown file. This tool does not move or delete source files.',
      inputSchema: z.object({
        projectRoot: z.string(),
        output: z.string().default('MIGRATION-PLAN.md')
      })
    },
    async ({ projectRoot, output }) => {
      return textResult(await writeMigrationPlan(projectRoot, output));
    }
  );

  return server;
}

void serveStdio(createServer);
console.error(`${SERVER_NAME} MCP server ${SERVER_VERSION} running on stdio`);
