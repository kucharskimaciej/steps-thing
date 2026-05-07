import type { Infer } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { requireAdminUser } from "./adminAuth";
import { v } from "convex/values";
import {
  importedSessionValidator,
  importedStepValidator,
} from "./model/validators";

type ImportedStep = Infer<typeof importedStepValidator>;
type ImportedSession = Infer<typeof importedSessionValidator>;

export const importBackupBatch = mutation({
  args: {
    steps: v.array(importedStepValidator),
    sessions: v.array(importedSessionValidator),
  },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    let steps = 0;
    let sessions = 0;

    for (const step of args.steps) {
      await upsertStep(ctx, step);
      steps += 1;
    }

    for (const session of args.sessions) {
      await upsertSession(ctx, session);
      sessions += 1;
    }

    return { steps, sessions };
  },
});

async function upsertStep(ctx: MutationCtx, step: ImportedStep) {
  const existing = await findStepByLegacyId(ctx, step.legacyId);
  const document = {
    legacyId: step.legacyId,
    ownerId: step.ownerId,
    identifier: step.identifier,
    name: step.name,
    videos: step.videos,
    videoHashes: step.videoHashes,
    difficulty: step.difficulty,
    feeling: step.feeling,
    kind: step.kind,
    tags: step.tags,
    artists: step.artists,
    notes: step.notes,
    smartTags: step.smartTags,
    removedSmartTags: step.removedSmartTags,
    tokens: step.tokens,
    variationKey: step.variationKey,
    practiceRecords: step.practiceRecords,
    viewRecords: step.viewRecords,
    createdAt: step.createdAt,
    updatedAt: step.updatedAt,
    lastViewedAt: step.lastViewedAt,
    needsVideoProcessing: step.needsVideoProcessing,
  } satisfies Omit<Doc<"steps">, "_id" | "_creationTime">;

  if (existing) {
    await ctx.db.replace(existing._id, document);
  } else {
    await ctx.db.insert("steps", document);
  }
}

async function upsertSession(ctx: MutationCtx, session: ImportedSession) {
  const existing = await findSessionByLegacyId(ctx, session.legacyId);
  const steps = await resolveLegacyStepIds(ctx, session.legacyStepIds);
  const document = {
    legacyId: session.legacyId,
    ownerId: session.ownerId,
    name: session.name,
    steps,
    locked: session.locked,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  } satisfies Omit<Doc<"practiceSessions">, "_id" | "_creationTime">;

  if (existing) {
    await ctx.db.replace(existing._id, document);
  } else {
    await ctx.db.insert("practiceSessions", document);
  }
}

async function findStepByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Doc<"steps"> | null> {
  const matches = await ctx.db
    .query("steps")
    .withIndex("by_legacyId", (index) => index.eq("legacyId", legacyId))
    .collect();

  if (matches.length > 1) {
    throw new Error(`Duplicate steps legacyId ${legacyId}`);
  }

  return matches[0] ?? null;
}

async function findSessionByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Doc<"practiceSessions"> | null> {
  const matches = await ctx.db
    .query("practiceSessions")
    .withIndex("by_legacyId", (index) => index.eq("legacyId", legacyId))
    .collect();

  if (matches.length > 1) {
    throw new Error(`Duplicate practiceSessions legacyId ${legacyId}`);
  }

  return matches[0] ?? null;
}

async function resolveLegacyStepIds(
  ctx: MutationCtx,
  legacyStepIds: string[],
): Promise<Id<"steps">[]> {
  const stepIds: Id<"steps">[] = [];

  for (const legacyId of legacyStepIds) {
    const step = await findStepByLegacyId(ctx, legacyId);

    if (!step) {
      throw new Error(`Session references missing legacy step ${legacyId}`);
    }

    stepIds.push(step._id);
  }

  return stepIds;
}
