# Progress Log
Started: Thu May  7 13:09:57 CEST 2026

## Codebase Patterns
- (add reusable patterns here)

---

## [2026-05-07 20:25 CEST] - S03-02-implement-video-processing-pipeline: Implement Video Processing Pipeline
Thread:
Run: 20260507-200253-24281 (iteration 2)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-2.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 0078aa8 feat(video): add processing pipeline
- Post-commit status: `.ralph/runs/run-20260507-200253-24281-iter-2.log` modified before progress commit
- Verification:
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> PASS
- Files changed:
  - convex/videoProcessing.ts
  - convex/videoProcessingActions.ts
  - workers/video-processing/processVideo.ts
  - lib/video/gcs.ts
  - lib/video/processing-status.ts
  - lib/video/storage-key.ts
  - convex/steps.ts
  - convex/adminBackfills.ts
  - convex/schema.ts
  - convex/model/steps.ts
  - convex/model/validators.ts
  - convex/videoStorageActions.ts
  - convex/_generated/api.d.ts
  - tests/video/processing-status.test.ts
  - tests/convex-schema.test.ts
  - tests/convex-owner-apis.test.ts
  - .ralph/activity.log
  - .ralph/runs/run-20260507-200253-24281-iter-2.log
- What was implemented
  Owner-scoped video processing jobs; create/update scheduling for incomplete videos; retry and admin backfill enqueue paths; GCS signed read/write helpers; ffmpeg worker for dimensions, 50% snapshot, and 256px thumbnail; idempotent metadata patching for matching videos only.
- **Learnings for future iterations:**
  - Patterns discovered: keep pure video-processing metadata rules in `lib/video/processing-status.ts` so Convex mutations and tests share the same idempotency logic.
  - Gotchas encountered: Node fetch typings reject raw `Buffer` bodies; Blob wrapping keeps uploads type-safe.
  - Useful context: runtime processing needs `ffmpeg` and `ffprobe` available plus `GCS_BUCKET_NAME`, `GCS_CLIENT_EMAIL`, and escaped-newline `GCS_PRIVATE_KEY`.
---

## [2026-05-07 20:16:17 +0200] - S03-01-implement-video-hashing-upload-and-duplicate-detection: Implement Video Hashing, Upload, And Duplicate Detection
Thread:
Run: 20260507-200253-24281 (iteration 1)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-1.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 2818db4 feat(video): add upload hashing flow
- Post-commit status: clean after final progress commit
- Verification:
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> PASS
  - Command: dev-browser `/video-upload-harness` temporary route -> PASS
- Files changed:
  - .env.example
  - app/(authenticated)/steps/new/page.tsx
  - components/video/step-video-upload-field.tsx
  - components/video/video-upload-input.tsx
  - convex/_generated/api.d.ts
  - convex/videoStorage.ts
  - convex/videoStorageActions.ts
  - lib/video/hash-file.ts
  - lib/video/storage-client.ts
  - lib/video/storage-key.ts
  - tests/video/hash-file.test.ts
  - tests/video/storage-client.test.ts
  - tests/video/video-upload-input.test.tsx
- What was implemented
  Sampled 512 KiB chunk hashing, same-form duplicate prevention, owner-scoped existing-hash lookup, signed GCS upload URL action, owner-scoped storage keys, reusable video upload field on create step, and helper/component tests.
- **Learnings for future iterations:**
  - Patterns discovered: keep hashing and upload decision helpers framework-free; wire Convex only in the field component.
  - Gotchas encountered: protected `/steps/new` could not render in standalone browser because local Clerk keys cause a redirect loop; temporary public harness verified the upload control.
  - Useful context: signed upload env needs `GCS_BUCKET_NAME`, `GCS_CLIENT_EMAIL`, and escaped-newline `GCS_PRIVATE_KEY`.
---

## [2026-05-07 19:55:08 +0200] - S02-04-create-migration-and-backfill-tooling: Create Migration And Backfill Tooling
Thread:
Run: 20260507-194102-61024 (iteration 1)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-194102-61024-iter-1.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-194102-61024-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 045ec04 feat(migration): add backup import tooling
- Post-commit status: clean after final progress commit
- Verification:
  - Command: `pnpm migration:audit` -> PASS
  - Command: `pnpm migration:import` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> PASS
- Files changed:
  - scripts/migrate-backup/README.md
  - scripts/migrate-backup/readFirestoreValue.ts
  - scripts/migrate-backup/auditBackup.ts
  - scripts/migrate-backup/mapBackupStep.ts
  - scripts/migrate-backup/mapBackupSession.ts
  - scripts/migrate-backup/importBackupToConvex.ts
  - scripts/migrate-backup/types.ts
  - convex/adminAuth.ts
  - convex/adminImport.ts
  - convex/adminBackfills.ts
  - convex/schema.ts
  - convex/model/validators.ts
  - tests/migration/backup-migration.test.ts
  - tests/convex-schema.test.ts
  - package.json
  - pnpm-lock.yaml
  - AGENTS.md
- What was implemented
  Backup audit, recursive Firestore value reader, deterministic legacy-to-camelCase mappers, dry-run/write import CLI, schema legacy IDs, admin-only upsert import mutation, explicit admin backfills for smart tags/thumbnails/tokens, docs, and migration tests.
- **Learnings for future iterations:**
  - Patterns discovered: keep backup parsing framework-free so audit/mapping tests run without Convex credentials.
  - Gotchas encountered: root Firestore documents are plain objects with wrapped child fields, not wrapped root objects.
  - Useful context: write mode needs `STEPS_ADMIN_USER_IDS`, `CONVEX_ADMIN_TOKEN`, `CONVEX_ADMIN_USER_ID`, and `--write`; dry-run performs no mutation calls.
---

## [2026-05-07 13:16:43 +0200] - S02-03-implement-owner-scoped-queries-and-mutations: Implement Owner-Scoped Queries And Mutations
Thread:
Run: 20260507-130957-33268 (iteration 1)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-130957-33268-iter-1.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-130957-33268-iter-1.md
- Guardrails reviewed: yes
- No-commit run: true
- Commit: none - no-commit run
- Post-commit status: `M convex/model/validators.ts`, `M vitest.config.mts`, `?? .agents/tasks/prd.json`, `?? .ralph/`, `?? convex/auth.ts`, `?? convex/model/practiceSessions.ts`, `?? convex/model/steps.ts`, `?? convex/practiceSessions.ts`, `?? convex/steps.ts`, `?? tests/convex-owner-apis.test.ts`
- Verification:
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> PASS
- Files changed:
  - convex/auth.ts
  - convex/model/practiceSessions.ts
  - convex/model/steps.ts
  - convex/model/validators.ts
  - convex/practiceSessions.ts
  - convex/steps.ts
  - tests/convex-owner-apis.test.ts
  - vitest.config.mts
  - .ralph/activity.log
  - .ralph/progress.md
- What was implemented
  Owner-scoped Convex auth helper, step queries/mutations, practice session queries/mutations, lock checks, identifier allocation, idempotent practice/session step handling, public step read without ownerId exposure, and focused model/auth tests.
- **Learnings for future iterations:**
  - Patterns discovered: keep Convex entry points thin and put behavior in `convex/model/*` helpers for unit coverage.
  - Gotchas encountered: `pnpm test -- --run` discovers nested `.codex` skill tests unless Vitest excludes `.codex`.
  - Useful context: `pnpm build` rewrites `next-env.d.ts` between dev/build route type imports; reverted generated churn after build validation.
---
