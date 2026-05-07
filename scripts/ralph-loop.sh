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

RUN_ID="$(date +%Y%m%d-%H%M%S)"
BRANCH="codex/ralph-$RUN_ID"
WORKTREE_DIR="$(cd -- "$ROOT_DIR/.." && pwd)/steps-thing-ralph-$RUN_ID"
PR_URL=""

git worktree add -b "$BRANCH" "$WORKTREE_DIR"

for ((iteration = 1; iteration <= TASK_LIMIT; iteration++)); do
  if ! grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" >/dev/null 2>&1; then
    echo "No TODO tasks left."
    exit 0
  fi

  TODO_BEFORE="$(grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" | wc -l | tr -d " ")"

  echo "Starting Ralph iteration $iteration/$TASK_LIMIT."
  if ! codex exec --full-auto --cd "$WORKTREE_DIR" "$(cat "$WORKTREE_DIR/tasks/RALPH_PROMPT.md")"; then
    echo "Codex failed. Worktree kept at: $WORKTREE_DIR" >&2
    exit 1
  fi

  if git -C "$WORKTREE_DIR" diff --quiet && git -C "$WORKTREE_DIR" diff --cached --quiet; then
    echo "Ralph produced no changes; stopping."
    exit 1
  fi

  TODO_AFTER="$(grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" | wc -l | tr -d " ")"
  if ((TODO_AFTER >= TODO_BEFORE)); then
    echo "Ralph changed files but did not complete a TODO task; stopping without commit or PR." >&2
    echo "Worktree kept at: $WORKTREE_DIR" >&2
    exit 1
  fi

  git -C "$WORKTREE_DIR" add -A
  git -C "$WORKTREE_DIR" commit -m "chore(ralph): complete task $iteration"
  git -C "$WORKTREE_DIR" push -u origin "$BRANCH"

  if [[ -z "$PR_URL" ]]; then
    PR_URL="$(gh pr create \
      --repo "$(gh repo view --json nameWithOwner --jq .nameWithOwner)" \
      --head "$BRANCH" \
      --base "$(git -C "$ROOT_DIR" branch --show-current)" \
      --draft \
      --title "Ralph task run $RUN_ID" \
      --body "Automated Ralph task run. Task limit: $TASK_LIMIT.")"
    echo "Draft PR: $PR_URL"
  fi

  echo "Iteration complete."
  sleep 2
done
