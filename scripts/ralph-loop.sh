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
LOG_FILE="$ROOT_DIR/ralph-$RUN_ID.log"
PR_URL=""

exec > >(tee -a "$LOG_FILE") 2>&1

fail() {
  echo "Ralph failed: $1" >&2
  echo "Run log: $LOG_FILE" >&2
  echo "Worktree kept at: $WORKTREE_DIR" >&2
  exit 1
}

echo "Ralph run: $RUN_ID"
echo "Log: $LOG_FILE"
echo "Branch: $BRANCH"
echo "Worktree: $WORKTREE_DIR"

git worktree add -b "$BRANCH" "$WORKTREE_DIR"

for ((iteration = 1; iteration <= TASK_LIMIT; iteration++)); do
  if ! grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" >/dev/null 2>&1; then
    echo "No TODO tasks left."
    exit 0
  fi

  TODO_BEFORE="$(grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" | wc -l | tr -d " ")"

  echo "Starting Ralph iteration $iteration/$TASK_LIMIT."
  if ! codex exec --sandbox workspace-write --cd "$WORKTREE_DIR" "$(cat "$ROOT_DIR/tasks/RALPH_PROMPT.md")"; then
    fail "codex exec exited non-zero during iteration $iteration"
  fi

  if [[ -z "$(git -C "$WORKTREE_DIR" status --porcelain)" ]]; then
    fail "codex produced no file changes during iteration $iteration"
  fi

  TODO_AFTER="$(grep -F -- "- [ ]" "$WORKTREE_DIR/TODO.md" | wc -l | tr -d " ")"
  if ((TODO_AFTER >= TODO_BEFORE)); then
    git -C "$WORKTREE_DIR" status --short
    git -C "$WORKTREE_DIR" diff --stat
    fail "codex changed files but did not complete a TODO task during iteration $iteration"
  fi

  git -C "$WORKTREE_DIR" add -A
  if ! git -C "$WORKTREE_DIR" commit -m "chore(ralph): complete task $iteration"; then
    fail "git commit failed during iteration $iteration"
  fi

  if ! git -C "$WORKTREE_DIR" push -u origin "$BRANCH"; then
    fail "git push failed for $BRANCH during iteration $iteration"
  fi

  if [[ -z "$PR_URL" ]]; then
    if ! PR_URL="$(gh pr create \
      --repo "$(gh repo view --json nameWithOwner --jq .nameWithOwner)" \
      --head "$BRANCH" \
      --base "$(git -C "$ROOT_DIR" branch --show-current)" \
      --draft \
      --title "Ralph task run $RUN_ID" \
      --body "Automated Ralph task run. Task limit: $TASK_LIMIT.")"; then
      fail "draft PR creation failed for $BRANCH"
    fi
    echo "Draft PR: $PR_URL"
  fi

  echo "Iteration complete."
  sleep 2
done
