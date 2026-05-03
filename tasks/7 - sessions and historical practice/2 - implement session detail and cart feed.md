# Task 2: Implement Session Detail And Cart Feed

Read `tasks/7 - sessions and historical practice/context.md` first.

## Goal

Build `/sessions/[sessionId]` for selecting steps, viewing the active step, and practicing a session feed.

## Implementation

1. Fetch owned session by ID.
2. Fetch owned steps.
3. If session is missing or unauthorized, show not-found/access-denied state.
4. If unlocked, render two-pane layout:
   - Sidebar with all steps.
   - Main active step detail.
5. Sidebar behavior:
   - Click a step to make it active.
   - Toggle a step in/out of the session.
   - Show selected state.
   - Footer shows `{count} selected`.
   - `Clear` removes all selected steps.
   - Button opens session feed/cart modal.
6. Main behavior:
   - Show session name.
   - Show remove session action.
   - Show read-only active step.
7. Mobile behavior:
   - If session has selected steps on initial load, open the session feed/cart modal.
8. Session feed/cart modal:
   - Render only selected session steps in feed form.
   - Practice buttons pass `collectionId = sessionId`.
9. Locked session behavior:
   - Do not allow add/remove/clear.
   - Show locked state and read-only selected steps.

## Suggested Files

- Create `app/(authenticated)/sessions/[sessionId]/page.tsx`.
- Create `components/sessions/session-detail.tsx`.
- Create `components/sessions/session-step-sidebar.tsx`.
- Create `components/sessions/session-cart-modal.tsx`.
- Reuse feed and practice components.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- User can add and remove steps in an unlocked session.
- Clear empties session steps.
- Active step changes on click.
- Session feed modal shows selected steps only.
- Recording practice from modal writes `collectionId`.
- Locked session blocks mutations.
- Removing session navigates back to `/sessions`.

## Acceptance Criteria

- Session detail restores legacy intended behavior.
- Server-side lock protection cannot be bypassed by UI manipulation.

