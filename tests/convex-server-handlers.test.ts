import { afterEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import * as practiceSessions from "@/convex/practiceSessions";
import * as steps from "@/convex/steps";

type ConvexFunction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runHandler(
  fn: unknown,
  ctx: unknown,
  args: Record<string, unknown> = {},
) {
  return (fn as ConvexFunction)._handler(ctx, args);
}

function authCtx(ownerId: string) {
  return {
    auth: {
      getUserIdentity: async () => ({
        subject: ownerId,
        tokenIdentifier: `issuer|${ownerId}`,
        issuer: "issuer",
      }),
    },
  };
}

function unauthCtx() {
  return {
    auth: { getUserIdentity: async () => null },
    db: {
      get: vi.fn(),
      query: vi.fn(),
      normalizeId: vi.fn(),
    },
  };
}

function processedVideo(hash: string) {
  return {
    hash,
    storageKey: `owners/user/videos/${hash}.mp4`,
    snapshotStorageKey: `owners/user/snapshots/${hash}.jpg`,
    thumbnailStorageKey: `owners/user/thumbnails/${hash}.jpg`,
    width: 1080,
    height: 1920,
  };
}

function stepDoc(overrides: Partial<Doc<"steps">> = {}): Doc<"steps"> {
  return {
    _id: "step-main" as Id<"steps">,
    _creationTime: 1,
    ownerId: "user-a",
    identifier: 1,
    name: "Shadow turn",
    videos: [processedVideo("hash-a")],
    videoHashes: ["hash-a"],
    difficulty: 3,
    feeling: ["urban"],
    kind: "step",
    tags: ["turn"],
    artists: ["Petchu"],
    notes: "",
    smartTags: ["Shadow position"],
    removedSmartTags: [],
    tokens: ["shadow", "turn", "shadow|turn"],
    variationKey: "variation-a",
    practiceRecords: [],
    viewRecords: [],
    createdAt: 1,
    updatedAt: 1,
    needsVideoProcessing: false,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("private Convex handlers", () => {
  it.each([
    ["steps.listMySteps", steps.listMySteps, {}],
    ["steps.getStepForEdit", steps.getStepForEdit, { id: "step-a" }],
    ["steps.getExistingTagsAndArtists", steps.getExistingTagsAndArtists, {}],
    [
      "steps.getVariationCandidates",
      steps.getVariationCandidates,
      { id: "step-a" as Id<"steps"> },
    ],
    [
      "steps.createStep",
      steps.createStep,
      {
        input: {
          name: "Shadow turn",
          videos: [processedVideo("hash-a")],
          difficulty: 3,
          feeling: ["urban"],
          kind: "step",
          tags: [],
          artists: [],
          notes: "",
          removedSmartTags: [],
          variationKey: "variation-a",
        },
      },
    ],
    [
      "steps.updateStep",
      steps.updateStep,
      { id: "step-a" as Id<"steps">, input: { name: "Updated" } },
    ],
    ["steps.recordStepView", steps.recordStepView, { id: "step-a" }],
    [
      "steps.recordPractice",
      steps.recordPractice,
      { id: "step-a", record: { date: 2, startOfDay: 0 } },
    ],
    [
      "practiceSessions.listMyPracticeSessions",
      practiceSessions.listMyPracticeSessions,
      {},
    ],
    [
      "practiceSessions.getMyPracticeSession",
      practiceSessions.getMyPracticeSession,
      { id: "session-a" as Id<"practiceSessions"> },
    ],
    [
      "practiceSessions.createPracticeSession",
      practiceSessions.createPracticeSession,
      { name: "Training" },
    ],
    [
      "practiceSessions.updatePracticeSession",
      practiceSessions.updatePracticeSession,
      { id: "session-a" as Id<"practiceSessions">, name: "Training" },
    ],
  ] as const)("requires auth for %s", async (_name, fn, args) => {
    await expect(runHandler(fn, unauthCtx(), args)).rejects.toThrow(
      "Authentication required",
    );
  });

  it("allows public step reads without auth and hides owner-only fields", async () => {
    const ctx = {
      ...unauthCtx(),
      db: {
        normalizeId: vi.fn(() => "step-main"),
        get: vi.fn(async () =>
          stepDoc({
            notes: "private note",
            practiceRecords: [{ date: 2, startOfDay: 0 }],
          }),
        ),
      },
    };

    await expect(
      runHandler(steps.getPublicStep, ctx, { id: "step-main" }),
    ).resolves.toEqual({
      _id: "step-main",
      identifier: 1,
      name: "Shadow turn",
      videos: [processedVideo("hash-a")],
      difficulty: 3,
      feeling: ["urban"],
      kind: "step",
      tags: ["turn"],
      artists: ["Petchu"],
      smartTags: ["Shadow position"],
    });
  });
});

describe("step mutation rules", () => {
  it("creates the next per-owner identifier", async () => {
    vi.spyOn(Date, "now").mockReturnValue(100);
    const insert = vi.fn(async () => "step-new");
    const ctx = {
      ...authCtx("user-a"),
      db: {
        insert,
        query: vi.fn(() => ({
          withIndex: () => ({
            order: () => ({
              first: async () =>
                stepDoc({
                  _id: "step-last" as Id<"steps">,
                  identifier: 9,
                }),
            }),
          }),
        })),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      runHandler(steps.createStep, ctx, {
        input: {
          name: "Shadow turn",
          videos: [processedVideo("hash-new")],
          difficulty: 3,
          feeling: ["urban"],
          kind: "step",
          tags: ["turn"],
          artists: ["Petchu"],
          notes: "",
          removedSmartTags: [],
          variationKey: "variation-new",
        },
      }),
    ).resolves.toBe("step-new");

    expect(insert).toHaveBeenCalledWith(
      "steps",
      expect.objectContaining({
        ownerId: "user-a",
        identifier: 10,
        videoHashes: ["hash-new"],
        needsVideoProcessing: false,
      }),
    );
  });

  it("updates a step with a fresh variation key and merges owned groups", async () => {
    vi.spyOn(Date, "now").mockReturnValue(200);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("variation-fresh");
    const patch = vi.fn();
    const ctx = {
      ...authCtx("user-a"),
      db: {
        get: vi.fn(async () => stepDoc({ variationKey: "variation-a" })),
        patch,
        query: vi.fn(() => ({
          withIndex: () => ({
            collect: async () => [
              stepDoc({
                _id: "step-merge" as Id<"steps">,
                variationKey: "variation-old",
              }),
              stepDoc({
                _id: "step-ignore" as Id<"steps">,
                variationKey: "variation-other",
              }),
            ],
          }),
        })),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      runHandler(steps.updateStep, ctx, {
        id: "step-main",
        input: { name: "Updated shadow", mergeVariationKeys: ["variation-old"] },
      }),
    ).resolves.toBe("step-main");

    expect(patch).toHaveBeenCalledWith(
      "step-main",
      expect.objectContaining({
        name: "Updated shadow",
        variationKey: "variation-fresh",
        updatedAt: 200,
      }),
    );
    expect(patch).toHaveBeenCalledWith("step-merge", {
      variationKey: "variation-fresh",
      updatedAt: 200,
    });
    expect(patch).not.toHaveBeenCalledWith(
      "step-ignore",
      expect.anything(),
    );
  });
});

describe("practice session mutation rules", () => {
  it("rejects edits to locked sessions", async () => {
    const ctx = {
      ...authCtx("user-a"),
      db: {
        get: vi.fn(async () => ({
          _id: "session-a",
          _creationTime: 1,
          ownerId: "user-a",
          name: "Training",
          steps: [],
          locked: true,
          createdAt: 1,
          updatedAt: 1,
        })),
      },
    };

    await expect(
      runHandler(practiceSessions.updatePracticeSession, ctx, {
        id: "session-a",
        name: "Updated",
      }),
    ).rejects.toThrow("Practice session is locked");
  });
});
