import { mutationGeneric, queryGeneric } from "convex/server";
import { type GenericId, v } from "convex/values";
import { requireUserId } from "./auth";
import { assertUnlocked } from "./model/practiceSessions";
import { assertOwner } from "./model/steps";

const query = queryGeneric;
const mutation = mutationGeneric;

const sessionIdArg = v.id("practiceSessions");
const stepIdArg = v.id("steps");

type StepDoc = {
  ownerId: string;
  [key: string]: unknown;
};

type SessionDoc = {
  _id: GenericId<"practiceSessions">;
  ownerId: string;
  name: string;
  steps: GenericId<"steps">[];
  locked: boolean;
  [key: string]: unknown;
};

type SessionContext = {
  db: {
    get: {
      <TableName extends string>(
        id: GenericId<TableName>,
      ): Promise<SessionDoc | StepDoc | null>;
      <TableName extends string>(
        table: TableName,
        id: GenericId<TableName>,
      ): Promise<SessionDoc | StepDoc | null>;
    };
  };
};

async function getOwnedSession(
  ctx: SessionContext,
  sessionId: GenericId<"practiceSessions">,
  ownerId: string,
) {
  return assertOwner(await ctx.db.get(sessionId), ownerId) as SessionDoc;
}

async function assertOwnedSteps(
  ctx: SessionContext,
  stepIds: GenericId<"steps">[],
  ownerId: string,
) {
  await Promise.all(
    stepIds.map(async (stepId) => {
      assertOwner(await ctx.db.get(stepId), ownerId);
    }),
  );
}

function uniqueStepIds(stepIds: GenericId<"steps">[]): GenericId<"steps">[] {
  return [...new Set(stepIds)];
}

export const listMyPracticeSessions = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireUserId(ctx);

    return ctx.db
      .query("practiceSessions")
      .withIndex("by_owner_createdAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  },
});

export const getMyPracticeSession = query({
  args: { sessionId: sessionIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.sessionId, ownerId);
    const steps = await Promise.all(
      session.steps.map((stepId) => ctx.db.get(stepId)),
    );

    return {
      ...session,
      stepDocuments: steps.filter(Boolean),
    };
  },
});

export const createPracticeSession = mutation({
  args: {
    name: v.string(),
    steps: v.optional(v.array(stepIdArg)),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const steps = uniqueStepIds(args.steps ?? []);
    await assertOwnedSteps(ctx, steps, ownerId);

    const now = Date.now();

    return ctx.db.insert("practiceSessions", {
      ownerId,
      name: args.name,
      steps,
      locked: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const duplicatePracticeSession = mutation({
  args: { sessionId: sessionIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.sessionId, ownerId);
    const now = Date.now();

    return ctx.db.insert("practiceSessions", {
      ownerId,
      name: `${session.name} copy`,
      steps: session.steps,
      locked: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePracticeSession = mutation({
  args: {
    sessionId: sessionIdArg,
    name: v.optional(v.string()),
    steps: v.optional(v.array(stepIdArg)),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = assertUnlocked(
      await getOwnedSession(ctx, args.sessionId, ownerId),
    );
    const steps =
      args.steps === undefined ? undefined : uniqueStepIds(args.steps);

    if (steps !== undefined) {
      await assertOwnedSteps(ctx, steps, ownerId);
    }

    await ctx.db.patch(args.sessionId, {
      name: args.name ?? session.name,
      steps: steps ?? session.steps,
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.sessionId);
  },
});

export const togglePracticeSessionLock = mutation({
  args: { sessionId: sessionIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = await getOwnedSession(ctx, args.sessionId, ownerId);

    await ctx.db.patch(args.sessionId, {
      locked: !session.locked,
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.sessionId);
  },
});

export const deletePracticeSession = mutation({
  args: { sessionId: sessionIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    await getOwnedSession(ctx, args.sessionId, ownerId);
    await ctx.db.delete(args.sessionId);

    return null;
  },
});

export const addStepToSession = mutation({
  args: {
    sessionId: sessionIdArg,
    stepId: stepIdArg,
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = assertUnlocked(
      await getOwnedSession(ctx, args.sessionId, ownerId),
    );
    assertOwner(await ctx.db.get(args.stepId), ownerId);

    await ctx.db.patch(args.sessionId, {
      steps: uniqueStepIds([...session.steps, args.stepId]),
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.sessionId);
  },
});

export const removeStepFromSession = mutation({
  args: {
    sessionId: sessionIdArg,
    stepId: stepIdArg,
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    const session = assertUnlocked(
      await getOwnedSession(ctx, args.sessionId, ownerId),
    );

    await ctx.db.patch(args.sessionId, {
      steps: session.steps.filter((stepId) => stepId !== args.stepId),
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.sessionId);
  },
});

export const clearSessionSteps = mutation({
  args: { sessionId: sessionIdArg },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);
    assertUnlocked(await getOwnedSession(ctx, args.sessionId, ownerId));

    await ctx.db.patch(args.sessionId, {
      steps: [],
      updatedAt: Date.now(),
    });

    return ctx.db.get(args.sessionId);
  },
});
