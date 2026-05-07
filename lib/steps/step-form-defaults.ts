import { getActiveAppConfig } from "@/lib/domain/config";
import { matchSmartTags } from "@/lib/domain/smart-tags";
import { tokenizeStepName } from "@/lib/domain/tokenize";
import {
  difficultyOptions,
  type StepFormErrors,
  type StepFormValidationOptions,
  type StepFormValidationResult,
  type StepFormValues,
  stepKindOptions,
} from "./step-form-schema";

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function createStepFormDefaults(
  values: Partial<StepFormValues> = {},
): StepFormValues {
  const defaults: StepFormValues = {
    videos: [],
    name: "",
    difficulty: 1,
    feeling: [],
    kind: "step",
    tags: [],
    artists: [],
    notes: "",
    smartTags: [],
    removedSmartTags: [],
    tokens: [],
  };

  return {
    ...defaults,
    ...values,
    videos: values.videos ?? defaults.videos,
    feeling: uniqueNonEmpty(values.feeling ?? defaults.feeling),
    tags: uniqueNonEmpty(values.tags ?? defaults.tags),
    artists: uniqueNonEmpty(values.artists ?? defaults.artists),
    smartTags: uniqueNonEmpty(values.smartTags ?? defaults.smartTags),
    removedSmartTags: uniqueNonEmpty(
      values.removedSmartTags ?? defaults.removedSmartTags,
    ),
    tokens: values.tokens ?? defaults.tokens,
  };
}

export function deriveStepFormSmartFields(
  name: string,
  removedSmartTags: string[],
): Pick<StepFormValues, "smartTags" | "tokens"> {
  const removed = new Set(removedSmartTags);

  return {
    smartTags: matchSmartTags(name, getActiveAppConfig()).filter(
      (tag) => !removed.has(tag),
    ),
    tokens: tokenizeStepName(name),
  };
}

export function allowedSmartTags(): string[] {
  return getActiveAppConfig()
    .smartTagMatchers.map((matcher) => matcher.tag)
    .sort((left, right) => left.localeCompare(right, "pl-PL"));
}

export function validateStepFormValues(
  rawValues: StepFormValues,
  options: StepFormValidationOptions = {},
): StepFormValidationResult {
  const values = createStepFormDefaults(rawValues);
  const errors: StepFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!difficultyOptions.includes(values.difficulty)) {
    errors.difficulty = "Difficulty is required.";
  }

  if (!stepKindOptions.includes(values.kind)) {
    errors.kind = "Choose a valid kind.";
  }

  if (uniqueNonEmpty(values.feeling).length === 0) {
    errors.feeling = "Choose at least one feeling.";
  }

  if (values.videos.length === 0) {
    errors.videos = "Add at least one video.";
  } else if (
    values.videos.some(
      (video) => video.hash.trim().length === 0 || video.storageKey.trim().length === 0,
    )
  ) {
    errors.videos = "Video hash and storage key are required.";
  } else {
    const duplicate = values.videos
      .map((video) =>
        options.existingVideos?.find(
          (candidate) =>
            candidate.hash === video.hash &&
            candidate.stepId !== options.currentStepId,
        ),
      )
      .find(Boolean);

    if (duplicate) {
      errors.videos = `Duplicate of ${duplicate.stepName}.`;
    }
  }

  return Object.keys(errors).length === 0
    ? { ok: true, values, errors }
    : { ok: false, values, errors };
}
