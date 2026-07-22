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
    local statuses=()
    local failed=0
    local index

    for index in "${!PIDS[@]}"; do
        wait "${PIDS[$index]}"
        statuses+=("$?")
    done

    for index in "${!PIDS[@]}"; do
        if [[ ${statuses[$index]} -ne 0 ]]; then
            failed=1
            printf '\n%s failed (exit code %s):\n' "${LABELS[$index]}" "${statuses[$index]}"
            cat "${LOGS[$index]}"
        fi
    done

    return "$failed"
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
        "$ROOT/client/node_modules/.bin/prettier" --config "$ROOT/client/.prettierrc" --write --ignore-unknown "${client_files[@]}"
    fi
    if [[ ${#server_files[@]} -gt 0 ]]; then
        "$ROOT/client/node_modules/.bin/prettier" --config "$ROOT/server/.prettierrc" --write --ignore-unknown "${server_files[@]}"
    fi
    if [[ ${#root_files[@]} -gt 0 ]]; then
        "$ROOT/client/node_modules/.bin/prettier" --config "$ROOT/server/.prettierrc" --write --ignore-unknown "${root_files[@]}"
    fi
}

reset_tasks
printf 'Formatting changed files...\n'
start_task "Prettier" "$ROOT" format_changed_files
wait_for_tasks || exit 1

reset_tasks
printf 'Linting client and server...\n'
start_task "Client lint" "$ROOT/client" npm run lint
start_task "Server lint" "$ROOT/server" npm run lint
wait_for_tasks || exit 1

reset_tasks
printf 'Typechecking client, server, and shared code...\n'
start_task "Typecheck" "$ROOT/client" npm run ts:check
wait_for_tasks || exit 1

reset_tasks
printf 'Testing client and server...\n'
start_task "Client tests" "$ROOT/client" npm test
start_task "Server tests" "$ROOT/server" npm test
wait_for_tasks || exit 1

printf 'All checks passed.\n'
