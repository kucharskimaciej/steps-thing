# Task 1: Build Step Form Validation And Smart Tags

Read `tasks/4 - step authoring/context.md` first.

## Goal

Create the shared step form used by create, edit, and inline edit workflows.

## Implementation

1. Build form fields:
   - Videos.
   - Name.
   - Kind.
   - Difficulty.
   - Artists.
   - Feeling.
   - Tags.
   - Smart tags.
   - Removed smart tags.
   - Notes.
2. Implement defaults:
   - `videos: []`
   - `name: ""`
   - `difficulty: 1`
   - `feeling: []`
   - `kind: "step"`
   - `tags: []`
   - `artists: []`
   - `notes: ""`
   - `smartTags: []`
   - `removedSmartTags: []`
   - `tokens: []`
3. Validate:
   - Required non-empty `name`.
   - Required numeric `difficulty`.
   - Valid `kind`.
   - At least one non-empty feeling.
   - At least one valid video.
   - Video `hash` and `url` are non-empty.
   - Duplicate videos are blocked except for the edited step.
4. Debounce name changes by about 200 ms.
5. On name change, recompute smart tags and tokens.
6. On removed smart tag changes, recompute smart tags.
7. When the user removes a smart tag, add it to unique `removedSmartTags`.
8. Prevent arbitrary values in smart tag and removed smart tag controls.
9. Provide autocomplete for tags and artists from existing user data.

## Suggested Files

- Create `components/steps/step-form.tsx`.
- Create `components/forms/tags-input.tsx`.
- Create `components/forms/checklist.tsx`.
- Create `components/forms/select.tsx`.
- Create `lib/steps/step-form-schema.ts`.
- Create `lib/steps/step-form-defaults.ts`.
- Add tests for validation and smart tag behavior.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- Empty form shows validation failures on submit.
- A valid form can submit.
- Name changes update tokens and smart tags.
- Removing a smart tag moves it to removed smart tags.
- Duplicate videos show `Duplicate of {stepName}`.

## Acceptance Criteria

- One shared form supports create/edit/inline edit.
- Production UI does not show raw debug JSON.
- Form output matches the Convex step mutation input.

