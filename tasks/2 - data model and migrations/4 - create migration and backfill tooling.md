# Task 4: Create Migration And Backfill Tooling

Read `tasks/2 - data model and migrations/context.md` first.

## Goal

Provide repeatable tooling to import or transform legacy Firebase-shaped data into the new Convex-shaped data.

## Implementation

1. Create a migration input format for exported legacy steps and practice sessions.
2. Map legacy snake_case fields to camelCase:
   - `owner_uid` to `ownerId`
   - `created_at` to `createdAt`
   - `updated_at` to `updatedAt`
   - `last_viewed_at` to `lastViewedAt`
   - `practice_records` to `practiceRecords`
   - `view_records` to `viewRecords`
   - `smart_tags` to `smartTags`
   - `removed_smart_tags` to `removedSmartTags`
   - `snapshot_url` to `snapshotUrl`
   - `thumbnail_url` to `thumbnailUrl`
3. Backfill missing `kind` to `step`.
4. Convert legacy `dance` into `feeling` if present.
5. For practice records without `start_of_day`, set `startOfDay` from `date`.
6. Enqueue or mark videos missing processed metadata.
7. Add admin-only backfill commands for:
   - Refresh smart tags.
   - Recreate thumbnails by clearing generated image fields and enqueueing processing.
   - Recompute tokens.
8. Produce a dry-run mode that reports counts without writing.

## Suggested Files

- Create `scripts/migrate-legacy/README.md`.
- Create `scripts/migrate-legacy/parseLegacyExport.ts`.
- Create `scripts/migrate-legacy/mapLegacyStep.ts`.
- Create `scripts/migrate-legacy/mapLegacySession.ts`.
- Create `scripts/migrate-legacy/runImport.ts`.
- Create `convex/adminBackfills.ts`.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test -- --run
```

Required tests:

- Mapping a complete legacy step preserves all values under new names.
- Missing `kind` becomes `step`.
- Legacy `dance` maps to `feeling`.
- Missing `start_of_day` is derived from `date`.
- Video `snapshot_url` and `thumbnail_url` map into camelCase fields.
- Dry run reports counts and performs no writes.

## Acceptance Criteria

- Migration can be tested without production credentials.
- Backfills are explicit admin operations.
- Import logic is deterministic and documented.

