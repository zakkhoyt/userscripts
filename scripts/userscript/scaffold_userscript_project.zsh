#!/usr/bin/env -S zsh -euo pipefail
# shellcheck shell=bash
# shellcheck disable=SC2296
# shellcheck disable=SC1091
#
# ---- ---- ----  About this Script  ---- ---- ----
#
# Purpose: Scaffold a userscript bundler workspace with src/dist folders and a lib symlink
# Author: GitHub Copilot
# Usage: ./scripts/userscript/scaffold_userscript_project.zsh --project-dir <dir> [--lib-source <dir>] [--project-name <name>] [--force]
#

# ---- ---- ----     Source Utilities     ---- ---- ----

script_dir="${0:A:h}"

source_dirs=(
  "${HATCH_SOURCE_DIR:-}"
  "$HOME/.hatch/source"
  "$HOME/.zsh_home/utilities"
  "$script_dir/../../assets/hatch_home/source"
)

unset -v scripting_utilities_found
for source_dir in "${source_dirs[@]}"; do
  if [[ -n "$source_dir" && -f "$source_dir/.zsh_scripting_utilities" ]]; then
    # shellcheck disable=SC1090
    source "$source_dir/.zsh_scripting_utilities" "$0" "$@" > /dev/null
    scripting_utilities_found=true
    break
  fi
done

if [[ -z "${scripting_utilities_found:-}" ]]; then
  echo "ERROR: Cannot find .zsh_scripting_utilities in any expected location:\n${(F)source_dirs[@]}" >&2 && exit 1
fi

repo_root="${script_dir:h:h}"

# ---- ---- ----     Helper Functions     ---- ---- ----

function print_usage {
  cat <<'EOF'
Usage:
    scaffold_userscript_project.zsh --project-dir <dir> [options]

Required:
    --project-dir <dir>    Target directory for the bundler workspace

Optional:
    --project-name <name>  Explicit project name (defaults to directory basename)
    --lib-source <dir>     Directory to link as ./lib (default: <repo>/common/amazon_toolkit)
    --force                Replace existing lib symlink or files if necessary
    --dry-run              Show operations without making changes
    --debug/-d             Increase logging verbosity (repeat for more detail)
EOF
}

function ensure_directory {
  local dir_path="$1"
  local description="$2"
  slog_step_se --context will "Ensure ${description} exists: " --url "$dir_path" --default
  if [[ "${is_dry_run:-}" == true ]]; then
    slog_step_se --context success "[dry-run] Would ensure directory: " --url "$dir_path" --default
    return 0
  fi
  # -p: create parent directories as needed
  # See: `man mkdir`
  mkdir -p "$dir_path"
  slog_step_se --context success "Directory ready: " --url "$dir_path" --default
}

function compute_relative_path {
  local from_dir="$1"
  local target_path="$2"
  python3 - "$from_dir" "$target_path" <<'PY'
import os
import sys
start = os.path.abspath(sys.argv[1])
target = os.path.abspath(sys.argv[2])
print(os.path.relpath(target, start=start))
PY
}

function ensure_symlink {
  local link_path="$1"
  local target_path="$2"
  local relative_target="${3-}"
  slog_step_se --context will "Ensure symlink: " --url "$link_path" --default " -> " --url "$target_path" --default

  if [[ "${is_dry_run:-}" == true ]]; then
    slog_step_se --context success "[dry-run] Would link " --url "$link_path" --default " -> " --url "$target_path" --default
    return 0
  fi

  if [[ -L "$link_path" ]]; then
    local current_target
    current_target="$(readlink "$link_path")"
    if [[ "$current_target" == "$relative_target" || "$current_target" == "$target_path" ]]; then
      slog_step_se --context success "Existing symlink already points to target"
      return 0
    fi
    if [[ -z "${flag_force:-}" ]]; then
      slog_step_se --context fatal "Symlink exists with different target. Re-run with --force to replace."
      exit 40
    fi
  fi

  if [[ -e "$link_path" && ! -L "$link_path" ]]; then
    if [[ -z "${flag_force:-}" ]]; then
      slog_step_se --context fatal "Path exists and is not a symlink: " --url "$link_path" --default
      exit 41
    fi
    slog_step_se --context will "Remove existing path: " --url "$link_path" --default
    # -r: recursive remove
    # -f: ignore nonexistent files, never prompt
    # See: `man rm`
    rm -rf "$link_path"
    slog_step_se --context success "Removed existing path"
  fi

  local link_parent="${link_path:h}"
  # -p: create parent directories as needed
  # See: `man mkdir`
  mkdir -p "$link_parent"

  local target_for_link="$relative_target"
  if [[ -z "$target_for_link" ]]; then
    target_for_link="$(compute_relative_path "$link_parent" "$target_path")"
  fi

  # -s: make symbolic link instead of hard link
  # See: `man ln`
  ln -s "$target_for_link" "$link_path"
  slog_step_se --context success "Symlink established"
}

function create_placeholder_entry {
  local entry_path="$1"
  if [[ -f "$entry_path" ]]; then
    slog_step_se --context info "Entry file already exists: " --url "$entry_path" --default
    return 0
  fi

  slog_step_se --context will "Create placeholder entry file: " --url "$entry_path" --default
  if [[ "${is_dry_run:-}" == true ]]; then
    slog_step_se --context success "[dry-run] Would create entry file"
    return 0
  fi

  cat <<'EOF' > "$entry_path"
import '../lib/index.js';

// TODO: Replace with your real userscript entry point
(function bootstrapUserscript() {
  console.log('Userscript entry placeholder. Import your script modules here.');
})();
EOF
  slog_step_se --context success "Placeholder entry created"
}

# ---- ---- ----   Argument Parsing   ---- ---- ----

# Stage 1: help/debug/dry-run
# -D: delete matched options from positional parameters
# See: `man zshmodules # zparseopts`
zparseopts -D -- \
  -help=flag_help \
  {d,-debug}+=flag_debug \
  -dry-run=flag_dry_run

if [[ -n "${flag_help:-}" ]]; then
  print_usage
  exit 0
fi

flag_debug_level=${#flag_debug[@]}
slog_var_se_d "flag_debug_level" "$flag_debug_level"
if [[ $flag_debug_level -gt 0 ]]; then
  export IS_DEBUG=true
  if [[ $flag_debug_level -gt 1 ]]; then
    export IS_UTILS_DEBUG=true
  fi
fi

is_dry_run=${flag_dry_run:+true}

# Stage 2: trap options
# -D: delete matched options from positional parameters
# See: `man zshmodules # zparseopts`
zparseopts -D -- \
  {-trap-err,-debug-err}=flag_debug_err \
  {-trap-exit,-debug-exit}=flag_debug_exit

if [[ -n "${flag_debug_err:-}" ]]; then
  trap 'slog_error_se "Script failed at line $LINENO with exit code $?"' ERR
else
  trap 'slog_error_se "Script failed at line $LINENO with exit code $?"' ERR
fi

if [[ -n "${flag_debug_exit:-}" ]]; then
  trap 'slog_se_d "Script exiting with status $?"' EXIT
fi

# Stage 3: script-specific options
# -D: delete matched options
# -E: stop parsing at first non-option
# See: `man zshmodules # zparseopts`
zparseopts -D -E -- \
  -project-dir:=opt_project_dir \
  -lib-source:=opt_lib_source \
  -project-name:=opt_project_name \
  -force=flag_force

project_dir_input="${opt_project_dir[-1]:-}"
if [[ -z "$project_dir_input" ]]; then
  slog_step_se --context fatal "--project-dir is required"
  exit 42
fi
project_dir="${project_dir_input:A}"
project_name="${opt_project_name[-1]:-${project_dir:t}}"
lib_source_input="${opt_lib_source[-1]:-$repo_root/common/amazon_toolkit}"
lib_source="${lib_source_input:A}"

if [[ ! -d "$lib_source" ]]; then
  slog_step_se --context fatal "Library source does not exist: " --url "$lib_source" --default
  exit 43
fi

project_src_dir="$project_dir/src"
project_dist_dir="$project_dir/dist"
project_lib_link="$project_dir/lib"
entry_file="$project_src_dir/userscript.entry.js"

declare -a summary_lines
summary_lines+=("project_dir=$project_dir")
summary_lines+=("project_name=$project_name")
summary_lines+=("lib_source=$lib_source")

# ---- ---- ----     Script Work     ---- ---- ----

ensure_directory "$project_dir" "project directory"
ensure_directory "$project_src_dir" "src directory"
ensure_directory "$project_dist_dir" "dist directory"
ensure_symlink "$project_lib_link" "$lib_source"
create_placeholder_entry "$entry_file"

slog_step_se --context success "Userscript bundler workspace scaffolded"
slog_se ""
slog_se "Summary:"
for summary_line in "${summary_lines[@]}"; do
  slog "  - $summary_line" --default
done
