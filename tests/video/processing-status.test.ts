import { describe, expect, it } from "vitest";
import {
  buildVideoProcessingPatch,
  findVideosNeedingProcessing,
  isVideoProcessed,
  stepNeedsVideoProcessing,
} from "@/lib/video/processing-status";

const processedVideo = {
  hash: "hash-a",
  storageKey: "videos/user-a/hash-a",
  snapshotStorageKey: "snapshots/user-a/hash-a.jpg",
  thumbnailStorageKey: "thumbnails/user-a/hash-a.jpg",
  width: 1920,
  height: 1080,
};

describe("video processing status", () => {
  it("detects videos missing any generated metadata", () => {
    expect(isVideoProcessed(processedVideo)).toBe(true);
    expect(
      isVideoProcessed({
        ...processedVideo,
        thumbnailStorageKey: undefined,
      }),
    ).toBe(false);
    expect(
      findVideosNeedingProcessing([
        processedVideo,
        { hash: "hash-b", storageKey: "videos/user-a/hash-b" },
      ]),
    ).toEqual([{ hash: "hash-b", storageKey: "videos/user-a/hash-b" }]);
  });

  it("marks a step as needing processing only when a video is incomplete", () => {
    expect(stepNeedsVideoProcessing([processedVideo])).toBe(false);
    expect(
      stepNeedsVideoProcessing([
        processedVideo,
        { hash: "hash-b", storageKey: "videos/user-a/hash-b" },
      ]),
    ).toBe(true);
  });

  it("updates only the matching video metadata", () => {
    const unchangedVideo = {
      ...processedVideo,
      hash: "hash-c",
      storageKey: "videos/user-a/hash-c",
    };
    const patch = buildVideoProcessingPatch({
      videos: [
        unchangedVideo,
        { hash: "hash-b", storageKey: "videos/user-a/hash-b" },
      ],
      processed: {
        hash: "hash-b",
        storageKey: "videos/user-a/hash-b",
        snapshotStorageKey: "snapshots/user-a/hash-b.jpg",
        thumbnailStorageKey: "thumbnails/user-a/hash-b.jpg",
        width: 1280,
        height: 720,
      },
    });

    expect(patch.videos).toEqual([
      unchangedVideo,
      {
        hash: "hash-b",
        storageKey: "videos/user-a/hash-b",
        snapshotStorageKey: "snapshots/user-a/hash-b.jpg",
        thumbnailStorageKey: "thumbnails/user-a/hash-b.jpg",
        width: 1280,
        height: 720,
      },
    ]);
    expect(patch.needsVideoProcessing).toBe(false);
  });
});
