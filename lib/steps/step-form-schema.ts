import type { Difficulty, StepKind } from "@/lib/domain/config";
import type { StepVideo } from "@/lib/video/storage-client";

export const stepKindOptions = ["step", "inspiration", "routine"] as const;
export const difficultyOptions = [1, 2, 3, 5, 8] as const;

export type StepFormVideo = StepVideo;

export type StepFormValues = {
  videos: StepFormVideo[];
  name: string;
  difficulty: Difficulty;
  feeling: string[];
  kind: StepKind;
  tags: string[];
  artists: string[];
  notes: string;
  smartTags: string[];
  removedSmartTags: string[];
  tokens: string[];
};

export type ExistingStepVideo = {
  hash: string;
  stepId: string;
  stepName: string;
};

export type StepMutationInput = {
  name: string;
  videos: StepFormVideo[];
  difficulty: Difficulty;
  feeling: string[];
  kind: StepKind;
  tags: string[];
  artists: string[];
  notes: string;
  removedSmartTags: string[];
  variationKey: string;
};

export type StepFormErrors = Partial<Record<keyof StepFormValues, string>>;

export type StepFormValidationOptions = {
  currentStepId?: string;
  existingVideos?: ExistingStepVideo[];
};

export type StepFormValidationResult =
  | { ok: true; values: StepFormValues; errors: StepFormErrors }
  | { ok: false; values: StepFormValues; errors: StepFormErrors };
