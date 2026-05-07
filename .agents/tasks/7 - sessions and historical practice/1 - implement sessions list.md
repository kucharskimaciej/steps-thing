# Task 1: Implement Sessions List

Read `tasks/7 - sessions and historical practice/context.md` first.

## Goal

Build `/sessions` with saved sessions and historical practice groups.

## Implementation

1. Create `/sessions` page.
2. Query owned practice sessions.
3. Add `Add session` button.
4. `Add session` calls `createPracticeSession` with defaults:
   - `locked: false`
   - `steps: []`
   - `name: Practice {dd MMM}`
5. Render saved sessions as cards:
   - Session name.
   - Number of selected steps.
   - Link to `/sessions/[sessionId]`.
6. Query historical practice days from step practice records.
7. Render historical practice cards:
   - Date label.
   - Count of unique practiced steps.
   - Link to `/historical-sessions/[startOfDay]`.
8. Sort saved sessions and historical days newest first.

## Suggested Files

- Create `app/(authenticated)/sessions/page.tsx`.
- Create `components/sessions/session-card.tsx`.
- Create `components/sessions/sessions-list.tsx`.
- Create `components/sessions/historical-session-card.tsx`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Add session creates a session with default name.
- Saved sessions show step counts.
- Historical practice days appear from practice records.
- Links navigate to detail pages.

## Acceptance Criteria

- `/sessions` no longer renders a placeholder.
- Both saved and historical session workflows are discoverable.

