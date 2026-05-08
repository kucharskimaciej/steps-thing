import { HistoricalSessionFeed } from "@/components/sessions/historical-session-feed";

type HistoricalSessionPageProps = {
  params: Promise<{
    startOfDay: string;
  }>;
};

export default async function HistoricalSessionPage({
  params,
}: HistoricalSessionPageProps) {
  const { startOfDay } = await params;
  const parsedStartOfDay = Number(startOfDay);

  if (!Number.isSafeInteger(parsedStartOfDay) || parsedStartOfDay < 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-8 sm:px-6">
        <div className="rounded-md border border-[var(--border)] bg-white px-4 py-5">
          <h1 className="font-semibold text-xl">
            Historical practice unavailable
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            This historical practice date is invalid.
          </p>
        </div>
      </main>
    );
  }

  return <HistoricalSessionFeed startOfDay={parsedStartOfDay} />;
}
