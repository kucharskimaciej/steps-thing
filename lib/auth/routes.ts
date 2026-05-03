export const protectedRoutePatterns = [
  "/feed(.*)",
  "/steps(.*)",
  "/sessions(.*)",
  "/historical-sessions(.*)",
];

export function isProtectedPathname(pathname: string) {
  return (
    pathname === "/feed" ||
    pathname.startsWith("/feed/") ||
    pathname === "/steps" ||
    pathname.startsWith("/steps/") ||
    pathname === "/sessions" ||
    pathname.startsWith("/sessions/") ||
    pathname === "/historical-sessions" ||
    pathname.startsWith("/historical-sessions/")
  );
}
