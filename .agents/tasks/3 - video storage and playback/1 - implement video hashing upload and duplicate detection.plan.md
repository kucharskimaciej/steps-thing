# Plan: Implement Video Hashing Upload And Duplicate Detection

## Phases

1. Tracer: hash selected file and block duplicate inside current form.
2. Add owner-scoped existing-hash lookup and duplicate message.
3. Add signed GCS upload URL flow and object-key persistence.
4. Wire upload input into step form; add helper tests.

## Files

- `lib/video/hash-file.ts`
- `lib/video/storage-client.ts`
- `convex/videoStorage.ts`
- `components/video/video-upload-input.tsx`
- `components/steps/step-form.tsx`
- `tests/video/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual upload/duplicate checks.

## Commit Message

`feat(video): add upload hashing flow`

## Unresolved Questions

- Confirm sampled hash compatibility is required vs full-file hash.
