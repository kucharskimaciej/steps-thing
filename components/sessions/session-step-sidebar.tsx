"use client";

import { Check, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type SessionStepSidebarProps = {
  steps: Doc<"steps">[];
  activeStepId: Id<"steps"> | null;
  selectedStepIds: Set<Id<"steps">>;
  locked: boolean;
  onSelectStep: (stepId: Id<"steps">) => void;
  onAddStep: (stepId: Id<"steps">) => void;
  onRemoveStep: (stepId: Id<"steps">) => void;
  onClear: () => void;
  onOpenFeed: () => void;
};

export function SessionStepSidebar({
  steps,
  activeStepId,
  selectedStepIds,
  locked,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  onClear,
  onOpenFeed,
}: SessionStepSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-[var(--border)] border-r bg-white md:w-80">
      <div className="border-[var(--border)] border-b px-4 py-4">
        <h2 className="font-semibold text-lg">Steps</h2>
        {locked ? (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Locked session
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {steps.length === 0 ? (
          <p className="px-4 py-5 text-sm text-[var(--muted-foreground)]">
            No steps yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {steps.map((step) => {
              const selected = selectedStepIds.has(step._id);
              const active = activeStepId === step._id;

              return (
                <li key={step._id} className={active ? "bg-[var(--muted)]" : ""}>
                  <div className="flex items-center gap-2 px-3 py-3">
                    <button
                      type="button"
                      aria-label={`Select ${step.name}`}
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelectStep(step._id)}
                    >
                      <span className="block truncate font-medium text-sm">
                        {step.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[var(--muted-foreground)] text-xs">
                        {selected ? <Check size={13} aria-hidden="true" /> : null}
                        #{step.identifier}
                      </span>
                    </button>
                    {selected ? (
                      <button
                        type="button"
                        aria-label={`Remove ${step.name}`}
                        disabled={locked}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-white disabled:opacity-45"
                        onClick={() => onRemoveStep(step._id)}
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Add ${step.name}`}
                        disabled={locked}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-white disabled:opacity-45"
                        onClick={() => onAddStep(step._id)}
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="flex flex-col gap-3 border-[var(--border)] border-t p-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          {selectedStepIds.size} selected
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-label="Clear selected steps"
            disabled={locked || selectedStepIds.size === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white text-sm font-medium disabled:opacity-45"
            onClick={onClear}
          >
            <Trash2 size={15} aria-hidden="true" />
            Clear
          </button>
          <button
            type="button"
            aria-label="Open session feed"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 text-[var(--accent-foreground)] text-sm font-medium disabled:opacity-45"
            disabled={selectedStepIds.size === 0}
            onClick={onOpenFeed}
          >
            <ShoppingCart size={15} aria-hidden="true" />
            Feed
          </button>
        </div>
      </footer>
    </aside>
  );
}
