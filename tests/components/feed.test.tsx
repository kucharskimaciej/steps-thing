import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StepsFeed } from "@/components/feed/steps-feed";
import type { Doc, Id } from "@/convex/_generated/dataModel";

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
  useMutation: () => mocks.recordPractice,
}));

describe("StepsFeed", () => {
  beforeEach(() => {
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
});
