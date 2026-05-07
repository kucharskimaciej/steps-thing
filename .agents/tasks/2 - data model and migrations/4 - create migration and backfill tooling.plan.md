# Plan: Create Backup-To-Convex Migration Tooling

## Phases

1. Tracer: unwrap one backup step, audit count = 203 steps / 2 sessions.
2. Add domain audit: constrained values vs config; report open tags/artists.
3. Add deterministic step/session mappers.
4. Add Convex admin import mutation + CLI write mode.
5. Add admin backfills for smart tags, thumbnails, tokens.
6. Document usage and tests.

## Files

- `scripts/migrate-backup/README.md`
- `scripts/migrate-backup/readFirestoreValue.ts`
- `scripts/migrate-backup/auditBackup.ts`
- `scripts/migrate-backup/mapBackupStep.ts`
- `scripts/migrate-backup/mapBackupSession.ts`
- `scripts/migrate-backup/importBackupToConvex.ts`
- `convex/adminImport.ts`
- `convex/adminBackfills.ts`
- `package.json` if adding a TypeScript script runner or migration scripts
- `tests/migration/*`

## Data Rules

- Backup path: `backups/database.20260507-110251`.
- Firestore wrappers: recursively unwrap `{ value, type }`.
- Missing `updated_at`: set `updatedAt = createdAt`.
- Video `url`: decode Firebase object path into `storageKey`.
- `kind`: must be `inspiration | routine | step`.
- `difficulty`: must be `1 | 2 | 3 | 5 | 8`.
- `feeling`: must be `doucer | fusion | kizomba | semba | tarraxa | urban`.
- `smart_tags` / `removed_smart_tags`: must exist in config smart tag names.
- `tags` / `artists`: open vocabulary; report only.

## Tracer Acceptance

- `pnpm tsx scripts/migrate-backup/auditBackup.ts backups/database.20260507-110251`
- Expected: reports 203 steps, 2 sessions, zero constrained-value mismatches.
- Expected observed values:
  - `kind`: `inspiration`, `routine`, `step`
  - `difficulty`: `1`, `2`, `3`, `5`, `8`
  - `feeling`: `doucer`, `fusion`, `kizomba`, `semba`, `tarraxa`, `urban`
  - `removed_smart_tags`: `Podniesienie nogi`, `Wyrzucenie ręki`

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test -- --run`
- Dry run: import command reports counts and writes nothing.
- Write run: import command pushes backup data through `convex/adminImport.ts`.

## Commit Message

`feat(migration): add backup import tooling`

## Unresolved Questions

- Should import preserve legacy document IDs in a dedicated field for idempotency?
- Which Convex deployment/user should receive the current backup on first real write?
