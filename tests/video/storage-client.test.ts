import { describe, expect, it, vi } from "vitest";
import {
  addVideoSelection,
  buildOwnerVideoStorageKey,
  uploadVideoForStep,
  type ExistingVideoMatch,
} from "@/lib/video/storage-client";

function fileWithHashName() {
  return new File([new Uint8Array([1, 2, 3])], "clip.mp4", {
    type: "video/mp4",
  });
}

describe("video storage client helpers", () => {
  it("builds owner-scoped object keys", () => {
    expect(buildOwnerVideoStorageKey("user/a", "abc/123")).toBe(
      "videos/user%2Fa/abc%2F123",
    );
  });

  it("blocks same-form duplicate hashes", () => {
    const current = [{ hash: "hash-a", storageKey: "videos/user/hash-a" }];

    expect(addVideoSelection(current, current[0])).toEqual({
      videos: current,
      added: false,
      reason: "already-selected",
    });
  });

  it("reuses owner-scoped storage keys for existing hashes", async () => {
    const existing: ExistingVideoMatch = {
      hash: "hash-a",
      storageKey: "videos/user-a/hash-a",
      duplicateStepId: "step-a",
      duplicateStepName: "Existing step",
    };
    const upload = vi.fn();
    const requestUpload = vi.fn();

    await expect(
      uploadVideoForStep({
        file: fileWithHashName(),
        hash: "hash-a",
        existing,
        requestUpload,
        upload,
      }),
    ).resolves.toEqual({
      hash: "hash-a",
      storageKey: "videos/user-a/hash-a",
      duplicateOf: {
        stepId: "step-a",
        stepName: "Existing step",
      },
    });
    expect(requestUpload).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("requests a signed URL before uploading new hashes", async () => {
    const upload = vi.fn().mockResolvedValue(undefined);
    const requestUpload = vi.fn().mockResolvedValue({
      uploadUrl: "https://storage.googleapis.test/upload",
      storageKey: "videos/user-a/hash-b",
    });

    await expect(
      uploadVideoForStep({
        file: fileWithHashName(),
        hash: "hash-b",
        existing: null,
        requestUpload,
        upload,
      }),
    ).resolves.toEqual({
      hash: "hash-b",
      storageKey: "videos/user-a/hash-b",
    });
    expect(requestUpload).toHaveBeenCalledWith({
      hash: "hash-b",
      contentType: "video/mp4",
    });
    expect(upload).toHaveBeenCalledWith(
      "https://storage.googleapis.test/upload",
      expect.any(File),
      "video/mp4",
    );
  });
});
