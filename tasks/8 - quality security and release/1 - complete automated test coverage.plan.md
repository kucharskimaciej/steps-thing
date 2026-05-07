# Plan: Complete Automated Test Coverage

## Phases

1. Tracer: add one missing high-value domain test and ensure suite shape.
2. Fill domain algorithm tests.
3. Fill Convex auth/owner/mutation tests.
4. Fill critical component behavior tests.
5. Remove brittle snapshots; stabilize test utilities.

## Files

- `tests/domain/*`
- `tests/convex/*`
- `tests/components/*`
- `tests/utils/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`

## Commit Message

`test: cover critical rewrite behavior`

## Unresolved Questions

- Is a coverage threshold required, or is behavior checklist coverage enough?
