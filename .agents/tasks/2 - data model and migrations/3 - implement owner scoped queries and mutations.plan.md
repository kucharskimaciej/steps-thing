# Plan: Implement Owner-Scoped Queries And Mutations

## Phases

1. Tracer: add `requireUserId`, `listMySteps`, `createStep`; prove owner scope.
2. Add step fetch/update/public/tag/variation/view/practice APIs.
3. Add practice session query/mutation APIs with lock checks.
4. Add server tests for auth, owner isolation, duplicate prevention.

## Files

- `convex/auth.ts`
- `convex/steps.ts`
- `convex/practiceSessions.ts`
- `convex/model/steps.ts`
- `convex/model/practiceSessions.ts`
- `tests/convex/*`

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test -- --run`

## Commit Message

`feat(convex): add owner scoped step APIs`

## Unresolved Questions

- Should public step read return full tags/notes or a narrowed DTO?
