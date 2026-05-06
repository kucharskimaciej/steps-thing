# Video Storage And Playback Context

The first video on a step is the primary video. Users can upload multiple videos. Duplicate detection is hash-based. Original videos, generated snapshots, and generated thumbnails are stored in Google Cloud Storage. Convex stores canonical metadata, owner scope, hashes, object keys, and processing state.

Player behavior must support looped playback, muted default, mobile autoplay when visible, slow motion, seek controls, progress, fullscreen/open-full-size modal, blurred snapshot backgrounds, and view tracking events.

Use server-issued signed URLs for Google Cloud Storage upload and read access. Store object keys in Convex; do not persist long-lived public URLs.
