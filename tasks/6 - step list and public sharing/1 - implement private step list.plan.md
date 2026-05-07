# Plan: Implement Private Step List

## Phases

1. Tracer: `/steps` lists owned steps newest first.
2. Add dense row/card fields: identifier, name, tags, notes, dates.
3. Add edit, video buttons, variation links.
4. Add visible shortlink copy and selected-state support.

## Files

- `app/(authenticated)/steps/page.tsx`
- `components/steps/step-list.tsx`
- `components/steps/step-list-item.tsx`
- `components/common/copy-to-clipboard.tsx`
- `lib/dates/relative-date.ts`
- `tests/components/step-list.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual list/edit/copy/video checks.

## Commit Message

`feat(steps): implement private list`

## Unresolved Questions

- Should notes be fully visible or collapsed in dense list?
