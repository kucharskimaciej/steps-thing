import { v } from "convex/values";
import { requireUserId } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx, query, type QueryCtx } from "./_generated/server";
import { assertStepOwner } from "./model/steps";
import {
  assertSessionEditable,
  assertSessionOwner,
  buildCreatedSession,
  buildDuplicatedSession,
  uniqueStepIds,
} from "./model/practiceSessions";

async function getOwnedSession(
  ctx: QueryCtx | MutationCtx,
  id: Id<"practiceSessions">,
  ownerId: string,
): Promise<Doc<"practiceSessions">> {
  const session = await ctx.db.get(id);
  assertSessionOwner(session, ownerId);

  return session;
}

async function assertOwnedSteps(
  ctx: QueryCtx | MutationCtx,
  stepIds: Id<"steps">[],
  ownerId: string,
): Promise<Id<"steps">[]> {
  const uniqueIds = uniqueStepIds(stepIds);

  for (const stepId of uniqueIds) {
    const step = await ctx.db.get(stepId);
    assertStepOwner(step, ownerId);
  }

  return uniqueIds;
}

export const listMyPracticeSessions = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);
    const sessions = await ctx.db
      .query("practiceSessions")
      .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
      .collect();

    return sessions.sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getMyPracticeSession = query({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);

    return await getOwnedSession(ctx, args.id, ownerId);
  },
});

export const createPracticeSession = mutation({
  args: { name: v.string(), stepIds: v.optional(v.array(v.id("steps"))) },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const steps = args.stepIds
      ? await assertOwnedSteps(ctx, args.stepIds, ownerId)
      : [];
    const now = Date.now();

    return await ctx.db.insert("practiceSessions", {
      ...buildCreatedSession({ ownerId, name: args.name, now }),
      steps,
    });
  },
});

export const duplicatePracticeSession = mutation({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const source = await getOwnedSession(ctx, args.id, ownerId);

    return await ctx.db.insert(
      "practiceSessions",
      buildDuplicatedSession({ source, now: Date.now() }),
    );
  },
});

export const updatePracticeSession = mutation({
  args: {
    id: v.id("practiceSessions"),
    name: v.optional(v.string()),
    stepIds: v.optional(v.array(v.id("steps"))),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.id, ownerId);
    assertSessionEditable(session);

    const patch: Partial<Pick<Doc<"practiceSessions">, "name" | "steps" | "updatedAt">> =
      { updatedAt: Date.now() };

    if (args.name !== undefined) {
      patch.name = args.name;
    }

    if (args.stepIds !== undefined) {
      patch.steps = await assertOwnedSteps(ctx, args.stepIds, ownerId);
    }

    await ctx.db.patch(args.id, patch);

    return args.id;
  },
});

export const togglePracticeSessionLock = mutation({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.id, ownerId);

    await ctx.db.patch(args.id, {
      locked: !session.locked,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const deletePracticeSession = mutation({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    await getOwnedSession(ctx, args.id, ownerId);
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const addStepToSession = mutation({
  args: { sessionId: v.id("practiceSessions"), stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.sessionId, ownerId);
    assertSessionEditable(session);
    const [stepId] = await assertOwnedSteps(ctx, [args.stepId], ownerId);
    const steps = session.steps.includes(stepId)
      ? session.steps
      : [...session.steps, stepId];

    await ctx.db.patch(args.sessionId, {
      steps,
      updatedAt: Date.now(),
    });

    return args.sessionId;
  },
});

export const removeStepFromSession = mutation({
  args: { sessionId: v.id("practiceSessions"), stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.sessionId, ownerId);
    assertSessionEditable(session);

    await ctx.db.patch(args.sessionId, {
      steps: session.steps.filter((stepId) => stepId !== args.stepId),
      updatedAt: Date.now(),
    });

    return args.sessionId;
  },
});

export const clearSessionSteps = mutation({
  args: { id: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.id, ownerId);
    assertSessionEditable(session);

    await ctx.db.patch(args.id, {
      steps: [],
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
