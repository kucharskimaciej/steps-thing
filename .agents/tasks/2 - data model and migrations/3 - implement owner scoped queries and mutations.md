# Task 3: Implement Owner-Scoped Queries And Mutations

Read `tasks/2 - data model and migrations/context.md` first.

## Goal

Create the Convex API for listing, fetching, creating, and updating steps and sessions with strict owner checks.

## Implementation

1. Implement auth helper `requireUserId(ctx)`.
2. Implement step queries:
   - `listMySteps`
   - `getStepForEdit`
   - `getPublicStep`
   - `getExistingTagsAndArtists`
   - `getVariationCandidates`
3. Implement step mutations:
   - `createStep`
   - `updateStep`
   - `recordStepView`
   - `recordPractice`
4. Implement practice session queries:
   - `listMyPracticeSessions`
   - `getMyPracticeSession`
5. Implement practice session mutations:
   - `createPracticeSession`
   - `duplicatePracticeSession`
   - `updatePracticeSession`
   - `togglePracticeSessionLock`
   - `deletePracticeSession`
   - `addStepToSession`
   - `removeStepFromSession`
   - `clearSessionSteps`
6. Enforce:
   - Private queries and mutations require authenticated user.
   - Private records must match authenticated user.
   - Public step fetch does not require auth.
   - Locked sessions reject normal update/add/remove/clear mutations.
   - `updatedAt` is written on every update mutation.
   - `identifier` increments per user during step creation.

## Suggested Files

- Create `convex/auth.ts`.
- Create `convex/steps.ts`.
- Create `convex/practiceSessions.ts`.
- Create `convex/model/steps.ts`.
- Create `convex/model/practiceSessions.ts`.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test -- --run
```

Add tests or Convex function tests for:

- Unauthenticated private query/mutation rejection.
- User A cannot update User B step/session.
- Public step query returns a step by ID without auth.
- Step identifiers increment per owner.
- Locked session rejects step changes.
- `recordPractice` does not duplicate same-day records for the same collection ID.
- `recordStepView` prepends timestamps.

## Acceptance Criteria

- All later UI work can use these Convex APIs.
- Authorization is enforced server-side, not only in the UI.
- Mutations are idempotent where the spec requires duplicate prevention.

