"use client";

import { useQuery } from "convex/react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchButton } from "@/components/search/search-button";
import { SearchOverlay } from "@/components/search/search-overlay";
import { InlineStepEditModal } from "@/components/steps/inline-step-edit-modal";
import { useInlineStepEdit } from "@/components/steps/use-inline-step-edit";
import { api } from "@/convex/_generated/api";
import { querySearch } from "@/lib/search/query-search";
import {
  DEFAULT_SEARCH_STATE,
  type SearchState,
} from "@/lib/search/types";

function isDefaultSearch(state: SearchState) {
  return (
    state.query.trim() === "" &&
    Object.keys(state.feeling).length === 0 &&
    state.includeAllTags.length === 0 &&
    state.excludeAnyTags.length === 0 &&
    state.anyArtists.length === 0 &&
    state.sort.type === DEFAULT_SEARCH_STATE.sort.type &&
    state.sort.direction === DEFAULT_SEARCH_STATE.sort.direction
  );
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function FeedStepList() {
  const steps = useQuery(api.steps.listMySteps);
  const existing = useQuery(api.steps.getExistingTagsAndArtists);
  const [searchState, setSearchState] =
    useState<SearchState>(DEFAULT_SEARCH_STATE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hasMounted = useRef(false);
  const {
    editingStepId,
    isInlineStepEditOpen,
    openInlineStepEdit,
    closeInlineStepEdit,
  } = useInlineStepEdit();

  const searchResults = useMemo(
    () => querySearch(steps ?? [], searchState),
    [steps, searchState],
  );
  const optionSource = useMemo(
    () => ({
      tags: uniqueSorted(
        steps?.flatMap((step) => [...step.tags, ...step.smartTags]) ?? [],
      ),
      artists: uniqueSorted(steps?.flatMap((step) => step.artists) ?? []),
    }),
    [steps],
  );
  const visibleSteps = searchResults.map((result) => result.step);
  const searchIsActive = !isDefaultSearch(searchState);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchState]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
            Steps
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Feed</h1>
        </div>
        {steps === undefined ? null : (
          <SearchButton
            isActive={searchIsActive}
            matchedCount={searchResults.length}
            onClick={() => setIsSearchOpen(true)}
          />
        )}
      </div>

      {steps === undefined ? (
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading steps...
        </p>
      ) : steps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          No steps yet.
        </p>
      ) : visibleSteps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          No matching steps.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleSteps.map((step) => (
            <li
              key={step._id}
              className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">
                    {step.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    #{step.identifier} · {step.kind} · difficulty{" "}
                    {step.difficulty}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[...step.feeling, ...step.tags, ...step.smartTags]
                      .slice(0, 8)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Edit ${step.name}`}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
                  onClick={() => openInlineStepEdit(step._id)}
                >
                  <MoreHorizontal size={16} aria-hidden="true" />
                  <Pencil size={16} aria-hidden="true" />
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SearchOverlay
        isOpen={isSearchOpen}
        value={searchState}
        matchedCount={searchResults.length}
        tagOptions={existing?.tags ?? optionSource.tags}
        artistOptions={existing?.artists ?? optionSource.artists}
        onChange={setSearchState}
        onClose={() => setIsSearchOpen(false)}
      />
      <InlineStepEditModal
        stepId={editingStepId}
        isOpen={isInlineStepEditOpen}
        onClose={closeInlineStepEdit}
      />
    </main>
  );
}
