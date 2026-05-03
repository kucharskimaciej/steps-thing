import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlaceholderPage } from "@/components/placeholder-page";

describe("PlaceholderPage", () => {
  it("renders a title and description", () => {
    render(
      <PlaceholderPage
        title="Feed"
        description="A placeholder for the authenticated feed."
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Feed" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A placeholder for the authenticated feed."),
    ).toBeInTheDocument();
  });
});
