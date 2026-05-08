import { describe, expect, it } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import { hasRecordedPractice } from "@/lib/practice/has-recorded-practice";

describe("hasRecordedPractice", () => {
  it("matches same local day general practice", () => {
    expect(
      hasRecordedPractice({
        records: [{ date: 10, startOfDay: 0 }],
        startOfDay: 0,
      }),
    ).toBe(true);
  });

  it("keeps collection practice separate from general practice", () => {
    const collectionId = "session-a" as Id<"practiceSessions">;

    expect(
      hasRecordedPractice({
        records: [{ date: 10, startOfDay: 0 }],
        startOfDay: 0,
        collectionId,
      }),
    ).toBe(false);
  });
});
