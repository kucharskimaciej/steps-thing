import { v } from "convex/values";

export const difficultyValidator = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(5),
  v.literal(8),
);

export const kindValidator = v.union(
  v.literal("step"),
  v.literal("inspiration"),
  v.literal("routine"),
);

export const videoValidator = v.object({
  hash: v.string(),
  storageKey: v.string(),
  snapshotStorageKey: v.optional(v.string()),
  thumbnailStorageKey: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

export const practiceRecordValidator = v.object({
  date: v.number(),
  startOfDay: v.number(),
  collectionId: v.optional(v.id("practiceSessions")),
});
