# Plan: Implement Edit Step Page

## Phases

1. Tracer: `/steps/[stepId]/edit` loads owned step into shared form.
2. Add save mutation and navigation.
3. Add variation candidate sidebar initialized from current variation key.
4. Add not-found/access-denied state and tests.

## Files

- `app/(authenticated)/steps/[stepId]/edit/page.tsx`
- `components/steps/step-form.tsx`
- `components/steps/variation-candidate-list.tsx`
- `tests/components/edit-step-page.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual edit/unauthorized checks.

## Commit Message

`feat(steps): implement edit page`

## Unresolved Questions

- Should save return to `/steps`, `/feed`, or previous route?
