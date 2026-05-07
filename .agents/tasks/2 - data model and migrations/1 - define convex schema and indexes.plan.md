# Plan: Define Convex Schema And Indexes

## Phases

1. Tracer: add minimal `steps` + `practiceSessions` schema, owner indexes, Convex validates.
2. Expand validators: video, practice/view records, difficulty, kind, timestamps, GCS object keys.
3. Add feed/session/migration indexes; export inferred/shared types only if needed.
4. Tighten tests/imports.

## Files

- `convex/schema.ts`
- `convex/model/validators.ts`
- `convex/model/types.ts`
- `tests/convex-schema.test.ts`

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `npx convex dev --once`

## Commit Message

`feat(convex): define step and session schema`

## Unresolved Questions

- Should `videoHash` be denormalized for indexing, or is owner query scan acceptable?
