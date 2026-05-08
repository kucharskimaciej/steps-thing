import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StepsFeed } from "@/components/feed/steps-feed";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { startOfLocalDay } from "@/lib/domain/dates";
import { resetViewedStepsForTests } from "@/lib/feed/viewed-steps-memory";

const mocks = vi.hoisted(() => ({
  recordPractice: vi.fn(),
  recordStepView: vi.fn(),
  openEdit: vi.fn(),
  clipboardWriteText: vi.fn(),
}));

function stepId(value: string) {
  return value as Id<"steps">;
}

function step(overrides: Partial<Doc<"steps">> = {}): Doc<"steps"> {
  const identifier = (overrides.identifier as number | undefined) ?? 1;

  return {
    _id: `step-${identifier}` as Id<"steps">,
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
    smartTags: ["Shadow position"],
    removedSmartTags: [],
    tokens: ["shadow", "turn", "shadow|turn"],
    variationKey: "group-main",
    practiceRecords: [],
    viewRecords: [],
    createdAt: 100 + identifier,
    updatedAt: 100 + identifier,
    ...overrides,
  };
}

vi.mock("convex/react", () => ({
  useMutation: () => (args: { id: string; record?: unknown }) =>
    args.record ? mocks.recordPractice(args) : mocks.recordStepView(args),
}));

describe("StepsFeed", () => {
  beforeEach(() => {
    resetViewedStepsForTests();
    mocks.recordPractice.mockReset();
    mocks.recordPractice.mockResolvedValue("step-1");
    mocks.recordStepView.mockReset();
    mocks.recordStepView.mockResolvedValue("step-1");
    mocks.openEdit.mockReset();
    mocks.clipboardWriteText.mockReset();
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(900);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
  });

  it("renders a virtualized feed with stable capped video sizing", () => {
    const steps = Array.from({ length: 60 }, (_, index) =>
      step({ identifier: index + 1, _id: stepId(`step-${index + 1}`) }),
    );

    render(<StepsFeed steps={steps} onEditStep={mocks.openEdit} />);

    expect(screen.getByText("Step 60")).toBeVisible();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
    const videoFrame = screen.getByTestId("feed-video-frame-step-60");
    expect(videoFrame).toHaveStyle({
      aspectRatio: "1080 / 1920",
      maxHeight: "60vh",
    });
  });

  it("shows tags, variations, practice, copy link, and edit actions", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis.navigator.clipboard, "writeText").mockImplementation(
      mocks.clipboardWriteText,
    );
    const steps = [
      step({ _id: stepId("step-main"), identifier: 1, name: "Shadow turn" }),
      step({
        _id: stepId("step-variation"),
        identifier: 2,
        name: "Shadow exit",
      }),
      step({
        _id: stepId("step-other"),
        identifier: 3,
        name: "Saida",
        variationKey: "group-other",
      }),
    ];

    render(
      <StepsFeed
        steps={steps}
        origin="https://steps.test"
        onEditStep={mocks.openEdit}
      />,
    );

    const card = screen.getByRole("article", { name: "Shadow turn" });
    expect(within(card).getByText("turn")).toBeVisible();
    expect(within(card).getByText("Shadow position")).toBeVisible();

    await user.click(
      within(card).getByRole("button", { name: "Show 1 variation" }),
    );
    const modal = screen.getByRole("dialog", {
      name: "Variations for Shadow turn",
    });
    expect(within(modal).getByText("Shadow exit")).toBeVisible();
    expect(within(modal).queryByText("Saida")).not.toBeInTheDocument();

    await user.click(
      within(modal).getByRole("button", { name: "Close variations" }),
    );
    const refreshedCard = screen.getByRole("article", { name: "Shadow turn" });
    await user.click(
      within(refreshedCard).getByRole("button", {
        name: "Practice Shadow turn",
      }),
    );
    await waitFor(() =>
      expect(mocks.recordPractice).toHaveBeenCalledWith({
        id: "step-main",
        record: expect.objectContaining({
          date: expect.any(Number),
          startOfDay: expect.any(Number),
        }),
      }),
    );

    await user.click(
      within(refreshedCard).getByRole("button", {
        name: "Open options for Shadow turn",
      }),
    );
    const menu = screen.getByRole("menu", { name: "Options for Shadow turn" });
    await user.click(within(menu).getByRole("menuitem", { name: "Copy link" }));
    await waitFor(() =>
      expect(mocks.clipboardWriteText).toHaveBeenCalledWith(
        "https://steps.test/s/step-main",
      ),
    );

    await user.click(
      within(refreshedCard).getByRole("button", {
        name: "Open options for Shadow turn",
      }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(mocks.openEdit).toHaveBeenCalledWith("step-main");
  });

  it("records a video view once per step for the current app load", async () => {
    const steps = [
      step({ _id: stepId("step-main"), identifier: 1, name: "Shadow turn" }),
    ];

    render(<StepsFeed steps={steps} onEditStep={mocks.openEdit} />);

    const video = screen.getByLabelText("Shadow turn video");
    Object.defineProperty(video, "duration", {
      configurable: true,
      value: 10,
    });

    fireTimeUpdate(video, 8);
    fireTimeUpdate(video, 0.5);
    fireTimeUpdate(video, 8.5);

    await waitFor(() =>
      expect(mocks.recordStepView).toHaveBeenCalledWith({ id: "step-main" }),
    );
    expect(mocks.recordStepView).toHaveBeenCalledTimes(1);
  });

  it("shows practiced state and blocks duplicate practice clicks", async () => {
    const user = userEvent.setup();
    const todayStart = startOfLocalDay(Date.now());
    const steps = [
      step({
        _id: stepId("step-main"),
        identifier: 1,
        name: "Shadow turn",
        practiceRecords: [{ date: todayStart + 1, startOfDay: todayStart }],
      }),
    ];

    render(<StepsFeed steps={steps} onEditStep={mocks.openEdit} />);

    const card = screen.getByRole("article", { name: "Shadow turn" });
    const button = within(card).getByRole("button", {
      name: "Practiced Shadow turn today",
    });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(mocks.recordPractice).not.toHaveBeenCalled();
  });
});

function fireTimeUpdate(video: HTMLElement, currentTime: number) {
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    value: currentTime,
  });
  video.dispatchEvent(new Event("timeupdate", { bubbles: true }));
}
