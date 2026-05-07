import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedStepList } from "@/components/steps/feed-step-list";
import { InlineStepEditModal } from "@/components/steps/inline-step-edit-modal";

const mocks = vi.hoisted(() => ({
  updateStep: vi.fn(),
  close: vi.fn(),
  stepForEdit: undefined as unknown,
  steps: [] as unknown[],
}));

const editedStep = {
  _id: "step-edit",
  identifier: 7,
  name: "Shadow turn",
  videos: [
    {
      hash: "hash-edit",
      storageKey: "owners/user/videos/hash-edit.mp4",
    },
  ],
  difficulty: 3,
  feeling: ["semba"],
  kind: "step",
  tags: ["turn"],
  artists: ["Petchu"],
  notes: "Keep frame",
  smartTags: ["Shadow position"],
  removedSmartTags: [],
  tokens: ["shadow", "turn", "shadow|turn"],
  variationKey: "group-shadow",
  updatedAt: 100,
};

function candidate(index: number) {
  return {
    _id: `step-candidate-${index}`,
    identifier: index,
    name: `Candidate ${index}`,
    videos: [
      {
        hash: `hash-candidate-${index}`,
        storageKey: `owners/user/videos/hash-candidate-${index}.mp4`,
      },
    ],
    difficulty: 3,
    feeling: ["semba"],
    kind: "step",
    tags: ["turn"],
    artists: ["Petchu"],
    notes: "",
    smartTags: ["Shadow position"],
    removedSmartTags: [],
    tokens: ["shadow", "turn", "shadow|turn"],
    variationKey: `group-${index}`,
    updatedAt: 100 - index,
  };
}

vi.mock("convex/react", async () => {
  const actualApi = await vi.importActual<
    typeof import("@/convex/_generated/api")
  >("@/convex/_generated/api");

  return {
    useMutation: () => mocks.updateStep,
    useQuery: (ref: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }

      if (
        ref === actualApi.api.steps.getStepForEdit ||
        (args as { id?: string } | undefined)?.id === "step-edit"
      ) {
        return mocks.stepForEdit;
      }

      if (ref === actualApi.api.steps.getExistingTagsAndArtists) {
        return {
          tags: ["turn", "frame"],
          artists: ["Petchu"],
        };
      }

      return mocks.steps;
    },
  };
});

vi.mock("@/components/video/step-video-upload-field", () => ({
  StepVideoUploadField: ({
    onVideosChange,
  }: {
    onVideosChange: (
      videos: Array<{ hash: string; storageKey: string }>,
    ) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onVideosChange([
          {
            hash: "hash-edit",
            storageKey: "owners/user/videos/hash-edit.mp4",
          },
        ])
      }
    >
      Keep mocked video
    </button>
  ),
}));

describe("InlineStepEditModal", () => {
  beforeEach(() => {
    mocks.updateStep.mockReset();
    mocks.updateStep.mockResolvedValue("step-edit");
    mocks.close.mockReset();
    mocks.stepForEdit = editedStep;
    mocks.steps = [
      editedStep,
      ...Array.from({ length: 24 }, (_, index) => candidate(index + 1)),
    ];
  });

  it("opens from the feed and closes without saving", async () => {
    const user = userEvent.setup();
    render(<FeedStepList />);

    await user.click(screen.getByRole("button", { name: "Edit Shadow turn" }));
    expect(screen.getByRole("dialog", { name: "Shadow turn" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close inline edit" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mocks.updateStep).not.toHaveBeenCalled();
  });

  it("saves through updateStep and closes on success", async () => {
    const user = userEvent.setup();
    render(
      <InlineStepEditModal
        stepId="step-edit"
        isOpen
        onClose={mocks.close}
      />,
    );

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Shadow turn updated");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mocks.updateStep).toHaveBeenCalledWith({
        id: "step-edit",
        input: expect.objectContaining({
          name: "Shadow turn updated",
          mergeVariationKeys: ["group-shadow"],
        }),
      }),
    );
    expect(mocks.close).toHaveBeenCalledTimes(1);
  });

  it("shows top 20 candidates with scores and excludes the edited step", () => {
    render(
      <InlineStepEditModal
        stepId="step-edit"
        isOpen
        onClose={mocks.close}
      />,
    );

    const sidebar = screen.getByText("Variation candidates").closest("aside");
    expect(sidebar).not.toBeNull();

    const items = within(sidebar as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(20);
    expect(within(sidebar as HTMLElement).queryByText("Shadow turn")).toBeNull();
    expect(items[0]).toHaveTextContent("Score 36");
  });

  it("closes on Escape without saving", async () => {
    const user = userEvent.setup();
    render(
      <InlineStepEditModal
        stepId="step-edit"
        isOpen
        onClose={mocks.close}
      />,
    );

    await user.keyboard("{Escape}");

    expect(mocks.close).toHaveBeenCalledTimes(1);
    expect(mocks.updateStep).not.toHaveBeenCalled();
  });
});
