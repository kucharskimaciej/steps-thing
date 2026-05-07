"use client";

import { useMutation, useQuery } from "convex/react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { WideWithSidebarRight } from "@/components/layout/wide-with-sidebar-right";
import { StepForm } from "@/components/steps/step-form";
import {
  type VariationCandidate,
  VariationCandidateList,
} from "@/components/steps/variation-candidate-list";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { scoreVariationCandidate } from "@/lib/domain/variation-score";
import type {
  ExistingStepVideo,
  StepFormValues,
  StepMutationInput,
} from "@/lib/steps/step-form-schema";

const formId = "edit-step-form";

function toFormValues(step: Doc<"steps">): StepFormValues {
  return {
    videos: step.videos,
    name: step.name,
    difficulty: step.difficulty,
    feeling: step.feeling,
    kind: step.kind,
    tags: step.tags,
    artists: step.artists,
    notes: step.notes,
    smartTags: step.smartTags,
    removedSmartTags: step.removedSmartTags,
    tokens: step.tokens,
  };
}

function toExistingVideos(steps: Doc<"steps">[] = []): ExistingStepVideo[] {
  return steps.flatMap((step) =>
    step.videos.map((video) => ({
      hash: video.hash,
      stepId: step._id,
      stepName: step.name,
    })),
  );
}

function rankCandidates(
  steps: Doc<"steps">[],
  currentStepId: string,
  values: StepFormValues,
): VariationCandidate[] {
  const sourceTags = [...values.tags, ...values.smartTags];

  return steps
    .filter((step) => step._id !== currentStepId)
    .map((step) => ({
      id: step._id,
      name: step.name,
      variationKey: step.variationKey,
      score: scoreVariationCandidate({
        sourceTokens: values.tokens,
        candidateTokens: step.tokens,
        sourceTags,
        candidateTags: [...step.tags, ...step.smartTags],
      }),
      kind: step.kind,
      difficulty: step.difficulty,
      tags: step.tags,
      smartTags: step.smartTags,
      artists: step.artists,
      updatedAt: step.updatedAt,
    }))
    .sort(
      (left, right) =>
        right.score - left.score || right.updatedAt - left.updatedAt,
    )
    .slice(0, 20);
}

type EditStepWorkflowProps = {
  stepId: string;
};

export function EditStepWorkflow({ stepId }: EditStepWorkflowProps) {
  const router = useRouter();
  const updateStep = useMutation(api.steps.updateStep);
  const step = useQuery(api.steps.getStepForEdit, {
    id: stepId,
  });
  const existing = useQuery(api.steps.getExistingTagsAndArtists);
  const steps = useQuery(api.steps.listMySteps);
  const [values, setValues] = useState<StepFormValues | null>(null);
  const [selectedVariationKeys, setSelectedVariationKeys] = useState<string[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const initialFormValues = useMemo(
    () => (step ? toFormValues(step) : null),
    [step],
  );

  useEffect(() => {
    if (!step || !initialFormValues) {
      return;
    }

    setValues(initialFormValues);
    setSelectedVariationKeys(
      step.variationKey.trim().length > 0 ? [step.variationKey] : [],
    );
  }, [initialFormValues, step]);

  const candidates = useMemo(
    () => (values ? rankCandidates(steps ?? [], stepId, values) : []),
    [steps, stepId, values],
  );
  const existingVideos = useMemo(() => toExistingVideos(steps ?? []), [steps]);

  function toggleVariationKey(variationKey: string) {
    setSelectedVariationKeys((current) =>
      current.includes(variationKey)
        ? current.filter((candidate) => candidate !== variationKey)
        : [...current, variationKey],
    );
  }

  async function handleSubmit(input: StepMutationInput) {
    if (!step) {
      return;
    }

    setIsSaving(true);

    try {
      await updateStep({
        id: step._id as Id<"steps">,
        input: {
          ...input,
          mergeVariationKeys: selectedVariationKeys,
        },
      });
      router.push("/steps");
    } finally {
      setIsSaving(false);
    }
  }

  if (step === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold">Step unavailable</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          This step was not found or you do not have access to it.
        </p>
      </div>
    );
  }

  if (step === undefined || values === null || initialFormValues === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          Loading step...
        </p>
      </div>
    );
  }

  return (
    <WideWithSidebarRight
      sidebar={
        <section className="sticky top-20 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Variation candidates</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Select groups to merge into this edited step.
            </p>
          </div>
          <VariationCandidateList
            candidates={candidates}
            selectedVariationKeys={selectedVariationKeys}
            onToggleVariationKey={toggleVariationKey}
          />
        </section>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Steps
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Edit Step</h1>
          </div>
          <button
            type="submit"
            form={formId}
            name="intent"
            value="save"
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            <Save size={16} aria-hidden="true" />
            Save
          </button>
        </div>
        <section className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <StepForm
            id={formId}
            initialValues={initialFormValues}
            currentStepId={stepId}
            existingVideos={existingVideos}
            tagOptions={existing?.tags ?? []}
            artistOptions={existing?.artists ?? []}
            hideActions
            videoMode="upload"
            onValuesChange={setValues}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </WideWithSidebarRight>
  );
}
