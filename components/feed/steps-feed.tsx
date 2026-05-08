"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchButton } from "@/components/search/search-button";
import { SearchOverlay } from "@/components/search/search-overlay";
import { VariationFeedModal } from "@/components/steps/variation-feed-modal";
import type { Doc } from "@/convex/_generated/dataModel";
import { querySearch } from "@/lib/search/query-search";
import { DEFAULT_SEARCH_STATE, type SearchState } from "@/lib/search/types";
import { FeedStepCard } from "./feed-step-card";

const estimatedCardHeight = 760;
const overscan = 3;

type StepsFeedProps = {
  steps: Doc<"steps">[];
  tagOptions?: string[];
  artistOptions?: string[];
  origin?: string;
  eyebrow?: string;
  title?: string;
  emptyLabel?: string;
  onEditStep: (stepId: string) => void;
};

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

function useVirtualWindow(count: number) {
  const [range, setRange] = useState({ start: 0, end: 12 });

  useEffect(() => {
    function updateRange() {
      const viewportHeight =
        typeof window === "undefined" ? 900 : window.innerHeight;
      const scrollTop = typeof window === "undefined" ? 0 : window.scrollY;
      const start = Math.max(
        0,
        Math.floor(scrollTop / estimatedCardHeight) - overscan,
      );
      const visible =
        Math.ceil(viewportHeight / estimatedCardHeight) + overscan * 2;

      setRange({
        start,
        end: Math.min(count, start + visible),
      });
    }

    updateRange();
    window.addEventListener("scroll", updateRange, { passive: true });
    window.addEventListener("resize", updateRange);

    return () => {
      window.removeEventListener("scroll", updateRange);
      window.removeEventListener("resize", updateRange);
    };
  }, [count]);

  return range;
}

export function StepsFeed({
  steps,
  tagOptions,
  artistOptions,
  origin,
  eyebrow = "Steps",
  title = "Feed",
  emptyLabel = "No steps yet.",
  onEditStep,
}: StepsFeedProps) {
  const [searchState, setSearchState] =
    useState<SearchState>(DEFAULT_SEARCH_STATE);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [variationSource, setVariationSource] = useState<Doc<"steps"> | null>(
    null,
  );
  const hasMounted = useRef(false);
  const searchResults = useMemo(
    () => querySearch(steps, searchState),
    [steps, searchState],
  );
  const visibleSteps = searchResults.map((result) => result.step);
  const { start, end } = useVirtualWindow(visibleSteps.length);
  const renderedSteps = visibleSteps.slice(start, end);
  const derivedOptions = useMemo(
    () => ({
      tags: uniqueSorted(
        steps.flatMap((step) => [...step.tags, ...step.smartTags]),
      ),
      artists: uniqueSorted(steps.flatMap((step) => step.artists)),
    }),
    [steps],
  );
  const searchIsActive = !isDefaultSearch(searchState);
  const variationSteps = useMemo(() => {
    if (!variationSource || variationSource.variationKey.trim().length === 0) {
      return [];
    }

    return steps.filter(
      (step) =>
        step._id !== variationSource._id &&
        step.variationKey === variationSource.variationKey,
    );
  }, [steps, variationSource]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchState]);

  function relatedStepsFor(step: Doc<"steps">) {
    if (step.variationKey.trim().length === 0) {
      return [];
    }

    return steps.filter(
      (candidate) =>
        candidate._id !== step._id &&
        candidate.variationKey === step.variationKey,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        </div>
        <SearchButton
          isActive={searchIsActive}
          matchedCount={searchResults.length}
          onClick={() => setIsSearchOpen(true)}
        />
      </div>

      {steps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          {emptyLabel}
        </p>
      ) : visibleSteps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          No matching steps.
        </p>
      ) : (
        <div
          style={{
            height: visibleSteps.length * estimatedCardHeight,
            position: "relative",
          }}
        >
          <ul
            className="absolute left-0 right-0 flex flex-col gap-4"
            style={{
              transform: `translateY(${start * estimatedCardHeight}px)`,
            }}
          >
            {renderedSteps.map((step) => (
              <li
                key={step._id}
                style={{ minHeight: estimatedCardHeight - 16 }}
              >
                <FeedStepCard
                  step={step}
                  relatedSteps={relatedStepsFor(step)}
                  origin={origin}
                  isVisible
                  onShowVariations={setVariationSource}
                  onEditStep={onEditStep}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <SearchOverlay
        isOpen={isSearchOpen}
        value={searchState}
        matchedCount={searchResults.length}
        tagOptions={tagOptions ?? derivedOptions.tags}
        artistOptions={artistOptions ?? derivedOptions.artists}
        onChange={setSearchState}
        onClose={() => setIsSearchOpen(false)}
      />
      <VariationFeedModal
        sourceStep={variationSource}
        steps={variationSteps}
        origin={origin}
        isOpen={variationSource !== null}
        onClose={() => setVariationSource(null)}
        onEditStep={onEditStep}
      />
    </main>
  );
}
