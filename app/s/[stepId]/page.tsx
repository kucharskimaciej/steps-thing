import { PlaceholderPage } from "@/components/placeholder-page";

type PublicStepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function PublicStepPage({ params }: PublicStepPageProps) {
  const { stepId } = await params;

  return (
    <PlaceholderPage
      title="Shared Step"
      description={`Public step placeholder for ${stepId}. Public playback and step details are implemented in later tasks.`}
    />
  );
}
