"use client";

import { useMutation } from "convex/react";
import { Lock, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepTags } from "@/components/steps/step-tags";
import { VideoPlayer } from "@/components/video/video-player";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { SessionCartModal } from "./session-cart-modal";
import { SessionStepSidebar } from "./session-step-sidebar";

type SessionDetailProps = {
  session: Doc<"practiceSessions">;
  steps: Doc<"steps">[];
};

function findInitialActiveStep(
  steps: Doc<"steps">[],
  selectedStepIds: Id<"steps">[],
) {
  return (
    steps.find((step) => selectedStepIds.includes(step._id)) ??
    steps[0] ??
    null
  );
}

function selectedStepsInStepOrder(
  steps: Doc<"steps">[],
  selectedStepIds: Set<Id<"steps">>,
) {
  return steps.filter((step) => selectedStepIds.has(step._id));
}

export function SessionDetail({ session, steps }: SessionDetailProps) {
  const router = useRouter();
  const addStepToSession = useMutation(api.practiceSessions.addStepToSession);
  const removeStepFromSession = useMutation(
    api.practiceSessions.removeStepFromSession,
  );
  const clearSessionSteps = useMutation(api.practiceSessions.clearSessionSteps);
  const deletePracticeSession = useMutation(
    api.practiceSessions.deletePracticeSession,
  );
  const [selectedIds, setSelectedIds] = useState<Id<"steps">[]>(
    session.steps,
  );
  const [activeStepId, setActiveStepId] = useState<Id<"steps"> | null>(
    () => findInitialActiveStep(steps, session.steps)?._id ?? null,
  );
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const selectedStepIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activeStep =
    steps.find((step) => step._id === activeStepId) ??
    findInitialActiveStep(steps, selectedIds);
  const selectedSteps = useMemo(
    () => selectedStepsInStepOrder(steps, selectedStepIdSet),
    [steps, selectedStepIdSet],
  );

  useEffect(() => {
    setSelectedIds(session.steps);
  }, [session.steps]);

  useEffect(() => {
    if (activeStepId && steps.some((step) => step._id === activeStepId)) {
      return;
    }

    setActiveStepId(findInitialActiveStep(steps, selectedIds)?._id ?? null);
  }, [activeStepId, selectedIds, steps]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile && session.steps.length > 0) {
      setIsFeedOpen(true);
    }
  }, [session._id, session.steps.length]);

  async function handleAddStep(stepId: Id<"steps">) {
    if (session.locked || selectedStepIdSet.has(stepId)) {
      return;
    }

    setSelectedIds((current) => [...current, stepId]);

    try {
      await addStepToSession({ sessionId: session._id, stepId });
    } catch (error) {
      setSelectedIds((current) => current.filter((id) => id !== stepId));
      throw error;
    }
  }

  async function handleRemoveStep(stepId: Id<"steps">) {
    if (session.locked || !selectedStepIdSet.has(stepId)) {
      return;
    }

    setSelectedIds((current) => current.filter((id) => id !== stepId));

    try {
      await removeStepFromSession({ sessionId: session._id, stepId });
    } catch (error) {
      setSelectedIds((current) =>
        current.includes(stepId) ? current : [...current, stepId],
      );
      throw error;
    }
  }

  async function handleClear() {
    if (session.locked || selectedIds.length === 0) {
      return;
    }

    const previousIds = selectedIds;
    setSelectedIds([]);

    try {
      await clearSessionSteps({ id: session._id });
    } catch (error) {
      setSelectedIds(previousIds);
      throw error;
    }
  }

  async function handleDelete() {
    await deletePracticeSession({ id: session._id });
    router.push("/sessions");
  }

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col bg-[var(--muted)] md:flex-row">
      <SessionStepSidebar
        steps={steps}
        activeStepId={activeStep?._id ?? null}
        selectedStepIds={selectedStepIdSet}
        locked={session.locked}
        onSelectStep={setActiveStepId}
        onAddStep={handleAddStep}
        onRemoveStep={handleRemoveStep}
        onClear={handleClear}
        onOpenFeed={() => setIsFeedOpen(true)}
      />

      <section className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
                Session
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{session.name}</h1>
              {session.locked ? (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <Lock size={15} aria-hidden="true" />
                  Locked session
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Remove session"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-red-700 text-sm font-medium"
              onClick={handleDelete}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove session
            </button>
          </div>

          {activeStep ? (
            <ActiveStepDetail step={activeStep} />
          ) : (
            <p className="rounded-md border border-dashed border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
              No steps yet.
            </p>
          )}
        </div>
      </section>

      <SessionCartModal
        sessionId={session._id}
        steps={selectedSteps}
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
      />
    </main>
  );
}

function ActiveStepDetail({ step }: { step: Doc<"steps"> }) {
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
        <div>
          <h2 className="text-2xl font-semibold">{step.name}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            #{step.identifier}
          </p>
        </div>
        <StepTags values={tags} />
        {step.notes.trim().length > 0 ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{step.notes}</p>
        ) : null}
      </div>
    </article>
  );
}
