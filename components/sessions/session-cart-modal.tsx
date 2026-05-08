"use client";

import { X } from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { SessionFeedCard } from "./session-feed-card";

type SessionCartModalProps = {
  sessionId: Id<"practiceSessions">;
  steps: Doc<"steps">[];
  isOpen: boolean;
  onClose: () => void;
};

export function SessionCartModal({
  sessionId,
  steps,
  isOpen,
  onClose,
}: SessionCartModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex bg-black/45 p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close session feed backdrop"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-feed-title"
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-3rem)] sm:rounded-lg"
      >
        <header className="flex min-h-16 items-center justify-between border-[var(--border)] border-b px-4 sm:px-6">
          <div>
            <h2 id="session-feed-title" className="text-lg font-semibold">
              Session feed
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {steps.length} selected
            </p>
          </div>
          <button
            type="button"
            aria-label="Close session feed"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {steps.length === 0 ? (
            <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
              No selected steps.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {steps.map((step) => (
                <li key={step._id}>
                  <SessionFeedCard step={step} collectionId={sessionId} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
