"use client";

import { useQuery } from "convex/react";
import { InlineStepEditModal } from "@/components/steps/inline-step-edit-modal";
import { useInlineStepEdit } from "@/components/steps/use-inline-step-edit";
import { StepsFeed } from "@/components/feed/steps-feed";
import { api } from "@/convex/_generated/api";

export function FeedStepList() {
  const steps = useQuery(api.steps.listMySteps);
  const existing = useQuery(api.steps.getExistingTagsAndArtists);
  const {
    editingStepId,
    isInlineStepEditOpen,
    openInlineStepEdit,
    closeInlineStepEdit,
  } = useInlineStepEdit();

  if (steps === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading steps...
        </p>
      </main>
    );
  }

  return (
    <>
      <StepsFeed
        steps={steps}
        tagOptions={existing?.tags}
        artistOptions={existing?.artists}
        onEditStep={openInlineStepEdit}
      />
      <InlineStepEditModal
        stepId={editingStepId}
        isOpen={isInlineStepEditOpen}
        onClose={closeInlineStepEdit}
      />
    </>
  );
}
