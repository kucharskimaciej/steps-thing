import type { StepKind } from "../../lib/domain/config";
import type { BackupDocument, MappedStep, RawBackupStep, RawBackupVideo } from "./types";

export function mapBackupStep(
  source: BackupDocument<RawBackupStep>,
): MappedStep {
  const feeling = source.data.feeling ?? legacyDanceToFeeling(source.data.dance);
  const videos = source.data.videos.map((video) => mapBackupVideo(video));

  return {
    legacyId: source.legacyId,
    ownerId: source.data.owner_uid,
    identifier: source.data.identifier,
    name: source.data.name,
    videos,
    videoHashes: videos.map((video) => video.hash),
    difficulty: source.data.difficulty as MappedStep["difficulty"],
    feeling,
    kind: (source.data.kind ?? "step") as StepKind,
    tags: source.data.tags,
    artists: source.data.artists,
    notes: source.data.notes,
    smartTags: source.data.smart_tags,
    removedSmartTags: source.data.removed_smart_tags,
    tokens: source.data.tokens,
    variationKey: source.data.variationKey,
    practiceRecords: (source.data.practice_records ?? []).map((record) => ({
      date: record.date,
      startOfDay: record.start_of_day ?? record.date,
    })),
    viewRecords: source.data.view_records ?? [],
    createdAt: source.data.created_at,
    updatedAt: source.data.updated_at ?? source.data.created_at,
    lastViewedAt: source.data.last_viewed_at,
    needsVideoProcessing: videos.some(
      (video) => !video.snapshotStorageKey || !video.thumbnailStorageKey,
    ),
  };
}

function legacyDanceToFeeling(dance: string | null | undefined): string[] {
  return dance ? [dance] : [];
}

function mapBackupVideo(video: RawBackupVideo) {
  return {
    hash: video.hash,
    storageKey: firebaseObjectPath(video.url) ?? video.url,
    snapshotStorageKey: firebaseObjectPath(video.snapshot_url) ?? video.snapshot_url,
    thumbnailStorageKey: firebaseObjectPath(video.thumbnail_url) ?? video.thumbnail_url,
    width: video.width,
    height: video.height,
  };
}

function firebaseObjectPath(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const marker = "/o/";
    const objectPath = url.pathname.includes(marker)
      ? url.pathname.slice(url.pathname.indexOf(marker) + marker.length)
      : undefined;

    return objectPath ? decodeURIComponent(objectPath) : value;
  } catch {
    return value;
  }
}

export function isStepKind(value: string): value is StepKind {
  return value === "step" || value === "inspiration" || value === "routine";
}
