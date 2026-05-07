# Task 4: Create Migration And Backfill Tooling

Read `tasks/2 - data model and migrations/context.md` first.

## Goal

Provide repeatable tooling to import the checked-in backup at `backups/database.20260507-110251` into Convex.

## Implementation

1. Treat `backups/database.20260507-110251` as the canonical current backup:
   - `steps/*.json`: 203 Firestore-export-shaped step documents.
   - `practice-sessions/*.json`: 2 Firestore-export-shaped session documents.
   - Each field is wrapped as `{ "value": ..., "type": ... }`; unwrap recursively before mapping.
2. Create a backup audit script that reads the backup without Convex credentials and reports:
   - Counts for steps, sessions, videos, practice records, and view records.
   - Missing required fields.
   - Unknown fields.
   - Distinct `kind`, `difficulty`, `feeling`, `tags`, `smart_tags`, and `removed_smart_tags`.
   - Domain mismatches against `lib/domain/config.ts`.
3. Enforce the supported-value policy before import:
   - `kind` must match `step | inspiration | routine`.
   - `difficulty` must match `1 | 2 | 3 | 5 | 8`.
   - `feeling` must match `doucer | fusion | kizomba | semba | tarraxa | urban`.
   - `smart_tags` and `removed_smart_tags` must match supported smart tag names from config.
   - User-authored `tags` and `artists` are open vocabulary; report them but do not reject them.
4. Seed the audit with backup-observed constrained values:
   - `kind`: `inspiration`, `routine`, `step`.
   - `difficulty`: `1`, `2`, `3`, `5`, `8`.
   - `feeling`: `doucer`, `fusion`, `kizomba`, `semba`, `tarraxa`, `urban`.
   - Observed `smart_tags`: `Cross`, `Cyrkiel`, `Footwork`, `Grande-saida`, `Izolacja`, `Monkey Virgula`, `Napasada`, `Obrót`, `Odwrotne trzymanie`, `Otwarcie`, `Pivot`, `Podcięcie`, `Podniesienie nogi`, `Położenie`, `Przed partnerką`, `Przesunięcie nogi`, `Saida francuska`, `Shadow position`, `Skorpion`, `Slide`, `Tep`, `Virgula`, `Wypuszczenie`, `Wyrzucenie ręki`, `Za partnerką`, `Zatrzymanie`.
   - Observed `removed_smart_tags`: `Podniesienie nogi`, `Wyrzucenie ręki`.
5. Map legacy snake_case fields to camelCase:
   - `owner_uid` to `ownerId`
   - `created_at` to `createdAt`
   - `updated_at` to `updatedAt`
   - `last_viewed_at` to `lastViewedAt`
   - `practice_records` to `practiceRecords`
   - `view_records` to `viewRecords`
   - `smart_tags` to `smartTags`
   - `removed_smart_tags` to `removedSmartTags`
   - `snapshot_url` to `snapshotStorageKey`
   - `thumbnail_url` to `thumbnailStorageKey`
6. Map video `url` to `storageKey` by extracting the decoded Firebase object path, for example `videos/<owner_uid>/<hash>`.
7. Backfill missing `updatedAt` from `createdAt`; the current backup has no `updated_at`.
8. Backfill missing `kind` to `step`.
9. Ignore legacy `dance` when its value is null; convert to `feeling` only if a non-null legacy value appears.
10. For practice records without `start_of_day`, set `startOfDay` from `date`.
11. Create a Convex import mutation and CLI script that pushes the mapped backup data into Convex:
    - Default to dry-run.
    - Require an explicit write flag for mutation calls.
    - Import by stable legacy document ID for idempotency, or fail clearly if schema support is missing.
    - Batch writes to avoid Convex limits.
12. Enqueue or mark videos missing processed metadata.
13. Add admin-only backfill commands for:
   - Refresh smart tags.
   - Recreate thumbnails by clearing generated image fields and enqueueing processing.
   - Recompute tokens.
14. Produce a dry-run mode that reports counts without writing.

## Suggested Files

- Create `scripts/migrate-backup/README.md`.
- Create `scripts/migrate-backup/readFirestoreValue.ts`.
- Create `scripts/migrate-backup/auditBackup.ts`.
- Create `scripts/migrate-backup/mapBackupStep.ts`.
- Create `scripts/migrate-backup/mapBackupSession.ts`.
- Create `scripts/migrate-backup/importBackupToConvex.ts`.
- Create `convex/adminImport.ts`.
- Create `convex/adminBackfills.ts`.
- Modify `package.json` if a TypeScript script runner or migration npm scripts are needed.

## Verification

Run:

```bash
pnpm typecheck
pnpm lint
pnpm test -- --run
```

Required tests:

- Backup audit reports 203 steps and 2 sessions.
- Backup audit fails on unsupported constrained values.
- Backup audit confirms observed constrained backup values match domain config.
- Mapping a complete backup step preserves all values under new names.
- Missing `kind` becomes `step`.
- Missing `updated_at` maps `updatedAt` from `createdAt`.
- Legacy null `dance` is ignored.
- Missing `start_of_day` is derived from `date`.
- Video `url`, `snapshot_url`, and `thumbnail_url` map into object-key fields.
- Dry run reports counts and performs no writes.
- Write mode pushes steps and sessions to Convex through an explicit admin import mutation.

## Acceptance Criteria

- Migration audit and mapping can be tested without production credentials.
- Write mode can push the current backup into a configured Convex deployment.
- Supported `kind`, `difficulty`, `feeling`, and smart tag names match the current backup before writes.
- Backfills are explicit admin operations.
- Import logic is deterministic and documented.
