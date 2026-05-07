# Project Setup Context

Build a fresh Next.js App Router application backed by Convex. The rewrite target is not a Vue/Firebase port; it should preserve product behavior from `REWRITE_SPEC.md` while using React, Convex queries/mutations/actions, and owner-scoped authorization.

Use these route groups unless a later architecture decision explicitly changes them:

- `app/(authenticated)/feed`
- `app/(authenticated)/steps`
- `app/(authenticated)/steps/new`
- `app/(authenticated)/steps/[stepId]/edit`
- `app/(authenticated)/sessions`
- `app/(authenticated)/sessions/[sessionId]`
- `app/(authenticated)/historical-sessions/[startOfDay]`
- `app/s/[stepId]`

Definition of done for setup tasks:

- `npm run lint`, `npm run typecheck`, and `npm test` exist and run.
- Convex dev tooling is configured.
- Authenticated routes cannot render private data without an authenticated user.
- Public step route remains accessible without authentication.

