import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { requireUserId } from "./auth";
import {
  buildVideoProcessingPatch,
  findVideosNeedingProcessing,
  isVideoProcessed,
} from "../lib/video/processing-status";
import { processedVideoMetadataValidator } from "./model/validators";

const runningJobTtlMs = 30 * 60 * 1000;

export const listMyFailedJobs = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);

    return await ctx.db
      .query("videoProcessingJobs")
      .withIndex("by_owner_status", (index) =>
        index.eq("ownerId", ownerId).eq("status", "failed"),
      )
      .collect();
  },
});

export const retryStepVideoProcessing = mutation({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await ctx.db.get(args.stepId);

    if (!step || step.ownerId !== ownerId) {
      throw new Error("Step not found");
    }

    return await enqueueMissingVideoProcessing(ctx, args.stepId, step.videos);
  },
});

export const getStepForProcessing = internalQuery({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.stepId);

    if (!step) {
      return null;
    }

    return {
      stepId: step._id,
      ownerId: step.ownerId,
      videos: findVideosNeedingProcessing(step.videos),
    };
  },
});

export const startVideoProcessingJob = internalMutation({
  args: {
    stepId: v.id("steps"),
    ownerId: v.string(),
    hash: v.string(),
    storageKey: v.string(),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.stepId);

    if (!step || step.ownerId !== args.ownerId) {
      return { shouldProcess: false };
    }

    const currentVideo = step.videos.find(
      (video) =>
        video.hash === args.hash && video.storageKey === args.storageKey,
    );

    if (!currentVideo || isVideoProcessed(currentVideo)) {
      return { shouldProcess: false };
    }

    const now = Date.now();
    const existingJobs = await ctx.db
      .query("videoProcessingJobs")
      .withIndex("by_video", (index) =>
        index
          .eq("stepId", args.stepId)
          .eq("videoHash", args.hash)
          .eq("storageKey", args.storageKey),
      )
      .collect();
    const activeJob = existingJobs.find(
      (job) =>
        job.status === "running" && now - job.updatedAt < runningJobTtlMs,
    );

    if (activeJob) {
      return { shouldProcess: false };
    }

    const attempts =
      existingJobs.reduce((max, job) => Math.max(max, job.attempts), 0) + 1;
    const jobId = await ctx.db.insert("videoProcessingJobs", {
      stepId: args.stepId,
      ownerId: args.ownerId,
      videoHash: args.hash,
      storageKey: args.storageKey,
      status: "running",
      attempts,
      createdAt: now,
      updatedAt: now,
      startedAt: now,
    });

    return { shouldProcess: true, jobId };
  },
});

export const completeVideoProcessingJob = internalMutation({
  args: {
    jobId: v.id("videoProcessingJobs"),
    stepId: v.id("steps"),
    processed: processedVideoMetadataValidator,
  },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.stepId);
    const now = Date.now();

    await ctx.db.patch(args.jobId, {
      status: "succeeded",
      snapshotStorageKey: args.processed.snapshotStorageKey,
      thumbnailStorageKey: args.processed.thumbnailStorageKey,
      width: args.processed.width,
      height: args.processed.height,
      updatedAt: now,
      completedAt: now,
    });

    if (!step) {
      return;
    }

    await ctx.db.patch(args.stepId, {
      ...buildVideoProcessingPatch({
        videos: step.videos,
        processed: args.processed,
      }),
      updatedAt: now,
    });
  },
});

export const failVideoProcessingJob = internalMutation({
  args: {
    jobId: v.id("videoProcessingJobs"),
    stepId: v.id("steps"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      updatedAt: now,
      completedAt: now,
    });

    const step = await ctx.db.get(args.stepId);
    if (step) {
      await ctx.db.patch(args.stepId, {
        needsVideoProcessing: true,
        updatedAt: now,
      });
    }
  },
});

export async function enqueueMissingVideoProcessing(
  ctx: MutationCtx,
  stepId: Id<"steps">,
  videos: Doc<"steps">["videos"],
): Promise<{ queued: boolean }> {
  const queued = findVideosNeedingProcessing(videos).length > 0;

  if (queued) {
    await ctx.scheduler.runAfter(
      0,
      internal.videoProcessingActions.processStepVideos,
      { stepId },
    );
  }

  return { queued };
}
