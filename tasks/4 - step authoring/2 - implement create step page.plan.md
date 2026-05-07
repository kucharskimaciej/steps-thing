# Plan: Implement Create Step Page

## Phases

1. Tracer: `/steps/new` renders shared form and creates one valid step.
2. Add tags/artists/variation candidate queries.
3. Add ranked variation sidebar and merge selection.
4. Add save-and-create-another preserved fields behavior.

## Files

- `app/(authenticated)/steps/new/page.tsx`
- `components/steps/variation-candidate-list.tsx`
- `components/steps/variation-toggle.tsx`
- `components/steps/step-form.tsx`
- `tests/components/create-step-page.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual create and save-another checks.

## Commit Message

`feat(steps): implement create page`

## Unresolved Questions

- After normal save, should navigation target `/steps` or `/feed`?
