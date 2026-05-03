# Task 3: Implement Edit Step Page

Read `tasks/4 - step authoring/context.md` first.

## Goal

Build the full-page step editing workflow.

## Implementation

1. Create page at `/steps/[stepId]/edit`.
2. Load the step by ID using an owner-scoped query.
3. Render the shared form initialized with existing values.
4. Initialize selected variation groups to the current step's `variationKey`.
5. Render sidebar candidates ranked by similarity to form data.
6. Allow selecting/deselecting variation groups.
7. On save:
   - Validate form.
   - Call `updateStep`.
   - Generate/assign fresh variation key server-side.
   - Merge selected variation groups.
   - Update `updatedAt`.
   - Navigate to `/steps`.
8. Handle missing or unauthorized step with a not-found or access-denied state.

## Suggested Files

- Create `app/(authenticated)/steps/[stepId]/edit/page.tsx`.
- Reuse `components/steps/step-form.tsx`.
- Reuse `components/steps/variation-candidate-list.tsx`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Existing step values populate the form.
- Saving updates the step.
- Variation selection changes the variation group.
- Unauthorized step IDs do not leak data.

## Acceptance Criteria

- Full edit and create share validation behavior.
- Server-side ownership is enforced.
- Updated step appears in feed/list without stale data.

