# Plan: Build Video Player And Modal

## Phases

1. Tracer: reusable player renders video, play/pause, emits viewed at 80%.
2. Add mute, seek, restart, slow-motion, progress controls.
3. Add snapshot background and modal.
4. Add aspect-aware fullscreen behavior and component tests.

## Files

- `components/video/video-player.tsx`
- `components/video/video-controls.tsx`
- `components/video/video-progress.tsx`
- `components/video/video-modal.tsx`
- `components/video/aspect-aware-video.tsx`
- `tests/components/video-player.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual media controls/modal check.

## Commit Message

`feat(video): add reusable player`

## Unresolved Questions

- Should modal use native fullscreen API, dialog, or both?
