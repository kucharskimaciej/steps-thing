export type Dance = "kizomba" | "zouk";
export type StepKind = "step" | "inspiration" | "routine";
export type Difficulty = 1 | 2 | 3 | 5 | 8;

export type SmartTagMatcher = {
  tag: string;
  patterns: string[];
};

export type AppConfig = {
  dance: Dance;
  label: string;
  feelings: Record<string, string>;
  difficulties: Record<Difficulty, string>;
  stepKinds: Record<StepKind, string>;
  smartTagMatchers: SmartTagMatcher[];
};

export type StepForTags = {
  kind: StepKind;
  difficulty: Difficulty;
  feeling: string[];
  artists: string[];
  tags: string[];
  smartTags: string[];
};

const stepKinds: Record<StepKind, string> = {
  step: "Step",
  inspiration: "Inspiration",
  routine: "Routine",
};

const kizombaSmartTagMatchers: SmartTagMatcher[] = [
  { tag: "Saida damska", patterns: ["saida damsk[a-z]*", "saidy damsk[a-z]*"] },
  { tag: "Saida męska", patterns: ["saida m[eę]sk[a-z]*", "saidy m[eę]sk[a-z]*"] },
  { tag: "Saida francuska", patterns: ["saida francusk[a-z]*", "french saida"] },
  { tag: "Shadow position", patterns: ["shadow position", "shadow"] },
  { tag: "Tep", patterns: ["tepy?", "tepem", "tepami"] },
  { tag: "Virgula", patterns: ["virgul[a-z]*"] },
  { tag: "Monkey Virgula", patterns: ["monkey virgula", "monkey"] },
  { tag: "Otwarcie", patterns: ["otwarc[a-z]*", "otwieran[a-z]*"] },
  {
    tag: "Przesunięcie nogi",
    patterns: ["przesuni[eę]ci[a-z]* nog[a-z]*", "przesuw[a-z]* nog[a-z]*"],
  },
  { tag: "Zatrzymanie", patterns: ["zatrzym[a-z]*", "stop", "hold"] },
  { tag: "Grande-saida", patterns: ["grande[- ]saida"] },
  {
    tag: "Podniesienie nogi",
    patterns: ["podniesieni[a-z]* nog[a-z]*", "podnoszeni[a-z]* nog[a-z]*"],
  },
  {
    tag: "Odwrotne trzymanie",
    patterns: ["odwrotn[a-z]* trzyman[a-z]*", "reverse hold"],
  },
  { tag: "Położenie", patterns: ["po[lł]o[zż]eni[a-z]*", "k[lł]adzeni[a-z]*"] },
  { tag: "Podcięcie", patterns: ["podci[eę]ci[a-z]*", "podcin[a-z]*"] },
  { tag: "Cassamento", patterns: ["cassamento"] },
  { tag: "Footwork", patterns: ["footwork"] },
  { tag: "Obrót", patterns: ["obr[oó]t[a-z]*", "obrot[a-z]*", "turn"] },
  { tag: "Clockwise", patterns: ["clockwise"] },
  { tag: "Skorpion", patterns: ["skorpion"] },
  { tag: "Napasada", patterns: ["napasad[a-z]*"] },
  { tag: "Cross", patterns: ["cross[a-z]*", "kross[a-z]*"] },
  {
    tag: "Za partnerką",
    patterns: ["za partnerk[aą]", "z ty[lł]u", "za plecami", "behind partner"],
  },
  {
    tag: "Przed partnerką",
    patterns: ["przed partnerk[aą]", "z przodu", "in front of partner"],
  },
  { tag: "Wypuszczenie", patterns: ["wypuszcz[a-z]*", "release"] },
  {
    tag: "Wyrzucenie ręki",
    patterns: ["wyrzuc[a-z]* r[eę]k[a-z]*", "rzuc[a-z]* r[eę]k[a-z]*"],
  },
  { tag: "Slide", patterns: ["slide[a-z]*"] },
  { tag: "Pivot", patterns: ["pivot[a-z]*"] },
  { tag: "Izolacja", patterns: ["izolacj[a-z]*", "isolation"] },
  { tag: "Cyrkiel", patterns: ["cyrkiel"] },
];

const configs: Record<Dance, AppConfig> = {
  kizomba: {
    dance: "kizomba",
    label: "Kizomba",
    feelings: {
      semba: "Semba",
      kizomba: "Kizomba",
      tarraxa: "Tarraxa",
      fusion: "Kizomba fusion",
      urban: "Urban Kizz",
      doucer: "Doucer",
    },
    difficulties: {
      1: "Very easy",
      2: "Easy",
      3: "Intermediate",
      5: "Hard",
      8: "Very hard",
    },
    stepKinds,
    smartTagMatchers: kizombaSmartTagMatchers,
  },
  zouk: {
    dance: "zouk",
    label: "Zouk",
    feelings: {
      zouk: "Zouk",
    },
    difficulties: {
      1: "Beginner",
      2: "Beginner-Intermediate",
      3: "Intermediate",
      5: "Intermediate-Advanced",
      8: "Advanced",
    },
    stepKinds,
    smartTagMatchers: [],
  },
};

export function getAppConfig(dance: Dance): AppConfig {
  return configs[dance];
}

export function getActiveAppConfig(): AppConfig {
  const dance = process.env.STEPS_ACTIVE_DANCE;

  if (dance === "zouk" || dance === "kizomba") {
    return getAppConfig(dance);
  }

  return getAppConfig("kizomba");
}
