#!/usr/bin/env -S zsh -euo pipefail
# shellcheck shell=bash # trick shellcheck into working with zsh
# shellcheck disable=SC2296 # Falsely identifies zsh expansions
# shellcheck disable=SC1091 # Complains about sourcing without literal path
#
# ---- ---- ----  About this Script  ---- ---- ----
#
# Purpose: Launch the source_capture local receiver. It accepts page source / log bytes POSTed by a
#          userscript (via GM_xmlhttpRequest) and writes them under <root>/.gitignored/<userscript>/.
#          This zsh script is the conventions-compliant entry point; the HTTP/file-writing work is
#          done by the sibling Python receiver (source_capture_server.py) which it spawns, because
#          zsh is a poor fit for parsing multi-MB HTTP POST bodies.
# Author:  Zakk Hoyt
# Usage:   ./source_capture_server.zsh [--port <n>] [--token <tok>] [--root <dir>]

# ---- ---- ----     Source Utilities     ---- ---- ----

# Determine script directory + basename at top level (inside a zsh function, $0 is the function name)
script_dir="${0:A:h}"
typeset -r script_basename="${0:A:t}"

# Define standard source file directories (mirrors scripts/violentmonkey/violentmonkey.zsh)
source_dirs=(
  "${HATCH_SOURCE_DIR:-}"
  "$HOME/.hatch/source"
  "$HOME/.zsh_home/utilities"
  "$script_dir/../../assets/hatch_home/source"
)

unset -v scripting_utilities_found
for source_dir in "${source_dirs[@]}"; do
  if [[ -n "$source_dir" && -f "$source_dir/.zsh_scripting_utilities" ]]; then
    source "$source_dir/.zsh_scripting_utilities" "$0" "$@" > /dev/null
    scripting_utilities_found=true
    break
  fi
done

if [[ -z "${scripting_utilities_found:-}" ]]; then
  echo "ERROR: Cannot find .zsh_scripting_utilities in any expected location:" >&2
  for source_dir in "${source_dirs[@]}"; do
    [[ -n "$source_dir" ]] && echo "  - $source_dir/.zsh_scripting_utilities" >&2
  done
  exit 1
fi

# ---- ---- ----     Help Function     ---- ---- ----

function print_usage {
  typeset -r script_name="${script_basename:-source_capture_server.zsh}"
  typeset -r i2="${INDENT_2:-  }"
  typeset -r i4="${INDENT_4:-    }"
  typeset -r i6="${i2}${i4}"

  slog_se --bold "SYNOPSIS" --default
  slog_se
  slog_se "${i2}" --code "${script_name} [--port <n>] [--token <tok>] [--root <dir>]" --default
  slog_se

  slog_se --bold "OPTIONS" --default
  slog_se
  slog_se "${i2}" --bold --italic "SCRIPT OPTIONS" --default
  slog_se "${i4}" --code '--port <n>' --default
  slog_se "${i6}Port to listen on (default: 8787)"
  slog_se "${i4}" --code '--token <tok>' --default
  slog_se "${i6}Shared token the userscript must send (default: source-capture-dev)"
  slog_se "${i4}" --code '--root <dir>' --default
  slog_se "${i6}Repo root; files land under " --code '<root>/.gitignored/<userscript>/' --default
  slog_se "${i6}(default: the current git repository top level)"
  slog_se
  slog_se "${i2}" --bold --italic "META-OPTIONS" --default
  slog_se "${i4}" --code '--help' --default
  slog_se "${i6}Display this help message and exit"
  slog_se

  slog_se --bold "DESCRIPTION" --default
  slog_se
  slog_se "${i2}Receives raw file bytes (POST /save) and writes them to"
  slog_se "${i2}" --code '<root>/.gitignored/<userscript>/<X-Capture-Path>' --default
  slog_se "${i2}Bound to 127.0.0.1 only. Stop with Ctrl+C."
  slog_se

  slog_se --bold "EXAMPLES" --default
  slog_se
  slog_se "${i2}${SYMBOL_BULLET:-•} Serve with defaults (git root, port 8787)"
  slog_se "${i4}" --code "./${script_name}" --default
  slog_se "${i2}${SYMBOL_BULLET:-•} Serve on a custom port with a random token"
  slog_se "${i4}" --code "./${script_name} --port 9000 --token \"\$(uuidgen)\"" --default
  slog_se

  slog_se --bold "REFERENCES" --default
  slog_se
  slog_se "${i4}GM_xmlhttpRequest: " --url "https://violentmonkey.github.io/api/gm/#gm_xmlhttprequest" --default

  return 0
}

# ---- ---- ----   Argument Parsing   ---- ---- ----

# Stage 1: standard meta flags
zparseopts -D -- \
  -help=flag_help \
  {d,-debug}+=flag_debug

if [[ -n "${flag_help:-}" ]]; then
  print_usage
  exit 0
fi

flag_debug_level=${#flag_debug[@]}
if [[ $flag_debug_level -gt 0 ]]; then
  export IS_DEBUG=true
  [[ $flag_debug_level -gt 1 ]] && export IS_UTILS_DEBUG=true
fi

# Stage 2: script-specific options
zparseopts -D -E -- \
  -port:=opt_port \
  -token:=opt_token \
  -root:=opt_root

# ---- ---- ---- Refine Vars ---- ---- ----

typeset -r server_port="${opt_port[-1]:-8787}"
slog_var1_se_d "server_port"

typeset -r server_token="${opt_token[-1]:-source-capture-dev}"
slog_var1_se_d "server_token"

# Resolve repo root (default: current git top level)
typeset repo_root="${opt_root[-1]:-}"
if [[ -z "$repo_root" ]]; then
  repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    slog_step_se --context fatal "Not in a git repository and no " --code "--root" --default " given. See " --code "--help" --default
    exit 1
  }
fi
repo_root="${repo_root:A}"
slog_var1_se_d "repo_root"

if [[ ! -d "$repo_root" ]]; then
  slog_step_se --context fatal "Root is not a directory: " --url "$repo_root" --default
  exit 1
fi

# ---- ---- ---- Script Logic ---- ---- ----

# [step] Verify python3 is available
slog_step_se_d --context will "Verify " --code "python3" --default " is available"
if ! command -v python3 > /dev/null 2>&1; then
  slog_step_se --context fatal "Required tool not found: " --code "python3" --default
  exit 1
fi
slog_step_se_d --context success "Verified " --code "python3" --default

typeset -r receiver_py="${script_dir}/source_capture_server.py"
slog_var1_se_d "receiver_py"
if [[ ! -f "$receiver_py" ]]; then
  slog_step_se --context fatal "Receiver not found: " --url "$receiver_py" --default
  exit 1
fi

# Persist server output per agent terminal conventions
typeset -r log_dir="${repo_root}/.gitignored/source_capture"
mkdir -p "$log_dir"
typeset -r log_file="${log_dir}/server_$(date +%Y%m%d_%H%M%S).log"
slog_var1_se_d "log_file"

# Clean exit on Ctrl+C / TERM (the Python receiver also handles KeyboardInterrupt)
trap 'slog_se ""; slog_step_se --context info "Capture server stopped"; exit 0' INT TERM

slog_step_se --context info "Capture server starting on " \
  --code "http://127.0.0.1:${server_port}/save" --default
slog_step_se --context info "Writing under " --url "${repo_root}/.gitignored/<userscript>/" --default
slog_step_se --context info "Token: " --code "${server_token}" --default " (Ctrl+C to stop)"

# [step] Run the Python receiver in the foreground; tee to a persisted log for the human + agents
typeset -r cmd="python3 ${(qqq)receiver_py} --root ${(qqq)repo_root} --port ${(qqq)server_port} --token ${(qqq)server_token}"
slog_step_se_d --context will "Run " --code "$cmd" --default
python3 "$receiver_py" --root "$repo_root" --port "$server_port" --token "$server_token" 2>&1 | tee "$log_file"
