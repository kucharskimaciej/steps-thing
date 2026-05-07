import type { QueryCtx } from "./_generated/server";

type AuthCtx = Pick<QueryCtx, "auth">;

export async function requireUserId(ctx: AuthCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required");
  }

  return identity.subject;
}
