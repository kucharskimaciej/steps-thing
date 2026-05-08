import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

type SessionCardProps = {
  session: Doc<"practiceSessions">;
};

function stepCountLabel(count: number) {
  return `${count} selected ${count === 1 ? "step" : "steps"}`;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <article className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-lg">{session.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {stepCountLabel(session.steps.length)}
          </p>
        </div>
        <Link
          aria-label={`Open ${session.name}`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium hover:bg-[var(--muted)]"
          href={`/sessions/${session._id}`}
        >
          Open
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
