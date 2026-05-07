import type { Doc, Id } from "../_generated/dataModel";

export function assertSessionOwner(
  session: Pick<Doc<"practiceSessions">, "ownerId"> | null,
  ownerId: string,
): asserts session is Doc<"practiceSessions"> {
  if (!session || session.ownerId !== ownerId) {
    throw new Error("Practice session not found");
  }
}

export function assertSessionEditable(
  session: Pick<Doc<"practiceSessions">, "locked">,
): void {
  if (session.locked) {
    throw new Error("Practice session is locked");
  }
}

export function uniqueStepIds(stepIds: Id<"steps">[]): Id<"steps">[] {
  return [...new Set(stepIds)];
}

export function buildCreatedSession({
  ownerId,
  name,
  now,
}: {
  ownerId: string;
  name: string;
  now: number;
}): Omit<Doc<"practiceSessions">, "_id" | "_creationTime"> {
  return {
    ownerId,
    name,
    steps: [],
    locked: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildDuplicatedSession({
  source,
  now,
}: {
  source: Pick<Doc<"practiceSessions">, "ownerId" | "name" | "steps">;
  now: number;
}): Omit<Doc<"practiceSessions">, "_id" | "_creationTime"> {
  return {
    ownerId: source.ownerId,
    name: `${source.name} copy`,
    steps: [...source.steps],
    locked: false,
    createdAt: now,
    updatedAt: now,
  };
}
