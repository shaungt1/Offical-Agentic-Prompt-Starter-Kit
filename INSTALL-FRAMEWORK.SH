#!/usr/bin/env sh
set -eu

VERSION="0.4.0"
MARKER_BEGIN="<!-- BEGIN PORTABLE AGENT CONTROL FRAMEWORK -->"
MARKER_END="<!-- END PORTABLE AGENT CONTROL FRAMEWORK -->"

usage() {
  cat <<'EOF'
Portable Agent Control Framework installer

Usage:
  INSTALL-FRAMEWORK.SH <install|update|status|detect> [options]

Commands:
  detect    Non-destructive scan of --target for existing vendor folders (.claude, .github,
            .cursor, .qwen, .gemini), an Admin Local Toolbox, and existing entry/control files.
            Prints a suggested FRAMEWORK_ROOT so a human or an agent can choose without guessing.

Options:
  --source <path-or-git-url>   Framework source. Defaults to the parent of this script.
  --target <project-root>      Target project. Defaults to current directory.
  --destination <path>         Destination relative to target. Default: .agent-framework
  --admin-local                Destination becomes .admin-local/shared_toolbox/agent-control-framework
  --wire <type>                Wire pointer into: agents|copilot|claude|qwen|gemini|cursor|none
  --with-mcp <target>          Also generate a default MCP server config if one doesn't already exist:
                                claude (.mcp.json), vscode (.vscode/mcp.json), both, or none (default: none)
  --no-backup                  Do not back up an existing destination on update/install replacement.
  --dry-run                    Print planned actions without changing files.
  --help                       Show this help.

Examples:
  sh INSTALL-FRAMEWORK.SH install --source . --target ../my-project --wire agents --with-mcp both
  sh INSTALL-FRAMEWORK.SH install --source . --target ../my-project --admin-local --wire agents --with-mcp claude
  sh INSTALL-FRAMEWORK.SH update --source https://github.com/shaungt1/-Offical-Agentic-Prompt-Starter-Kit.git --target ../my-project
EOF
}

command="${1:-}"
if [ -z "$command" ] || [ "$command" = "--help" ] || [ "$command" = "-h" ]; then
  usage
  exit 0
fi
shift || true

case "$command" in
  install|update|status|detect) ;;
  *) echo "Unknown command: $command" >&2; usage >&2; exit 2 ;;
esac

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
default_source=$(CDPATH= cd -- "$script_dir/.." && pwd)

source_value="$default_source"
target="$(pwd)"
destination=".agent-framework"
wire="none"
with_mcp="none"
backup="yes"
dry_run="no"
admin_local="no"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --source) source_value="$2"; shift 2 ;;
    --target) target="$2"; shift 2 ;;
    --destination) destination="$2"; shift 2 ;;
    --admin-local) admin_local="yes"; shift ;;
    --wire) wire="$2"; shift 2 ;;
    --with-mcp) with_mcp="$2"; shift 2 ;;
    --no-backup) backup="no"; shift ;;
    --dry-run) dry_run="yes"; shift ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [ "$admin_local" = "yes" ]; then
  destination=".admin-local/shared_toolbox/agent-control-framework"
fi

target=$(CDPATH= cd -- "$target" 2>/dev/null && pwd) || {
  echo "Target project does not exist: $target" >&2
  exit 3
}

dest_abs="$target/$destination"
manifest="$dest_abs/.agent-framework-install.json"

if [ "$command" = "detect" ]; then
  echo "Project: $target"
  echo ""
  echo "Detected vendor / customization folders:"
  found_admin_local="no"; found_claude="no"; found_github="no"; found_cursor="no"; found_qwen="no"; found_gemini="no"

  if [ -d "$target/.admin-local/shared_toolbox" ]; then
    echo "  .admin-local/shared_toolbox/    FOUND"
    found_admin_local="yes"
  else
    echo "  .admin-local/shared_toolbox/    not found"
  fi
  if [ -d "$target/.claude" ]; then
    echo "  .claude/                        FOUND"
    found_claude="yes"
  else
    echo "  .claude/                        not found"
  fi
  if [ -d "$target/.github" ]; then
    echo "  .github/                        FOUND (Copilot)"
    found_github="yes"
  else
    echo "  .github/                        not found"
  fi
  if [ -d "$target/.cursor" ]; then
    echo "  .cursor/                        FOUND"
    found_cursor="yes"
  else
    echo "  .cursor/                        not found"
  fi
  if [ -d "$target/.qwen" ]; then
    echo "  .qwen/                          FOUND"
    found_qwen="yes"
  else
    echo "  .qwen/                          not found"
  fi
  if [ -d "$target/.gemini" ]; then
    echo "  .gemini/                        FOUND"
    found_gemini="yes"
  else
    echo "  .gemini/                        not found"
  fi

  echo ""
  echo "Existing entry/control files:"
  for f in AGENTS.md CLAUDE.md CLAUDE.local.md QWEN.md GEMINI.md .github/copilot-instructions.md .cursor/rules; do
    if [ -e "$target/$f" ]; then
      echo "  $f    FOUND"
    else
      echo "  $f    not found"
    fi
  done

  echo ""
  echo "Suggested FRAMEWORK_ROOT (highest precedence first):"
  n=1
  if [ "$found_admin_local" = "yes" ]; then
    echo "  $n. .admin-local/shared_toolbox/agent-control-framework   (Admin Local Toolbox found — shared across every project on this machine)"
    n=$((n + 1))
  fi
  if [ "$found_claude" = "yes" ]; then
    echo "  $n. .claude/agent-control-framework                       (.claude/ found)"
    n=$((n + 1))
  fi
  if [ "$found_github" = "yes" ]; then
    echo "  $n. .github/agent-control-framework                       (.github/ found — Copilot)"
    n=$((n + 1))
  fi
  if [ "$found_cursor" = "yes" ]; then
    echo "  $n. .cursor/agent-control-framework                       (.cursor/ found)"
    n=$((n + 1))
  fi
  if [ "$found_qwen" = "yes" ]; then
    echo "  $n. .qwen/agent-control-framework                         (.qwen/ found)"
    n=$((n + 1))
  fi
  if [ "$found_gemini" = "yes" ]; then
    echo "  $n. .gemini/agent-control-framework                       (.gemini/ found)"
    n=$((n + 1))
  fi
  echo "  $n. .agent-framework                                       (default fallback — no vendor folder found, or team-committed generic copy preferred)"

  echo ""
  echo "Reminder: the framework COPY location and the per-project WIRING are separate decisions."
  echo "  - If the copy lives in a shared Admin Local Toolbox, its content is visible to every"
  echo "    project using that Toolbox. Never put project-specific customizations inside it."
  echo "  - Wire THIS project's pointer into its own control file: a committed one (AGENTS.md,"
  echo "    CLAUDE.md, .github/copilot-instructions.md, ...) for team-shared setup, the normal"
  echo "    case and the file \"anybody can commit\" — or a private one (CLAUDE.local.md, or a"
  echo "    project-local file kept out of Git) if the wiring itself must not be shared."
  echo ""
  echo "Run install with --destination <one of the above> (or --admin-local) and --wire <vendor>."
  exit 0
fi

if [ "$command" = "status" ]; then
  echo "Project: $target"
  echo "Destination: $dest_abs"
  if [ -f "$manifest" ]; then
    echo "Status: installed"
    cat "$manifest"
  elif [ -d "$dest_abs" ]; then
    echo "Status: directory exists but install manifest is missing"
  else
    echo "Status: not installed"
  fi
  exit 0
fi

if [ "$admin_local" = "yes" ] && [ ! -d "$target/.admin-local/shared_toolbox" ]; then
  echo "Admin Local shared_toolbox was not found at:" >&2
  echo "  $target/.admin-local/shared_toolbox" >&2
  echo "Initialize Admin Local first or omit --admin-local." >&2
  exit 4
fi

tmp_root="${TMPDIR:-/tmp}/agent-framework-install.$$"
tmp_source="$tmp_root/source"
tmp_payload="$tmp_root/payload"
mkdir -p "$tmp_root" "$tmp_payload"

cleanup() {
  rm -rf "$tmp_root"
}
trap cleanup EXIT INT TERM

is_git_url="no"
case "$source_value" in
  http://*|https://*|git@*|ssh://*|git://*) is_git_url="yes" ;;
esac

if [ "$is_git_url" = "yes" ]; then
  command -v git >/dev/null 2>&1 || {
    echo "git is required for a remote --source URL." >&2
    exit 5
  }
  echo "Staging remote source..."
  if [ "$dry_run" = "yes" ]; then
    echo "[DRY-RUN] git clone --depth 1 <source> $tmp_source"
    mkdir -p "$tmp_source"
  else
    git clone --depth 1 "$source_value" "$tmp_source" >/dev/null 2>&1 || {
      echo "Failed to clone framework source." >&2
      exit 6
    }
  fi
  staged_source="$tmp_source"
else
  if [ ! -d "$source_value" ]; then
    echo "Framework source directory does not exist: $source_value" >&2
    exit 7
  fi
  staged_source=$(CDPATH= cd -- "$source_value" && pwd)
fi

if [ "$dry_run" = "yes" ]; then
  echo "[DRY-RUN] Copy framework from:"
  echo "  $staged_source"
  echo "to:"
  echo "  $dest_abs"
else
  # Copy source to a clean staging directory while dropping source-control/runtime junk.
  (
    cd "$staged_source"
    tar -cf - \
      --exclude='.git' \
      --exclude='node_modules' \
      --exclude='.admin-local' \
      --exclude='.DS_Store' \
      --exclude='*.zip' \
      .
  ) | (
    cd "$tmp_payload"
    tar -xf -
  )
fi

timestamp=$(date '+%Y%m%d-%H%M%S')
if [ -e "$dest_abs" ]; then
  if [ "$backup" = "yes" ]; then
    backup_path="${dest_abs}.backup-${timestamp}"
    if [ "$dry_run" = "yes" ]; then
      echo "[DRY-RUN] Backup existing destination to $backup_path"
    else
      mv "$dest_abs" "$backup_path"
      echo "Backup: $backup_path"
    fi
  else
    if [ "$dry_run" = "yes" ]; then
      echo "[DRY-RUN] Remove existing managed destination: $dest_abs"
    else
      rm -rf "$dest_abs"
    fi
  fi
fi

if [ "$dry_run" != "yes" ]; then
  mkdir -p "$(dirname "$dest_abs")"
  mv "$tmp_payload" "$dest_abs"
  installed_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  cat > "$manifest" <<EOF
{
  "framework_version": "$VERSION",
  "installed_at": "$installed_at",
  "source": "$(printf '%s' "$source_value" | sed 's/"/\\"/g')",
  "project_root": "$(printf '%s' "$target" | sed 's/"/\\"/g')",
  "destination": "$(printf '%s' "$destination" | sed 's/"/\\"/g')",
  "install_method": "shell-copy-no-nested-git"
}
EOF
  echo "Installed framework: $dest_abs"
fi

control_file=""
case "$wire" in
  none) ;;
  agents|cursor) control_file="$target/AGENTS.md" ;;
  copilot) control_file="$target/.github/copilot-instructions.md" ;;
  claude) control_file="$target/CLAUDE.md" ;;
  qwen) control_file="$target/QWEN.md" ;;
  gemini) control_file="$target/GEMINI.md" ;;
  *) echo "Unknown --wire value: $wire" >&2; exit 8 ;;
esac

wire_pointer() {
  file="$1"
  if [ -z "$file" ]; then
    return
  fi

  if [ -f "$file" ] && grep -F "$MARKER_BEGIN" "$file" >/dev/null 2>&1; then
    echo "Framework pointer already present: $file"
    return
  fi

  if [ "$dry_run" = "yes" ]; then
    echo "[DRY-RUN] Append framework pointer to $file"
    return
  fi

  mkdir -p "$(dirname "$file")"
  if [ ! -f "$file" ]; then
    : > "$file"
  fi

  cat >> "$file" <<EOF

$MARKER_BEGIN

## Shared Agent Control Framework

Framework root: \`$destination\`

When creating, modifying, discovering, or validating an agent-control artifact:

1. Read \`$destination/README.md\` when repository-level routing is needed.
2. Read the applicable root manifest before creating a duplicate.
3. Follow the corresponding specification under \`$destination/agent-specifications/specs/\`.
4. Load only the documents relevant to the current task.
5. Preserve vendor-native entry files when the runtime requires them.
6. For existing customizations, follow \`$destination/MIGRATION.INSTRUCTIONS.md\`.

$MARKER_END
EOF

  echo "Wired framework pointer: $file"
}

wire_pointer "$control_file"

server_entry_name="agent-control-framework"
server_js_path="$destination/mcp/mcp-server/src/index.mjs"

write_mcp_config() {
  target_file="$1"
  key_name="$2"
  json_body="$3"

  if [ -f "$target_file" ] && grep -F "$server_entry_name" "$target_file" >/dev/null 2>&1; then
    echo "MCP config already references '$server_entry_name': $target_file"
    return
  fi

  if [ "$dry_run" = "yes" ]; then
    echo "[DRY-RUN] Write MCP config to $target_file"
    return
  fi

  if [ -f "$target_file" ]; then
    echo "MCP config already exists and does not reference '$server_entry_name': $target_file" >&2
    echo "  Add this by hand under the \"$key_name\" key instead of overwriting the file:" >&2
    echo "$json_body" | sed 's/^/  /' >&2
    return
  fi

  mkdir -p "$(dirname "$target_file")"
  printf '%s\n' "$json_body" > "$target_file"
  echo "Wrote MCP config: $target_file"
}

case "$with_mcp" in
  none) ;;
  claude|vscode|both)
    claude_json=$(cat <<EOF
{
  "mcpServers": {
    "$server_entry_name": {
      "command": "node",
      "args": ["$server_js_path"],
      "env": {
        "AGENT_FRAMEWORK_HOME": "$destination"
      }
    }
  }
}
EOF
)
    vscode_json=$(cat <<EOF
{
  "servers": {
    "$server_entry_name": {
      "type": "stdio",
      "command": "node",
      "args": ["\${workspaceFolder}/$server_js_path"],
      "env": {
        "AGENT_FRAMEWORK_HOME": "\${workspaceFolder}/$destination"
      }
    }
  }
}
EOF
)
    [ "$with_mcp" = "claude" ] || [ "$with_mcp" = "both" ] && write_mcp_config "$target/.mcp.json" "mcpServers" "$claude_json"
    [ "$with_mcp" = "vscode" ] || [ "$with_mcp" = "both" ] && write_mcp_config "$target/.vscode/mcp.json" "servers" "$vscode_json"
    ;;
  *) echo "Unknown --with-mcp value: $with_mcp" >&2; exit 9 ;;
esac

if [ "$dry_run" = "yes" ]; then
  echo "Dry run complete."
else
  echo "Validation:"
  required_files="
README.md
agent-specifications/specs/skill.specification.md
skills/SKILLS.md
rules/RULES.md
task/TASKS.md
AGENT-SETUP.INSTRUCTIONS.md
MIGRATION.INSTRUCTIONS.md
"
  failed="no"
  echo "$required_files" | while IFS= read -r f; do
    [ -z "$f" ] && continue
    if [ ! -e "$dest_abs/$f" ]; then
      echo "  MISSING: $f" >&2
      failed="yes"
    fi
  done
  echo "  Framework root: $dest_abs"
  echo "  Nested .git copied: no"
  echo "Done."
fi
