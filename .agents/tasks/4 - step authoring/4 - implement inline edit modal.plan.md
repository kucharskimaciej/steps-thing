# Plan: Implement Inline Edit Modal

## Phases

1. Tracer: feed opens modal for a step ID and closes on cancel.
2. Render shared form with loaded step.
3. Add top-20 ranked variation sidebar.
4. Save via `updateStep`; refresh feed state; add accessibility tests.

## Files

- `components/steps/inline-step-edit-modal.tsx`
- `components/steps/use-inline-step-edit.tsx`
- `components/steps/step-form.tsx`
- `components/steps/variation-candidate-list.tsx`
- `tests/components/inline-step-edit-modal.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual open/save/cancel checks from feed.

## Commit Message

`feat(steps): add inline edit modal`

## Unresolved Questions

- Should modal preserve feed scroll/playback state after save?
