import type { SearchState, SearchableStep } from "./types";

export function matchesSearchFilters(
  step: SearchableStep,
  state: SearchState,
): boolean {
  const tagSet = new Set([...step.tags, ...step.smartTags]);

  if (!state.includeAllTags.every((tag) => tagSet.has(tag))) {
    return false;
  }

  if (state.excludeAnyTags.some((tag) => tagSet.has(tag))) {
    return false;
  }

  if (
    state.anyArtists.length > 0 &&
    !state.anyArtists.some((artist) => step.artists.includes(artist))
  ) {
    return false;
  }

  const positiveFeelings = Object.entries(state.feeling)
    .filter(([, value]) => value === 1)
    .map(([feeling]) => feeling);
  const negativeFeelings = Object.entries(state.feeling)
    .filter(([, value]) => value === -1)
    .map(([feeling]) => feeling);

  if (
    positiveFeelings.length > 0 &&
    !positiveFeelings.some((feeling) => step.feeling.includes(feeling))
  ) {
    return false;
  }

  return !negativeFeelings.some((feeling) => step.feeling.includes(feeling));
}

export function filterSteps<TStep extends SearchableStep>(
  steps: TStep[],
  state: SearchState,
): TStep[] {
  return steps.filter((step) => matchesSearchFilters(step, state));
}
