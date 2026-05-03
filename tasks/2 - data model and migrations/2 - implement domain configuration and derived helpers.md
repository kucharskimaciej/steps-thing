# Task 2: Implement Domain Configuration And Derived Helpers

Read `tasks/2 - data model and migrations/context.md` first.

## Goal

Implement the app configuration, tag derivation, date helpers, tokenization, smart tags, and variation scoring needed by later features.

## Implementation

1. Create dance configuration for `kizomba` and `zouk`.
2. Include all feelings, difficulty labels, step kind labels, and Kizomba smart tag matchers from `REWRITE_SPEC.md`.
3. Create `getAppConfig(dance)` and choose the active dance from an environment variable.
4. Implement `deriveStepTags(step, config)` returning grouped categories:
   - `kind`
   - `difficulty`
   - `feeling`
   - `artist`
   - `content`
   - `meta`
   - `all`
5. Implement local-day helpers:
   - `startOfLocalDay(timestampOrDate)`
   - `todayStartOfLocalDay()`
6. Implement tokenization:
   - Locale lowercase.
   - Stop characters and numbers to spaces.
   - Remove words of length `<= 2`.
   - Generate 1-gram through 4-gram token chains joined by `|`.
7. Implement smart tag matching:
   - Build case-insensitive regexes from config matchers.
   - Match at text boundaries or non-word boundaries as in the legacy behavior.
   - Return sorted tag names.
8. Implement variation scoring:
   - Token score: matching token chain length squared.
   - Tag score: one-based match index times `10`.
   - Total score is token score plus tag score.

## Suggested Files

- Create `lib/domain/config.ts`.
- Create `lib/domain/tags.ts`.
- Create `lib/domain/dates.ts`.
- Create `lib/domain/tokenize.ts`.
- Create `lib/domain/smart-tags.ts`.
- Create `lib/domain/variation-score.ts`.
- Create unit tests next to each helper or in `tests/domain`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Required unit test cases:

- Tokenizer examples from the rewrite spec.
- Smart tags match Kizomba examples:
  - `Obrót partnerki z przejściem przez shadow position` yields `Obrót` and `Shadow position`.
  - `Tepy, potem przesunięcie nogi w pozycji z tyłu` yields `Tep`, `Przesunięcie nogi`, and `Za partnerką`.
- Tag derivation includes kind, difficulty, feeling, artist, content, meta, and all categories.
- Variation scoring returns the expected examples from the spec.
- Date helper returns local start of day.

## Acceptance Criteria

- Domain helpers are framework-independent and can be imported by UI, Convex, and tests.
- Kizomba and Zouk config behavior is complete.
- No legacy Vue dependency is used.

