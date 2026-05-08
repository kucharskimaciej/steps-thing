import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedStepList } from "@/components/steps/feed-step-list";

const mocks = vi.hoisted(() => ({
  steps: [] as unknown[],
}));

function step(overrides: Record<string, unknown>) {
  return {
    _id: crypto.randomUUID(),
    identifier: 1,
    name: "Base step",
    videos: [],
    difficulty: 1,
    feeling: ["urban"],
    kind: "step",
    tags: [],
    artists: [],
    notes: "",
    smartTags: [],
    removedSmartTags: [],
    tokens: [],
    variationKey: "variation",
    practiceRecords: [],
    viewRecords: [],
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  };
}

vi.mock("convex/react", async () => {
  const actualApi = await vi.importActual<
    typeof import("@/convex/_generated/api")
  >("@/convex/_generated/api");

  return {
    useMutation: () => vi.fn(),
    useQuery: (ref: unknown) => {
      if (ref === actualApi.api.steps.getExistingTagsAndArtists) {
        return {
          tags: ["turn", "frame", "saida"],
          artists: ["Petchu", "Bonifacio"],
        };
      }

      return mocks.steps;
    },
  };
});

async function waitForDebounce() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 70));
  });
}

describe("Feed search overlay", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    mocks.steps = [
      step({
        _id: "step-shadow",
        identifier: 1,
        name: "Shadow turn",
        feeling: ["urban"],
        tags: ["turn"],
        smartTags: ["Shadow position"],
        artists: ["Petchu"],
        createdAt: 300,
        updatedAt: 300,
      }),
      step({
        _id: "step-saida",
        identifier: 2,
        name: "Saida frame",
        feeling: ["semba"],
        tags: ["frame", "saida"],
        artists: ["Bonifacio"],
        createdAt: 200,
        updatedAt: 200,
      }),
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens overlay, debounces query updates, and clears search", async () => {
    const user = userEvent.setup();
    render(<FeedStepList />);

    await user.click(screen.getByRole("button", { name: "Open search" }));
    expect(screen.getByRole("dialog", { name: "Search feed" })).toBeVisible();

    await user.type(screen.getByLabelText("Text query"), "shadow");
    expect(screen.getByText("Saida frame")).toBeVisible();

    await waitForDebounce();

    await waitFor(() =>
      expect(screen.queryByText("Saida frame")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Shadow turn")).toBeVisible();
    expect(screen.getAllByText("1 match").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    await waitFor(() => expect(screen.getByText("2 matches")).toBeVisible());
    expect(screen.getByText("Saida frame")).toBeVisible();
  });

  it("expresses feeling, tag, artist, sort, direction, and back actions", async () => {
    const scrollTo = vi.mocked(window.scrollTo);
    const user = userEvent.setup();
    render(<FeedStepList />);

    await user.click(screen.getByRole("button", { name: "Open search" }));
    const dialog = screen.getByRole("dialog", { name: "Search feed" });

    await user.click(
      within(dialog).getByRole("button", { name: "Semba: neutral" }),
    );
    await waitForDebounce();
    await waitFor(() =>
      expect(screen.getAllByText("1 match").length).toBeGreaterThan(0),
    );
    expect(screen.getByText("Saida frame")).toBeVisible();

    await user.click(
      within(dialog).getByRole("button", { name: "Semba: include" }),
    );
    await user.click(
      within(
        within(dialog).getByRole("listbox", {
          name: "Include all tags options",
        }),
      ).getByRole("option", { name: "turn" }),
    );
    await user.click(
      within(
        within(dialog).getByRole("listbox", { name: "Artists options" }),
      ).getByRole("option", { name: "Petchu" }),
    );
    await user.selectOptions(
      within(dialog).getByLabelText("Sort by"),
      "VIEW_COUNT",
    );
    await user.selectOptions(
      within(dialog).getByLabelText("Direction"),
      "ASCENDING",
    );
    await waitForDebounce();

    await waitFor(() => expect(screen.getByText("Shadow turn")).toBeVisible());
    expect(within(dialog).getByRole("button", { name: "Semba: exclude" })).toBeVisible();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    await user.click(screen.getByRole("button", { name: "Back to results" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Search feed" })).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText("1 match").length).toBeGreaterThan(0);

  });
});
