"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MobileNavigationProps = {
  isOpen: boolean;
  onClose: () => void;
};

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/sessions", label: "Sessions" },
  { href: "/steps/new", label: "Create step" },
];

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="min-[900px]:hidden">
      <button
        aria-label="Close navigation"
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        type="button"
      />
      <nav
        aria-label="Mobile navigation"
        className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-80 flex-col gap-2 border-[var(--border)] border-l bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">Steps</p>
          <button
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        {links.map((link) => (
          <Link
            className="rounded-md px-3 py-3 text-base hover:bg-[var(--muted)]"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
