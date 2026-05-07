import { describe, expect, it } from "vitest";
import {
  VIDEO_HASH_CHUNK_SIZE,
  hashVideoFile,
  sampledChunkIndexes,
} from "@/lib/video/hash-file";

function videoFile(bytes: Uint8Array) {
  const body = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(body).set(bytes);

  return new File([body], "clip.mp4", { type: "video/mp4" });
}

describe("video file hashing", () => {
  it("uses the required sampled chunk interval", () => {
    expect(sampledChunkIndexes(0)).toEqual([]);
    expect(sampledChunkIndexes(VIDEO_HASH_CHUNK_SIZE)).toEqual([0]);
    expect(sampledChunkIndexes(VIDEO_HASH_CHUNK_SIZE * 16)).toEqual([
      0, 3, 6, 9, 12, 15,
    ]);
  });

  it("hashes only sampled chunks in chunk order", async () => {
    const bytes = new Uint8Array(VIDEO_HASH_CHUNK_SIZE * 4);
    bytes.fill(1, 0, VIDEO_HASH_CHUNK_SIZE);
    bytes.fill(2, VIDEO_HASH_CHUNK_SIZE, VIDEO_HASH_CHUNK_SIZE * 2);
    bytes.fill(3, VIDEO_HASH_CHUNK_SIZE * 2, VIDEO_HASH_CHUNK_SIZE * 3);
    bytes.fill(4, VIDEO_HASH_CHUNK_SIZE * 3);

    const hash = await hashVideoFile(videoFile(bytes));
    const expected = await crypto.subtle.digest(
      "SHA-256",
      new Uint8Array([
        ...bytes.slice(0, VIDEO_HASH_CHUNK_SIZE),
        ...bytes.slice(VIDEO_HASH_CHUNK_SIZE * 2, VIDEO_HASH_CHUNK_SIZE * 3),
      ]),
    );

    expect(hash).toBe(
      [...new Uint8Array(expected)]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    );
  });
});
