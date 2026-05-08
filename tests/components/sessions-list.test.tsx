import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  groupHistoricalPracticeDays,
  SessionsList,
} from "@/components/sessions/sessions-list";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const mocks = vi.hoisted(() => ({
  createPracticeSession: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useMutation: () => mocks.createPracticeSession,
}));

function sessionId(value: string) {
  return value as Id<"practiceSessions">;
}

function stepId(value: string) {
  return value as Id<"steps">;
}

function session(
  overrides: Partial<Doc<"practiceSessions">> = {},
): Doc<"practiceSessions"> {
  const name = overrides.name ?? "Morning practice";

  return {
    _id: sessionId(name.toLowerCase().replaceAll(" ", "-")),
    _creationTime: 100,
    ownerId: "user",
    name,
    steps: [],
    locked: false,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  };
}

function step(overrides: Partial<Doc<"steps">> = {}): Doc<"steps"> {
  const identifier = overrides.identifier ?? 1;

  return {
    _id: stepId(`step-${identifier}`),
    _creationTime: 100 + identifier,
    ownerId: "user",
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

describe("SessionsList", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-08T10:00:00Z"));
    mocks.createPracticeSession.mockReset();
    mocks.createPracticeSession.mockResolvedValue("session-new");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders saved sessions and historical practice days newest first", () => {
    const sessions = [
      session({
        _id: sessionId("session-old"),
        name: "Older session",
        steps: [stepId("step-a")],
        updatedAt: 1_700_000_000_000,
      }),
      session({
        _id: sessionId("session-new"),
        name: "Newer session",
        steps: [stepId("step-a"), stepId("step-b")],
        updatedAt: 1_700_086_400_000,
      }),
    ];
    const steps = [
      step({
        _id: stepId("step-a"),
        identifier: 1,
        practiceRecords: [
          { date: 1_700_086_500_000, startOfDay: 1_700_086_400_000 },
          { date: 1_700_086_700_000, startOfDay: 1_700_086_400_000 },
        ],
      }),
      step({
        _id: stepId("step-b"),
        identifier: 2,
        practiceRecords: [
          { date: 1_700_086_600_000, startOfDay: 1_700_086_400_000 },
          { date: 1_700_000_100_000, startOfDay: 1_700_000_000_000 },
        ],
      }),
    ];

    render(
      <SessionsList
        sessions={sessions}
        historicalDays={groupHistoricalPracticeDays(steps)}
      />,
    );

    const saved = screen.getByRole("list", { name: "Saved sessions" });
    const savedItems = within(saved).getAllByRole("listitem");
    expect(savedItems[0]).toHaveTextContent("Newer session");
    expect(savedItems[0]).toHaveTextContent("2 selected steps");
    expect(
      within(savedItems[0]).getByRole("link", { name: "Open Newer session" }),
    ).toHaveAttribute("href", "/sessions/session-new");
    expect(savedItems[1]).toHaveTextContent("Older session");
    expect(savedItems[1]).toHaveTextContent("1 selected step");

    const historical = screen.getByRole("list", {
      name: "Historical practice",
    });
    const historicalItems = within(historical).getAllByRole("listitem");
    expect(historicalItems[0]).toHaveTextContent("15 Nov 2023");
    expect(historicalItems[0]).toHaveTextContent("2 practiced steps");
    expect(
      within(historicalItems[0]).getByRole("link", {
        name: "Open historical practice for 15 Nov 2023",
      }),
    ).toHaveAttribute("href", "/historical-sessions/1700086400000");
    expect(historicalItems[1]).toHaveTextContent("14 Nov 2023");
    expect(historicalItems[1]).toHaveTextContent("1 practiced step");
  });

  it("creates a default empty unlocked practice session", async () => {
    render(<SessionsList sessions={[]} historicalDays={[]} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add session" }));
    });

    expect(mocks.createPracticeSession).toHaveBeenCalledWith({
      name: "Practice 08 May",
      stepIds: [],
    });
  });

  it("renders empty states for both sections", () => {
    render(<SessionsList sessions={[]} historicalDays={[]} />);

    expect(screen.getByText("No saved sessions yet.")).toBeVisible();
    expect(screen.getByText("No practice history yet.")).toBeVisible();
  });
});
