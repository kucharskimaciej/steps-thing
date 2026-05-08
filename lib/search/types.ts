export type FeelingFilterValue = -1 | 0 | 1;

export type SearchSortType =
  | "SCORE"
  | "VIEW_DATE"
  | "VIEW_COUNT"
  | "PRACTICE_DATE"
  | "ADDED_DATE"
  | "RANDOM";

export type SearchSortDirection = "ASCENDING" | "DESCENDING";

export type SearchSort = {
  type: SearchSortType;
  direction: SearchSortDirection;
};

export type SearchState = {
  query: string;
  feeling: Record<string, FeelingFilterValue>;
  includeAllTags: string[];
  excludeAnyTags: string[];
  anyArtists: string[];
  sort: SearchSort;
};

export type SearchablePracticeRecord = {
  date: number;
  startOfDay: number;
  collectionId?: unknown;
};

export type SearchableStep = {
  _id?: string;
  name: string;
  tags: string[];
  smartTags: string[];
  artists: string[];
  feeling: string[];
  viewRecords: number[];
  practiceRecords: SearchablePracticeRecord[];
  createdAt: number;
  updatedAt: number;
};

export type SearchResult<TStep extends SearchableStep = SearchableStep> = {
  step: TStep;
  fuzzyScore?: number;
  score: number;
};

export const DEFAULT_SEARCH_STATE: SearchState = {
  query: "",
  feeling: {},
  includeAllTags: [],
  excludeAnyTags: [],
  anyArtists: [],
  sort: {
    type: "ADDED_DATE",
    direction: "DESCENDING",
  },
};
