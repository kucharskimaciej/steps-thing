# Plan: Build Step Form Validation And Smart Tags

## Phases

1. Tracer: shared form submits valid minimal step shape.
2. Add validation schema, defaults, duplicate video validation.
3. Add debounced name tokens/smart tags and removed smart tags.
4. Add tag/artist autocomplete and form tests.

## Files

- `components/steps/step-form.tsx`
- `components/forms/tags-input.tsx`
- `components/forms/checklist.tsx`
- `components/forms/select.tsx`
- `lib/steps/step-form-schema.ts`
- `lib/steps/step-form-defaults.ts`
- `tests/components/step-form.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual empty/valid/duplicate form checks.

## Commit Message

`feat(steps): add shared step form`

## Unresolved Questions

- Should validation require video `url` or only `hash` + `storageKey` after GCS migration?
