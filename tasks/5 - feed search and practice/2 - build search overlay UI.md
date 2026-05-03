# Task 2: Build Search Overlay UI

Read `tasks/5 - feed search and practice/context.md` first.

## Goal

Create the feed search overlay with filters and sorting controls.

## Implementation

1. Add search button to the feed top bar.
2. Show active search badge with matched count when search is not default.
3. Build overlay fields:
   - Text query.
   - Feeling tri-state selector.
   - Include all tags.
   - Exclude any tags.
   - Artists.
   - Sort by.
   - Direction.
4. Debounce search state updates by about 50 ms.
5. Add `Clear` action to reset default search.
6. Add `Back to results` action to close overlay.
7. On search changes, scroll feed to top.
8. Use existing tags and artists as autocomplete options.

## Suggested Files

- Create `components/search/search-button.tsx`.
- Create `components/search/search-overlay.tsx`.
- Create `components/search/search-filters.tsx`.
- Create `components/search/search-sort.tsx`.
- Create `components/forms/three-state-tag.tsx`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Opening search overlay shows current search state.
- Changing filters updates matched count.
- Clear restores default search.
- Back to results closes overlay without clearing.
- Tri-state feelings cycle neutral to include to exclude to neutral.

## Acceptance Criteria

- Search UI can express every search state.
- Feed reacts immediately enough without excessive re-rendering.

