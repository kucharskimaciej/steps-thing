import { StepFormWithUserData } from "@/components/steps/step-form-with-user-data";

export default function NewStepPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Steps
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Create Step</h1>
      </div>
      <section className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <StepFormWithUserData />
      </section>
    </main>
  );
}
