import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type HistoricalPracticeDay = {
  startOfDay: number;
  label: string;
  practicedStepCount: number;
};

type HistoricalSessionCardProps = {
  day: HistoricalPracticeDay;
};

function practicedCountLabel(count: number) {
  return `${count} practiced ${count === 1 ? "step" : "steps"}`;
}

export function HistoricalSessionCard({ day }: HistoricalSessionCardProps) {
  return (
    <article className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-lg">{day.label}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {practicedCountLabel(day.practicedStepCount)}
          </p>
        </div>
        <Link
          aria-label={`Open historical practice for ${day.label}`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium hover:bg-[var(--muted)]"
          href={`/historical-sessions/${day.startOfDay}`}
        >
          Open
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
