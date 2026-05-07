# Plan: Implement Sessions List

## Phases

1. Tracer: `/sessions` lists owned practice sessions.
2. Add create default session button.
3. Add historical practice grouping from step records.
4. Sort both sections newest first; add tests.

## Files

- `app/(authenticated)/sessions/page.tsx`
- `components/sessions/session-card.tsx`
- `components/sessions/sessions-list.tsx`
- `components/sessions/historical-session-card.tsx`
- `tests/components/sessions-list.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual add/link/history checks.

## Commit Message

`feat(sessions): implement sessions list`

## Unresolved Questions

- Should default session name use browser locale or fixed app locale?
