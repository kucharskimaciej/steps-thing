import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUserId } from "./auth";

export const findExistingVideosByHash = query({
  args: {
    hashes: v.array(v.string()),
    excludeStepId: v.optional(v.id("steps")),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const requested = new Set(args.hashes);

    if (requested.size === 0) {
      return [];
    }

    const steps = await ctx.db
      .query("steps")
      .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
      .collect();

    return steps.flatMap((step) =>
      step._id === args.excludeStepId
        ? []
        : step.videos
            .filter((video) => requested.has(video.hash))
            .map((video) => ({
              hash: video.hash,
              storageKey: video.storageKey,
              duplicateStepId: step._id,
              duplicateStepName: step.name,
            })),
    );
  },
});
