import { filterSteps } from "./filter-steps";
import { scoreStepSearchResult } from "./score-result";
import {
  sortSearchResults,
  type SortSearchResultsOptions,
} from "./sort-results";
import {
  DEFAULT_SEARCH_STATE,
  type SearchResult,
  type SearchState,
  type SearchableStep,
} from "./types";

const FUZZY_THRESHOLD = 0.4;

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost =
        left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }

    for (let index = 0; index < previous.length; index += 1) {
      previous[index] = current[index];
    }
  }

  return previous[right.length] ?? 0;
}

function bestSubstringDistance(query: string, text: string): number {
  if (query.length >= text.length) {
    return levenshteinDistance(query, text);
  }

  let best = Number.POSITIVE_INFINITY;

  for (let start = 0; start <= text.length - query.length; start += 1) {
    const candidate = text.slice(start, start + query.length);
    best = Math.min(best, levenshteinDistance(query, candidate));
  }

  return best;
}

export function fuzzyScoreStepName(
  step: Pick<SearchableStep, "name">,
  query: string,
): number | undefined {
  const normalizedQuery = normalizeText(query.trim());

  if (normalizedQuery.length === 0) {
    return undefined;
  }

  const normalizedName = normalizeText(step.name);

  if (normalizedName.includes(normalizedQuery)) {
    return 0;
  }

  const score =
    bestSubstringDistance(normalizedQuery, normalizedName) /
    normalizedQuery.length;

  return score <= FUZZY_THRESHOLD ? score : undefined;
}

export function querySearch<TStep extends SearchableStep>(
  steps: TStep[],
  state: SearchState = DEFAULT_SEARCH_STATE,
  options: SortSearchResultsOptions = {},
): SearchResult<TStep>[] {
  const scoredResults = filterSteps(steps, state)
    .map((step) => ({
      step,
      fuzzyScore: fuzzyScoreStepName(step, state.query),
    }))
    .filter(
      (result) =>
        state.query.trim().length === 0 || result.fuzzyScore !== undefined,
    )
    .map(({ step, fuzzyScore }) =>
      scoreStepSearchResult({ step, state, fuzzyScore }),
    );

  return sortSearchResults(scoredResults, state.sort, options);
}
