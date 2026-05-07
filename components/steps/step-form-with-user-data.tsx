"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StepForm } from "./step-form";
import type {
  ExistingStepVideo,
  StepFormValues,
  StepMutationInput,
} from "@/lib/steps/step-form-schema";

type StepFormWithUserDataProps = {
  initialValues?: Partial<StepFormValues>;
  currentStepId?: string;
  existingVideos?: ExistingStepVideo[];
  onSubmit?: (input: StepMutationInput) => void | Promise<void>;
};

export function StepFormWithUserData(props: StepFormWithUserDataProps) {
  const existing = useQuery(api.steps.getExistingTagsAndArtists);

  return (
    <StepForm
      {...props}
      tagOptions={existing?.tags ?? []}
      artistOptions={existing?.artists ?? []}
    />
  );
}
