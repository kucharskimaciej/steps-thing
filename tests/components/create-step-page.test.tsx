import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateStepWorkflow } from "@/components/steps/create-step-workflow";

const mocks = vi.hoisted(() => ({
  createStep: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("convex/react", async () => {
  const actualApi = await vi.importActual<
    typeof import("@/convex/_generated/api")
  >("@/convex/_generated/api");

  return {
    useMutation: () => mocks.createStep,
    useQuery: (ref: unknown) => {
      if (ref === actualApi.api.steps.getExistingTagsAndArtists) {
        return {
          tags: ["turn", "frame"],
          artists: ["Petchu"],
        };
      }

      return [
        {
          _id: "step-shadow",
          name: "Shadow turn",
          variationKey: "group-shadow",
          tokens: ["shadow", "turn", "shadow|turn"],
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
            hash: "hash-video",
            storageKey: "owners/user/videos/hash-video.mp4",
          },
        ])
      }
    >
      Add mocked video
    </button>
  ),
}));

describe("CreateStepWorkflow", () => {
  beforeEach(() => {
    mocks.createStep.mockReset();
    mocks.createStep.mockResolvedValue("new-step");
    mocks.push.mockReset();
  });

  it("creates a step and navigates to the steps list", async () => {
    const user = userEvent.setup();
    render(<CreateStepWorkflow />);

    await user.click(screen.getByRole("button", { name: "Add mocked video" }));
    await user.type(screen.getByLabelText("Name"), "Shadow turn");
    await user.click(screen.getByLabelText("Semba"));

    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "Select" })[0],
      ).toBeVisible(),
    );
    await user.click(screen.getAllByRole("button", { name: "Select" })[0]);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mocks.createStep).toHaveBeenCalledWith({
        input: expect.objectContaining({
          name: "Shadow turn",
          videos: [
            {
              hash: "hash-video",
              storageKey: "owners/user/videos/hash-video.mp4",
            },
          ],
          feeling: ["semba"],
          mergeVariationKeys: ["group-shadow"],
        }),
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/steps");
  });

  it("reranks candidates from current form data", async () => {
    const user = userEvent.setup();
    render(<CreateStepWorkflow />);

    const list = screen.getByText("Variation candidates").closest("section");
    expect(list).not.toBeNull();

    await user.type(screen.getByLabelText("Name"), "Shadow turn");

    await waitFor(() => {
      const items = within(list as HTMLElement).getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Shadow turn");
      expect(items[0]).toHaveTextContent("Score 16");
    });
  });

  it("save and create another preserves selected fields only", async () => {
    const user = userEvent.setup();
    render(<CreateStepWorkflow />);

    await user.click(screen.getByRole("button", { name: "Add mocked video" }));
    await user.type(screen.getByLabelText("Name"), "Shadow turn");
    await user.click(screen.getByLabelText("Semba"));
    await user.type(screen.getByLabelText("Tags"), "turn{enter}");
    await user.type(screen.getByLabelText("Artists"), "Petchu{enter}");
    await user.click(screen.getAllByRole("button", { name: "Select" })[0]);
    await user.click(
      screen.getByRole("button", { name: "Save & create another" }),
    );

    await waitFor(() => expect(mocks.createStep).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Semba")).toBeChecked();
    expect(
      within(screen.getByLabelText("Selected tags")).getByText("turn"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Selected artists")).getByText("Petchu"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Selected" }),
    ).not.toBeInTheDocument();
  });
});
