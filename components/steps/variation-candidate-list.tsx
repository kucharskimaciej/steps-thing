"use client";

import { VariationToggle } from "./variation-toggle";

export type VariationCandidate = {
  id: string;
  name: string;
  variationKey: string;
  score: number;
  kind: string;
  difficulty: number;
  tags: string[];
  smartTags: string[];
  artists: string[];
  updatedAt: number;
};

type VariationCandidateListProps = {
  candidates: VariationCandidate[];
  selectedVariationKeys: string[];
  onToggleVariationKey: (variationKey: string) => void;
};

export function VariationCandidateList({
  candidates,
  selectedVariationKeys,
  onToggleVariationKey,
}: VariationCandidateListProps) {
  const selected = new Set(selectedVariationKeys);

  if (candidates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
        No similar steps yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {candidates.map((candidate) => {
        const hasVariationGroup = candidate.variationKey.trim().length > 0;

        return (
          <li
            key={candidate.id}
            className="rounded-md border border-[var(--border)] bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  {candidate.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Score {candidate.score}
                </p>
              </div>
              <VariationToggle
                variationKey={candidate.variationKey}
                selected={selected.has(candidate.variationKey)}
                disabled={!hasVariationGroup}
                onToggle={onToggleVariationKey}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...candidate.tags, ...candidate.smartTags, ...candidate.artists]
                .slice(0, 6)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
