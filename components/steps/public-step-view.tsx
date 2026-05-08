import type { PublicStep } from "@/convex/model/steps";
import { StepTags } from "./step-tags";
import { VideoPlayer } from "../video/video-player";

type PublicStepViewProps = {
  step: Omit<PublicStep, "_id" | "identifier" | "primaryVideo">;
  primaryVideo: {
    videoUrl: string;
    snapshotUrl?: string;
    width?: number;
    height?: number;
  } | null;
};

export function PublicStepView({ step, primaryVideo }: PublicStepViewProps) {
  const tags = [
    step.kind,
    `difficulty ${step.difficulty}`,
    ...step.feeling,
    ...step.tags,
    ...step.smartTags,
    ...step.artists,
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
          Shared step
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">{step.name}</h1>
      </header>

      {primaryVideo ? (
        <section
          aria-label={`${step.name} primary video`}
          className="overflow-hidden rounded-md border border-[var(--border)] bg-black shadow-sm"
        >
          <VideoPlayer
            videoUrl={primaryVideo.videoUrl}
            snapshotUrl={primaryVideo.snapshotUrl}
            width={primaryVideo.width}
            height={primaryVideo.height}
            enableFullSize
            ariaLabel={`${step.name} video`}
          />
        </section>
      ) : (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Primary video is unavailable.
        </p>
      )}

      <section
        aria-label="Public step tags"
        className="rounded-md border border-[var(--border)] bg-white p-4"
      >
        <StepTags values={tags} />
      </section>
    </main>
  );
}
