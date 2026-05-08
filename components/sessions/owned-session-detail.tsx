"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SessionDetail } from "./session-detail";

type OwnedSessionDetailProps = {
  sessionId: string;
};

export function OwnedSessionDetail({ sessionId }: OwnedSessionDetailProps) {
  const session = useQuery(api.practiceSessions.getMyPracticeSessionById, {
    id: sessionId,
  });
  const steps = useQuery(api.steps.listMySteps);

  if (session === undefined || steps === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
        <p className="rounded-md border border-[var(--border)] bg-white px-4 py-5 text-sm text-[var(--muted-foreground)]">
          Loading session...
        </p>
      </main>
    );
  }

  if (session === null) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6">
        <div className="rounded-md border border-[var(--border)] bg-white px-4 py-5">
          <h1 className="font-semibold text-xl">Session unavailable</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            This session was not found or you do not have access to it.
          </p>
        </div>
      </main>
    );
  }

  return <SessionDetail session={session} steps={steps} />;
}
