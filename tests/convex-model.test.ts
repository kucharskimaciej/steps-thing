import { describe, expect, it } from "vitest";
import {
  assertOwner,
  nextIdentifier,
  prependViewRecord,
  upsertPracticeRecord,
} from "@/convex/model/steps";
import { assertUnlocked } from "@/convex/model/practiceSessions";

describe("Convex step model helpers", () => {
  it("rejects records owned by another user", () => {
    expect(() => assertOwner({ ownerId: "user-b" }, "user-a")).toThrow(
      "Not found",
    );
  });

  it("increments identifiers per owner", () => {
    expect(nextIdentifier([])).toBe(1);
    expect(nextIdentifier([{ identifier: 1 }, { identifier: 4 }])).toBe(5);
  });

  it("prepends view timestamps", () => {
    expect(prependViewRecord([20, 10], 30)).toEqual([30, 20, 10]);
  });

  it("does not duplicate same-day practice for the same collection", () => {
    const existing = [
      { date: 100, startOfDay: 0, collectionId: "session-a" },
      { date: 200, startOfDay: 0 },
    ];

    expect(
      upsertPracticeRecord(existing, {
        date: 300,
        startOfDay: 0,
        collectionId: "session-a",
      }),
    ).toEqual(existing);
  });
});

describe("Convex practice session model helpers", () => {
  it("rejects locked session edits", () => {
    expect(() => assertUnlocked({ locked: true })).toThrow("Session locked");
  });
});
