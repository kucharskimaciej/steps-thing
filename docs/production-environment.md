# Production Environment Checklist

## Purpose

Use this checklist before production cutover to confirm runtime dependencies match implementation intent: Convex owns canonical data, Clerk owns auth, and Google Cloud Storage owns video objects and generated media.

## Convex Deployment

- [ ] Production Convex deployment exists and is separate from local/dev.
- [ ] `CONVEX_DEPLOYMENT` points at the production deployment for deploy/build workflows.
- [ ] `NEXT_PUBLIC_CONVEX_URL` points at the production Convex URL used by the Next.js app and public `/s/[stepId]` route.
- [ ] Convex schema/functions validate with `CI=1 pnpm exec convex dev --once --tail-logs disable` before deploy.
- [ ] Production functions are deployed from the release candidate commit.
- [ ] Admin-only mutations are restricted by `STEPS_ADMIN_USER_IDS`.
- [ ] Migration write mode has a tested rollback/restore plan before it is used.

## Clerk Auth Provider

- [ ] Clerk production instance is configured for Google OAuth.
- [ ] Clerk allowed redirect URLs include production app origin and preview smoke-test origin.
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set for the production Clerk instance.
- [ ] `CLERK_SECRET_KEY` is set only as a server secret.
- [ ] `CLERK_JWT_ISSUER_DOMAIN` matches the issuer configured in `convex/auth.config.ts`.
- [ ] Public auth routes are set: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`.
- [ ] A signed-out browser cannot render private data from authenticated route group pages.

## Google Cloud Storage

- [ ] Production bucket exists and is not public-read by default.
- [ ] `GCS_BUCKET_NAME` points at the production video bucket.
- [ ] Service account email in `GCS_CLIENT_EMAIL` has the minimum bucket permissions needed for signed upload/read, object read, and generated object write.
- [ ] `GCS_PRIVATE_KEY` is stored as a secret with newline escaping preserved.
- [ ] CORS allows browser `PUT` uploads from production and preview origins.
- [ ] CORS allows required headers, especially `Content-Type`.
- [ ] Signed upload URLs work for video content types and reject non-video upload requests through the app action.
- [ ] Signed read URLs are short lived; no long-lived GCS URLs are persisted in Convex.
- [ ] Object key layout remains owner-scoped: `videos/{ownerId}/{hash}`, `video-snapshots/{ownerId}/{hash}.jpg`, `video-thumbnails/{ownerId}/{hash}.jpg`.

## Video Processing Worker

- [ ] Worker runtime can run the ffmpeg/ffprobe path used by `workers/video-processing/processVideo.ts`.
- [ ] Worker has access to the same GCS bucket and service account secrets as the Convex action environment.
- [ ] Generated snapshot and thumbnail writes use owner-scoped object keys.
- [ ] Processing is idempotent: already processed videos are skipped, failed jobs can be retried.
- [ ] Backfill path is available through `adminBackfills:recreateThumbnails`.
- [ ] Worker and Convex logs are retained long enough to debug processing failures during cutover.

## Required Server Secrets

- [ ] `CLERK_SECRET_KEY`
- [ ] `CLERK_JWT_ISSUER_DOMAIN`
- [ ] `GCS_BUCKET_NAME`
- [ ] `GCS_CLIENT_EMAIL`
- [ ] `GCS_PRIVATE_KEY`
- [ ] `STEPS_ADMIN_USER_IDS`
- [ ] `CONVEX_ADMIN_TOKEN` for migration import write mode only.
- [ ] `CONVEX_ADMIN_USER_ID` for migration import write mode only.

## Required Public Environment Variables

- [ ] `NEXT_PUBLIC_CONVEX_URL`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

## Cutover Checks

- [ ] Build uses production public environment variables: `pnpm build`.
- [ ] Release smoke test target URL is recorded in `docs/release-smoke-test.md`.
- [ ] Migration dry run has been executed against the exact backup planned for cutover.
- [ ] No production write migration runs without explicit operator approval.

