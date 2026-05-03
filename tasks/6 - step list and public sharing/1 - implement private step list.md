# Task 1: Implement Private Step List

Read `tasks/6 - step list and public sharing/context.md` first.

## Goal

Build `/steps` as a dense list/card view of all owned steps.

## Implementation

1. Create `/steps` page.
2. Query all owned steps.
3. Sort by `createdAt` descending.
4. Render each list item with:
   - `#identifier`.
   - Name linked to primary video.
   - Edit button linking to `/steps/[stepId]/edit`.
   - Secondary video buttons for videos after the first.
   - Notes when present.
   - All tags.
   - Relative created date.
   - Relative last practiced date from `practiceRecords[0].date`.
   - Variation links when variations exist.
   - Visible shortlink that copies to clipboard.
5. Show selected state support if the component is reused by sessions.

## Suggested Files

- Create `app/(authenticated)/steps/page.tsx`.
- Create `components/steps/step-list.tsx`.
- Create `components/steps/step-list-item.tsx`.
- Create `components/common/copy-to-clipboard.tsx`.
- Create `lib/dates/relative-date.ts`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- List shows owned steps only.
- Edit button navigates to the edit page.
- Secondary videos open/play.
- Shortlink copies `{origin}/s/{stepId}`.
- Variation links jump to related list items.

## Acceptance Criteria

- `/steps` provides all legacy list information.
- Copy-to-clipboard works with browser clipboard API.

