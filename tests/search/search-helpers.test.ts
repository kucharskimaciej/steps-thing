import { describe, expect, it } from "vitest";
import { querySearch } from "@/lib/search/query-search";
import { scoreSearchResult } from "@/lib/search/score-result";
import { sortSearchResults } from "@/lib/search/sort-results";
import {
  DEFAULT_SEARCH_STATE,
  type SearchState,
  type SearchableStep,
} from "@/lib/search/types";

function step(
  id: string,
  overrides: Partial<SearchableStep> = {},
): SearchableStep {
  return {
    _id: id,
    name: id,
    tags: [],
    smartTags: [],
    artists: [],
    feeling: [],
    viewRecords: [],
    practiceRecords: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const baseState: SearchState = {
  ...DEFAULT_SEARCH_STATE,
  sort: { type: "ADDED_DATE", direction: "DESCENDING" },
};

describe("querySearch filters", () => {
  it("uses default search with added date descending", () => {
    const results = querySearch([
      step("old", { createdAt: 10 }),
      step("new", { createdAt: 30 }),
      step("middle", { createdAt: 20 }),
    ]);

    expect(results.map((result) => result.step._id)).toEqual([
      "new",
      "middle",
      "old",
    ]);
  });

  it("matches text query against step name with fuzzy threshold", () => {
    const results = querySearch([
      step("match", { name: "Shadow position turn" }),
      step("fuzzy", { name: "Shado position" }),
      step("miss", { name: "Saida basic" }),
    ], {
      ...baseState,
      query: "shadow",
    });

    expect(results.map((result) => result.step._id)).toEqual([
      "match",
      "fuzzy",
    ]);
    expect(results[0]?.fuzzyScore).toBe(0);
  });

  it("requires every included tag across tags and smart tags", () => {
    const results = querySearch([
      step("both", { tags: ["turn"], smartTags: ["Shadow position"] }),
      step("one", { tags: ["turn"] }),
      step("none", { smartTags: ["Shadow position"] }),
    ], {
      ...baseState,
      includeAllTags: ["turn", "Shadow position"],
    });

    expect(results.map((result) => result.step._id)).toEqual(["both"]);
  });

  it("rejects any excluded tag across tags and smart tags", () => {
    const results = querySearch([
      step("keep", { tags: ["turn"], smartTags: ["Shadow position"] }),
      step("reject-tag", { tags: ["drop"] }),
      step("reject-smart", { smartTags: ["drop"] }),
    ], {
      ...baseState,
      excludeAnyTags: ["drop"],
    });

    expect(results.map((result) => result.step._id)).toEqual(["keep"]);
  });

  it("matches any selected artist", () => {
    const results = querySearch([
      step("petchu", { artists: ["Petchu"], createdAt: 10 }),
      step("kwenda", { artists: ["Kwenda Lima"], createdAt: 20 }),
      step("other", { artists: ["Other"] }),
    ], {
      ...baseState,
      anyArtists: ["Petchu", "Kwenda Lima"],
    });

    expect(results.map((result) => result.step._id)).toEqual([
      "kwenda",
      "petchu",
    ]);
  });

  it("requires at least one positive feeling", () => {
    const results = querySearch([
      step("urban", { feeling: ["urban"] }),
      step("semba", { feeling: ["semba"] }),
      step("none", { feeling: [] }),
    ], {
      ...baseState,
      feeling: { urban: 1, tarraxa: 1 },
    });

    expect(results.map((result) => result.step._id)).toEqual(["urban"]);
  });

  it("rejects matching negative feelings", () => {
    const results = querySearch([
      step("urban", { feeling: ["urban"] }),
      step("semba", { feeling: ["semba"] }),
      step("mixed", { feeling: ["urban", "semba"] }),
    ], {
      ...baseState,
      feeling: { urban: -1 },
    });

    expect(results.map((result) => result.step._id)).toEqual(["semba"]);
  });

  it("requires positive match and no negative match for mixed feelings", () => {
    const results = querySearch([
      step("urban", { feeling: ["urban"] }),
      step("mixed", { feeling: ["urban", "semba"] }),
      step("semba", { feeling: ["semba"] }),
    ], {
      ...baseState,
      feeling: { urban: 1, semba: -1 },
    });

    expect(results.map((result) => result.step._id)).toEqual(["urban"]);
  });
});

describe("scoreSearchResult", () => {
  it("adds text, included tag, and positive feeling score", () => {
    const result = querySearch([
      step("scored", {
        name: "Shadow turn",
        tags: ["turn"],
        smartTags: ["Shadow position"],
        feeling: ["urban"],
      }),
    ], {
      ...baseState,
      query: "shadow",
      includeAllTags: ["turn", "Shadow position"],
      feeling: { urban: 1, semba: 1 },
      sort: { type: "SCORE", direction: "DESCENDING" },
    })[0];

    expect(result).toBeDefined();
    expect(scoreSearchResult(result)).toBe(260);
  });
});

describe("sortSearchResults", () => {
  const results = [
    {
      step: step("a", {
        createdAt: 10,
        updatedAt: 90,
        viewRecords: [100, 40],
        practiceRecords: [{ date: 50, startOfDay: 0 }],
      }),
      fuzzyScore: 0,
      score: 10,
    },
    {
      step: step("b", {
        createdAt: 20,
        updatedAt: 80,
        viewRecords: [200],
        practiceRecords: [{ date: 70, startOfDay: 0 }],
      }),
      fuzzyScore: 0,
      score: 30,
    },
    {
      step: step("c", {
        createdAt: 30,
        updatedAt: 70,
        viewRecords: [100, 60, 20],
        practiceRecords: [{ date: 70, startOfDay: 0 }],
      }),
      fuzzyScore: 0,
      score: 20,
    },
  ];

  it.each([
    ["SCORE", "DESCENDING", ["b", "c", "a"]],
    ["SCORE", "ASCENDING", ["a", "c", "b"]],
    ["ADDED_DATE", "DESCENDING", ["c", "b", "a"]],
    ["ADDED_DATE", "ASCENDING", ["a", "b", "c"]],
    ["VIEW_COUNT", "DESCENDING", ["c", "a", "b"]],
    ["VIEW_DATE", "DESCENDING", ["b", "c", "a"]],
    ["PRACTICE_DATE", "DESCENDING", ["c", "b", "a"]],
  ] as const)(
    "sorts by %s %s",
    (type, direction, expected) => {
      expect(
        sortSearchResults(results, { type, direction }).map(
          (result) => result.step._id,
        ),
      ).toEqual(expected);
    },
  );

  it("uses reverse updatedAt direction for secondary ordering", () => {
    expect(
      sortSearchResults(
        [
          { step: step("older-update", { updatedAt: 10 }), score: 0 },
          { step: step("newer-update", { updatedAt: 20 }), score: 0 },
        ],
        { type: "VIEW_COUNT", direction: "DESCENDING" },
      ).map((result) => result.step._id),
    ).toEqual(["older-update", "newer-update"]);
  });

  it("shuffles random order using the supplied random function", () => {
    expect(
      sortSearchResults(
        results,
        { type: "RANDOM", direction: "DESCENDING" },
        { random: () => 0 },
      ).map((result) => result.step._id),
    ).toEqual(["b", "c", "a"]);
  });
});
