# Task 1: Complete Automated Test Coverage

Read `tasks/8 - quality security and release/context.md` first.

## Goal

Add focused automated tests for the critical behavior specified in `REWRITE_SPEC.md`.

## Implementation

1. Ensure unit tests cover:
   - Tokenization.
   - Smart tags.
   - Tag derivation.
   - Variation scoring.
   - Search filters.
   - Search sorting.
   - Practice duplicate prevention helper.
   - Date grouping.
2. Ensure server tests cover:
   - Auth required for private queries/mutations.
   - Owner isolation.
   - Public step read.
   - Step create identifier increment.
   - Step update variation merging.
   - Session lock enforcement.
   - Practice duplicate prevention.
3. Ensure component tests cover:
   - Step form validation.
   - Search overlay state changes.
   - Practice button states.
   - Copy link behavior with mocked clipboard.
   - Video player control state with mocked media element methods.

## Suggested Files

- Create or update tests under `tests/domain`.
- Create or update tests under `tests/convex`.
- Create or update tests under `tests/components`.
- Add test utilities under `tests/utils`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Expected:

- All tests pass.
- Coverage includes every behavior listed above.

## Acceptance Criteria

- Important algorithms have deterministic tests.
- Authorization rules are tested server-side.
- UI tests focus on behavior, not snapshots.

