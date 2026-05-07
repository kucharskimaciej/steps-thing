# Task 2: Perform Security And Access Review

Read `tasks/8 - quality security and release/context.md` first.

## Goal

Verify that private data and storage access are owner-scoped and public sharing exposes only intended data.

## Implementation

1. Review every Convex query and mutation.
2. Confirm private APIs call the auth helper.
3. Confirm private APIs filter or fetch by authenticated owner.
4. Confirm mutations reject records owned by another user.
5. Confirm public step API returns only fields needed by the public page.
6. Confirm sessions are not public unless explicitly intended.
7. Review upload/storage paths:
   - Owner-scoped Google Cloud Storage object keys.
   - No cross-user overwrites.
   - Signed upload URLs require authenticated ownership.
   - Public playback uses short-lived signed Google Cloud Storage read URLs intentionally.
8. Document the access model in a security note.

## Suggested Files

- Create `docs/security-access-model.md`.
- Update tests from task 1 if any missing access case is found.
- Update Convex APIs if any authorization gap is found.

## Verification

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
```

Manual checks:

- User A cannot open User B private step edit URL.
- User A cannot mutate User B step/session through direct function calls.
- Signed-out user can open public step page only.
- Signed-out user cannot list private steps or sessions.

## Acceptance Criteria

- Access model is documented.
- Security checks are backed by tests.
- Public sharing behavior is explicit.
