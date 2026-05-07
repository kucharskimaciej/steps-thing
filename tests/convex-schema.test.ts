import { describe, expect, it } from "vitest";
import schema from "@/convex/schema";

const exportedSchema = JSON.parse(
  (schema as unknown as { export: () => string }).export(),
);

const table = (name: string) => {
  const match = exportedSchema.tables.find(
    (candidate: { tableName: string }) => candidate.tableName === name,
  );

  if (!match) {
    throw new Error(`Missing table: ${name}`);
  }

  return match;
};

describe("Convex schema", () => {
  it("defines owner-scoped step indexes", () => {
    expect(table("steps").indexes).toEqual([
      { indexDescriptor: "by_legacyId", fields: ["legacyId"] },
      { indexDescriptor: "by_owner", fields: ["ownerId"] },
      {
        indexDescriptor: "by_owner_identifier",
        fields: ["ownerId", "identifier"],
      },
      {
        indexDescriptor: "by_owner_variationKey",
        fields: ["ownerId", "variationKey"],
      },
      {
        indexDescriptor: "by_owner_createdAt",
        fields: ["ownerId", "createdAt"],
      },
      {
        indexDescriptor: "by_owner_updatedAt",
        fields: ["ownerId", "updatedAt"],
      },
    ]);
  });

  it("defines owner-scoped practice session indexes", () => {
    expect(table("practiceSessions").indexes).toEqual([
      { indexDescriptor: "by_legacyId", fields: ["legacyId"] },
      { indexDescriptor: "by_owner", fields: ["ownerId"] },
      {
        indexDescriptor: "by_owner_createdAt",
        fields: ["ownerId", "createdAt"],
      },
    ]);
  });

  it("defines video processing job indexes", () => {
    expect(table("videoProcessingJobs").indexes).toEqual([
      { indexDescriptor: "by_step", fields: ["stepId"] },
      {
        indexDescriptor: "by_owner_status",
        fields: ["ownerId", "status"],
      },
      {
        indexDescriptor: "by_video",
        fields: ["stepId", "videoHash", "storageKey"],
      },
    ]);
  });

  it("stores denormalized video hashes on steps", () => {
    expect(table("steps").documentType.value.videoHashes).toEqual({
      fieldType: {
        type: "array",
        value: { type: "string" },
      },
      optional: false,
    });
  });

  it("stores Google Cloud Storage object keys on videos", () => {
    const videoType = table("steps").documentType.value.videos.fieldType.value;

    expect(videoType.value).toMatchObject({
      hash: { fieldType: { type: "string" }, optional: false },
      storageKey: { fieldType: { type: "string" }, optional: false },
      snapshotStorageKey: { fieldType: { type: "string" }, optional: true },
      thumbnailStorageKey: { fieldType: { type: "string" }, optional: true },
    });
    expect(videoType.value).not.toHaveProperty("url");
    expect(videoType.value).not.toHaveProperty("snapshotUrl");
    expect(videoType.value).not.toHaveProperty("thumbnailUrl");
  });
});
