# Plan: Implement Domain Configuration And Derived Helpers

## Phases

1. Tracer: create config + tokenizer with one passing spec example.
2. Add tags, dates, smart tags, variation score as pure helpers.
3. Add full Kizomba config from `REWRITE_SPEC.md`; no runtime dance switch.
4. Cover examples and edge cases with unit tests.

## Files

- `lib/domain/config.ts`
- `lib/domain/tags.ts`
- `lib/domain/dates.ts`
- `lib/domain/tokenize.ts`
- `lib/domain/smart-tags.ts`
- `lib/domain/variation-score.ts`
- `tests/domain/*`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`

## Commit Message

`feat(domain): add step helper algorithms`

## Unresolved Questions

- None.

## Resolved Decisions

- Support only Kizomba for now. Do not add `ACTIVE_DANCE` or any runtime dance-selection env var.
