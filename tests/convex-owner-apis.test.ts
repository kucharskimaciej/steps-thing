import { describe, expect, it } from "vitest";
import { requireUserId } from "@/convex/auth";
import {
  applyStepView,
  assertStepOwner,
  buildCreatedStep,
  mergePracticeRecord,
  nextIdentifier,
  toPublicStep,
  type PracticeRecordInput,
} from "@/convex/model/steps";
import type { Id } from "@/convex/_generated/dataModel";
import {
  assertSessionEditable,
  assertSessionOwner,
  buildDuplicatedSession,
} from "@/convex/model/practiceSessions";

describe("Convex auth helper", () => {
  it("rejects unauthenticated private calls", async () => {
    await expect(
      requireUserId({
        auth: { getUserIdentity: async () => null },
      }),
    ).rejects.toThrow("Authentication required");
  });

  it("returns the authenticated subject", async () => {
    await expect(
      requireUserId({
        auth: {
          getUserIdentity: async () => ({
            subject: "user-a",
            tokenIdentifier: "issuer|user-a",
            issuer: "issuer",
          }),
        },
      }),
    ).resolves.toBe("user-a");
  });
});

describe("owner-scoped step model", () => {
  it("increments identifiers per owner", () => {
    expect(
      nextIdentifier(
        [
          { ownerId: "user-a", identifier: 1 },
          { ownerId: "user-b", identifier: 9 },
          { ownerId: "user-a", identifier: 2 },
        ],
        "user-a",
      ),
    ).toBe(3);
  });

  it("creates canonical step fields for the authenticated owner", () => {
    const step = buildCreatedStep({
      ownerId: "user-a",
      identifier: 4,
      now: 10,
      input: {
        name: "Shadow turn",
        videos: [{ hash: "hash-a", storageKey: "videos/hash-a.mp4" }],
        difficulty: 3,
        feeling: ["urban"],
        kind: "step",
        tags: ["turn"],
        artists: ["Petchu"],
        notes: "note",
        removedSmartTags: [],
        variationKey: "",
      },
    });

    expect(step).toMatchObject({
      ownerId: "user-a",
      identifier: 4,
      videoHashes: ["hash-a"],
      needsVideoProcessing: true,
      createdAt: 10,
      updatedAt: 10,
    });
    expect(step.smartTags).toContain("Shadow position");
    expect(step.tokens).toContain("shadow|turn");
  });

  it("rejects another owner's step", () => {
    expect(() => assertStepOwner({ ownerId: "user-b" }, "user-a")).toThrow(
      "Step not found",
    );
  });

  it("limits public step exposure to read-only share fields", () => {
    const publicStep = toPublicStep({
      _id: "step-a" as Id<"steps">,
      _creationTime: 1,
      ownerId: "user-a",
      identifier: 2,
      name: "Shadow turn",
      videos: [
        { hash: "hash-a", storageKey: "videos/user-a/hash-a", width: 1920 },
        { hash: "hash-b", storageKey: "videos/user-a/hash-b" },
      ],
      videoHashes: ["hash-a"],
      difficulty: 3,
      feeling: ["smooth"],
      kind: "step",
      tags: ["turn"],
      artists: ["Petchu"],
      notes: "private note",
      smartTags: ["Shadow position"],
      removedSmartTags: [],
      tokens: ["shadow"],
      variationKey: "variation",
      practiceRecords: [{ date: 1, startOfDay: 0 }],
      viewRecords: [1],
      createdAt: 1,
      updatedAt: 1,
    });

    expect(publicStep).toEqual({
      _id: "step-a",
      identifier: 2,
      name: "Shadow turn",
      primaryVideo: {
        storageKey: "videos/user-a/hash-a",
        width: 1920,
      },
      difficulty: 3,
      feeling: ["smooth"],
      kind: "step",
      tags: ["turn"],
      artists: ["Petchu"],
      smartTags: ["Shadow position"],
    });
    expect(publicStep).not.toHaveProperty("ownerId");
    expect(publicStep).not.toHaveProperty("notes");
    expect(publicStep).not.toHaveProperty("practiceRecords");
    expect(publicStep).not.toHaveProperty("videos");
    expect(publicStep.primaryVideo).not.toHaveProperty("hash");
  });

  it("prepends view timestamps and updates last viewed time", () => {
    expect(applyStepView({ existing: [1, 2], now: 3 })).toEqual({
      viewRecords: [3, 1, 2],
      lastViewedAt: 3,
      updatedAt: 3,
    });
  });

  it("does not duplicate practice records for same day and collection", () => {
    const sessionId = "session-a" as Id<"practiceSessions">;
    const existing = [{ date: 10, startOfDay: 0, collectionId: sessionId }];

    expect(
      mergePracticeRecord({
        existing,
        record: { date: 20, startOfDay: 0, collectionId: sessionId },
      }),
    ).toBe(existing);
  });

  it("tracks general and collection practice independently", () => {
    const sessionId = "session-a" as Id<"practiceSessions">;
    const existing: PracticeRecordInput[] = [{ date: 10, startOfDay: 0 }];

    expect(
      mergePracticeRecord({
        existing,
        record: { date: 20, startOfDay: 0, collectionId: sessionId },
      }),
    ).toEqual([
      { date: 20, startOfDay: 0, collectionId: sessionId },
      { date: 10, startOfDay: 0 },
    ]);
  });
});

describe("owner-scoped practice session model", () => {
  it("rejects another owner's session", () => {
    expect(() => assertSessionOwner({ ownerId: "user-b" }, "user-a")).toThrow(
      "Practice session not found",
    );
  });

  it("rejects normal changes to locked sessions", () => {
    expect(() => assertSessionEditable({ locked: true })).toThrow(
      "Practice session is locked",
    );
  });

  it("duplicates sessions unlocked with copied steps", () => {
    expect(
      buildDuplicatedSession({
        source: {
          ownerId: "user-a",
          name: "Training",
          steps: ["step-a", "step-b"] as Id<"steps">[],
        },
        now: 10,
      }),
    ).toEqual({
      ownerId: "user-a",
      name: "Training copy",
      steps: ["step-a", "step-b"],
      locked: false,
      createdAt: 10,
      updatedAt: 10,
    });
  });
});
