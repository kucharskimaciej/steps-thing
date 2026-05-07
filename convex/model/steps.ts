import type { Infer } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { getActiveAppConfig } from "../../lib/domain/config";
import { matchSmartTags } from "../../lib/domain/smart-tags";
import { tokenizeStepName } from "../../lib/domain/tokenize";
import { scoreVariationCandidate } from "../../lib/domain/variation-score";
import { stepNeedsVideoProcessing } from "../../lib/video/processing-status";
import type {
  createStepInputValidator,
  practiceRecordInputValidator,
  updateStepInputValidator,
} from "./validators";

export type CreateStepInput = Infer<typeof createStepInputValidator>;
export type UpdateStepInput = Infer<typeof updateStepInputValidator>;
export type PracticeRecordInput = Infer<typeof practiceRecordInputValidator>;

type ExistingIdentifier = Pick<Doc<"steps">, "identifier" | "ownerId">;

export function assertStepOwner(
  step: Pick<Doc<"steps">, "ownerId"> | null,
  ownerId: string,
): asserts step is Doc<"steps"> {
  if (!step || step.ownerId !== ownerId) {
    throw new Error("Step not found");
  }
}

export function nextIdentifier(
  steps: ExistingIdentifier[],
  ownerId?: string,
): number {
  const ownedSteps =
    ownerId === undefined
      ? steps
      : steps.filter((step) => step.ownerId === ownerId);
  const maxIdentifier = ownedSteps.reduce(
    (max, step) => Math.max(max, step.identifier),
    0,
  );

  return maxIdentifier + 1;
}

function deriveSmartTags(name: string, removedSmartTags: string[]): string[] {
  const removed = new Set(removedSmartTags);

  return matchSmartTags(name, getActiveAppConfig()).filter(
    (tag) => !removed.has(tag),
  );
}

export function buildCreatedStep({
  ownerId,
  identifier,
  now,
  input,
}: {
  ownerId: string;
  identifier: number;
  now: number;
  input: CreateStepInput;
}): Omit<Doc<"steps">, "_id" | "_creationTime"> {
  const smartTags = deriveSmartTags(input.name, input.removedSmartTags);

  return {
    ownerId,
    identifier,
    name: input.name,
    videos: input.videos,
    videoHashes: input.videos.map((video) => video.hash),
    difficulty: input.difficulty,
    feeling: input.feeling,
    kind: input.kind,
    tags: input.tags,
    artists: input.artists,
    notes: input.notes,
    smartTags,
    removedSmartTags: input.removedSmartTags,
    tokens: tokenizeStepName(input.name),
    variationKey: input.variationKey,
    practiceRecords: [],
    viewRecords: [],
    createdAt: now,
    updatedAt: now,
    needsVideoProcessing: stepNeedsVideoProcessing(input.videos),
  };
}

export function buildStepPatch({
  existing,
  input,
  now,
}: {
  existing: Pick<Doc<"steps">, "name" | "removedSmartTags">;
  input: UpdateStepInput;
  now: number;
}): Partial<Omit<Doc<"steps">, "_id" | "_creationTime" | "ownerId">> {
  const patch: Partial<
    Omit<Doc<"steps">, "_id" | "_creationTime" | "ownerId">
  > = { updatedAt: now };

  if (input.name !== undefined) {
    patch.name = input.name;
    patch.tokens = tokenizeStepName(input.name);
  }

  if (input.videos !== undefined) {
    patch.videos = input.videos;
    patch.videoHashes = input.videos.map((video) => video.hash);
    patch.needsVideoProcessing = stepNeedsVideoProcessing(input.videos);
  }

  if (input.difficulty !== undefined) {
    patch.difficulty = input.difficulty;
  }

  if (input.feeling !== undefined) {
    patch.feeling = input.feeling;
  }

  if (input.kind !== undefined) {
    patch.kind = input.kind;
  }

  if (input.tags !== undefined) {
    patch.tags = input.tags;
  }

  if (input.artists !== undefined) {
    patch.artists = input.artists;
  }

  if (input.notes !== undefined) {
    patch.notes = input.notes;
  }

  if (input.removedSmartTags !== undefined) {
    patch.removedSmartTags = input.removedSmartTags;
  }

  if (input.variationKey !== undefined) {
    patch.variationKey = input.variationKey;
  }

  if (input.name !== undefined || input.removedSmartTags !== undefined) {
    patch.smartTags = deriveSmartTags(
      input.name ?? existing.name,
      input.removedSmartTags ?? existing.removedSmartTags,
    );
  }

  return patch;
}

export function applyStepView({
  existing,
  now,
}: {
  existing: number[];
  now: number;
}) {
  return {
    viewRecords: [now, ...existing],
    lastViewedAt: now,
    updatedAt: now,
  };
}

export function mergePracticeRecord<T extends PracticeRecordInput>({
  existing,
  record,
}: {
  existing: T[];
  record: T;
}): T[] {
  const duplicate = existing.some(
    (candidate) =>
      candidate.startOfDay === record.startOfDay &&
      candidate.collectionId === record.collectionId,
  );

  if (duplicate) {
    return existing;
  }

  return [record, ...existing];
}

export function rankVariationCandidates({
  source,
  candidates,
}: {
  source: Doc<"steps">;
  candidates: Doc<"steps">[];
}): Array<Doc<"steps"> & { score: number }> {
  const sourceTags = [...source.tags, ...source.smartTags];

  return candidates
    .filter((candidate) => candidate._id !== source._id)
    .map((candidate) => ({
      ...candidate,
      score: scoreVariationCandidate({
        sourceTokens: source.tokens,
        candidateTokens: candidate.tokens,
        sourceTags,
        candidateTags: [...candidate.tags, ...candidate.smartTags],
      }),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || right.updatedAt - left.updatedAt,
    )
    .slice(0, 20);
}

export function publicStepId(id: Id<"steps">): Id<"steps"> {
  return id;
}
