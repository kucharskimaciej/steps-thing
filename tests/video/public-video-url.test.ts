import { describe, expect, it, vi } from "vitest";
import { resolvePublicStepVideoUrls } from "@/lib/video/public-video-url";
import { createSignedGcsUrl, getGcsConfigFromEnv } from "@/lib/video/gcs";

vi.mock("@/lib/video/gcs", () => ({
  createSignedGcsUrl: vi.fn(({ storageKey }) => `signed:${storageKey}`),
  getGcsConfigFromEnv: vi.fn(() => ({
    bucket: "bucket",
    clientEmail: "client@example.com",
    privateKey: "private-key",
  })),
}));

describe("resolvePublicStepVideoUrls", () => {
  it("signs primary video and snapshot keys with a short read ttl", () => {
    const now = 1_700_000_000_000;

    expect(
      resolvePublicStepVideoUrls({
        step: {
          videos: [
            {
              hash: "hash-a",
              storageKey: "videos/user-a/hash-a",
              snapshotStorageKey: "snapshots/user-a/hash-a.jpg",
              width: 1920,
              height: 1080,
            },
          ],
        },
        now,
      }),
    ).toEqual({
      primaryVideo: {
        hash: "hash-a",
        storageKey: "videos/user-a/hash-a",
        snapshotStorageKey: "snapshots/user-a/hash-a.jpg",
        width: 1920,
        height: 1080,
        videoUrl: "signed:videos/user-a/hash-a",
        snapshotUrl: "signed:snapshots/user-a/hash-a.jpg",
      },
    });
    expect(getGcsConfigFromEnv).toHaveBeenCalledOnce();
    expect(createSignedGcsUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        storageKey: "videos/user-a/hash-a",
        expires: 1_700_000_900,
      }),
    );
  });

  it("returns no primary video when the public step has no videos", () => {
    expect(
      resolvePublicStepVideoUrls({ step: { videos: [] }, now: 0 }),
    ).toEqual({ primaryVideo: null });
    expect(createSignedGcsUrl).not.toHaveBeenCalledWith(
      expect.objectContaining({ storageKey: undefined }),
    );
  });
});
