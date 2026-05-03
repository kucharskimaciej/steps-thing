# Task 2: Configure Auth And Route Protection

Read `tasks/1 - project setup/context.md` first.

## Goal

Add authentication and enforce the public/private route model from the spec.

## Implementation

1. Choose the auth provider used with Convex. Prefer Convex-supported auth integration with Google OAuth.
2. Configure environment variables for auth provider IDs/secrets and Convex URL.
3. Create a sign-in page or unauthenticated state.
4. Add a protected authenticated layout for `app/(authenticated)`.
5. Ensure authenticated pages block private UI/data until auth has resolved.
6. Ensure unauthenticated users are redirected to sign-in or shown a sign-in prompt.
7. Ensure `app/s/[stepId]` remains public and does not require auth.
8. Add a small user menu or sign-out control if the auth integration does not provide one.

## Suggested Files

- Create `app/(authenticated)/layout.tsx`.
- Create `app/sign-in/page.tsx` or equivalent.
- Create `lib/auth/server.ts`.
- Create `lib/auth/client.tsx`.
- Modify Convex auth configuration files required by the selected provider.
- Update `.env.example` with required variables and non-secret descriptions.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test
```

Manual checks:

- In a fresh browser session, visit `/feed`; the app does not show private data and offers sign-in or redirects.
- Sign in with Google; `/feed` renders the authenticated shell.
- Sign out; private pages no longer render private shell/data.
- Visit `/s/example-step-id` while signed out; the public route renders its public placeholder.

## Acceptance Criteria

- Auth state is persisted between sessions.
- Private routes are protected centrally.
- Public step route is unaffected by private route protection.

