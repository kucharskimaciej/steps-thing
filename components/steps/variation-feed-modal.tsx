"use client";

import { X } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { FeedStepCard } from "@/components/feed/feed-step-card";

type VariationFeedModalProps = {
  sourceStep: Doc<"steps"> | null;
  steps: Doc<"steps">[];
  isOpen: boolean;
  origin?: string;
  onClose: () => void;
  onEditStep: (stepId: string) => void;
};

export function VariationFeedModal({
  sourceStep,
  steps,
  isOpen,
  origin,
  onClose,
  onEditStep,
}: VariationFeedModalProps) {
  if (!isOpen || !sourceStep) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex bg-black/45 p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close variations backdrop"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="variation-feed-title"
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-3rem)] sm:rounded-lg"
      >
        <header className="flex min-h-16 items-center justify-between border-[var(--border)] border-b px-4 sm:px-6">
          <h2 id="variation-feed-title" className="text-lg font-semibold">
            Variations for {sourceStep.name}
          </h2>
          <button
            type="button"
            aria-label="Close variations"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <ul className="flex flex-col gap-4">
            {steps.map((step) => (
              <li key={step._id}>
                <FeedStepCard
                  step={step}
                  relatedSteps={[]}
                  origin={origin}
                  isVisible
                  onShowVariations={() => undefined}
                  onEditStep={onEditStep}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
