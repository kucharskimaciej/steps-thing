import { v } from "convex/values";
import { requireUserId } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server";
import {
  applyStepView,
  assertStepOwner,
  buildCreatedStep,
  buildStepPatch,
  mergePracticeRecord,
  nextIdentifier,
  rankVariationCandidates,
} from "./model/steps";
import {
  createStepInputValidator,
  practiceRecordInputValidator,
  updateStepInputValidator,
} from "./model/validators";
import { enqueueMissingVideoProcessing } from "./videoProcessing";

async function getOwnedSteps(ctx: QueryCtx, ownerId: string) {
  return await ctx.db
    .query("steps")
    .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
    .collect();
}

async function getOwnedStep(
  ctx: QueryCtx | MutationCtx,
  id: Id<"steps">,
  ownerId: string,
): Promise<Doc<"steps">> {
  const step = await ctx.db.get(id);
  assertStepOwner(step, ownerId);

  return step;
}

function freshVariationKey() {
  return crypto.randomUUID();
}

async function mergeVariationGroups({
  ctx,
  ownerId,
  mergeVariationKeys,
  variationKey,
  now,
}: {
  ctx: MutationCtx;
  ownerId: string;
  mergeVariationKeys: string[] | undefined;
  variationKey: string;
  now: number;
}) {
  const keys = new Set(
    (mergeVariationKeys ?? [])
      .map((key) => key.trim())
      .filter((key) => key.length > 0 && key !== variationKey),
  );

  if (keys.size === 0) {
    return;
  }

  const steps = await getOwnedSteps(ctx, ownerId);
  await Promise.all(
    steps
      .filter((step) => keys.has(step.variationKey))
      .map((step) =>
        ctx.db.patch(step._id, {
          variationKey,
          updatedAt: now,
        }),
      ),
  );
}

export const listMySteps = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);
    const steps = await getOwnedSteps(ctx, ownerId);

    return steps.sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getStepForEdit = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const id = ctx.db.normalizeId("steps", args.id);

    if (!id) {
      return null;
    }

    const step = await ctx.db.get(id);

    if (!step || step.ownerId !== ownerId) {
      return null;
    }

    return step;
  },
});

export const getPublicStep = query({
  args: { id: v.id("steps") },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.id);

    if (!step) {
      return null;
    }

    const { ownerId: _ownerId, ...publicStep } = step;

    return publicStep;
  },
});

export const getExistingTagsAndArtists = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);
    const steps = await getOwnedSteps(ctx, ownerId);

    return {
      tags: [
        ...new Set(steps.flatMap((step) => [...step.tags, ...step.smartTags])),
      ].sort(),
      artists: [...new Set(steps.flatMap((step) => step.artists))].sort(),
    };
  },
});

export const getVariationCandidates = query({
  args: { id: v.id("steps") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const source = await getOwnedStep(ctx, args.id, ownerId);
    const candidates =
      source.variationKey.length > 0
        ? await ctx.db
            .query("steps")
            .withIndex("by_owner_variationKey", (index) =>
              index
                .eq("ownerId", ownerId)
                .eq("variationKey", source.variationKey),
            )
            .collect()
        : await getOwnedSteps(ctx, ownerId);

    return rankVariationCandidates({ source, candidates });
  },
});

export const createStep = mutation({
  args: { input: createStepInputValidator },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const lastStep = await ctx.db
      .query("steps")
      .withIndex("by_owner_identifier", (index) => index.eq("ownerId", ownerId))
      .order("desc")
      .first();
    const identifier = nextIdentifier(lastStep ? [lastStep] : [], ownerId);
    const now = Date.now();

    const step = buildCreatedStep({
      ownerId,
      identifier,
      now,
      input: args.input,
    });
    const stepId = await ctx.db.insert("steps", step);

    await mergeVariationGroups({
      ctx,
      ownerId,
      mergeVariationKeys: args.input.mergeVariationKeys,
      variationKey: args.input.variationKey,
      now,
    });

    await enqueueMissingVideoProcessing(ctx, stepId, step.videos);

    return stepId;
  },
});

export const updateStep = mutation({
  args: { id: v.id("steps"), input: updateStepInputValidator },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await getOwnedStep(ctx, args.id, ownerId);

    const patch = buildStepPatch({
      existing: step,
      input: {
        ...args.input,
        variationKey: freshVariationKey(),
      },
      now: Date.now(),
    });

    await ctx.db.patch(args.id, patch);

    await mergeVariationGroups({
      ctx,
      ownerId,
      mergeVariationKeys: args.input.mergeVariationKeys,
      variationKey: patch.variationKey ?? step.variationKey,
      now: patch.updatedAt ?? Date.now(),
    });

    if (patch.videos) {
      await enqueueMissingVideoProcessing(ctx, args.id, patch.videos);
    }

    return args.id;
  },
});

export const recordStepView = mutation({
  args: { id: v.id("steps") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await getOwnedStep(ctx, args.id, ownerId);

    await ctx.db.patch(
      args.id,
      applyStepView({ existing: step.viewRecords, now: Date.now() }),
    );

    return args.id;
  },
});

export const recordPractice = mutation({
  args: { id: v.id("steps"), record: practiceRecordInputValidator },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await getOwnedStep(ctx, args.id, ownerId);
    const practiceRecords = mergePracticeRecord({
      existing: step.practiceRecords,
      record: args.record,
    });

    await ctx.db.patch(args.id, {
      practiceRecords,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
