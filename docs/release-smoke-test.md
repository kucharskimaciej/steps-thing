# Release Smoke Test

## Purpose

Run this checklist before production cutover so release validation does not depend on memory. Use it after automated gates pass and before any data migration write mode.

## Run Metadata

- Target environment:
- Release candidate commit:
- Tester:
- Date:
- Browser/device:
- Test account owner ID:
- Notes:

## Preconditions

- Automated gates passed: `pnpm typecheck`, `pnpm lint`, `pnpm test -- --run`.
- Preview deployment uses the same Convex, Clerk, GCS, and worker configuration intended for cutover.
- Test account can sign in with Google through Clerk.
- Test video file is available and small enough for upload retry.
- At least one migrated or seeded step exists for feed, search, sessions, public sharing, and historical practice checks.

## Result Key

- PASS: expected result observed.
- FAIL: expected result not observed; record follow-up issue.
- BLOCKED: environment or data missing; record blocker before cutover.

## Smoke Checklist

| Area | Steps | Expected result | Result | Notes |
| --- | --- | --- | --- | --- |
| Sign in | Visit `/feed` signed out, choose sign in, complete Google auth. | Authenticated shell loads and private data is visible only after auth resolves. |  |  |
| Private route protection | Sign out, then visit `/feed`, `/steps`, `/steps/new`, `/sessions`, and a known `/sessions/[sessionId]`. | Private pages do not render user data while signed out and route to sign-in or unauthenticated state. |  |  |
| Public step route signed out | Sign out, open a known `/s/[stepId]`. | Public step page loads with display fields and playable primary video; no private notes, session data, owner ID, tokens, or variation key are exposed. |  |  |
| Upload video | Sign in, open `/steps/new`, add a video file. | Upload completes through a signed GCS URL, video appears in the form, duplicate video warning appears only for existing hashes. |  |  |
| Create step | Fill name, kind, difficulty, feeling, optional tags/artists/notes, then save. | New step persists, receives the next user identifier, appears in `/steps` and `/feed`. |  |  |
| Edit step | Open `/steps/[stepId]/edit`, change name/tags/difficulty, save. | Changes persist, `updatedAt` ordering updates, feed/list show the edited values. |  |  |
| Inline edit | From `/feed`, open a step actions menu, choose edit, update a small field, save. | Modal saves through the same validation path and closes; feed card updates without leaking another user's data. |  |  |
| Variation merge | Create or edit a step, select one or more variation candidates, save. | Selected variation groups merge; related steps show in variation controls/list without duplicating unrelated steps. |  |  |
| Search | Open feed search, search by name token and tag. | Matching steps remain; non-matching steps are filtered out. |  |  |
| Filter | Toggle feeling/tag filters. | Include/exclude filters change the feed result set predictably. |  |  |
| Sort | Change sort between supported orderings, including random if present. | Feed ordering changes without dropping matching steps or breaking pagination/virtualization. |  |  |
| Feed view tracking | Play a feed video past 80 percent. | `recordStepView` runs once for that crossing; repeat view is not spammed unless playback resets below 10 percent and crosses again. |  |  |
| Practice recording | Click `Practice` on a step. | Button changes to practiced state and today's practice record appears in sessions/history views. |  |  |
| Step list | Open `/steps`. | Owned steps list loads, grouped variations render, edit links and shortlink controls are available. |  |  |
| Copy shortlink | In `/steps`, click `Copy shortlink` for a step. | Clipboard receives an absolute `/s/[stepId]` URL that opens while signed out. |  |  |
| Sessions list | Open `/sessions`; create a saved session. | Saved sessions list updates with the new session and historical practice section remains visible. |  |  |
| Session detail | Open `/sessions/[sessionId]`, add/remove steps, use session feed/cart. | Only owned steps can be added; session feed records practice with the session collection ID. |  |  |
| Historical session | Open `/historical-sessions/[startOfDay]` from the historical practice list. | Page shows steps practiced on that local day and allows normal feed actions where applicable. |  |  |
| Migration dry run | Run `pnpm migration:import` against the release backup without `--write`. | Command reports counts and validation issues without writing to Convex. |  |  |
| Video processing backfill | Run `pnpm exec convex run --prod adminBackfills:recreateThumbnails '{"limit":1}'` or the release equivalent. | Backfill marks only selected records, enqueues missing processing, and logs scanned/updated counts. |  |  |

## Failure Handling

- Record every FAIL/BLOCKED row with owner, reproduction steps, and release decision.
- Do not run migration write mode until public route, auth protection, upload, create/edit, feed tracking, sessions, and dry-run checks pass.
- If video backfill fails, confirm the failed job has step ID, video hash, and error message in Convex logs before retrying.
