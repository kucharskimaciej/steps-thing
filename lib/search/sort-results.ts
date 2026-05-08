import type { SearchResult, SearchSort, SearchableStep } from "./types";

export type SortSearchResultsOptions = {
  random?: () => number;
};

function directionMultiplier(direction: SearchSort["direction"]): number {
  return direction === "DESCENDING" ? -1 : 1;
}

function newestPracticeDate(step: SearchableStep): number {
  return step.practiceRecords[0]?.date ?? 0;
}

function newestViewDate(step: SearchableStep): number {
  return step.viewRecords[0] ?? 0;
}

function primaryValue(result: SearchResult, type: SearchSort["type"]): number {
  switch (type) {
    case "SCORE":
      return result.score;
    case "VIEW_DATE":
      return newestViewDate(result.step);
    case "VIEW_COUNT":
      return result.step.viewRecords.length;
    case "PRACTICE_DATE":
      return newestPracticeDate(result.step);
    case "ADDED_DATE":
      return result.step.createdAt;
    case "RANDOM":
      return 0;
  }
}

function compareSearchResults(
  left: SearchResult,
  right: SearchResult,
  sort: SearchSort,
): number {
  const primary =
    (primaryValue(left, sort.type) - primaryValue(right, sort.type)) *
    directionMultiplier(sort.direction);

  if (primary !== 0) {
    return primary;
  }

  return (
    (left.step.updatedAt - right.step.updatedAt) *
    directionMultiplier(
      sort.direction === "DESCENDING" ? "ASCENDING" : "DESCENDING",
    )
  );
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function sortSearchResults<TStep extends SearchableStep>(
  results: SearchResult<TStep>[],
  sort: SearchSort,
  options: SortSearchResultsOptions = {},
): SearchResult<TStep>[] {
  if (sort.type === "RANDOM") {
    return shuffle(results, options.random ?? Math.random);
  }

  return [...results].sort((left, right) =>
    compareSearchResults(left, right, sort),
  );
}
