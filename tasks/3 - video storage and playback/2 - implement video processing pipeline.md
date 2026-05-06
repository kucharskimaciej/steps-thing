# Task 2: Implement Video Processing Pipeline

Read `tasks/3 - video storage and playback/context.md` first.

## Goal

Generate snapshots, thumbnails, and dimensions for newly uploaded Google Cloud Storage videos.

## Implementation

1. Trigger processing when a step is created or updated and any video lacks:
   - `snapshotStorageKey`
   - `thumbnailStorageKey`
   - `width`
   - `height`
2. Skip deleted/missing steps.
3. Skip videos that already have all processed fields.
4. For each unprocessed video:
   - Download original video from Google Cloud Storage using its stored object key.
   - Generate a snapshot at 50% duration.
   - Generate a thumbnail at 50% duration with width `256px` and proportional height.
   - Read source width and height.
   - Upload generated files to Google Cloud Storage under owner-scoped snapshot/thumbnail object keys.
   - Update only the matching video metadata.
5. Make processing idempotent and retryable.
6. Log failures with step ID and video hash.
7. Store processing status if the chosen worker setup supports it.

## Suggested Files

- Create `convex/videoProcessing.ts`.
- Create `workers/video-processing/processVideo.ts` or equivalent external worker.
- Create or reuse `lib/video/gcs.ts` for Google Cloud Storage read/write helpers.
- Create `lib/video/processing-status.ts`.
- Create tests for "needs processing" detection.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual/integration checks:

- Create a step with `{ hash, storageKey }`; processing runs once.
- After processing, the video has `snapshotStorageKey`, `thumbnailStorageKey`, `width`, and `height`.
- Updating an already processed step does not reprocess that video.
- Clearing generated metadata and running the backfill reprocesses the video.

## Acceptance Criteria

- Processing does not overwrite unrelated step fields.
- Processing does not loop forever.
- Failed jobs are observable.
- Generated media is stored in Google Cloud Storage.
