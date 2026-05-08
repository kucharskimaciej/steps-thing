"use client";

import { useQuery } from "convex/react";
import { StepsFeed } from "@/components/feed/steps-feed";
import { InlineStepEditModal } from "@/components/steps/inline-step-edit-modal";
import { useInlineStepEdit } from "@/components/steps/use-inline-step-edit";
import { api } from "@/convex/_generated/api";

type HistoricalSessionFeedProps = {
  startOfDay: number;
};

const historicalDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function HistoricalSessionFeed({
  startOfDay,
}: HistoricalSessionFeedProps) {
  const steps = useQuery(api.steps.getHistoricalPracticeSteps, { startOfDay });
  const existing = useQuery(api.steps.getExistingTagsAndArtists);
  const {
    editingStepId,
    isInlineStepEditOpen,
    openInlineStepEdit,
    closeInlineStepEdit,
  } = useInlineStepEdit();
  const title = `Historical practice: ${historicalDateFormatter.format(startOfDay)}`;

  if (steps === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading historical practice...
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
        eyebrow="Practice"
        title={title}
        emptyLabel="No practiced steps for this day."
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
