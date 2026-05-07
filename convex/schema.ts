import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  difficultyValidator,
  kindValidator,
  practiceRecordValidator,
  videoValidator,
} from "./model/validators";

export default defineSchema({
  steps: defineTable({
    legacyId: v.optional(v.string()),
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
    practiceRecords: v.array(practiceRecordValidator),
    viewRecords: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastViewedAt: v.optional(v.number()),
    needsVideoProcessing: v.optional(v.boolean()),
  })
    .index("by_legacyId", ["legacyId"])
    .index("by_owner", ["ownerId"])
    .index("by_owner_identifier", ["ownerId", "identifier"])
    .index("by_owner_variationKey", ["ownerId", "variationKey"])
    .index("by_owner_createdAt", ["ownerId", "createdAt"])
    .index("by_owner_updatedAt", ["ownerId", "updatedAt"]),
  practiceSessions: defineTable({
    legacyId: v.optional(v.string()),
    ownerId: v.string(),
    name: v.string(),
    steps: v.array(v.id("steps")),
    locked: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_legacyId", ["legacyId"])
    .index("by_owner", ["ownerId"])
    .index("by_owner_createdAt", ["ownerId", "createdAt"]),
});
