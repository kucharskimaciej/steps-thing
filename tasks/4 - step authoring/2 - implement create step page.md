# Task 2: Implement Create Step Page

Read `tasks/4 - step authoring/context.md` first.

## Goal

Build the authenticated create step workflow.

## Implementation

1. Create page at `/steps/new`.
2. Render a split layout:
   - Main form.
   - Right sidebar with similarity-ranked existing steps.
3. Add top actions:
   - `Save`
   - `Save & create another`
4. Use shared step form.
5. Query existing tags, artists, and variation candidates.
6. Rank candidates with variation score against current form data.
7. Allow selecting/deselecting variation groups by candidate.
8. On `Save`:
   - Validate.
   - Call `createStep`.
   - Include current user implicitly server-side.
   - Let server assign next `identifier`.
   - Merge selected variation groups.
   - Navigate to `/steps` or the agreed list page.
9. On `Save & create another`:
   - Validate.
   - Save.
   - Reset form while preserving `feeling`, `artists`, `tags`, and `difficulty`.
   - Clear selected variations.

## Suggested Files

- Create `app/(authenticated)/steps/new/page.tsx`.
- Create `components/steps/variation-candidate-list.tsx`.
- Create `components/steps/variation-toggle.tsx`.
- Use `components/steps/step-form.tsx`.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- User can create a valid step.
- New step receives the next identifier for that user.
- Selected variation groups merge into the new step's variation group.
- Save-and-create-another preserves only the specified fields.
- Invalid form does not create a step.

## Acceptance Criteria

- Create persistence is active; no legacy "log only" behavior remains.
- Candidate ranking reacts to form data.
- Variation group selection is clear.

