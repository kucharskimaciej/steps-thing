# Task 1: Define Convex Schema And Indexes

Read `tasks/2 - data model and migrations/context.md` first.

## Goal

Create the Convex schema for steps and practice sessions, including indexes needed by feed, edit, sessions, search, and migration workflows.

## Implementation

1. Define a `steps` table with:
   - `ownerId`
   - `identifier`
   - `name`
   - `videos`
   - `difficulty`
   - `feeling`
   - `kind`
   - `tags`
   - `artists`
   - `notes`
   - `smartTags`
   - `removedSmartTags`
   - `tokens`
   - `variationKey`
   - `practiceRecords`
   - `viewRecords`
   - `createdAt`
   - `updatedAt`
   - optional `lastViewedAt`
   - Do not store Google Cloud Storage blobs in Convex; store only metadata and object keys.
2. Define `practiceSessions` table with:
   - `ownerId`
   - `name`
   - `steps`
   - `locked`
   - `createdAt`
   - `updatedAt`
3. Define validators for:
   - Step difficulty: `1 | 2 | 3 | 5 | 8`.
   - Step kind: `step | inspiration | routine`.
   - Video object, including `hash`, Google Cloud Storage `storageKey`, optional `snapshotStorageKey`, optional `thumbnailStorageKey`, and dimensions.
   - Do not persist signed URLs in Convex; generate them at upload/playback/public-sharing boundaries.
   - Practice record.
4. Add indexes:
   - `steps.by_owner`
   - `steps.by_owner_identifier`
   - `steps.by_owner_variationKey`
   - `steps.by_owner_createdAt`
   - `steps.by_owner_updatedAt`
   - `steps.by_owner_videoHash` if the schema supports indexing extracted hashes directly; otherwise implement duplicate lookup by owner query.
   - `practiceSessions.by_owner`
   - `practiceSessions.by_owner_createdAt`

## Suggested Files

- Modify `convex/schema.ts`.
- Create `convex/model/validators.ts` if validators are too large for the schema file.
- Create `convex/model/types.ts` for shared inferred types if useful.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npx convex dev --once
```

Expected:

- Convex accepts the schema.
- TypeScript can import generated table types without errors.

## Acceptance Criteria

- Schema represents every field in the spec.
- Indexes support owner-scoped queries.
- Validators reject invalid difficulty, kind, video, and practice record shapes.
- Video schema is ready for Google Cloud Storage: original, snapshot, and thumbnail fields are object keys, not Convex storage IDs or long-lived URLs.
