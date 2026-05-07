import type { AppConfig, StepForTags } from "./config";

export type DerivedStepTags = {
  kind: string[];
  difficulty: string[];
  feeling: string[];
  artist: string[];
  content: string[];
  meta: string[];
  all: string[];
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function deriveStepTags(
  step: StepForTags,
  config: AppConfig,
): DerivedStepTags {
  const kind = [config.stepKinds[step.kind] ?? step.kind];
  const difficulty = [config.difficulties[step.difficulty] ?? String(step.difficulty)];
  const feeling = step.feeling.map((key) => config.feelings[key] ?? key);
  const artist = step.artists;
  const content = unique([...step.tags, ...step.smartTags]);
  const meta = unique([...kind, ...feeling, ...artist, ...difficulty]);

  return {
    kind,
    difficulty,
    feeling,
    artist,
    content,
    meta,
    all: unique([...meta, ...content]),
  };
}
