import { describe, expect, it } from "vitest";
import { isProtectedPathname } from "@/lib/auth/routes";

describe("auth route protection rules", () => {
  it.each([
    "/feed",
    "/feed/search",
    "/steps",
    "/steps/new",
    "/steps/example/edit",
    "/sessions",
    "/sessions/example",
    "/historical-sessions/1704067200000",
  ])("marks %s as protected", (pathname) => {
    expect(isProtectedPathname(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/sign-in",
    "/sign-up",
    "/s/example-step-id",
  ])("leaves %s public", (pathname) => {
    expect(isProtectedPathname(pathname)).toBe(false);
  });
});
