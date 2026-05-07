#!/usr/bin/env bash
set -euo pipefail

TASK_LIMIT="${1:-1}"

if [[ ! "$TASK_LIMIT" =~ ^[1-9][0-9]*$ ]]; then
  echo "Usage: $0 [positive-task-count]" >&2
  exit 2
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

for ((iteration = 1; iteration <= TASK_LIMIT; iteration++)); do
  if ! grep -F -- "- [ ]" TODO.md >/dev/null 2>&1; then
    echo "No TODO tasks left."
    exit 0
  fi

  echo "Starting Ralph iteration $iteration/$TASK_LIMIT."
  codex exec --full-auto "$(cat tasks/RALPH_PROMPT.md)"

  echo "Iteration complete."
  sleep 2
done
