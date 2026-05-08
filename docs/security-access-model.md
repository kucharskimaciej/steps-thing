# Security Access Model

## Scope

This note records the S08-02 access review for Convex APIs, public sharing, sessions, and Google Cloud Storage video access.

## Auth Boundary

Private Convex queries, mutations, and actions call `requireUserId(ctx)` before reading or writing user data. The helper uses Convex auth identity subject as `ownerId` and rejects signed-out callers with `Authentication required`.

Admin migration/backfill mutations use `requireAdminUser(ctx)` and allow only subjects listed in `STEPS_ADMIN_USER_IDS`.

## Owner Isolation

Private step reads load only records with the authenticated `ownerId` or fetch by ID and then assert `step.ownerId === ownerId`.

Private step writes reject cross-owner records through `assertStepOwner`. This covers `updateStep`, `recordStepView`, `recordPractice`, and video-processing retry. `recordPractice` also verifies `collectionId` references an owned practice session before saving it.

Practice sessions are not public. Session queries and mutations call `requireUserId`, fetch owned sessions, and reject other users' sessions through `assertSessionOwner`. Session mutations that reference steps also verify every step belongs to the same owner.

## Public Sharing

`steps.getPublicStep` is intentionally callable without auth. It returns display-only fields for the shared page:

- Step identity and public labels: `_id`, `identifier`, `name`, `difficulty`, `feeling`, `kind`, `tags`, `artists`, `smartTags`.
- A single `primaryVideo` object with storage metadata needed by the server to issue short-lived playback URLs.

It does not expose `ownerId`, `notes`, `tokens`, `variationKey`, `practiceRecords`, `viewRecords`, removed smart tags, all video hashes, secondary videos, or sessions.

## Video Storage

Uploads use `videoStorageActions.createUploadUrl`, which requires auth before issuing a signed Google Cloud Storage `PUT` URL. Object keys are built as `videos/{encodedOwnerId}/{encodedHash}` so users cannot overwrite another user's object for the same hash.

Generated snapshots and thumbnails use owner-scoped keys under `video-snapshots/{encodedOwnerId}/{encodedHash}.jpg` and `video-thumbnails/{encodedOwnerId}/{encodedHash}.jpg`.

Public playback does not store long-lived URLs. The public page signs the primary video and snapshot storage keys into short-lived Google Cloud Storage `GET` URLs with a 15 minute TTL.

## Observability

Video processing failures are logged with step ID and video hash in `videoProcessingActions.processStepVideos`, then persisted to `videoProcessingJobs` with status `failed`. Auth and storage failure monitoring should use the production error monitoring tool chosen in the release operations story; no specific monitoring vendor is configured in this repo yet.

## Evidence

Automated coverage:

- `tests/convex-owner-apis.test.ts`: auth helper, owner assertions, public exposure shape.
- `tests/convex-server-handlers.test.ts`: private handlers require auth, public read is signed-out safe, mutation owner/session rules.
- `tests/security/video-storage-actions.test.ts`: signed upload URLs require auth, use owner-scoped keys, reject non-video uploads.
- `tests/video/public-video-url.test.ts`: public playback uses short-lived signed read URLs.

Manual checks to run in a deployed environment:

- User A cannot open User B private step edit URL.
- User A cannot mutate User B step/session through direct Convex calls.
- Signed-out user can open `/s/[stepId]` only.
- Signed-out user cannot list private steps or sessions.
