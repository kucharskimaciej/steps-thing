"use client";

import Link from "next/link";
import { Pencil, Play, Video } from "lucide-react";
import { useState } from "react";
import { CopyToClipboard } from "@/components/common/copy-to-clipboard";
import { StepTags } from "@/components/steps/step-tags";
import { VideoModal } from "@/components/video/video-modal";
import type { Doc } from "@/convex/_generated/dataModel";
import { relativeDate } from "@/lib/dates/relative-date";

type StepListItemProps = {
  step: Doc<"steps">;
  variations: Doc<"steps">[];
  origin: string;
  now?: number;
  selected?: boolean;
  onSelectStep?: (stepId: string) => void;
};

type ActiveVideo = Doc<"steps">["videos"][number] | null;

export function StepListItem({
  step,
  variations,
  origin,
  now,
  selected = false,
  onSelectStep,
}: StepListItemProps) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>(null);
  const primaryVideo = step.videos[0];
  const secondaryVideos = step.videos.slice(1);
  const shortlink = `${origin}/s/${step._id}`;
  const tags = [
    step.kind,
    `difficulty ${step.difficulty}`,
    ...step.feeling,
    ...step.tags,
    ...step.smartTags,
    ...step.artists,
  ];

  function openVideo(video: Doc<"steps">["videos"][number]) {
    setActiveVideo(video);
    onSelectStep?.(step._id);
  }

  return (
    <article
      id={step._id}
      aria-label={step.name}
      aria-current={selected ? "true" : undefined}
      className={[
        "scroll-mt-20 rounded-md border bg-white p-4 shadow-sm",
        selected
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
          : "border-[var(--border)]",
      ].join(" ")}
    >
      <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--muted-foreground)]">
              #{step.identifier}
            </span>
            {primaryVideo ? (
              <a
                className="inline-flex min-w-0 items-center gap-2 text-left font-semibold text-lg hover:underline"
                href={primaryVideo.storageKey}
                aria-label={`Play ${step.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  openVideo(primaryVideo);
                }}
              >
                <Play size={16} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{step.name}</span>
              </a>
            ) : (
              <h2 className="truncate font-semibold text-lg">{step.name}</h2>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
            <span>Created {relativeDate(step.createdAt, now)}</span>
            <span>
              Practiced {relativeDate(step.practiceRecords[0]?.date, now)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2 min-[760px]:justify-end">
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
            href={`/steps/${step._id}/edit`}
            aria-label={`Edit ${step.name}`}
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Link>
          {secondaryVideos.map((video, index) => (
            <button
              key={`${video.hash}-${index}`}
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
              aria-label={`Play video ${index + 2}`}
              onClick={() => openVideo(video)}
            >
              <Video size={15} aria-hidden="true" />
              {index + 2}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <StepTags values={tags} limit={tags.length} />
      </div>

      {step.notes.trim().length > 0 ? (
        <p className="mt-3 whitespace-pre-wrap text-sm">{step.notes}</p>
      ) : null}

      {variations.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="font-medium text-[var(--muted-foreground)]">
            Variations
          </span>
          {variations.map((variation) => (
            <a
              key={variation._id}
              className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--muted)]"
              href={`#${variation._id}`}
              aria-label={`Variation #${variation.identifier} ${variation.name}`}
            >
              #{variation.identifier} {variation.name}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <CopyToClipboard value={shortlink} />
      </div>

      <VideoModal
        open={activeVideo !== null}
        videoUrl={activeVideo?.storageKey ?? ""}
        snapshotUrl={activeVideo?.snapshotStorageKey}
        width={activeVideo?.width}
        height={activeVideo?.height}
        onClose={() => setActiveVideo(null)}
      />
    </article>
  );
}
