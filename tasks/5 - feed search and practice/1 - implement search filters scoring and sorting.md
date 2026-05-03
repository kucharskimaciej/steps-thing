# Task 1: Implement Search Filters, Scoring, And Sorting

Read `tasks/5 - feed search and practice/context.md` first.

## Goal

Implement the search engine used by the feed.

## Implementation

1. Define search state:
   - `query`
   - `feeling`
   - `includeAllTags`
   - `excludeAnyTags`
   - `anyArtists`
   - `sort.type`
   - `sort.direction`
2. Default search:
   - Empty filters.
   - Sort by `ADDED_DATE` descending.
3. Implement filters:
   - Include all selected tags across `tags` and `smartTags`.
   - Exclude any selected tags across `tags` and `smartTags`.
   - Artists match any selected artist.
   - Feelings use tri-state positive/negative logic.
4. Implement text search against step `name`.
5. Preserve fuzzy threshold semantics close to legacy `0.4`.
6. Implement score sort:
   - `(1 - fuzzyScore) * 200`.
   - `+20` per included matching tag.
   - `+20` per positively selected matching feeling.
7. Implement sort types:
   - `SCORE`
   - `VIEW_DATE`
   - `VIEW_COUNT`
   - `PRACTICE_DATE`
   - `ADDED_DATE`
   - `RANDOM`
8. Implement sort direction and reverse secondary `updatedAt` direction.

## Suggested Files

- Create `lib/search/types.ts`.
- Create `lib/search/filter-steps.ts`.
- Create `lib/search/query-search.ts`.
- Create `lib/search/score-result.ts`.
- Create `lib/search/sort-results.ts`.
- Add unit tests for all filter and sort cases.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Required tests:

- Include all tags works across user tags and smart tags.
- Exclude any tags rejects matching tags and smart tags.
- Artists match any selected artist.
- Positive feelings require at least one selected feeling.
- Negative feelings reject matching feelings.
- Mixed feeling filters require positive match and no negative match.
- Sort modes order expected fixtures correctly.

## Acceptance Criteria

- Search behavior matches the legacy spec.
- Search helpers are independent from React components.

