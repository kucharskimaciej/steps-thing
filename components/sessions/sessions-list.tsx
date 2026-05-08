"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  HistoricalSessionCard,
  type HistoricalPracticeDay,
} from "./historical-session-card";
import { SessionCard } from "./session-card";

type SessionsListProps = {
  sessions: Doc<"practiceSessions">[];
  historicalDays: HistoricalPracticeSummary[];
};

type HistoricalPracticeSummary = Omit<HistoricalPracticeDay, "label">;

const sessionNameFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const historicalDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function defaultSessionName(now = Date.now()) {
  return `Practice ${sessionNameFormatter.format(now)}`;
}

export function groupHistoricalPracticeDays(
  steps: Doc<"steps">[],
): HistoricalPracticeSummary[] {
  const practicedStepsByDay = new Map<number, Set<string>>();

  for (const step of steps) {
    for (const record of step.practiceRecords) {
      const practicedSteps =
        practicedStepsByDay.get(record.startOfDay) ?? new Set<string>();
      practicedSteps.add(step._id);
      practicedStepsByDay.set(record.startOfDay, practicedSteps);
    }
  }

  return [...practicedStepsByDay.entries()]
    .map(([startOfDay, practicedSteps]) => ({
      startOfDay,
      practicedStepCount: practicedSteps.size,
    }))
    .sort((left, right) => right.startOfDay - left.startOfDay);
}

function labelHistoricalPracticeDay(
  day: HistoricalPracticeSummary,
): HistoricalPracticeDay {
  return {
    ...day,
    label: historicalDateFormatter.format(day.startOfDay),
  };
}

export function OwnedSessionsList() {
  const sessions = useQuery(api.practiceSessions.listMyPracticeSessions);
  const historicalDays = useQuery(api.steps.listMyHistoricalPracticeDays);

  if (sessions === undefined || historicalDays === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading sessions...
        </p>
      </main>
    );
  }

  return <SessionsList sessions={sessions} historicalDays={historicalDays} />;
}

export function SessionsList({ sessions, historicalDays }: SessionsListProps) {
  const createPracticeSession = useMutation(
    api.practiceSessions.createPracticeSession,
  );
  const [isCreating, setIsCreating] = useState(false);
  const sortedSessions = useMemo(
    () => [...sessions].sort((left, right) => right.updatedAt - left.updatedAt),
    [sessions],
  );
  const labeledHistoricalDays = useMemo(
    () =>
      [...historicalDays]
        .sort((left, right) => right.startOfDay - left.startOfDay)
        .map(labelHistoricalPracticeDay),
    [historicalDays],
  );

  async function handleAddSession() {
    setIsCreating(true);

    try {
      await createPracticeSession({
        name: defaultSessionName(),
        stepIds: [],
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
            Practice
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Sessions</h1>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-4 text-[var(--accent-foreground)] text-sm font-medium disabled:opacity-60"
          disabled={isCreating}
          onClick={handleAddSession}
          type="button"
        >
          <Plus size={16} aria-hidden="true" />
          {isCreating ? "Adding..." : "Add session"}
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-xl">Saved sessions</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Named step collections for focused practice.
          </p>
        </div>
        {sortedSessions.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
            No saved sessions yet.
          </p>
        ) : (
          <ul aria-label="Saved sessions" className="grid gap-3">
            {sortedSessions.map((session) => (
              <li key={session._id}>
                <SessionCard session={session} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-xl">Historical practice</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Days reconstructed from recorded step practice.
          </p>
        </div>
        {labeledHistoricalDays.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
            No practice history yet.
          </p>
        ) : (
          <ul aria-label="Historical practice" className="grid gap-3">
            {labeledHistoricalDays.map((day) => (
              <li key={day.startOfDay}>
                <HistoricalSessionCard day={day} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
