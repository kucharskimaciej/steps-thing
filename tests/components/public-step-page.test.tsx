import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicStepView } from "@/components/steps/public-step-view";

describe("PublicStepView", () => {
  it("renders shared step name, playable primary video, and tags only", () => {
    render(
      <PublicStepView
        step={{
          name: "Shadow turn",
          kind: "step",
          difficulty: 3,
          feeling: ["smooth"],
          tags: ["turn"],
          smartTags: ["Shadow position"],
          artists: ["Petchu"],
        }}
        primaryVideo={{
          videoUrl: "https://storage.googleapis.test/video",
          snapshotUrl: "https://storage.googleapis.test/snapshot",
          width: 1920,
          height: 1080,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Shadow turn" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Shadow turn video")).toHaveAttribute(
      "src",
      "https://storage.googleapis.test/video",
    );
    expect(screen.getByText("Shadow position")).toBeVisible();
    expect(screen.getByText("Petchu")).toBeVisible();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /practice/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/private note/i)).not.toBeInTheDocument();
  });

  it("renders an empty video state when no primary video exists", () => {
    render(
      <PublicStepView
        step={{
          name: "No video step",
          kind: "routine",
          difficulty: 1,
          feeling: [],
          tags: [],
          smartTags: [],
          artists: [],
        }}
        primaryVideo={null}
      />,
    );

    expect(screen.getByText("Primary video is unavailable.")).toBeVisible();
  });
});
