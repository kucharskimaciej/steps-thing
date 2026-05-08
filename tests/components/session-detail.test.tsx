import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionDetail } from "@/components/sessions/session-detail";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const mocks = vi.hoisted(() => ({
  addStepToSession: vi.fn(),
  removeStepFromSession: vi.fn(),
  clearSessionSteps: vi.fn(),
  deletePracticeSession: vi.fn(),
  recordPractice: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    practiceSessions: {
      addStepToSession: "addStepToSession",
      removeStepFromSession: "removeStepFromSession",
      clearSessionSteps: "clearSessionSteps",
      deletePracticeSession: "deletePracticeSession",
    },
    steps: {
      recordPractice: "recordPractice",
    },
  },
}));

vi.mock("convex/react", () => ({
  useMutation: (name: keyof typeof mocks) => mocks[name],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
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
  return {
    _id: sessionId("session-a"),
    _creationTime: 100,
    ownerId: "user",
    name: "Morning practice",
    steps: [stepId("step-a")],
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
    videos: [
      {
        hash: `hash-${identifier}`,
        storageKey: `/videos/${identifier}.mp4`,
        snapshotStorageKey: `/snapshots/${identifier}.jpg`,
        width: 1080,
        height: 1920,
      },
    ],
    videoHashes: [`hash-${identifier}`],
    difficulty: 3,
    feeling: ["urban"],
    kind: "step",
    tags: ["turn"],
    artists: ["Petchu"],
    notes: "",
    smartTags: ["shadow"],
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

describe("SessionDetail", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    for (const mock of Object.values(mocks)) {
      mock.mockReset();
      mock.mockResolvedValue(undefined);
    }
  });

  it("loads session steps, changes active step, and toggles membership", async () => {
    const user = userEvent.setup();
    const steps = [
      step({ _id: stepId("step-a"), identifier: 1, name: "Alpha" }),
      step({ _id: stepId("step-b"), identifier: 2, name: "Beta" }),
    ];

    render(<SessionDetail session={session()} steps={steps} />);

    expect(screen.getByRole("heading", { name: "Morning practice" })).toBeVisible();
    expect(screen.getByRole("article", { name: "Alpha" })).toBeVisible();
    expect(screen.getByText("1 selected")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Select Beta" }));
    expect(screen.getByRole("article", { name: "Beta" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add Beta" }));
    expect(mocks.addStepToSession).toHaveBeenCalledWith({
      sessionId: "session-a",
      stepId: "step-b",
    });

    await user.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(mocks.removeStepFromSession).toHaveBeenCalledWith({
      sessionId: "session-a",
      stepId: "step-a",
    });
  });

  it("clears selected steps and opens a cart feed with collection practice", async () => {
    const user = userEvent.setup();
    render(
      <SessionDetail
        session={session({ steps: [stepId("step-a")] })}
        steps={[
          step({ _id: stepId("step-a"), identifier: 1, name: "Alpha" }),
          step({ _id: stepId("step-b"), identifier: 2, name: "Beta" }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open session feed" }));
    const modal = screen.getByRole("dialog", { name: "Session feed" });
    expect(within(modal).getByRole("article", { name: "Alpha" })).toBeVisible();
    expect(within(modal).queryByText("Beta")).not.toBeInTheDocument();

    await user.click(within(modal).getByRole("button", { name: "Practice Alpha" }));
    await waitFor(() =>
      expect(mocks.recordPractice).toHaveBeenCalledWith({
        id: "step-a",
        record: expect.objectContaining({ collectionId: "session-a" }),
      }),
    );

    await user.click(screen.getByRole("button", { name: "Clear selected steps" }));
    expect(mocks.clearSessionSteps).toHaveBeenCalledWith({ id: "session-a" });
  });

  it("locks add remove and clear controls for locked sessions", () => {
    render(
      <SessionDetail
        session={session({ locked: true })}
        steps={[
          step({ _id: stepId("step-a"), identifier: 1, name: "Alpha" }),
          step({ _id: stepId("step-b"), identifier: 2, name: "Beta" }),
        ]}
      />,
    );

    expect(screen.getAllByText("Locked session")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add Beta" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear selected steps" })).toBeDisabled();
  });

  it("deletes a session and returns to the sessions list", async () => {
    const user = userEvent.setup();
    render(<SessionDetail session={session()} steps={[step({ name: "Alpha" })]} />);

    await user.click(screen.getByRole("button", { name: "Remove session" }));

    expect(mocks.deletePracticeSession).toHaveBeenCalledWith({ id: "session-a" });
    expect(mocks.routerPush).toHaveBeenCalledWith("/sessions");
  });

  it("opens the session feed on mobile when steps are selected initially", async () => {
    mockMatchMedia(true);

    await act(async () => {
      render(
        <SessionDetail
          session={session({ steps: [stepId("step-a")] })}
          steps={[step({ _id: stepId("step-a"), name: "Alpha" })]}
        />,
      );
    });

    expect(screen.getByRole("dialog", { name: "Session feed" })).toBeVisible();
  });
});

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: "(max-width: 767px)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}
