# Steps App Rewrite Specification

This document describes the existing product behavior and domain requirements for a full rewrite in Next.js, React, and Convex. It is intentionally written as a standalone product and engineering spec so implementation tasks can be created without reading the legacy codebase.

## 1. Product Summary

Steps App is a personal dance-learning library for storing short movement videos, tagging them, searching them, reviewing them in a feed, recording practice, and grouping related steps as variations.

The primary user is an authenticated dancer who records or receives movement videos, uploads them into a private collection, annotates them, and later uses the app as a searchable practice feed.

The app currently supports two dance configurations:

- `kizomba`
- `zouk`

The selected dance configuration controls:

- Available feelings/styles.
- Difficulty labels.
- Smart tag rules.

The current product is mostly single-user-per-record: every private record belongs to an authenticated user by `owner_uid`. Public step links expose individual step detail pages by step ID.

## 2. Recommended Rewrite Architecture

Use:

- Next.js App Router.
- React components and hooks.
- Convex for database, server functions, file metadata, search helper queries, and background processing state.
- A file storage provider for original videos and generated images. Convex file storage can be used if video size and processing requirements fit; otherwise use object storage such as Cloudflare R2, S3, or Firebase Storage while keeping canonical metadata in Convex.
- A background worker or serverless job for video thumbnail/snapshot generation. Convex actions can orchestrate this, but ffmpeg execution may need a separate worker/runtime depending on hosting constraints.

Recommended top-level areas:

- `app/(authenticated)/feed`
- `app/(authenticated)/steps`
- `app/(authenticated)/steps/new`
- `app/(authenticated)/steps/[stepId]/edit`
- `app/(authenticated)/sessions`
- `app/(authenticated)/sessions/[sessionId]`
- `app/(authenticated)/historical-sessions/[startOfDay]`
- `app/s/[stepId]` for public step sharing

## 3. Authentication And Authorization

### 3.1 Authentication

The legacy app uses Google popup sign-in with persistent local auth.

Rewrite requirements:

- Require authentication for all private pages and data mutations.
- Sign in users with Google or an equivalent OAuth provider.
- Persist auth between browser sessions.
- On app load, resolve auth before loading private data.
- Redirect unauthenticated users away from private routes or present a sign-in screen.

### 3.2 Authorization

Rules:

- A user can list, create, update, and delete only records they own.
- Private list/feed/session pages must only include records for the authenticated user.
- Public step page `/s/[stepId]` can fetch and display an individual step without ownership checks.
- Public session reads existed in legacy rules, but no active public session UI exists. Do not expose session pages publicly unless intentionally redesigned.
- Storage access in the legacy app allows authenticated users to read/write any file; the rewrite should be stricter:
  - Users can upload only into their own namespace.
  - Users can read their own original videos.
  - Public step sharing needs video URLs that are readable by public recipients, signed for the shared page, or proxied by the app.

## 4. Core Domain Model

### 4.1 Step

A step is the main content record.

Fields:

- `id`: database ID.
- `ownerId`: authenticated user ID.
- `identifier`: numeric per-user display identifier, starting at `1` and increasing by one for each user-created step.
- `name`: required string.
- `videos`: required non-empty array of video objects.
- `difficulty`: required numeric enum: `1`, `2`, `3`, `5`, `8`.
- `feeling`: required non-empty array of configured feeling keys.
- `kind`: required enum: `step`, `inspiration`, `routine`.
- `tags`: user-authored content tags, string array.
- `artists`: string array.
- `notes`: optional/freeform string.
- `smartTags`: automatically inferred tags, string array.
- `removedSmartTags`: smart tags manually removed by the user, string array.
- `tokens`: generated search/scoring tokens derived from `name`.
- `variationKey`: string grouping ID shared by related variations.
- `practiceRecords`: array of practice records, newest first.
- `viewRecords`: array of timestamps, newest first.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `lastViewedAt`: optional legacy field; prefer deriving from `viewRecords[0]`.

### 4.2 Video Object

Fields:

- `hash`: content-derived identifier for duplicate detection.
- `url`: playable URL for the original video.
- `snapshotUrl`: optional storage path or URL for a full-size preview image.
- `thumbnailUrl`: optional storage path or URL for a small thumbnail image.
- `width`: optional source video width.
- `height`: optional source video height.

Video behavior:

- Each step must have at least one video.
- The first video is the primary video for feeds and detail pages.
- Additional videos are displayed as secondary links/buttons.
- Duplicate detection is based on `hash`.

### 4.3 Practice Record

Fields:

- `date`: exact timestamp when practice was recorded.
- `startOfDay`: timestamp for local start of that day.
- `collectionId`: optional session ID if practice was recorded from a practice session.

Rules:

- A step can be recorded as practiced at most once per day for a given collection/session.
- A general practice record without `collectionId` is separate from a session-specific practice record.
- New records are prepended to `practiceRecords`.

### 4.4 Practice Session

Practice sessions are present in the domain model and store logic. The current UI is mostly disabled, but legacy behavior is recoverable and should be considered for the rewrite.

Fields:

- `id`: database ID.
- `ownerId`: authenticated user ID.
- `name`: string.
- `steps`: ordered array of step IDs.
- `locked`: boolean.
- `createdAt`: timestamp.

Defaults:

- `locked`: `false`.
- `steps`: `[]`.
- `name`: `Practice {date}`, where date is formatted similarly to `dd MMM`.

Rules:

- Unlocked sessions can be renamed and have steps added/removed.
- Locked sessions cannot be mutated by normal session update operations.
- Sessions can be duplicated by copying `name`, `steps`, and owner.
- Sessions can be removed.

### 4.5 Tags And Derived Display Categories

Raw stored fields are plain arrays, but the UI derives grouped display tags.

Tag categories:

- `kind`: one tag from `kind`.
- `difficulty`: one tag from `difficulty`.
- `feeling`: one tag per feeling.
- `artist`: one tag per artist.
- `content`: user `tags` plus `smartTags`.
- `meta`: kind, feelings, artists, and difficulty.
- `all`: meta plus content.

Tag type labels:

- `DIFFICULTY`
- `FEELING`
- `ARTIST`
- `SMART`
- `KIND`

Display labels:

- Step kinds:
  - `step`: `Step`
  - `inspiration`: `Inspiration`
  - `routine`: `Routine`

## 5. Dance Configuration

The app must be configurable by dance type.

### 5.1 Kizomba Configuration

Feelings:

- `semba`: `Semba`
- `kizomba`: `Kizomba`
- `tarraxa`: `Tarraxa`
- `fusion`: `Kizomba fusion`
- `urban`: `Urban Kizz`
- `doucer`: `Doucer`

Difficulties:

- `1`: `Very easy`
- `2`: `Easy`
- `3`: `Intermediate`
- `5`: `Hard`
- `8`: `Very hard`

Smart tag matchers:

- `Saida damska`: matches Polish variants of female saida.
- `Saida męska`: matches Polish variants of male saida.
- `Saida francuska`: matches variants of French saida.
- `Shadow position`: matches `shadow position` or `shadow`.
- `Tep`: matches variants of `tep`.
- `Virgula`: matches `virgula` variants.
- `Monkey Virgula`: matches `monkey` or `monkey virgula`.
- `Otwarcie`: matches Polish variants of opening.
- `Przesunięcie nogi`: matches Polish variants of leg/foot shift.
- `Zatrzymanie`: matches Polish variants of stop/hold.
- `Grande-saida`: matches `grande-saida` and `grande saida`.
- `Podniesienie nogi`: matches Polish variants of lifting leg/foot.
- `Odwrotne trzymanie`: matches Polish variants of reverse hold.
- `Położenie`: matches Polish variants of placement/laying.
- `Podcięcie`: matches Polish variants of sweep.
- `Cassamento`: matches `cassamento`.
- `Footwork`: matches `footwork`.
- `Obrót`: matches Polish variants of turn.
- `Clockwise`: matches `clockwise`.
- `Skorpion`: matches `skorpion`.
- `Napasada`: matches `napasada` variants.
- `Cross`: matches `cross`, `kross`, and variants.
- `Za partnerką`: matches phrases meaning behind partner.
- `Przed partnerką`: matches phrases meaning in front of partner.
- `Wypuszczenie`: matches Polish variants of release.
- `Wyrzucenie ręki`: matches Polish variants of throwing/releasing hand.
- `Slide`: matches `slide` variants.
- `Pivot`: matches `pivot` variants.
- `Izolacja`: matches isolation variants.
- `Cyrkiel`: matches `cyrkiel` variants.

### 5.2 Zouk Configuration

Feelings:

- `zouk`: `Zouk`

Difficulties:

- `1`: `Beginner`
- `2`: `Beginner-Intermediate`
- `3`: `Intermediate`
- `5`: `Intermediate-Advanced`
- `8`: `Advanced`

Smart tag matchers:

- None.

## 6. Pages And Routes

### 6.1 Root

Route: `/`

Behavior:

- Redirect to `/feed`.

### 6.2 Feed

Route: `/feed`

Purpose:

- Main browsing/practice experience.
- Displays searchable, sortable, virtualized feed of step videos.

Data:

- Load all steps owned by current user.
- Derive selected feed steps from search/filter/sort state.

Layout:

- Sticky top bar.
- Desktop nav with active `Feed` link and `Create step` action.
- Mobile menu button opens navigation overlay.
- Search button in top bar.
- If search is active, show a badge with the count of matched steps.
- Main feed column displays step cards.

Feed item behavior:

- Display primary video.
- Auto-play when visible on mobile/non-desktop.
- Use an intersection observer or equivalent so videos are only mounted/played when visible.
- Record a view when video playback passes 80% progress.
- Do not record duplicate view records for the same step during a single app load.
- If playback progress goes below 10%, reset the local viewed flag so a future 80% crossing can emit a new viewed event, but store-level duplicate prevention should still apply for the app session.
- Display step name and tags.
- Display actions:
  - Open variations if variations exist.
  - Record practice / practiced indicator.
  - Options menu.

### 6.3 Search Overlay

Opened from feed top bar.

Fields:

- Text query.
- Feeling tri-state selection.
- Include all tags.
- Exclude any tags.
- Artists.
- Sort type.
- Sort direction.

Actions:

- Clear search.
- Back to results.

Behavior:

- Search state updates as form controls change with a short debounce.
- Feed scrolls to top after search changes.
- Clearing search restores the default search state.

Default search:

- Query: empty.
- Feeling filters: none.
- Include tags: none.
- Exclude tags: none.
- Artists: none.
- Sort by date added descending.

### 6.4 Step List

Route: `/list`

Purpose:

- Dense list/card view of all steps.

Behavior:

- Always fetch all user steps.
- Sort by `createdAt` descending.
- Display each step with:
  - `#identifier` and name linked to primary video.
  - Edit button linking to edit route.
  - Secondary video buttons for videos after the first.
  - Notes if present.
  - All tags.
  - Created date as relative time.
  - Last practiced date as relative time.
  - Variation links if variations exist.
  - Shortlink text that copies to clipboard.

### 6.5 Create Step

Route: `/create-step`

Purpose:

- Create a new step and optionally group it with existing variations.

Important legacy note:

- The current active create screen has persistence calls commented out, so it logs form data instead of saving. The intended behavior is still clear from the store/resource layer and should be implemented in the rewrite.

Layout:

- Split layout with main form and right sidebar.
- Top actions:
  - `Save`
  - `Save & create another`
- Sidebar lists existing steps ranked by similarity to current form data.
- Sidebar items can be selected to merge variation groups.

Save behavior:

- Validate form.
- Create step with current user as owner.
- Assign next per-user `identifier`.
- Generate a new `variationKey`.
- If selected variations exist, update all steps in those variation groups to the new `variationKey`.
- On `Save`, navigate to list page or another agreed post-save destination.
- On `Save & create another`, save and reset the form while preserving:
  - `feeling`
  - `artists`
  - `tags`
  - `difficulty`
- Clear selected variation groups after save.

### 6.6 Edit Step

Route: `/edit/[stepId]`

Purpose:

- Edit an existing step and update its variation grouping.

Layout:

- Split layout with main form and right sidebar.
- Top action: `Save`.
- Sidebar lists existing steps ranked by similarity to current form data.
- Selected variation groups are indicated and can be toggled.

Behavior:

- Load all user steps and find the step by ID.
- Initialize selected variation group to the current step's `variationKey`.
- Validate form before saving.
- On save:
  - Optimistically update the local step.
  - Generate a new `variationKey`.
  - Update the edited step with form values and the new `variationKey`.
  - Update all steps from selected variation groups to the same new `variationKey`.
  - Navigate to the list page.

### 6.7 Inline Edit Modal

Opened from a feed step's options menu.

Purpose:

- Edit a step without leaving the feed.

Layout:

- Borderless modal.
- Header with `Save`.
- Same step form as create/edit.
- Sidebar shows top 20 most similar steps, excluding the edited step.
- Each sidebar item displays its similarity score and variation toggle.

Behavior:

- On save, validate and update the step.
- On success, close modal.

### 6.8 Public Step

Route: `/s/[stepId]`

Purpose:

- Publicly share a single step.

Behavior:

- Does not require authentication.
- Fetches step by ID.
- Displays read-only step detail:
  - Name.
  - Primary video.
  - Tags.
- Shows a loader while fetching.

Access implications:

- Public page must be able to play the primary video. If private storage is used, implement signed read access or a server-mediated public playback route.

### 6.9 Sessions

Route: `/sessions`

Current status:

- The active page renders an empty placeholder.
- Legacy intended behavior exists and should be either restored or explicitly dropped.

Intended behavior:

- Display page title `Sessions`.
- `Add session` button creates a new practice session and navigates/returns to sessions list.
- Show saved sessions as cards:
  - Session name.
  - Number of selected steps.
  - Link to session detail.
- Show past sessions derived from practice records, grouped by `startOfDay`.

### 6.10 Session Detail

Route: `/sessions/[sessionId]`

Current status:

- The active page renders an empty placeholder.
- Legacy intended behavior exists.

Intended behavior:

- Fetch selected session.
- If session is unlocked, show a two-pane layout.
- Sidebar:
  - Button to open session feed/cart.
  - List all steps.
  - Each step can become active.
  - Each step can be toggled into/out of the session.
  - Footer shows selected count and `Clear`.
- Main:
  - Session name.
  - Remove session action.
  - Read-only display of active step.
- Mobile behavior:
  - If a session has selected steps, open the session feed/cart modal on initial load.
- Session feed/cart modal:
  - Shows only selected session steps in feed form.
  - Each step has a practice-record action with `collectionId` set to the session ID.

### 6.11 Historical Session

Route: `/historical-sessions/[startOfDay]`

Current status:

- The active page renders an empty placeholder.
- Legacy intended behavior exists.

Intended behavior:

- Load all user steps.
- Select steps with a practice record whose `startOfDay` equals route param.
- Render those steps in a feed.

## 7. Step Form Requirements

Fields:

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

Defaults for new step:

- `videos`: `[]`
- `name`: `""`
- `difficulty`: `1`
- `feeling`: `[]`
- `kind`: `step`
- `tags`: `[]`
- `artists`: `[]`
- `notes`: `""`
- `smartTags`: `[]`
- `removedSmartTags`: `[]`
- `tokens`: `[]`

Validation:

- `name` is required.
- `difficulty` is required number.
- `kind` must be `step`, `inspiration`, or `routine`.
- `feeling` must contain at least one non-empty value.
- `tags` must be an array of non-empty strings.
- `smartTags` is optional array of non-empty strings.
- `artists` is optional array of non-empty strings.
- `removedSmartTags` is optional array of non-empty strings.
- `notes` is optional string.
- `videos` must contain at least one valid video object.
- Each video must have non-empty `hash` and `url`.
- Video duplicate validation must reject a video if another step owned by the user already has the same `hash`, except when editing that same step.
- When a duplicate video is detected, show helper text: `Duplicate of {stepName}` for the duplicate video's row.

Reactive behavior:

- When `name` changes:
  - Debounce for roughly 200 ms.
  - Recompute smart tags.
  - Recompute `tokens`.
- When `removedSmartTags` changes:
  - Recompute smart tags.
- When a smart tag is removed from the smart tag input:
  - Add that tag to `removedSmartTags`.
  - Keep removed tags unique.
- Smart tag input should not allow arbitrary new values.
- Removed smart tag input should not allow arbitrary new values.
- Tags input and artists input should provide autocomplete from existing user steps.

Developer note:

- The legacy form currently displays raw form JSON in a `<pre>` for debugging. The rewrite should omit that from production UI unless a deliberate debug mode exists.

## 8. Video Upload And Processing

### 8.1 Upload Flow

User flow:

1. User clicks `Upload video`.
2. Browser file picker accepts `video/*`.
3. If user cancels, mark videos field touched/validated.
4. Compute a deterministic-ish file hash.
5. If the same hash is already selected in the current form, do not add it again.
6. If a video with this hash already exists in storage for the user, reuse its URL.
7. Otherwise upload original video.
8. Add `{ hash, url }` to form videos.
9. Trigger validation.

Hashing behavior:

- Legacy hashing uses MD5 over sampled file chunks.
- Chunk size: 512 KiB.
- Number of chunks is `ceil(file.size / chunkSize)`.
- Sampling interval is `max(round((e / pi) * sqrt(totalChunks)), 1)`.
- Hash includes every sampled chunk where `chunkIndex % samplingInterval === 0`.
- This is optimized for large files but is not a cryptographic guarantee. For the rewrite, prefer a full content hash if performance is acceptable, or preserve the sampling algorithm for migration compatibility.

Storage path convention:

- Original videos should be namespaced by user and hash, equivalent to `videos/{ownerId}/{hash}`.
- Generated snapshots should be equivalent to `snapshots/{ownerId}/{hash}.jpg`.
- Generated thumbnails should be equivalent to `thumbnails/{ownerId}/{hash}.jpg`.

### 8.2 Video Processing Job

Trigger:

- When a step is created or updated and any video lacks `snapshotUrl`, `thumbnailUrl`, `width`, or `height`.

Behavior:

- Skip deleted steps.
- Skip processing if all videos already have required processed fields.
- For each unprocessed video:
  - Download original video.
  - Generate one snapshot image at 50% of video duration.
  - Generate one thumbnail image at 50% of video duration, width 256 px and proportional height.
  - Read source video dimensions.
  - Upload generated images.
  - Update the video object with:
    - `snapshotUrl`
    - `thumbnailUrl`
    - `width`
    - `height`
- Update only video metadata without overwriting unrelated step fields.

Operational requirements:

- Processing should be idempotent.
- Processing should be retryable.
- Temporary files should be cleaned up.
- Failed processing should be observable in logs and, ideally, on step/video processing status.

## 9. Video Player Requirements

Core behavior:

- Render HTML video with:
  - `loop`
  - `playsInline`
  - metadata preload
  - muted by default
  - optional autoplay
- Background:
  - If `snapshotUrl` exists and background mode is enabled, render a blurred snapshot behind the video.
- Center overlay:
  - Clicking video area toggles play/pause.
  - Show large play icon while not playing.
- Top-right controls:
  - Mute/unmute.
  - Size/fullscreen/open-full-size control when enabled.
- Bottom-right controls:
  - Forward 1 second.
  - Back 5 seconds.
  - Back 1 second.
  - Play from start.
  - Toggle slow motion.
- Slow motion:
  - Full speed is `1`.
  - Slow speed is `0.5`.
- Progress:
  - Show a bottom progress bar calculated as `currentTime / duration`.
- View tracking:
  - Emit viewed event once playback crosses 80% progress.
  - Reset local viewed flag if progress drops below 10%.

Modal playback:

- Video modal opens a selected video in a borderless overlay.
- Full-size modal should autoplay.
- Aspect-aware behavior:
  - Determine video width/height from metadata if missing.
  - On portrait/narrow clients, if video is landscape, rotate 90 degrees to better use screen space.

## 10. Search, Filtering, And Sorting

### 10.1 Text Search

Search only by step `name`.

Legacy behavior:

- Uses fuzzy search with:
  - include score.
  - ignore location.
  - extended search enabled.
  - threshold `0.4`.
  - no automatic sort before custom sorting.

Rewrite options:

- Implement equivalent client/server fuzzy scoring.
- Or use Convex search/indexing for query candidate selection and preserve the scoring/sorting semantics in app code.

### 10.2 Filters

A step matches filters only if all filter groups match.

Include all tags:

- Empty filter matches every step.
- Non-empty filter requires every selected tag to exist in either `tags` or `smartTags`.

Exclude any tags:

- Empty filter matches every step.
- Non-empty filter rejects a step if any excluded tag exists in either `tags` or `smartTags`.

Artists:

- Empty filter matches every step.
- Non-empty filter matches when the step has at least one selected artist.

Feelings:

- UI is tri-state per feeling:
  - `0`: neutral.
  - `1`: include.
  - `-1`: exclude.
- If no positive feelings are selected, positive matching passes.
- If positive feelings exist, step must include at least one positive feeling.
- Step must include none of the negative feelings.

### 10.3 Search Score

When sorting by score, calculate:

- Initial text score: `(1 - fuzzyScore) * 200`, where missing/empty fuzzy score is `0`.
- For each included tag that exists on the step in `tags` or `smartTags`: add `20`.
- For each positively selected feeling that exists on the step: add `20`.

### 10.4 Sort Types

Supported sort types:

- `SCORE`
- `VIEW_DATE`
- `VIEW_COUNT`
- `PRACTICE_DATE`
- `ADDED_DATE`
- `RANDOM`

Directions:

- `ASCENDING`
- `DESCENDING`

Sort behavior:

- `RANDOM`: shuffle results. Direction is irrelevant.
- `ADDED_DATE`: order by `createdAt`.
- `VIEW_COUNT`: order by `viewRecords.length`, then by `updatedAt` in the reverse direction.
- `VIEW_DATE`: order by newest view record timestamp, then by `updatedAt` in the reverse direction.
- `PRACTICE_DATE`: order by newest practice record `date`, then by `updatedAt` in the reverse direction.
- `SCORE`: order by computed score.

Reverse direction rule:

- If primary direction is descending, secondary `updatedAt` direction is ascending.
- If primary direction is ascending, secondary `updatedAt` direction is descending.

## 11. Tokenization And Variation Similarity

### 11.1 Tokenization

Tokens are generated from step name.

Cleaning:

- Lowercase using locale-aware lowercasing.
- Replace whitespace, digits, punctuation, quotes, parentheses, and similar stop characters with spaces.
- Remove words whose length is less than or equal to `2`.
- Collapse multiple spaces to one.
- Trim.

Token chain generation:

- Split cleaned text by spaces.
- Generate 1-grams, 2-grams, 3-grams, and 4-grams.
- Join token chains with `|`.

Example:

- `Aaa bbb ccc` produces:
  - `aaa`
  - `bbb`
  - `ccc`
  - `aaa|bbb`
  - `bbb|ccc`
  - `aaa|bbb|ccc`

### 11.2 Variation Similarity Score

Used to rank existing steps when creating or editing a step.

Inputs:

- `tokens`
- `tags`

Token score:

- Intersect token arrays.
- For each matching token, add `(number of terms in token chain)^2`.
- Examples:
  - `a`: `1`
  - `a|b`: `4`
  - `a|b|c`: `9`
  - `a|b|c|d`: `16`

Tag score:

- Intersect tag arrays.
- For each matching tag, add `10 * index`, where index is one-based in the matching intersection order.

Total score:

- `tokenScore + tagScore`.

Sidebar ranking:

- Sort candidate steps by descending total score.
- Inline edit shows only the top 20 candidates.
- Edit/create page can show all candidates.

### 11.3 Variation Grouping

Rules:

- Every step has a `variationKey`.
- Steps with the same `variationKey` are variations of one another.
- When creating or updating a step, generate a fresh variation key for the resulting group.
- If selected variation groups are provided, update every step in those groups to the fresh variation key.
- The current step is excluded from its own displayed variation list.
- Variation count for a step is the number of other steps with the same `variationKey`.

## 12. Practice Workflows

### 12.1 Record Practice From Feed

Behavior:

- If the step already has a practice record for today with no collection/session ID, show practiced state.
- If not practiced today, show `Practice` or `Record practice`.
- Clicking records a practice record.
- If already practiced, clicking the practiced state currently attempts the same action but no duplicate is created.

Record payload:

- `date`: current timestamp.
- `startOfDay`: local start of current day.
- `collectionId`: absent.

### 12.2 Record Practice From Session

Behavior:

- Same as general practice, but pass `collectionId = sessionId`.
- Duplicate prevention checks both `startOfDay` and `collectionId`.

### 12.3 Historical Practice

Behavior:

- Group steps by practice record `startOfDay`.
- A step should appear only once per historical date even if multiple records exist for that date.
- Historical date list should be sorted newest first.
- Historical session detail displays all steps for the selected `startOfDay`.

## 13. Navigation And Layout

Global UI:

- Private pages use a top bar where appropriate.
- Desktop top bar:
  - Center nav includes `Feed`.
  - Right side includes search slot/actions and `Create step`.
- Mobile:
  - Menu button opens a slide-in navigation overlay.
  - Overlay includes at least `Feed`.
  - Opening overlay prevents body scroll.
  - Navigating closes overlay.

Responsive behavior:

- Desktop breakpoint in legacy UI is `900px`.
- Feed videos should scale to feed width while respecting source aspect ratio.
- Feed video max height should be around `60vh`.
- Virtualized feed should preserve stable item sizes and update when scaled video height changes.

## 14. Clipboard And Sharing

Shortlink:

- Public step URL format: `{origin}/s/{stepId}`.
- Copying link writes the full URL to clipboard.

Places where shortlink appears:

- Step options menu: `Copy link`.
- Step list item: visible `Shortlink: {url}` that copies on click.

## 15. Data Loading And Client State

Legacy state statuses:

- `clean`: not loaded.
- `pending`: loading.
- `dirty`: loaded.

Rewrite equivalent:

- Use Convex reactive queries for most data.
- Preserve explicit loading states in UI.
- Avoid refetching all steps when already loaded unless the page/action requires fresh data.

Data selectors to preserve as derived queries/helpers:

- All raw steps owned by user.
- Steps sorted by created date descending.
- Steps by ID.
- Raw steps by ID.
- Existing artists from all user steps.
- Existing tags from all user-authored and smart tags.
- Variations by `variationKey`.
- Steps by practice date.
- Stable step IDs sorted lexicographically.
- Next per-user numeric identifier.

## 16. Database And Convex Schema Guidance

Suggested Convex tables:

- `users`
- `steps`
- `practiceSessions`
- `files` or `videoFiles` if using external storage metadata.
- Optional `videoProcessingJobs` for observability/retries.

Suggested indexes:

- `steps.by_owner`: `ownerId`
- `steps.by_owner_identifier`: `ownerId`, `identifier`
- `steps.by_owner_variationKey`: `ownerId`, `variationKey`
- `steps.by_owner_createdAt`: `ownerId`, `createdAt`
- `steps.by_owner_updatedAt`: `ownerId`, `updatedAt`
- `practiceSessions.by_owner`: `ownerId`
- `practiceSessions.by_owner_createdAt`: `ownerId`, `createdAt`
- Optional: `steps.by_video_hash` if duplicate lookup should be server-side.

Mutation requirements:

- `createStep`
- `updateStep`
- `recordStepView`
- `recordPractice`
- `createPracticeSession`
- `duplicatePracticeSession`
- `updatePracticeSession`
- `togglePracticeSessionLock`
- `deletePracticeSession`
- `addStepToSession`
- `removeStepFromSession`
- `clearSessionSteps`

Query requirements:

- `listMySteps`
- `getStepForEdit`
- `getPublicStep`
- `searchMySteps`
- `listMyPracticeSessions`
- `getMyPracticeSession`
- `listHistoricalPracticeDays`
- `getHistoricalPracticeSteps`
- `getExistingTagsAndArtists`
- `getVariationCandidates`

Action/job requirements:

- `processStepVideos`
- `refreshSmartTagsForUser` or admin-only global script.
- `recreateThumbnails` or admin-only backfill script.

## 17. Migration Requirements

Legacy data migrations to account for:

- Some old records may lack `kind`; default to `step`.
- Some old records may use `dance`; convert/ignore in favor of `feeling`.
- Some old practice records may lack `startOfDay`; default it from old `date`.
- Some videos may lack `snapshotUrl`, `thumbnailUrl`, `width`, or `height`; enqueue processing.
- Old field names use snake_case:
  - `owner_uid`
  - `created_at`
  - `updated_at`
  - `last_viewed_at`
  - `variationKey`
  - `practice_records`
  - `view_records`
  - `smart_tags`
  - `removed_smart_tags`
  - `snapshot_url`
  - `thumbnail_url`
- Rewrite can normalize to camelCase, but migration must map every field.

Backfill scripts to preserve:

- Trigger video processing for all steps by touching a timestamp/token.
- Add default kind.
- Convert `dance` to `feeling`.
- Add granular practice `startOfDay` values.
- Recreate all thumbnails by clearing generated image fields.
- Refresh smart tags from current matcher rules, while preserving manually removed smart tags.

## 18. Known Legacy Gaps To Resolve

These are observed product gaps in the current app and should be addressed intentionally:

- Create step persistence is disabled in the active UI.
- Sessions, session detail, historical sessions, session cards, and session providers render placeholders despite legacy intended behavior being present.
- Some debug `console.log` calls and debug form JSON are visible/active.
- Public step access depends on public video readability, which should be explicitly designed.
- Legacy Firestore rules allow public `get` for sessions; rewrite should avoid unintentionally public session access.
- Legacy storage rules are broad for authenticated users; rewrite should use owner-scoped storage permissions.
- `updatedAt` is used by sorting but not consistently written by all mutations; rewrite should set it reliably.

## 19. Acceptance Criteria By Feature

### Feed

- Authenticated user can see only their steps.
- Feed displays videos, names, tags, actions, and variations.
- Search filters and sorting update feed results.
- View records are created after 80% playback progress and not duplicated during one app load.
- Practice can be recorded from feed and updates UI immediately.

### Step Creation

- User can upload at least one video.
- Duplicate videos are blocked with clear messaging.
- Smart tags and tokens update from name.
- User can create a valid step.
- Identifier increments per user.
- Save-and-create-another preserves configured persistent fields.
- Selected variation groups merge correctly.

### Step Editing

- User can edit all form fields.
- User can merge/unmerge variation groups through selected candidates.
- Inline edit and full edit produce equivalent saved data.
- Updated step appears immediately in feed/list.

### Search

- Include/exclude tag behavior matches the rules above.
- Artist filter matches any selected artist.
- Feeling tri-state behavior matches positive/negative rules.
- Sort modes produce deterministic expected order except random.

### Public Sharing

- Copy link generates `/s/{stepId}` URL.
- Public page loads without auth.
- Public page can play the step video.

### Sessions

- If restored, user can create, view, edit, lock, duplicate, and delete sessions.
- User can add/remove/clear steps in an unlocked session.
- Session feed records session-scoped practice.
- Historical sessions group practiced steps by local start of day.

### Video Processing

- Uploaded videos eventually receive snapshot, thumbnail, width, and height.
- Processing is idempotent and does not loop forever.
- Failed processing is visible to developers/admins.

## 20. Suggested Implementation Task Breakdown

1. Set up Next.js, auth, Convex schema, and protected/public route shells.
2. Implement step data model, migrations/import tooling, and owner-scoped queries.
3. Implement video upload, hashing, storage metadata, and duplicate detection.
4. Implement video processing pipeline and backfill job.
5. Build shared video player and modal playback.
6. Build step form with validation, smart tags, tokens, autocomplete, and video input.
7. Implement create/edit/inline-edit workflows and variation merging.
8. Implement feed with virtualized video cards, view tracking, practice actions, and options menu.
9. Implement search overlay, filtering, scoring, and sorting.
10. Implement step list and public step page.
11. Restore or intentionally remove sessions; if restored, implement sessions and historical practice.
12. Add migration/backfill scripts for legacy data.
13. Add tests for tokenization, smart tags, search filters, sort order, variation scoring, practice duplicate prevention, and authorization.

