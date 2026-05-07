# Plan: Create Release Smoke Test And Operational Checklist

## Phases

1. Tracer: create smoke-test doc with auth, create, feed, public route.
2. Expand checklist across upload/edit/search/practice/list/sessions/migration.
3. Add production environment checklist for Convex, Clerk, GCS, worker, env vars.
4. Add operations checklist for logs, failures, migration counts, monitoring.

## Files

- `docs/release-smoke-test.md`
- `docs/production-environment.md`
- `docs/operations.md`

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test -- --run`
- Manual deployed preview smoke run.

## Commit Message

`docs: add release readiness checklist`

## Unresolved Questions

- Which preview environment should be the release smoke-test target?
