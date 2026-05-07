import type { MutationCtx } from "./_generated/server";

export async function requireAdminUser(ctx: MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  const subject = identity?.subject;
  const allowed = new Set(
    (process.env.STEPS_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (!subject || !allowed.has(subject)) {
    throw new Error("Admin authorization required");
  }

  return subject;
}
