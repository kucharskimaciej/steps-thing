"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { MobileNavigation } from "./mobile-navigation";

export function TopBar() {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  return (
    <>
      <header className="border-[var(--border)] border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link className="font-semibold text-lg" href="/feed">
            Steps
          </Link>

          <nav
            aria-label="Primary navigation"
            className="ml-8 hidden items-center gap-2 min-[900px]:flex"
          >
            <Link
              className="rounded-md px-3 py-2 text-sm hover:bg-[var(--muted)]"
              href="/feed"
            >
              Feed
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-sm hover:bg-[var(--muted)]"
              href="/sessions"
            >
              Sessions
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-[var(--accent-foreground)] text-sm"
              href="/steps/new"
            >
              Create step
            </Link>
            <UserButton />
            <button
              aria-expanded={isMobileNavigationOpen}
              aria-label="Open navigation"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm min-[900px]:hidden"
              onClick={() => setIsMobileNavigationOpen(true)}
              type="button"
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <MobileNavigation
        isOpen={isMobileNavigationOpen}
        onClose={() => setIsMobileNavigationOpen(false)}
      />
    </>
  );
}
