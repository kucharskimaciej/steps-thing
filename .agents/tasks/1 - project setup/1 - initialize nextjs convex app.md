# Task 1: Initialize Next.js And Convex App

Read `tasks/1 - project setup/context.md` first.

## Goal

Create the baseline Next.js App Router project structure, install Convex, and define the core developer commands needed by all later tasks.

## Implementation

1. Create or replace the app runtime with a Next.js TypeScript project.
2. Install and configure:
   - `next`
   - `react`
   - `react-dom`
   - `convex`
   - `typescript`
   - ESLint and Prettier or the repo-standard formatter.
   - A test runner suitable for React unit tests, such as Vitest with Testing Library.
3. Add scripts:
   - `dev`: run Next.js locally.
   - `convex:dev`: run Convex dev.
   - `build`: build Next.js.
   - `lint`: run lint checks.
   - `typecheck`: run TypeScript without emitting.
   - `test`: run unit tests once.
4. Create the App Router root layout.
5. Add a global stylesheet and minimal accessible base styles.
6. Add a root page at `/` that redirects to `/feed`.
7. Add placeholder pages for all routes listed in `context.md`.

## Suggested Files

- Create or modify `package.json`.
- Create `app/layout.tsx`.
- Create `app/page.tsx`.
- Create `app/globals.css`.
- Create route placeholder files under `app/(authenticated)` and `app/s/[stepId]`.
- Create `convex/_generated` through the Convex CLI.
- Create initial `convex/schema.ts`.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Expected:

- All commands exit with code `0`.
- `/` redirects to `/feed`.
- Every target route renders a placeholder page without crashing.

## Acceptance Criteria

- The app can run locally with Next.js.
- Convex dev tooling can start.
- The directory structure supports authenticated and public route separation.
- No route depends on legacy Vue/Firebase code.

