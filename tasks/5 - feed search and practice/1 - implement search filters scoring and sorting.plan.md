# Plan: Implement Search Filters Scoring And Sorting

## Phases

1. Tracer: pure helper filters by text query and default sort.
2. Add tag/artist/feeling filter semantics.
3. Add fuzzy score and score sort.
4. Add all sort modes, direction, random, secondary ordering.
5. Cover fixtures from `REWRITE_SPEC.md`.

## Files

- `lib/search/types.ts`
- `lib/search/filter-steps.ts`
- `lib/search/query-search.ts`
- `lib/search/score-result.ts`
- `lib/search/sort-results.ts`
- `tests/search/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`

## Commit Message

`feat(search): add feed filtering helpers`

## Unresolved Questions

- Which fuzzy-search library/pattern best matches legacy threshold `0.4`?
