import { mutationGeneric, queryGeneric } from "convex/server";
import { type GenericId, v } from "convex/values";
import { startOfLocalDay } from "../lib/domain/dates";
import { scoreVariationCandidate } from "../lib/domain/variation-score";
import { requireUserId } from "./auth";
import {
  difficultyValidator,
  kindValidator,
  videoValidator,
} from "./model/validators";
import {
  assertOwner,
  nextIdentifier,
  prependViewRecord,
  type PracticeRecordLike,
  upsertPracticeRecord,
} from "./model/steps";

const query = queryGeneric;
const mutation = mutationGeneric;

const stepFields = {
  name: v.string(),
  videos: v.array(videoValidator),
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
};

const optionalStepFields = {
  name: v.optional(v.string()),
  videos: v.optional(v.array(videoValidator)),
  difficulty: v.optional(difficultyValidator),
  feeling: v.optional(v.array(v.string())),
  kind: v.optional(kindValidator),
  tags: v.optional(v.array(v.string())),
  artists: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  smartTags: v.optional(v.array(v.string())),
  removedSmartTags: v.optional(v.array(v.string())),
  tokens: v.optional(v.array(v.string())),
  variationKey: v.optional(v.string()),
};

const stepIdArg = v.id("steps");

type VideoDoc = {
  hash: string;
};

type StepDoc = {
  _id: GenericId<"steps">;
  ownerId: string;
  identifier: number;
  videos: VideoDoc[];
  tags: string[];
  artists: string[];
  tokens: string[];
  practiceRecords: PracticeRecordLike[];
  viewRecords: number[];
  [key: string]: unknown;
};

type StepContext = {
  db: {
    get: {
      <TableName extends string>(
        id: GenericId<TableName>,
      ): Promise<StepDoc | null>;
      <TableName extends string>(
        table: TableName,
        id: GenericId<TableName>,
      ): Promise<StepDoc | null>;
    };
  };
};

function compactPatch<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter((entry) => entry[1] !== undefined),
  );
}

async function getOwnedStep(
  ctx: StepContext,
  stepId: GenericId<"steps">,
  ownerId: string,
) {
  return assertOwner(await ctx.db.get(stepId), ownerId);
}

export const listMySteps = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);

    return ctx.db
      .query("steps")
      .withIndex("by_owner_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  },
});

export const getStepForEdit = query({
  args: { stepId: stepIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);

    return getOwnedStep(ctx, args.stepId, ownerId);
  },
});

export const getPublicStep = query({
  args: { stepId: stepIdArg },
  handler: async (ctx, args) => ctx.db.get(args.stepId),
});

export const getExistingTagsAndArtists = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    return {
      tags: [...new Set(steps.flatMap((step) => step.tags))].sort(),
      artists: [...new Set(steps.flatMap((step) => step.artists))].sort(),
    };
  },
});

export const getVariationCandidates = query({
  args: {
    variationKey: v.string(),
    sourceStepId: v.optional(stepIdArg),
    sourceTokens: v.optional(v.array(v.string())),
    sourceTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const candidates = await ctx.db
      .query("steps")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    const source =
      args.sourceStepId === undefined
        ? null
        : assertOwner(await ctx.db.get(args.sourceStepId), ownerId);
    const sourceTokens = args.sourceTokens ?? source?.tokens ?? [];
    const sourceTags = args.sourceTags ?? source?.tags ?? [];

    return candidates
      .filter((candidate) => candidate._id !== args.sourceStepId)
      .filter((candidate) => candidate.variationKey === args.variationKey)
      .map((candidate) => ({
        ...candidate,
        variationScore: scoreVariationCandidate({
          sourceTokens,
          candidateTokens: candidate.tokens,
          sourceTags,
          candidateTags: candidate.tags,
        }),
      }))
      .sort((left, right) => right.variationScore - left.variationScore);
  },
});

export const createStep = mutation({
  args: stepFields,
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("steps")
      .withIndex("by_owner_identifier", (q) => q.eq("ownerId", ownerId))
      .collect();

    return ctx.db.insert("steps", {
      ...args,
      ownerId,
      identifier: nextIdentifier(existing),
      videoHashes: args.videos.map((video) => video.hash),
      practiceRecords: [],
      viewRecords: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStep = mutation({
  args: {
    stepId: stepIdArg,
    ...optionalStepFields,
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    await getOwnedStep(ctx, args.stepId, ownerId);

    const patch = compactPatch({
      name: args.name,
      videos: args.videos,
      videoHashes: args.videos?.map((video) => video.hash),
      difficulty: args.difficulty,
      feeling: args.feeling,
      kind: args.kind,
      tags: args.tags,
      artists: args.artists,
      notes: args.notes,
      smartTags: args.smartTags,
      removedSmartTags: args.removedSmartTags,
      tokens: args.tokens,
      variationKey: args.variationKey,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.stepId, patch);

    return ctx.db.get(args.stepId);
  },
});

export const recordStepView = mutation({
  args: {
    stepId: stepIdArg,
    viewedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await getOwnedStep(ctx, args.stepId, ownerId);
    const viewedAt = args.viewedAt ?? Date.now();

    await ctx.db.patch(args.stepId, {
      viewRecords: prependViewRecord(step.viewRecords, viewedAt),
      lastViewedAt: viewedAt,
      updatedAt: viewedAt,
    });

    return ctx.db.get(args.stepId);
  },
});

export const recordPractice = mutation({
  args: {
    stepId: stepIdArg,
    practicedAt: v.optional(v.number()),
    startOfDay: v.optional(v.number()),
    collectionId: v.optional(v.id("practiceSessions")),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const step = await getOwnedStep(ctx, args.stepId, ownerId);

    if (args.collectionId !== undefined) {
      assertOwner(await ctx.db.get(args.collectionId), ownerId);
    }

    const date = args.practicedAt ?? Date.now();
    const record = {
      date,
      startOfDay: args.startOfDay ?? startOfLocalDay(date),
      ...(args.collectionId === undefined
        ? {}
        : { collectionId: args.collectionId }),
    };

    await ctx.db.patch(args.stepId, {
      practiceRecords: upsertPracticeRecord(step.practiceRecords, record),
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.stepId);
  },
});
