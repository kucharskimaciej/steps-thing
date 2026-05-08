import { ConvexHttpClient } from "convex/browser";
import { PublicStepView } from "@/components/steps/public-step-view";
import { api } from "@/convex/_generated/api";
import { resolvePublicStepVideoUrls } from "@/lib/video/public-video-url";

type PublicStepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function PublicStepPage({ params }: PublicStepPageProps) {
  const { stepId } = await params;
  const step = await fetchPublicStep(stepId);

  if (!step) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-3 px-4 py-8 sm:px-6">
        <p className="text-sm font-medium uppercase text-[var(--muted-foreground)]">
          Shared step
        </p>
        <h1 className="text-3xl font-semibold">Step not found</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          This shared step does not exist or is no longer available.
        </p>
      </main>
    );
  }

  const { primaryVideo } = resolvePublicStepVideoUrls({ step });

  return <PublicStepView step={step} primaryVideo={primaryVideo} />;
}

async function fetchPublicStep(stepId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return null;
  }

  const client = new ConvexHttpClient(convexUrl);

  return await client.query(api.steps.getPublicStep, { id: stepId });
}
