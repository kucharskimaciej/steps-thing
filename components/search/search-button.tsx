"use client";

import { Search } from "lucide-react";

type SearchButtonProps = {
  isActive: boolean;
  matchedCount: number;
  onClick: () => void;
};

function matchLabel(count: number) {
  return count === 1 ? "1 match" : `${count} matches`;
}

export function SearchButton({
  isActive,
  matchedCount,
  onClick,
}: SearchButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open search"
      className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
      onClick={onClick}
    >
      <Search size={16} aria-hidden="true" />
      Search
      {isActive ? (
        <span className="rounded-md bg-[var(--foreground)] px-2 py-1 text-xs text-white">
          {matchLabel(matchedCount)}
        </span>
      ) : null}
    </button>
  );
}
