import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { StepList } from "@/components/steps/step-list";
import type { Doc, Id } from "@/convex/_generated/dataModel";

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
        hash: `hash-${identifier}-a`,
        storageKey: `/videos/${identifier}-a.mp4`,
        snapshotStorageKey: `/snapshots/${identifier}-a.jpg`,
        width: 1080,
        height: 1920,
      },
      {
        hash: `hash-${identifier}-b`,
        storageKey: `/videos/${identifier}-b.mp4`,
        width: 1080,
        height: 1920,
      },
    ],
    videoHashes: [`hash-${identifier}-a`, `hash-${identifier}-b`],
    difficulty: 3,
    feeling: ["urban"],
    kind: "step",
    tags: ["turn"],
    artists: ["Petchu"],
    notes: "Keep torso quiet.",
    smartTags: ["Shadow position"],
    removedSmartTags: [],
    tokens: ["shadow", "turn", "shadow|turn"],
    variationKey: "group-main",
    practiceRecords: [],
    viewRecords: [],
    createdAt: 1_700_000_000_000 + identifier,
    updatedAt: 1_700_000_000_000 + identifier,
    ...overrides,
  };
}

describe("StepList", () => {
  it("renders owned steps newest first with dense legacy details", () => {
    const steps = [
      step({
        _id: stepId("old-step"),
        identifier: 1,
        name: "Older step",
        createdAt: 1_700_000_000_000,
      }),
      step({
        _id: stepId("new-step"),
        identifier: 2,
        name: "Newer step",
        createdAt: 1_700_086_400_000,
        practiceRecords: [
          {
            date: 1_700_043_200_000,
            startOfDay: 1_700_035_200_000,
          },
        ],
      }),
      step({
        _id: stepId("variation-step"),
        identifier: 3,
        name: "Variation step",
        createdAt: 1_699_913_600_000,
      }),
    ];

    render(
      <StepList
        steps={steps}
        origin="https://steps.test"
        now={1_700_086_400_000}
        selectedStepId="new-step"
      />,
    );

    const items = screen.getAllByRole("article");
    expect(items[0]).toHaveAccessibleName("Newer step");
    expect(items[1]).toHaveAccessibleName("Older step");
    expect(items[2]).toHaveAccessibleName("Variation step");

    const newest = screen.getByRole("article", { name: "Newer step" });
    expect(newest).toHaveAttribute("aria-current", "true");
    expect(within(newest).getByText("#2")).toBeVisible();
    expect(
      within(newest).getByRole("link", { name: "Play Newer step" }),
    ).toHaveAttribute("href", "/videos/2-a.mp4");
    expect(
      within(newest).getByRole("link", { name: "Edit Newer step" }),
    ).toHaveAttribute("href", "/steps/new-step/edit");
    expect(
      within(newest).getByRole("button", { name: "Play video 2" }),
    ).toBeVisible();
    expect(within(newest).getByText("Keep torso quiet.")).toBeVisible();
    expect(within(newest).getByText("Shadow position")).toBeVisible();
    expect(within(newest).getByText("Petchu")).toBeVisible();
    expect(within(newest).getByText("Created today")).toBeVisible();
    expect(within(newest).getByText("Practiced 12 hours ago")).toBeVisible();
    expect(
      within(newest).getByRole("link", { name: "Variation #1 Older step" }),
    ).toHaveAttribute("href", "#old-step");
    expect(within(newest).getByText("https://steps.test/s/new-step"));
  });

  it("copies the visible shortlink", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
    render(
      <StepList
        steps={[step({ _id: stepId("copy-step"), name: "Copy step" })]}
        origin="https://steps.test"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy shortlink" }));

    expect(screen.getByText("Copied")).toBeVisible();
  });
});
