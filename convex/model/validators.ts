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

export const videoProcessingStatusValidator = v.union(
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);

export const practiceRecordValidator = v.object({
  date: v.number(),
  startOfDay: v.number(),
  collectionId: v.optional(v.id("practiceSessions")),
});

export const createStepInputValidator = v.object({
  name: v.string(),
  videos: v.array(videoValidator),
  difficulty: difficultyValidator,
  feeling: v.array(v.string()),
  kind: kindValidator,
  tags: v.array(v.string()),
  artists: v.array(v.string()),
  notes: v.string(),
  removedSmartTags: v.array(v.string()),
  variationKey: v.string(),
  mergeVariationKeys: v.optional(v.array(v.string())),
});

export const updateStepInputValidator = v.object({
  name: v.optional(v.string()),
  videos: v.optional(v.array(videoValidator)),
  difficulty: v.optional(difficultyValidator),
  feeling: v.optional(v.array(v.string())),
  kind: v.optional(kindValidator),
  tags: v.optional(v.array(v.string())),
  artists: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  removedSmartTags: v.optional(v.array(v.string())),
  variationKey: v.optional(v.string()),
  mergeVariationKeys: v.optional(v.array(v.string())),
});

export const practiceRecordInputValidator = v.object({
  date: v.number(),
  startOfDay: v.number(),
  collectionId: v.optional(v.id("practiceSessions")),
});

export const importedPracticeRecordValidator = v.object({
  date: v.number(),
  startOfDay: v.number(),
});

export const importedStepValidator = v.object({
  legacyId: v.string(),
  ownerId: v.string(),
  identifier: v.number(),
  name: v.string(),
  videos: v.array(videoValidator),
  videoHashes: v.array(v.string()),
  difficulty: difficultyValidator,
  feeling: v.array(v.string()),
  kind: kindValidator,
  tags: v.array(v.string()),
  artists: v.array(v.string()),
  notes: v.string(),
  smartTags: v.array(v.string()),
  removedSmartTags: v.array(v.string()),
  tokens: v.array(v.string()),
  variationKey: v.string(),
  practiceRecords: v.array(importedPracticeRecordValidator),
  viewRecords: v.array(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastViewedAt: v.optional(v.number()),
  needsVideoProcessing: v.boolean(),
});

export const importedSessionValidator = v.object({
  legacyId: v.string(),
  ownerId: v.string(),
  name: v.string(),
  legacyStepIds: v.array(v.string()),
  locked: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const processedVideoMetadataValidator = v.object({
  hash: v.string(),
  storageKey: v.string(),
  snapshotStorageKey: v.string(),
  thumbnailStorageKey: v.string(),
  width: v.number(),
  height: v.number(),
});
