# Task 2: Implement Public Step Page

Read `tasks/6 - step list and public sharing/context.md` first.

## Goal

Build the public route for shared individual steps.

## Implementation

1. Create `/s/[stepId]` page.
2. Fetch step by ID without requiring authentication.
3. Render loading, not-found, and loaded states.
4. Loaded state displays:
   - Step name.
   - Primary video.
   - Tags.
5. Ensure the public page can play the primary video:
   - Use public-readable URLs, signed URLs, or a server-mediated read endpoint.
6. Do not expose owner-private controls such as edit, practice, sessions, or private notes beyond what is intentionally shown by the read-only step component.

## Suggested Files

- Create `app/s/[stepId]/page.tsx`.
- Create `components/steps/public-step-view.tsx`.
- Modify `convex/steps.ts` public query if needed.
- Create `lib/video/public-video-url.ts` if signed/proxied URLs are needed.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Signed-out browser can open `/s/{existingStepId}`.
- Page renders name, video, and tags.
- Video plays while signed out.
- Missing step ID shows not-found state.
- No private owner controls appear.

## Acceptance Criteria

- Public sharing works without authentication.
- Public data exposure is limited to the intended step view.

