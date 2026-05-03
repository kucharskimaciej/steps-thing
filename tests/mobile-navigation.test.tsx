import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileNavigation } from "@/components/app-shell/mobile-navigation";

let pathname = "/feed";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("MobileNavigation", () => {
  afterEach(() => {
    pathname = "/feed";
    document.body.style.overflow = "";
  });

  it("renders links and closes from the backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MobileNavigation isOpen={true} onClose={onClose} />);

    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Feed" })).toHaveAttribute(
      "href",
      "/feed",
    );
    expect(screen.getByRole("link", { name: "Create step" })).toHaveAttribute(
      "href",
      "/steps/new",
    );

    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Close navigation" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("locks body scroll while open", () => {
    const { unmount } = render(
      <MobileNavigation isOpen={true} onClose={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("closes when the route changes", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MobileNavigation isOpen={true} onClose={onClose} />,
    );

    expect(onClose).toHaveBeenCalledTimes(1);

    pathname = "/steps/new";
    rerender(<MobileNavigation isOpen={true} onClose={onClose} />);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
