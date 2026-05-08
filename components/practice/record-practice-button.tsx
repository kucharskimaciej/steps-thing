"use client";

import { useMutation } from "convex/react";
import { Check, Dumbbell } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { startOfLocalDay } from "@/lib/domain/dates";
import { hasRecordedPractice } from "@/lib/practice/has-recorded-practice";

type RecordPracticeButtonProps = {
  stepId: Id<"steps">;
  stepName: string;
  practiceRecords: Doc<"steps">["practiceRecords"];
  collectionId?: Id<"practiceSessions">;
};

export function RecordPracticeButton({
  stepId,
  stepName,
  practiceRecords,
  collectionId,
}: RecordPracticeButtonProps) {
  const recordPractice = useMutation(api.steps.recordPractice);
  const todayStart = useMemo(() => startOfLocalDay(Date.now()), []);
  const [optimisticRecorded, setOptimisticRecorded] = useState(false);
  const recorded =
    optimisticRecorded ||
    hasRecordedPractice({
      records: practiceRecords,
      startOfDay: todayStart,
      collectionId,
    });

  async function handlePractice() {
    if (recorded) {
      return;
    }

    const now = Date.now();
    setOptimisticRecorded(true);

    try {
      await recordPractice({
        id: stepId,
        record: {
          date: now,
          startOfDay: todayStart,
          ...(collectionId ? { collectionId } : {}),
        },
      });
    } catch (error) {
      setOptimisticRecorded(false);
      throw error;
    }
  }

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-white disabled:cursor-default disabled:bg-[var(--muted-foreground)]"
      aria-label={
        recorded ? `Practiced ${stepName} today` : `Practice ${stepName}`
      }
      aria-pressed={recorded}
      disabled={recorded}
      onClick={handlePractice}
    >
      {recorded ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Dumbbell size={16} aria-hidden="true" />
      )}
      {recorded ? "Practiced" : "Practice"}
    </button>
  );
}
