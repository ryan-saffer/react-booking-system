#!/usr/bin/env bash

set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

EXPECTED_NODE=$(<"$ROOT/.nvmrc")
if [[ $(node --version) != "v$EXPECTED_NODE" ]]; then
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
        printf 'Node %s is required. Install it or run `nvm use` first.\n' "$EXPECTED_NODE" >&2
        exit 1
    fi

    set +u
    unset npm_config_prefix NPM_CONFIG_PREFIX
    source "$NVM_DIR/nvm.sh"
    nvm use --silent "$EXPECTED_NODE" >/dev/null
    nvm_status=$?
    set -u

    if [[ $nvm_status -ne 0 ]]; then
        printf 'Could not activate Node %s with nvm.\n' "$EXPECTED_NODE" >&2
        exit 1
    fi
fi

LOG_DIR=$(mktemp -d "${TMPDIR:-/tmp}/fizz-kidz-verify.XXXXXX")

PIDS=()
LABELS=()
LOGS=()

if [[ -t 1 && -z ${NO_COLOR:-} && ${TERM:-dumb} != dumb ]]; then
    GREEN=$'\033[32m'
    RED=$'\033[31m'
    CYAN=$'\033[36m'
    YELLOW=$'\033[33m'
    BOLD=$'\033[1m'
    DIM=$'\033[2m'
    RESET=$'\033[0m'
else
    GREEN=''
    RED=''
    CYAN=''
    YELLOW=''
    BOLD=''
    DIM=''
    RESET=''
fi

cleanup() {
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    rm -rf "$LOG_DIR"
}

trap cleanup EXIT
trap 'exit 130' INT TERM

reset_tasks() {
    PIDS=()
    LABELS=()
    LOGS=()
}

start_task() {
    local label=$1
    local directory=$2
    local log="$LOG_DIR/${#PIDS[@]}.log"
    shift 2

    (
        cd "$directory" || exit 1
        "$@"
    ) >"$log" 2>&1 &

    PIDS+=("$!")
    LABELS+=("$label")
    LOGS+=("$log")
}

wait_for_tasks() {
    local phase=$1
    local statuses=()
    local failed=0
    local index
    local frame=0
    local started_at=$SECONDS
    local spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

    if [[ -t 1 ]]; then
        while tasks_running; do
            printf '\r\033[2K  %b%s%b %s' "$CYAN" "${spinner[$frame]}" "$RESET" "$phase"
            frame=$(((frame + 1) % ${#spinner[@]}))
            sleep 0.08
        done
        printf '\r\033[2K'
    else
        printf '  • %s...\n' "$phase"
    fi

    for index in "${!PIDS[@]}"; do
        wait "${PIDS[$index]}"
        statuses+=("$?")
    done

    for index in "${!PIDS[@]}"; do
        if [[ ${statuses[$index]} -ne 0 ]]; then
            failed=1
        fi
    done

    if [[ $failed -ne 0 ]]; then
        printf '  %b✗%b %s %bfailed%b\n' "$RED" "$RESET" "$phase" "$RED" "$RESET"
        for index in "${!PIDS[@]}"; do
            if [[ ${statuses[$index]} -eq 0 ]]; then
                continue
            fi
            printf '\n%b%s%b %b(exit code %s)%b\n' "$YELLOW" "${LABELS[$index]}" "$RESET" "$DIM" "${statuses[$index]}" "$RESET"
            cat "${LOGS[$index]}"
            printf '\n'
        done
    fi

    if [[ $failed -eq 0 ]]; then
        printf '  %b✓%b %s %b(%ss)%b\n' "$GREEN" "$RESET" "$phase" "$DIM" "$((SECONDS - started_at))" "$RESET"
    fi

    return "$failed"
}

tasks_running() {
    local pid
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    done
    return 1
}

format_changed_files() {
    local client_files=()
    local server_files=()
    local root_files=()
    local file

    while IFS= read -r -d '' file; do
        case "$file" in
            client/*) client_files+=("$ROOT/$file") ;;
            server/*) server_files+=("$ROOT/$file") ;;
            *) root_files+=("$ROOT/$file") ;;
        esac
    done < <(
        git -C "$ROOT" diff --name-only --diff-filter=ACMR -z HEAD
        git -C "$ROOT" ls-files --others --exclude-standard -z
    )

    if [[ ${#client_files[@]} -gt 0 ]]; then
        "$ROOT/client/node_modules/.bin/oxfmt" --config "$ROOT/client/.oxfmtrc.json" "${client_files[@]}"
    fi
    if [[ ${#server_files[@]} -gt 0 ]]; then
        "$ROOT/server/node_modules/.bin/oxfmt" --config "$ROOT/server/.oxfmtrc.json" "${server_files[@]}"
    fi
    if [[ ${#root_files[@]} -gt 0 ]]; then
        "$ROOT/client/node_modules/.bin/oxfmt" --config "$ROOT/server/.oxfmtrc.json" "${root_files[@]}"
    fi
}

VERIFY_STARTED_AT=$SECONDS

printf '\n%b%s%b\n\n' "$BOLD" 'Fizz Kidz verification' "$RESET"

reset_tasks
start_task "Oxfmt" "$ROOT" format_changed_files
wait_for_tasks "Formatting changed files" || exit 1

reset_tasks
start_task "Client lint" "$ROOT/client" npm run lint
start_task "Server lint" "$ROOT/server" npm run lint
wait_for_tasks "Linting client and server" || exit 1

reset_tasks
start_task "Typecheck" "$ROOT/client" npm run ts:check
wait_for_tasks "Typechecking all packages" || exit 1

reset_tasks
start_task "Client tests" "$ROOT/client" npm test
start_task "Server tests" "$ROOT/server" npm test
wait_for_tasks "Testing client and server" || exit 1

printf '\n%b%b✨ All checks passed%b %b(%ss)%b\n\n' "$BOLD" "$GREEN" "$RESET" "$DIM" "$((SECONDS - VERIFY_STARTED_AT))" "$RESET"
