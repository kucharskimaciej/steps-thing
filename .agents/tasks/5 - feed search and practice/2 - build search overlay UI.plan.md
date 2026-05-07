# Plan: Build Search Overlay UI

## Phases

1. Tracer: feed search button opens/closes overlay with query input.
2. Add feeling tri-state, include/exclude tags, artists.
3. Add sort controls, clear, matched-count badge.
4. Debounce updates and scroll feed to top.

## Files

- `components/search/search-button.tsx`
- `components/search/search-overlay.tsx`
- `components/search/search-filters.tsx`
- `components/search/search-sort.tsx`
- `components/forms/three-state-tag.tsx`
- `tests/components/search-overlay.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual overlay/filter/clear checks.

## Commit Message

`feat(search): add feed overlay controls`

## Unresolved Questions

- Should overlay route state be URL-backed or local component state?
