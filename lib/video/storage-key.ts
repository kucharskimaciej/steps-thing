export function buildOwnerVideoStorageKey(ownerId: string, hash: string): string {
  return `videos/${encodeURIComponent(ownerId)}/${encodeURIComponent(hash)}`;
}
