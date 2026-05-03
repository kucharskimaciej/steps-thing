type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col justify-center gap-4 px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        Steps
      </p>
      <section className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          {description}
        </p>
      </section>
    </main>
  );
}
