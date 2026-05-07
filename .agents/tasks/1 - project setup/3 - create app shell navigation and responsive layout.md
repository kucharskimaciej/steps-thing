# Task 3: Create App Shell Navigation And Responsive Layout

Read `tasks/1 - project setup/context.md` first.

## Goal

Implement the shared authenticated shell used by feed and related private pages.

## Implementation

1. Create a top bar with:
   - Center desktop nav containing `Feed`.
   - Right-side slot/area for page actions.
   - `Create step` action linking to `/steps/new`.
   - Mobile menu button.
2. Create a mobile navigation overlay:
   - Slide-in panel.
   - Backdrop.
   - `Feed` link.
   - Close on backdrop click.
   - Close on route change.
   - Prevent body scroll while open.
3. Add shared layout primitives for:
   - Standard centered container.
   - Wide two-column layout with right sidebar.
   - Full-height split layout for sessions/edit pages.
4. Use a desktop breakpoint around `900px`.

## Suggested Files

- Create `components/app-shell/top-bar.tsx`.
- Create `components/app-shell/mobile-navigation.tsx`.
- Create `components/layout/container.tsx`.
- Create `components/layout/wide-with-sidebar-right.tsx`.
- Create `components/layout/full-with-sidebar.tsx`.
- Modify `app/(authenticated)/layout.tsx`.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test
```

Manual checks:

- Desktop width: top bar shows `Feed` and `Create step`.
- Mobile width: menu button opens and closes navigation overlay.
- Opening mobile overlay prevents background scrolling.
- Navigating to another route closes the overlay.

## Acceptance Criteria

- Shared shell is reusable by feature pages.
- Navigation behavior matches the spec.
- UI remains usable at mobile and desktop widths.

