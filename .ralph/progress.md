# Progress Log
Started: Thu May  7 13:09:57 CEST 2026

## Codebase Patterns
- (add reusable patterns here)

---

## [2026-05-07 20:37:41 CEST] - S03-03-build-video-player-and-modal: Build Video Player And Modal
Thread:
Run: 20260507-200253-24281 (iteration 3)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-3.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-200253-24281-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 492ebf3 feat(video): add reusable player
- Post-commit status: clean after final progress commit
- Verification:
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `dev-browser temporary route check at http://localhost:3001/video-player-check` -> PASS
  - Command: `pnpm exec biome format components/video/aspect-aware-video.tsx components/video/video-controls.tsx components/video/video-modal.tsx components/video/video-player.tsx components/video/video-progress.tsx tests/components/video-player.test.tsx` -> PASS
  - Command: `pnpm format:check` -> FAIL (pre-existing formatter drift outside story files)
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> SKIPPED (no Convex schema/functions changed)
- Files changed:
  - .agents/tasks/prd.json
  - .ralph/activity.log
  - .ralph/progress.md
  - .ralph/.tmp/prompt-20260507-200253-24281-3.md
  - .ralph/.tmp/story-20260507-200253-24281-3.json
  - .ralph/.tmp/story-20260507-200253-24281-3.md
  - .ralph/runs/run-20260507-200253-24281-iter-3.log
  - components/video/aspect-aware-video.tsx
  - components/video/video-controls.tsx
  - components/video/video-modal.tsx
  - components/video/video-player.tsx
  - components/video/video-progress.tsx
  - tests/components/video-player.test.tsx
- What was implemented
  Reusable looped muted video player, center play/pause overlay, accessible mute/full-size/seek/restart/slow-motion controls, progress bar, 80% viewed callback with <10% reset, blurred snapshot background, borderless full-size modal, visible autoplay behavior, and aspect-aware rotation for landscape video on narrow portrait clients.
- **Learnings for future iterations:**
  - Patterns discovered: keep player state local and expose `onViewed`, `videoUrl`, `snapshotUrl`, dimensions, autoplay, and full-size flags for feed/public/session reuse.
  - Gotchas encountered: rapid `timeupdate` events can beat React state, so viewed tracking needs a ref latch.
  - Useful context: browser verification used a temporary Next route that was removed before commit; `format:check` still fails on unrelated pre-existing files, but new story files pass targeted Biome formatting.
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

## [2026-05-07 21:06:08 +0200] - S04-01-build-step-form-validation-and-smart-tags: Build Step Form Validation And Smart Tags
Thread:
Run: 20260507-205447-62953 (iteration 1)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-205447-62953-iter-1.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-205447-62953-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 71a4d85 feat(steps): add shared step form
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm test tests/components/step-form.test.tsx -- --run` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `dev-browser http://localhost:3001/step-form-preview temporary route` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> SKIP, no Convex schema/functions changed
- Files changed:
  - app/(authenticated)/steps/new/page.tsx
  - components/forms/checklist.tsx
  - components/forms/select.tsx
  - components/forms/tags-input.tsx
  - components/steps/step-form.tsx
  - components/steps/step-form-with-user-data.tsx
  - lib/steps/step-form-defaults.ts
  - lib/steps/step-form-schema.ts
  - tests/components/step-form.test.tsx
  - .ralph/activity.log
  - .ralph/progress.md
- What was implemented
  Shared step form defaults, validation, duplicate video checks, debounced token/smart-tag derivation, removed smart-tag restore flow, controlled smart-tag UI, tag/artist autocomplete from existing user data, and create-page wiring.
- **Learnings for future iterations:**
  - Patterns discovered: keep form validation and smart-tag derivation pure so tests do not need Convex or Clerk.
  - Gotchas encountered: authenticated step routes block direct browser form verification; temporary local preview route used and removed.
  - Useful context: current Convex video shape uses `storageKey`; form validates `hash` plus `storageKey` while matching mutation input.
---

## [2026-05-07 21:17:12 +0200] - S04-02-implement-create-step-page: Implement Create Step Page
Thread:
Run: 20260507-205447-62953 (iteration 2)
Run log: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-205447-62953-iter-2.log
Run summary: /Users/maciejkucharski/work/steps-thing/.ralph/runs/run-20260507-205447-62953-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: e465728 feat(steps): implement create step page
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm test -- --run` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CI=1 pnpm exec convex dev --once --tail-logs disable` -> PASS
  - Command: `dev-browser http://localhost:3001/steps/new` -> PASS, protected route redirected to sign-in without app crash; create workflow verified by component tests
- Files changed:
  - app/(authenticated)/steps/new/page.tsx
  - components/steps/create-step-workflow.tsx
  - components/steps/step-form.tsx
  - components/steps/step-form-with-user-data.tsx
  - components/steps/variation-candidate-list.tsx
  - components/steps/variation-toggle.tsx
  - convex/model/validators.ts
  - convex/steps.ts
  - tests/components/create-step-page.test.tsx
  - tests/components/step-form.test.tsx
  - .ralph/activity.log
  - .ralph/progress.md
- What was implemented
  Authenticated create workflow at `/steps/new`, split layout, top save actions, upload-enabled shared form, existing tags/artists queries, candidate ranking from live form data, variation group selection, create persistence, server-side variation group merge, and save-and-create-another preservation/reset behavior.
- **Learnings for future iterations:**
  - Patterns discovered: create/edit form orchestration works best with a shared form plus thin workflow components for routing/mutations.
  - Gotchas encountered: upload field owns local video state, so form reset must remount it with `resetSignal`.
  - Useful context: protected `/steps/new` redirects to Clerk sign-in in browser tests without credentials; component tests cover the authed workflow with mocked Convex boundaries.
---
