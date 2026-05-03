# Task 3: Create Release Smoke Test And Operational Checklist

Read `tasks/8 - quality security and release/context.md` first.

## Goal

Create a repeatable checklist for validating the rewrite before production cutover.

## Implementation

1. Create a smoke test document covering:
   - Sign in.
   - Private route protection.
   - Public step route while signed out.
   - Upload video.
   - Create step.
   - Edit step.
   - Inline edit.
   - Variation merge.
   - Search/filter/sort.
   - Feed view tracking.
   - Practice recording.
   - Step list.
   - Copy shortlink.
   - Sessions list.
   - Session detail.
   - Historical session.
   - Migration dry run.
   - Video processing backfill.
2. Create an environment checklist:
   - Convex deployment.
   - Auth provider config.
   - Storage provider config.
   - Video processing worker config.
   - Required secrets.
   - Required public environment variables.
3. Create an observability checklist:
   - Video processing failures are logged.
   - Migration counts are logged.
   - Auth failures are observable.
   - Production errors are captured by the chosen monitoring tool.

## Suggested Files

- Create `docs/release-smoke-test.md`.
- Create `docs/production-environment.md`.
- Create `docs/operations.md`.

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm test -- --run
```

Manual checks:

- Walk through every smoke test item on a deployed preview environment.
- Record pass/fail and any follow-up issues.

## Acceptance Criteria

- Release validation does not depend on memory.
- Operational requirements are documented before production cutover.
- Smoke test covers all primary user workflows.

