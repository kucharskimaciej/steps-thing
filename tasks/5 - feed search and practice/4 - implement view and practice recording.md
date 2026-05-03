# Task 4: Implement View And Practice Recording

Read `tasks/5 - feed search and practice/context.md` first.

## Goal

Connect feed/player events to Convex mutations for view and practice records.

## Implementation

1. Maintain an in-memory set of step IDs viewed during the current app load.
2. When video player emits `viewed`, call `recordStepView` unless step ID is already in the in-memory set.
3. `recordStepView` prepends current timestamp to `viewRecords` and updates `updatedAt`.
4. Build practice action component:
   - If already practiced today for the same optional collection ID, show practiced state.
   - Otherwise show practice action.
5. On click, call `recordPractice`.
6. `recordPractice` prepends record with:
   - `date`
   - `startOfDay`
   - optional `collectionId`
7. Prevent duplicate same-day records server-side.
8. Optimistically update UI if the data library supports it safely.

## Suggested Files

- Create `components/practice/record-practice-button.tsx`.
- Create `lib/practice/has-recorded-practice.ts`.
- Modify `components/feed/feed-step-card.tsx`.
- Modify `convex/steps.ts`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Playing past 80% records one view.
- Replaying the same step in one app load does not add another view.
- Practice button records today's practice.
- Clicking practiced state does not create a duplicate record.
- Session-specific collection ID records independently from general practice.

## Acceptance Criteria

- Duplicate prevention exists client-side for views and server-side for practice.
- Feed action state updates after mutations.

