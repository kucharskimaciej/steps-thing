# Task 1: Implement Video Hashing, Upload, And Duplicate Detection

Read `tasks/3 - video storage and playback/context.md` first.

## Goal

Implement the browser-side and server-side pieces needed to add Google Cloud Storage videos to a step form.

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
6. Reuse existing `storageKey` if the hash already exists for the owner.
7. Request a server-issued signed Google Cloud Storage upload URL.
8. Upload new videos under `videos/{ownerId}/{hash}` or equivalent owner-scoped object key.
9. Add `{ hash, storageKey }` to persisted form/step state. Resolve playback URLs separately when rendering.
10. Show duplicate-of-step validation messages when another owned step already uses a video hash.

## Suggested Files

- Create `lib/video/hash-file.ts`.
- Create `lib/video/storage-client.ts`.
- Create `convex/videoStorage.ts` or equivalent API for signed upload/read URL requests.
- Create `components/video/video-upload-input.tsx`.
- Add Convex query/mutation/action plumbing for Google Cloud Storage object-key registration.
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
- Google Cloud Storage object key is owner-scoped.
- Convex stores object keys, not long-lived public URLs.

## Acceptance Criteria

- Video input supports all form validation needs.
- Duplicate prevention works before step creation/update.
- Upload code does not grant cross-user write access.
- Signed URL generation verifies authenticated ownership.
