# Task 1: Implement Video Hashing, Upload, And Duplicate Detection

Read `tasks/3 - video storage and playback/context.md` first.

## Goal

Implement the browser-side and server-side pieces needed to add videos to a step form.

## Implementation

1. Implement file hashing:
   - Chunk size: `512 KiB`.
   - Total chunks: `ceil(file.size / chunkSize)`.
   - Sampling interval: `max(round((e / pi) * sqrt(totalChunks)), 1)`.
   - Hash every sampled chunk where `chunkIndex % samplingInterval === 0`.
   - Use full hashing instead only if migration compatibility is explicitly not required.
2. Implement an upload UI control accepting `video/*`.
3. If the user cancels file selection, mark videos as touched/validated.
4. If the same hash is already selected in the current form, do not add it again.
5. Check existing owner-scoped videos by hash before upload.
6. Reuse existing uploaded URL if the hash already exists in storage.
7. Upload new videos under `videos/{ownerId}/{hash}` or equivalent owner-scoped storage.
8. Add `{ hash, url }` to form state.
9. Show duplicate-of-step validation messages when another owned step already uses a video hash.

## Suggested Files

- Create `lib/video/hash-file.ts`.
- Create `lib/video/storage-client.ts`.
- Create `components/video/video-upload-input.tsx`.
- Add Convex query/mutation or action for upload URL creation if needed.
- Add tests for hashing and duplicate detection helpers.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Uploading a video adds one video row to the form.
- Selecting the same file twice leaves only one row.
- Uploading a video whose hash exists on another step shows `Duplicate of {stepName}` and blocks save.
- Storage path is owner-scoped.

## Acceptance Criteria

- Video input supports all form validation needs.
- Duplicate prevention works before step creation/update.
- Upload code does not grant cross-user write access.

