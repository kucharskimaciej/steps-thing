# Operations Checklist

## Purpose

Use this checklist to confirm production failures are observable and release operators know which checks to run during cutover. The intent is to catch auth, migration, video processing, and runtime errors early enough to stop or roll back.

## Automated Evidence

- [ ] Unit/domain tests passed: `pnpm test -- --run`.
- [ ] TypeScript passed: `pnpm typecheck`.
- [ ] Lint passed: `pnpm lint`.
- [ ] App build passed for runtime-impacting changes: `pnpm build`.
- [ ] Convex validation passed after schema/function changes: `CI=1 pnpm exec convex dev --once --tail-logs disable`.

## Video Processing Observability

- [ ] Failed processing logs include step ID, video hash, and error message from `videoProcessingActions.processStepVideos`.
- [ ] `videoProcessingJobs` records reach `succeeded` or `failed`; skipped videos do not create duplicate running jobs.
- [ ] Retry path is documented for a failed job: fix root cause, then call the retry/backfill mutation for the affected step or use `adminBackfills:recreateThumbnails` for a bounded batch.
- [ ] Backfill runs use a small `limit` first, then expand only after logs show expected scanned/updated counts.
- [ ] Operator can find generated object keys in GCS for original, snapshot, and thumbnail media.

## Migration Observability

- [ ] `pnpm migration:audit` reports source backup counts before import.
- [ ] `pnpm migration:import` dry run reports mapped steps, sessions, skipped/invalid records, and validation errors without Convex writes.
- [ ] Write mode is explicit: `pnpm migration:import -- --write`.
- [ ] `adminImport:importBackupBatch` returns step/session counts per batch.
- [ ] Migration logs are captured with backup path, release commit, operator, start/end time, and final counts.
- [ ] Duplicate `legacyId` errors are treated as blockers until resolved.

## Auth And Access Observability

- [ ] Clerk dashboard shows sign-in success/failure rates during smoke testing and cutover.
- [ ] Convex logs show `Authentication required` and `Admin authorization required` errors when intentionally testing denied access.
- [ ] Cross-owner access attempts are denied without returning private fields.
- [ ] Public `/s/[stepId]` failures are distinguishable from private auth failures.
- [ ] Production monitoring captures server-side auth errors with route/function context and without secrets.

## Production Error Monitoring

- [ ] A monitoring tool is selected and enabled for the production Next.js app.
- [ ] Client runtime errors are captured with release commit and environment.
- [ ] Server/render errors are captured with route context.
- [ ] Convex function/action failures are captured through Convex logs or the chosen monitoring export.
- [ ] Alert recipients and escalation path are documented for cutover day.
- [ ] Secrets, signed URLs, private keys, and auth tokens are scrubbed from logs.

## Cutover Watch

- [ ] Start watch window before migration write mode.
- [ ] Watch Clerk auth errors.
- [ ] Watch Convex function errors and mutation latency.
- [ ] Watch video processing failures and job counts.
- [ ] Watch GCS 4xx/5xx errors for signed upload/read paths.
- [ ] Run one signed-out public route check after migration.
- [ ] Run one signed-in create/edit/feed/session check after migration.
- [ ] Record final go/no-go decision with smoke-test result links.
