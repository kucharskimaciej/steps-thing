"use client";

import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { StepListItem } from "./step-list-item";

type StepListProps = {
  steps: Doc<"steps">[];
  origin?: string;
  now?: number;
  selectedStepId?: string;
  onSelectStep?: (stepId: string) => void;
};

export function OwnedStepList() {
  const steps = useQuery(api.steps.listMySteps);

  if (steps === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading steps...
        </p>
      </main>
    );
  }

  return <StepList steps={steps} />;
}

export function StepList({
  steps,
  origin,
  now,
  selectedStepId,
  onSelectStep,
}: StepListProps) {
  const [browserOrigin, setBrowserOrigin] = useState(origin ?? "");
  const sortedSteps = useMemo(
    () => [...steps].sort((left, right) => right.createdAt - left.createdAt),
    [steps],
  );
  const variationGroups = useMemo(() => {
    const groups = new Map<string, Doc<"steps">[]>();

    for (const step of sortedSteps) {
      const key = step.variationKey.trim();

      if (key.length === 0) {
        continue;
      }

      groups.set(key, [...(groups.get(key) ?? []), step]);
    }

    return groups;
  }, [sortedSteps]);

  useEffect(() => {
    if (origin) {
      setBrowserOrigin(origin);
      return;
    }

    setBrowserOrigin(window.location.origin);
  }, [origin]);

  function variationsFor(step: Doc<"steps">) {
    if (step.variationKey.trim().length === 0) {
      return [];
    }

    return (variationGroups.get(step.variationKey) ?? []).filter(
      (candidate) => candidate._id !== step._id,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
          Steps
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Step list</h1>
      </div>

      {sortedSteps.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">
          No steps yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sortedSteps.map((step) => (
            <li key={step._id}>
              <StepListItem
                step={step}
                variations={variationsFor(step)}
                origin={browserOrigin}
                now={now}
                selected={selectedStepId === step._id}
                onSelectStep={onSelectStep}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
