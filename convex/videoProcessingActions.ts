"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { processVideoFromGcs } from "../workers/video-processing/processVideo";

export const processStepVideos = internalAction({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const step = await ctx.runQuery(
      internal.videoProcessing.getStepForProcessing,
      { stepId: args.stepId },
    );

    if (!step) {
      return { processed: 0, failed: 0, skipped: 1 };
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const video of step.videos) {
      const claim = await ctx.runMutation(
        internal.videoProcessing.startVideoProcessingJob,
        {
          stepId: step.stepId,
          ownerId: step.ownerId,
          hash: video.hash,
          storageKey: video.storageKey,
        },
      );

      if (!claim.shouldProcess || !claim.jobId) {
        skipped += 1;
        continue;
      }

      try {
        const result = await processVideoFromGcs({
          ownerId: step.ownerId,
          hash: video.hash,
          storageKey: video.storageKey,
        });

        await ctx.runMutation(
          internal.videoProcessing.completeVideoProcessingJob,
          {
            jobId: claim.jobId,
            stepId: step.stepId,
            processed: result,
          },
        );
        processed += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error(
          `[video-processing] failed step=${step.stepId} hash=${video.hash}: ${message}`,
        );
        await ctx.runMutation(internal.videoProcessing.failVideoProcessingJob, {
          jobId: claim.jobId,
          stepId: step.stepId,
          error: message,
        });
        failed += 1;
      }
    }

    return { processed, failed, skipped };
  },
});
