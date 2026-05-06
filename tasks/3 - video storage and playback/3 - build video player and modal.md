# Task 3: Build Video Player And Modal

Read `tasks/3 - video storage and playback/context.md` first.

## Goal

Create the reusable video player used by feed, public pages, list modals, and sessions.

## Implementation

1. Render an HTML video with:
   - `loop`
   - `playsInline`
   - metadata preload
   - muted by default
   - optional autoplay
2. Add blurred snapshot background when a resolved snapshot URL exists for `snapshotStorageKey`.
3. Add center play overlay that toggles play/pause.
4. Add top-right controls:
   - mute/unmute.
   - open full-size/fullscreen when enabled.
5. Add bottom-right controls:
   - forward 1 second.
   - back 5 seconds.
   - back 1 second.
   - play from start.
   - slow motion toggle between playback rates `1` and `0.5`.
6. Add bottom progress bar.
7. Emit `viewed` once progress crosses `80%`.
8. Reset local viewed flag if progress drops below `10%`.
9. Build a borderless video modal.
10. Add aspect-aware modal behavior:
    - Determine video dimensions if missing.
    - On portrait/narrow clients, rotate landscape video by 90 degrees.

## Suggested Files

- Create `components/video/video-player.tsx`.
- Create `components/video/video-controls.tsx`.
- Create `components/video/video-progress.tsx`.
- Create `components/video/video-modal.tsx`.
- Create `components/video/aspect-aware-video.tsx`.
- Add component tests for control behavior.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Play/pause overlay works.
- Mute toggle changes media muted state.
- Seek controls adjust current time within bounds.
- Slow toggle changes playback rate to `0.5` and back to `1`.
- Progress bar advances while video plays.
- `viewed` callback fires after crossing `80%`.
- Full-size modal opens and plays selected video.

## Acceptance Criteria

- Player is reusable across all pages.
- View tracking events match the spec.
- Controls are accessible by button semantics and labels.
