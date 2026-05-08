export default function LoadingPublicStepPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
          Shared step
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Loading step...</h1>
      </div>
      <div className="aspect-video animate-pulse rounded-md bg-[var(--muted)]" />
      <div className="h-20 animate-pulse rounded-md bg-[var(--muted)]" />
    </main>
  );
}
