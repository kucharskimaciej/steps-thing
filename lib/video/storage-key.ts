export function buildOwnerVideoStorageKey(
  ownerId: string,
  hash: string,
): string {
  return `videos/${encodeURIComponent(ownerId)}/${encodeURIComponent(hash)}`;
}

export function buildOwnerVideoSnapshotStorageKey(
  ownerId: string,
  hash: string,
): string {
  return `video-snapshots/${encodeURIComponent(ownerId)}/${encodeURIComponent(
    hash,
  )}.jpg`;
}

export function buildOwnerVideoThumbnailStorageKey(
  ownerId: string,
  hash: string,
): string {
  return `video-thumbnails/${encodeURIComponent(ownerId)}/${encodeURIComponent(
    hash,
  )}.jpg`;
}
