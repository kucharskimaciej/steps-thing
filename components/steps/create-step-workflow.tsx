"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { WideWithSidebarRight } from "@/components/layout/wide-with-sidebar-right";
import { StepForm } from "@/components/steps/step-form";
import {
  type VariationCandidate,
  VariationCandidateList,
} from "@/components/steps/variation-candidate-list";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { scoreVariationCandidate } from "@/lib/domain/variation-score";
import { createStepFormDefaults } from "@/lib/steps/step-form-defaults";
import type {
  StepFormValues,
  StepMutationInput,
} from "@/lib/steps/step-form-schema";

const formId = "create-step-form";

function rankCandidates(
  steps: Doc<"steps">[],
  values: StepFormValues,
): VariationCandidate[] {
  const sourceTags = [...values.tags, ...values.smartTags];

  return steps
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

function preserveCreateAnotherValues(
  values: StepFormValues,
): Partial<StepFormValues> {
  return {
    difficulty: values.difficulty,
    feeling: values.feeling,
    tags: values.tags,
    artists: values.artists,
  };
}

export function CreateStepWorkflow() {
  const router = useRouter();
  const createStep = useMutation(api.steps.createStep);
  const existing = useQuery(api.steps.getExistingTagsAndArtists);
  const steps = useQuery(api.steps.listMySteps);
  const [values, setValues] = useState<StepFormValues>(() =>
    createStepFormDefaults(),
  );
  const [initialValues, setInitialValues] = useState<Partial<StepFormValues>>(
    {},
  );
  const [selectedVariationKeys, setSelectedVariationKeys] = useState<string[]>(
    [],
  );
  const [resetSignal, setResetSignal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const candidates = useMemo(
    () => rankCandidates(steps ?? [], values),
    [steps, values],
  );

  function toggleVariationKey(variationKey: string) {
    setSelectedVariationKeys((current) =>
      current.includes(variationKey)
        ? current.filter((candidate) => candidate !== variationKey)
        : [...current, variationKey],
    );
  }

  async function handleSubmit(
    input: StepMutationInput,
    intent: "save" | "save-and-create-another",
  ) {
    setIsSaving(true);
    setMessage("");

    try {
      await createStep({
        input: {
          ...input,
          mergeVariationKeys: selectedVariationKeys,
        },
      });

      if (intent === "save-and-create-another") {
        const preserved = preserveCreateAnotherValues(values);

        setInitialValues(preserved);
        setValues(createStepFormDefaults(preserved));
        setSelectedVariationKeys([]);
        setResetSignal((current) => current + 1);
        setMessage("Step saved. Ready for another.");
        return;
      }

      router.push("/steps");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WideWithSidebarRight
      sidebar={
        <section className="sticky top-20 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Variation candidates</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Select groups to merge into the new step.
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
            <h1 className="mt-2 text-3xl font-semibold">Create Step</h1>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <button
              type="submit"
              form={formId}
              name="intent"
              value="save-and-create-another"
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium disabled:opacity-60"
            >
              <Plus size={16} aria-hidden="true" />
              Save & create another
            </button>
          </div>
        </div>
        {message ? (
          <p
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)]"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        <section className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <StepForm
            id={formId}
            initialValues={initialValues}
            tagOptions={existing?.tags ?? []}
            artistOptions={existing?.artists ?? []}
            hideActions
            videoMode="upload"
            resetSignal={resetSignal}
            onValuesChange={setValues}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </WideWithSidebarRight>
  );
}
