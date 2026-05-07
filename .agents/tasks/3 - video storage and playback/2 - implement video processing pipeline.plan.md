# Plan: Implement Video Processing Pipeline

## Phases

1. Tracer: detect videos missing generated metadata.
2. Add idempotent processing job contract and status/logging.
3. Implement worker download, snapshot, thumbnail, dimensions, upload.
4. Update matching video metadata only; add retry/backfill path.

## Files

- `convex/videoProcessing.ts`
- `workers/video-processing/processVideo.ts`
- `lib/video/gcs.ts`
- `lib/video/processing-status.ts`
- `tests/video/processing-status.test.ts`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual processing/backfill check with one video.

## Commit Message

`feat(video): add processing pipeline`

## Unresolved Questions

- Which worker runtime/deployment should run ffmpeg?
