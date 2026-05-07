# Plan: Implement View And Practice Recording

## Phases

1. Tracer: player `viewed` event calls mutation once per app load.
2. Add practice button with today-state helper.
3. Enforce server duplicate prevention for same local day + collection.
4. Add optimistic UI where reliable; test duplicate paths.

## Files

- `components/practice/record-practice-button.tsx`
- `lib/practice/has-recorded-practice.ts`
- `components/feed/feed-step-card.tsx`
- `convex/steps.ts`
- `tests/practice/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual 80% view and practice click checks.

## Commit Message

`feat(practice): record views and practice`

## Unresolved Questions

- Should view duplicate prevention persist across page reloads?
