"use client";

import { useMutation, useQuery } from "convex/react";
import { Save, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const formId = "inline-edit-step-form";

type InlineStepEditModalProps = {
  stepId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

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

export function InlineStepEditModal({
  stepId,
  isOpen,
  onClose,
}: InlineStepEditModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const updateStep = useMutation(api.steps.updateStep);
  const step = useQuery(
    api.steps.getStepForEdit,
    isOpen && stepId ? { id: stepId } : "skip",
  );
  const existing = useQuery(
    api.steps.getExistingTagsAndArtists,
    isOpen ? {} : "skip",
  );
  const steps = useQuery(api.steps.listMySteps, isOpen ? {} : "skip");
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
    if (!isOpen) {
      setValues(null);
      setSelectedVariationKeys([]);
      return;
    }

    closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !step || !initialFormValues) {
      return;
    }

    setValues(initialFormValues);
    setSelectedVariationKeys(
      step.variationKey.trim().length > 0 ? [step.variationKey] : [],
    );
  }, [initialFormValues, isOpen, step]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const candidates = useMemo(
    () => (values && stepId ? rankCandidates(steps ?? [], stepId, values) : []),
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
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close inline edit backdrop"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <section
        aria-labelledby="inline-step-edit-title"
        aria-modal="true"
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-3rem)] sm:rounded-lg"
        role="dialog"
      >
        <header className="flex min-h-16 items-center justify-between gap-3 border-[var(--border)] border-b px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">
              Inline edit
            </p>
            <h1
              id="inline-step-edit-title"
              className="truncate text-lg font-semibold"
            >
              {step?.name ?? "Loading step..."}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form={formId}
              disabled={isSaving || !step}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              <Save size={16} aria-hidden="true" />
              Save
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close inline edit"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white"
              onClick={onClose}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {step === null ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold">Step unavailable</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              This step was not found or you do not have access to it.
            </p>
          </div>
        ) : step === undefined ||
          values === null ||
          initialFormValues === null ? (
          <p className="p-6 text-sm text-[var(--muted-foreground)]">
            Loading step...
          </p>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden min-[1000px]:grid-cols-[minmax(0,1fr)_22rem]">
            <main className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
              <StepForm
                id={formId}
                initialValues={initialFormValues}
                currentStepId={stepId ?? undefined}
                existingVideos={existingVideos}
                tagOptions={existing?.tags ?? []}
                artistOptions={existing?.artists ?? []}
                hideActions
                videoMode="upload"
                onValuesChange={setValues}
                onSubmit={handleSubmit}
              />
            </main>
            <aside className="min-h-0 overflow-y-auto border-[var(--border)] border-t bg-[var(--background)] px-4 py-5 min-[1000px]:border-t-0 min-[1000px]:border-l sm:px-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold">
                  Variation candidates
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Top 20 matches, excluding this step.
                </p>
              </div>
              <VariationCandidateList
                candidates={candidates}
                selectedVariationKeys={selectedVariationKeys}
                onToggleVariationKey={toggleVariationKey}
              />
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
