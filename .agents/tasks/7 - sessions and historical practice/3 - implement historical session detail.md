# Task 3: Implement Historical Session Detail

Read `tasks/7 - sessions and historical practice/context.md` first.

## Goal

Build `/historical-sessions/[startOfDay]` as a feed of steps practiced on a given local day.

## Implementation

1. Create route `/historical-sessions/[startOfDay]`.
2. Parse `startOfDay` route param as number.
3. Query owned steps with practice records matching that `startOfDay`.
4. Ensure each step appears only once for the date.
5. Render the matching steps using the shared feed component.
6. Show empty state if no steps match.

## Suggested Files

- Create `app/(authenticated)/historical-sessions/[startOfDay]/page.tsx`.
- Create `components/sessions/historical-session-feed.tsx`.
- Add or reuse Convex query `getHistoricalPracticeSteps`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Historical route shows all steps practiced on that date.
- Duplicate practice records for one step/date do not duplicate feed cards.
- Invalid date param shows a not-found or invalid route state.
- User cannot see another user's practiced steps.

## Acceptance Criteria

- Historical practice route no longer renders a placeholder.
- Grouping behavior matches the spec.

