export type VideoProcessingFields = {
  hash: string;
  storageKey: string;
  snapshotStorageKey?: string;
  thumbnailStorageKey?: string;
  width?: number;
  height?: number;
};

export type ProcessedVideoMetadata = Required<VideoProcessingFields>;

export function isVideoProcessed(video: VideoProcessingFields): boolean {
  return Boolean(
    video.snapshotStorageKey &&
      video.thumbnailStorageKey &&
      Number.isFinite(video.width) &&
      Number.isFinite(video.height),
  );
}

export function findVideosNeedingProcessing<T extends VideoProcessingFields>(
  videos: T[],
): T[] {
  return videos.filter((video) => !isVideoProcessed(video));
}

export function stepNeedsVideoProcessing(
  videos: VideoProcessingFields[],
): boolean {
  return findVideosNeedingProcessing(videos).length > 0;
}

export function buildVideoProcessingPatch<T extends VideoProcessingFields>({
  videos,
  processed,
}: {
  videos: T[];
  processed: ProcessedVideoMetadata;
}) {
  const patchedVideos = videos.map((video) =>
    video.hash === processed.hash && video.storageKey === processed.storageKey
      ? { ...video, ...processed }
      : video,
  );

  return {
    videos: patchedVideos,
    videoHashes: patchedVideos.map((video) => video.hash),
    needsVideoProcessing: stepNeedsVideoProcessing(patchedVideos),
  };
}
