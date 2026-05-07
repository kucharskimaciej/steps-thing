# Task 4: Implement Inline Edit Modal

Read `tasks/4 - step authoring/context.md` first.

## Goal

Allow editing a step from the feed without leaving the feed page.

## Implementation

1. Create an inline edit provider or hook that opens a borderless modal for a step ID.
2. Render the shared step form inside the modal.
3. Render a right sidebar with the top 20 similarity-ranked candidates, excluding the edited step.
4. Show each candidate's score.
5. Allow toggling variation groups.
6. On save:
   - Validate.
   - Call `updateStep`.
   - Close modal on success.
7. On cancel/close, leave data unchanged.

## Suggested Files

- Create `components/steps/inline-step-edit-modal.tsx`.
- Create `components/steps/use-inline-step-edit.tsx` if useful.
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

- Feed options menu opens inline edit.
- Save updates the feed card and closes the modal.
- Closing without saving leaves the step unchanged.
- Candidate list shows no more than 20 items and excludes the edited step.

## Acceptance Criteria

- Inline edit produces the same persisted data as full edit.
- Modal is keyboard and pointer accessible.

