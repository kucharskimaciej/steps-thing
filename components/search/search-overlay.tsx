"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchSort } from "@/components/search/search-sort";
import {
  DEFAULT_SEARCH_STATE,
  type SearchState,
} from "@/lib/search/types";

type SearchOverlayProps = {
  isOpen: boolean;
  value: SearchState;
  matchedCount: number;
  tagOptions: string[];
  artistOptions: string[];
  onChange: (value: SearchState) => void;
  onClose: () => void;
};

function cloneSearchState(value: SearchState): SearchState {
  return {
    query: value.query,
    feeling: { ...value.feeling },
    includeAllTags: [...value.includeAllTags],
    excludeAnyTags: [...value.excludeAnyTags],
    anyArtists: [...value.anyArtists],
    sort: { ...value.sort },
  };
}

function matchLabel(count: number) {
  return count === 1 ? "1 match" : `${count} matches`;
}

export function SearchOverlay({
  isOpen,
  value,
  matchedCount,
  tagOptions,
  artistOptions,
  onChange,
  onClose,
}: SearchOverlayProps) {
  const [draft, setDraft] = useState<SearchState>(() =>
    cloneSearchState(value),
  );
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setDraft(cloneSearchState(value));
    }

    wasOpen.current = isOpen;
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => onChange(draft), 50);

    return () => window.clearTimeout(timeout);
  }, [draft, isOpen, onChange]);

  if (!isOpen) {
    return null;
  }

  function clearSearch() {
    const next = cloneSearchState(DEFAULT_SEARCH_STATE);
    setDraft(next);
    onChange(next);
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Search feed"
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(24,23,22,0.28)] px-4 py-4"
    >
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col gap-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4 shadow-xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
              Search
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Search feed</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {matchLabel(matchedCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-label="Clear search"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
              onClick={clearSearch}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Clear
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-white"
              onClick={onClose}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to results
            </button>
          </div>
        </div>

        <SearchFilters
          value={draft}
          tagOptions={tagOptions}
          artistOptions={artistOptions}
          onChange={setDraft}
        />
        <SearchSort
          value={draft.sort}
          onChange={(sort) => setDraft((current) => ({ ...current, sort }))}
        />
      </section>
    </div>
  );
}
