"use client";

import { Pencil, Shapes } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { StepTags } from "@/components/steps/step-tags";
import { VideoPlayer } from "@/components/video/video-player";
import { OptionsMenu } from "./options-menu";
import { StepActions } from "./step-actions";

type FeedStepCardProps = {
  step: Doc<"steps">;
  relatedSteps: Doc<"steps">[];
  isVisible: boolean;
  origin?: string;
  onShowVariations: (step: Doc<"steps">) => void;
  onEditStep: (stepId: string) => void;
};

export function FeedStepCard({
  step,
  relatedSteps,
  isVisible,
  origin,
  onShowVariations,
  onEditStep,
}: FeedStepCardProps) {
  const primaryVideo = step.videos[0];
  const hasVariations = relatedSteps.length > 0;
  const tags = [
    step.kind,
    `difficulty ${step.difficulty}`,
    ...step.feeling,
    ...step.tags,
    ...step.smartTags,
    ...step.artists,
  ];

  return (
    <article
      aria-label={step.name}
      className="overflow-hidden rounded-md border border-[var(--border)] bg-white shadow-sm"
    >
      {primaryVideo ? (
        <div
          data-testid={`feed-video-frame-${step._id}`}
          className="w-full overflow-hidden bg-black"
          style={{
            aspectRatio:
              primaryVideo.width && primaryVideo.height
                ? `${primaryVideo.width} / ${primaryVideo.height}`
                : "16 / 9",
            maxHeight: "60vh",
          }}
        >
          {isVisible ? (
            <VideoPlayer
              videoUrl={primaryVideo.storageKey}
              snapshotUrl={primaryVideo.snapshotStorageKey}
              width={primaryVideo.width}
              height={primaryVideo.height}
              autoPlay={typeof IntersectionObserver !== "undefined"}
              enableFullSize
              ariaLabel={`${step.name} video`}
            />
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{step.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              #{step.identifier}
            </p>
          </div>
          <OptionsMenu
            stepId={step._id}
            stepName={step.name}
            origin={origin}
            hasVariations={hasVariations}
            onShowVariations={() => onShowVariations(step)}
            onEdit={() => onEditStep(step._id)}
          />
        </div>

        <StepTags values={tags} />

        <div className="flex flex-wrap items-center gap-2">
          {hasVariations ? (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
              aria-label={`Show ${relatedSteps.length} ${
                relatedSteps.length === 1 ? "variation" : "variations"
              }`}
              onClick={() => onShowVariations(step)}
            >
              <Shapes size={16} aria-hidden="true" />
              {relatedSteps.length}
            </button>
          ) : null}
          <StepActions stepId={step._id} stepName={step.name} />
          <button
            type="button"
            aria-label={`Edit ${step.name}`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
            onClick={() => onEditStep(step._id)}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </article>
  );
}
