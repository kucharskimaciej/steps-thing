import { describe, expect, it, vi } from "vitest";
import {
  getActiveAppConfig,
  getAppConfig,
  type StepForTags,
} from "@/lib/domain/config";
import { startOfLocalDay } from "@/lib/domain/dates";
import { matchSmartTags } from "@/lib/domain/smart-tags";
import { deriveStepTags } from "@/lib/domain/tags";
import { tokenizeStepName } from "@/lib/domain/tokenize";
import { scoreVariationCandidate } from "@/lib/domain/variation-score";

describe("domain config", () => {
  it("returns dance-specific labels and smart tag matchers", () => {
    expect(getAppConfig("kizomba").feelings.urban).toBe("Urban Kizz");
    expect(getAppConfig("kizomba").difficulties[8]).toBe("Very hard");
    expect(getAppConfig("kizomba").smartTagMatchers).toContainEqual(
      expect.objectContaining({ tag: "Obrót" }),
    );

    expect(getAppConfig("zouk").feelings.zouk).toBe("Zouk");
    expect(getAppConfig("zouk").difficulties[8]).toBe("Advanced");
    expect(getAppConfig("zouk").smartTagMatchers).toEqual([]);
  });

  it("uses STEPS_ACTIVE_DANCE for active config", () => {
    vi.stubEnv("STEPS_ACTIVE_DANCE", "zouk");

    expect(getActiveAppConfig().dance).toBe("zouk");

    vi.unstubAllEnvs();
  });
});

describe("tokenizeStepName", () => {
  it("creates one through four gram token chains", () => {
    expect(tokenizeStepName("Aaa bbb ccc")).toEqual([
      "aaa",
      "bbb",
      "ccc",
      "aaa|bbb",
      "bbb|ccc",
      "aaa|bbb|ccc",
    ]);
  });

  it("lowercases by locale, removes stop characters, numbers, and short words", () => {
    expect(tokenizeStepName("Obrót 123 z NA shadow-position!")).toEqual([
      "obrót",
      "shadow",
      "position",
      "obrót|shadow",
      "shadow|position",
      "obrót|shadow|position",
    ]);
  });
});

describe("matchSmartTags", () => {
  it.each([
    [
      "Obrót partnerki z przejściem przez shadow position",
      ["Obrót", "Shadow position"],
    ],
    [
      "Tepy, potem przesunięcie nogi w pozycji z tyłu",
      ["Przesunięcie nogi", "Tep", "Za partnerką"],
    ],
  ])("matches Kizomba smart tags in %s", (name, expected) => {
    expect(matchSmartTags(name, getAppConfig("kizomba"))).toEqual(expected);
  });
});

describe("deriveStepTags", () => {
  it("groups kind, difficulty, feeling, artist, content, meta, and all tags", () => {
    const step = {
      kind: "step",
      difficulty: 3,
      feeling: ["urban", "semba"],
      artists: ["Petchu"],
      tags: ["balance"],
      smartTags: ["Obrót"],
    } satisfies StepForTags;

    expect(deriveStepTags(step, getAppConfig("kizomba"))).toEqual({
      kind: ["Step"],
      difficulty: ["Intermediate"],
      feeling: ["Urban Kizz", "Semba"],
      artist: ["Petchu"],
      content: ["balance", "Obrót"],
      meta: ["Step", "Urban Kizz", "Semba", "Petchu", "Intermediate"],
      all: [
        "Step",
        "Urban Kizz",
        "Semba",
        "Petchu",
        "Intermediate",
        "balance",
        "Obrót",
      ],
    });
  });
});

describe("startOfLocalDay", () => {
  it("returns local midnight for a timestamp", () => {
    const date = new Date(2026, 4, 7, 15, 30, 45, 100);

    expect(startOfLocalDay(date.getTime())).toBe(
      new Date(2026, 4, 7).getTime(),
    );
  });
});

describe("scoreVariationCandidate", () => {
  it("adds squared token chain lengths and one-based tag matches", () => {
    expect(
      scoreVariationCandidate({
        sourceTokens: ["a", "a|b", "a|b|c", "x"],
        candidateTokens: ["a", "a|b", "a|b|c", "a|b|c|d"],
        sourceTags: ["first", "second", "third"],
        candidateTags: ["third", "first", "second"],
      }),
    ).toBe(1 + 4 + 9 + 10 + 20 + 30);
  });
});
