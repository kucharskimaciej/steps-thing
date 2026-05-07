"use client";

import { useQuery } from "convex/react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { InlineStepEditModal } from "@/components/steps/inline-step-edit-modal";
import { useInlineStepEdit } from "@/components/steps/use-inline-step-edit";
import { api } from "@/convex/_generated/api";

export function FeedStepList() {
  const steps = useQuery(api.steps.listMySteps);
  const {
    editingStepId,
    isInlineStepEditOpen,
    openInlineStepEdit,
    closeInlineStepEdit,
  } = useInlineStepEdit();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
          Steps
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Feed</h1>
      </div>

      {steps === undefined ? (
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading steps...
        </p>
      ) : steps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          No steps yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {steps.map((step) => (
            <li
              key={step._id}
              className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">
                    {step.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    #{step.identifier} · {step.kind} · difficulty{" "}
                    {step.difficulty}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[...step.feeling, ...step.tags, ...step.smartTags]
                      .slice(0, 8)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Edit ${step.name}`}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
                  onClick={() => openInlineStepEdit(step._id)}
                >
                  <MoreHorizontal size={16} aria-hidden="true" />
                  <Pencil size={16} aria-hidden="true" />
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <InlineStepEditModal
        stepId={editingStepId}
        isOpen={isInlineStepEditOpen}
        onClose={closeInlineStepEdit}
      />
    </main>
  );
}
