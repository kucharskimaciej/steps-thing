import { v } from "convex/values";
import { getActiveAppConfig } from "../lib/domain/config";
import { matchSmartTags } from "../lib/domain/smart-tags";
import { tokenizeStepName } from "../lib/domain/tokenize";
import { mutation, type MutationCtx } from "./_generated/server";
import { requireAdminUser } from "./adminAuth";
import { enqueueMissingVideoProcessing } from "./videoProcessing";

export const refreshSmartTags = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    const steps = await loadSteps(ctx, args.limit);
    let updated = 0;

    for (const step of steps) {
      const removed = new Set(step.removedSmartTags);
      const smartTags = matchSmartTags(step.name, getActiveAppConfig()).filter(
        (tag) => !removed.has(tag),
      );

      await ctx.db.patch(step._id, {
        smartTags,
        updatedAt: Date.now(),
      });
      updated += 1;
    }

    return { scanned: steps.length, updated };
  },
});

export const recreateThumbnails = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    const steps = await loadSteps(ctx, args.limit);
    let updated = 0;

    for (const step of steps) {
      const videos = step.videos.map((video) => ({
        hash: video.hash,
        storageKey: video.storageKey,
        width: video.width,
        height: video.height,
      }));

      await ctx.db.patch(step._id, {
        videos,
        needsVideoProcessing: true,
        updatedAt: Date.now(),
      });
      await enqueueMissingVideoProcessing(ctx, step._id, videos);
      updated += 1;
    }

    return { scanned: steps.length, updated };
  },
});

export const recomputeTokens = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    const steps = await loadSteps(ctx, args.limit);
    let updated = 0;

    for (const step of steps) {
      await ctx.db.patch(step._id, {
        tokens: tokenizeStepName(step.name),
        updatedAt: Date.now(),
      });
      updated += 1;
    }

    return { scanned: steps.length, updated };
  },
});

async function loadSteps(ctx: MutationCtx, limit: number | undefined) {
  const steps = await ctx.db.query("steps").collect();

  return limit === undefined ? steps : steps.slice(0, limit);
}
