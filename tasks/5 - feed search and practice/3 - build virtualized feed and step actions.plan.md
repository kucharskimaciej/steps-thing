# Plan: Build Virtualized Feed And Step Actions

## Phases

1. Tracer: `/feed` lists owned steps with primary video card.
2. Add search/filter/sort integration.
3. Add virtualization/intersection playback and stable video sizing.
4. Add tags, variation modal, practice action, options menu.
5. Wire copy link and inline edit entry.

## Files

- `app/(authenticated)/feed/page.tsx`
- `components/feed/steps-feed.tsx`
- `components/feed/feed-step-card.tsx`
- `components/feed/step-actions.tsx`
- `components/feed/options-menu.tsx`
- `components/steps/step-tags.tsx`
- `components/steps/variation-feed-modal.tsx`
- `tests/components/feed.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual feed/variation/copy/edit checks.

## Commit Message

`feat(feed): add virtualized step feed`

## Unresolved Questions

- Which virtualization package should be used, if any?
