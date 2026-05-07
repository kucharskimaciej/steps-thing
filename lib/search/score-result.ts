import type { SearchResult, SearchState, SearchableStep } from "./types";

export function scoreStepSearchResult<TStep extends SearchableStep>({
  step,
  state,
  fuzzyScore,
}: {
  step: TStep;
  state: SearchState;
  fuzzyScore?: number;
}): SearchResult<TStep> {
  const tagSet = new Set([...step.tags, ...step.smartTags]);
  const textScore = (1 - (fuzzyScore ?? 0)) * 200;
  const tagScore =
    state.includeAllTags.filter((tag) => tagSet.has(tag)).length * 20;
  const positiveFeelingScore =
    Object.entries(state.feeling).filter(
      ([feeling, value]) => value === 1 && step.feeling.includes(feeling),
    ).length * 20;

  return {
    step,
    fuzzyScore,
    score: textScore + tagScore + positiveFeelingScore,
  };
}

export function scoreSearchResult(result: SearchResult): number {
  return result.score;
}
