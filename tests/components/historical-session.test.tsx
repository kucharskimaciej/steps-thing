import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HistoricalSessionPage from "@/app/(authenticated)/historical-sessions/[startOfDay]/page";
import { selectHistoricalPracticeSteps } from "@/convex/model/steps";
import type { Doc, Id } from "@/convex/_generated/dataModel";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
  useQuery: (_query: unknown, args: unknown) => {
    if (args === "skip") {
      return undefined;
    }

    if (
      typeof args === "object" &&
      args !== null &&
      "startOfDay" in args
    ) {
      return [];
    }

    return { tags: [], artists: [] };
  },
}));

function stepId(value: string) {
  return value as Id<"steps">;
}

function step(overrides: Partial<Doc<"steps">> = {}): Doc<"steps"> {
  const identifier = overrides.identifier ?? 1;

  return {
    _id: stepId(`step-${identifier}`),
    _creationTime: 100 + identifier,
    ownerId: "user-a",
    identifier,
    name: `Step ${identifier}`,
    videos: [],
    videoHashes: [],
    difficulty: 3,
    feeling: ["urban"],
    kind: "step",
    tags: [],
    artists: [],
    notes: "",
    smartTags: [],
    removedSmartTags: [],
    tokens: [],
    variationKey: `group-${identifier}`,
    practiceRecords: [],
    viewRecords: [],
    createdAt: 100 + identifier,
    updatedAt: 100 + identifier,
    ...overrides,
  };
}

describe("Historical session route", () => {
  it("shows an invalid route state for non-numeric startOfDay", async () => {
    render(
      await HistoricalSessionPage({
        params: Promise.resolve({ startOfDay: "not-a-number" }),
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Historical practice unavailable",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("This historical practice date is invalid."),
    ).toBeVisible();
  });

  it("renders the historical feed for a valid startOfDay", async () => {
    render(
      await HistoricalSessionPage({
        params: Promise.resolve({ startOfDay: "1700086400000" }),
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Historical practice: 15 Nov 2023",
      }),
    ).toBeVisible();
    expect(screen.getByText("No practiced steps for this day.")).toBeVisible();
  });
});

describe("selectHistoricalPracticeSteps", () => {
  it("deduplicates steps with multiple practice records for the same day", () => {
    const selected = selectHistoricalPracticeSteps({
      ownerId: "user-a",
      startOfDay: 1_700_086_400_000,
      steps: [
        step({
          _id: stepId("step-a"),
          identifier: 1,
          practiceRecords: [
            { date: 1_700_086_500_000, startOfDay: 1_700_086_400_000 },
            { date: 1_700_086_600_000, startOfDay: 1_700_086_400_000 },
          ],
        }),
      ],
    });

    expect(selected).toHaveLength(1);
    expect(selected[0]?._id).toBe("step-a");
  });

  it("keeps another owner's practiced steps out of the result", () => {
    const selected = selectHistoricalPracticeSteps({
      ownerId: "user-a",
      startOfDay: 1_700_086_400_000,
      steps: [
        step({
          _id: stepId("step-a"),
          identifier: 1,
          ownerId: "user-a",
          practiceRecords: [
            { date: 1_700_086_500_000, startOfDay: 1_700_086_400_000 },
          ],
        }),
        step({
          _id: stepId("step-b"),
          identifier: 2,
          ownerId: "user-b",
          practiceRecords: [
            { date: 1_700_086_600_000, startOfDay: 1_700_086_400_000 },
          ],
        }),
      ],
    });

    expect(selected.map((candidate) => candidate._id)).toEqual(["step-a"]);
  });
});
