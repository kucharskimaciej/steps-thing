"use client";

import { useMutation } from "convex/react";
import { Dumbbell } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { startOfLocalDay } from "@/lib/domain/dates";

type StepActionsProps = {
  stepId: string;
  stepName: string;
};

export function StepActions({ stepId, stepName }: StepActionsProps) {
  const recordPractice = useMutation(api.steps.recordPractice);

  async function handlePractice() {
    const now = Date.now();

    await recordPractice({
      id: stepId as Id<"steps">,
      record: {
        date: now,
        startOfDay: startOfLocalDay(now),
      },
    });
  }

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-white disabled:opacity-60"
      aria-label={`Practice ${stepName}`}
      onClick={handlePractice}
    >
      <Dumbbell size={16} aria-hidden="true" />
      Practice
    </button>
  );
}
