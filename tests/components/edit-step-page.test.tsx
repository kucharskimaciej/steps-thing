import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditStepWorkflow } from "@/components/steps/edit-step-workflow";

const mocks = vi.hoisted(() => ({
  updateStep: vi.fn(),
  push: vi.fn(),
  stepForEdit: undefined as unknown,
}));

const existingStep = {
  _id: "step-edit",
  name: "Shadow turn",
  videos: [
    {
      hash: "hash-video",
      storageKey: "owners/user/videos/hash-video.mp4",
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
  updatedAt: 30,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("convex/react", async () => {
  const actualApi = await vi.importActual<
    typeof import("@/convex/_generated/api")
  >("@/convex/_generated/api");

  return {
    useMutation: () => mocks.updateStep,
    useQuery: (ref: unknown, args: unknown) => {
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

      return [
        existingStep,
        {
          _id: "step-related",
          name: "Shadow exit",
          videos: [
            {
              hash: "hash-related",
              storageKey: "owners/user/videos/hash-related.mp4",
            },
          ],
          variationKey: "group-shadow",
          tokens: ["shadow", "exit", "shadow|exit"],
          tags: ["turn"],
          smartTags: ["Shadow position"],
          artists: ["Petchu"],
          kind: "step",
          difficulty: 3,
          updatedAt: 20,
        },
        {
          _id: "step-basic",
          name: "Basic",
          videos: [
            {
              hash: "hash-basic",
              storageKey: "owners/user/videos/hash-basic.mp4",
            },
          ],
          variationKey: "group-basic",
          tokens: ["basic"],
          tags: ["frame"],
          smartTags: [],
          artists: [],
          kind: "step",
          difficulty: 1,
          updatedAt: 10,
        },
      ];
    },
  };
});

vi.mock("@/components/video/step-video-upload-field", () => ({
  StepVideoUploadField: () => <div>Video upload field</div>,
}));

describe("EditStepWorkflow", () => {
  beforeEach(() => {
    mocks.updateStep.mockReset();
    mocks.updateStep.mockResolvedValue("step-edit");
    mocks.push.mockReset();
    mocks.stepForEdit = existingStep;
  });

  it("loads the current step, saves updates, and returns to the list", async () => {
    const user = userEvent.setup();
    render(<EditStepWorkflow stepId="step-edit" />);

    expect(screen.getByLabelText("Name")).toHaveValue("Shadow turn");
    expect(screen.getByLabelText("Semba")).toBeChecked();
    expect(screen.getByLabelText("Notes")).toHaveValue("Keep frame");

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
    expect(mocks.push).toHaveBeenCalledWith("/steps");
  });

  it("initializes variation selection from the edited step group", () => {
    render(<EditStepWorkflow stepId="step-edit" />);

    const list = screen.getByText("Variation candidates").closest("section");
    expect(list).not.toBeNull();

    const items = within(list as HTMLElement).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Shadow exit");
    expect(
      within(items[0]).getByRole("button", { name: "Selected" }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable state when the step is missing or unauthorized", () => {
    mocks.stepForEdit = null;

    render(<EditStepWorkflow stepId="step-edit" />);

    expect(screen.getByRole("heading", { name: "Step unavailable" }));
    expect(screen.getByText(/not found or you do not have access/i));
  });
});
