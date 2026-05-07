import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StepForm } from "@/components/steps/step-form";
import {
  createStepFormDefaults,
  validateStepFormValues,
} from "@/lib/steps/step-form-defaults";
import type { StepFormValues } from "@/lib/steps/step-form-schema";

const validVideo = {
  hash: "video-hash-1",
  storageKey: "owners/user/videos/video-hash-1.mp4",
};

describe("step form validation", () => {
  it("defaults to the minimal empty step shape", () => {
    expect(createStepFormDefaults()).toEqual({
      videos: [],
      name: "",
      difficulty: 1,
      feeling: [],
      kind: "step",
      tags: [],
      artists: [],
      notes: "",
      smartTags: [],
      removedSmartTags: [],
      tokens: [],
    });
  });

  it("requires name, difficulty, kind, feeling, and valid videos", () => {
    const result = validateStepFormValues({
      ...createStepFormDefaults(),
      kind: "bad-kind",
      difficulty: Number.NaN,
      videos: [{ hash: "", storageKey: "" }],
    } as unknown as StepFormValues);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({
      name: "Name is required.",
      difficulty: "Difficulty is required.",
      kind: "Choose a valid kind.",
      feeling: "Choose at least one feeling.",
      videos: "Video hash and storage key are required.",
    });
  });

  it("blocks duplicate videos except the edited step", () => {
    const values = {
      ...createStepFormDefaults(),
      name: "Saida",
      videos: [validVideo],
      feeling: ["semba"],
    };

    const duplicate = validateStepFormValues(values, {
      currentStepId: "step-2",
      existingVideos: [
        {
          hash: validVideo.hash,
          stepId: "step-1",
          stepName: "Existing Saida",
        },
      ],
    });
    const edited = validateStepFormValues(values, {
      currentStepId: "step-1",
      existingVideos: [
        {
          hash: validVideo.hash,
          stepId: "step-1",
          stepName: "Existing Saida",
        },
      ],
    });

    expect(duplicate.ok).toBe(false);
    expect(duplicate.errors.videos).toBe("Duplicate of Existing Saida.");
    expect(edited.ok).toBe(true);
  });
});

describe("StepForm", () => {
  it("submits Convex mutation-shaped values for a valid form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <StepForm
        initialValues={{
          ...createStepFormDefaults(),
          videos: [validVideo],
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Saida damska");
    await user.click(screen.getByLabelText("Semba"));
    await user.click(screen.getByRole("button", { name: "Save step" }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Saida damska",
        videos: [validVideo],
        difficulty: 1,
        feeling: ["semba"],
        kind: "step",
        tags: [],
        artists: [],
        notes: "",
        removedSmartTags: [],
        variationKey: expect.any(String),
      },
      "save",
    );
  });

  it("debounces name smart tags and moves removed tags to removedSmartTags", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <StepForm
        initialValues={{
          ...createStepFormDefaults(),
          videos: [validVideo],
          feeling: ["semba"],
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Obrot shadow");

    expect(
      screen.queryByRole("button", {
        name: "Remove smart tag Shadow position",
      }),
    ).not.toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByText("Shadow position")).toBeInTheDocument(),
      { timeout: 500 },
    );
    expect(screen.getByText("Obrót")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Remove smart tag Shadow position" }),
    );

    expect(
      screen.queryByRole("button", {
        name: "Remove smart tag Shadow position",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Removed smart tags")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Restore smart tag Shadow position"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save step" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        removedSmartTags: ["Shadow position"],
      }),
      "save",
    );
  });

  it("offers tag and artist autocomplete without arbitrary smart tag controls", async () => {
    const user = userEvent.setup();

    render(
      <StepForm
        initialValues={{
          ...createStepFormDefaults(),
          videos: [validVideo],
          feeling: ["semba"],
          name: "Saida damska",
        }}
        tagOptions={["balance", "frame"]}
        artistOptions={["Petchu"]}
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Tags"), "balance{enter}");
    await user.type(screen.getByLabelText("Artists"), "Petchu{enter}");

    expect(
      within(screen.getByLabelText("Selected tags")).getByText("balance"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Selected artists")).getByText("Petchu"),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "frame" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Add smart tag")).not.toBeInTheDocument();
  });

  it("shows validation failures instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<StepForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Save step" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Add at least one video.")).toBeInTheDocument();
  });
});

const _typecheck: StepFormValues | null = null;
