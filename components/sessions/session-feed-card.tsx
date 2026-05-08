"use client";

import { RecordPracticeButton } from "@/components/practice/record-practice-button";
import { StepTags } from "@/components/steps/step-tags";
import { VideoPlayer } from "@/components/video/video-player";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type SessionFeedCardProps = {
  step: Doc<"steps">;
  collectionId: Id<"practiceSessions">;
};

export function SessionFeedCard({ step, collectionId }: SessionFeedCardProps) {
  const primaryVideo = step.videos[0];
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
          className="w-full overflow-hidden bg-black"
          style={{
            aspectRatio:
              primaryVideo.width && primaryVideo.height
                ? `${primaryVideo.width} / ${primaryVideo.height}`
                : "16 / 9",
            maxHeight: "60vh",
          }}
        >
          <VideoPlayer
            videoUrl={primaryVideo.storageKey}
            snapshotUrl={primaryVideo.snapshotStorageKey}
            width={primaryVideo.width}
            height={primaryVideo.height}
            enableFullSize
            ariaLabel={`${step.name} video`}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold">{step.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            #{step.identifier}
          </p>
        </div>
        <StepTags values={tags} />
        <RecordPracticeButton
          stepId={step._id}
          stepName={step.name}
          practiceRecords={step.practiceRecords}
          collectionId={collectionId}
        />
      </div>
    </article>
  );
}
