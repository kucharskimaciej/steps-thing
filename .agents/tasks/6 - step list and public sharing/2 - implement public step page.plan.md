# Plan: Implement Public Step Page

## Phases

1. Tracer: `/s/[stepId]` fetches public step without auth and renders name.
2. Add read-only public step view with primary video and tags.
3. Resolve short-lived signed GCS read URLs.
4. Add loading/not-found states and exposure tests.

## Files

- `app/s/[stepId]/page.tsx`
- `components/steps/public-step-view.tsx`
- `convex/steps.ts`
- `lib/video/public-video-url.ts`
- `tests/components/public-step-page.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual signed-out public playback check.

## Commit Message

`feat(sharing): add public step page`

## Unresolved Questions

- Should public view include notes, or only name/video/tags?
