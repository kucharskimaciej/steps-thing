# Plan: Implement Historical Session Detail

## Phases

1. Tracer: route parses `startOfDay` and renders empty/invalid state.
2. Add owner-scoped query for practiced steps on local day.
3. Deduplicate steps and render shared feed.
4. Add tests for invalid params, dedupe, owner isolation.

## Files

- `app/(authenticated)/historical-sessions/[startOfDay]/page.tsx`
- `components/sessions/historical-session-feed.tsx`
- `convex/steps.ts`
- `tests/components/historical-session.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual historical route check.

## Commit Message

`feat(sessions): add historical practice feed`

## Unresolved Questions

- Should invalid `startOfDay` show 404 or inline invalid state?
