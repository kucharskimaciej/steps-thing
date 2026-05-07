# Plan: Perform Security And Access Review

## Phases

1. Tracer: document current auth model and one owner-isolation proof.
2. Review Convex private/public API field exposure.
3. Review GCS object keys, signed upload/read URL boundaries.
4. Add missing tests/fixes discovered by review.
5. Finalize security note.

## Files

- `docs/security-access-model.md`
- `convex/*`
- `lib/video/*`
- `tests/convex/*`
- `tests/security/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual User A/User B and signed-out checks.

## Commit Message

`docs: document access model`

## Unresolved Questions

- Which monitoring/logging system should be referenced for auth/storage failures?
