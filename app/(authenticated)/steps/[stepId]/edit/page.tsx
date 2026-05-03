import { PlaceholderPage } from "@/components/placeholder-page";

type EditStepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function EditStepPage({ params }: EditStepPageProps) {
  const { stepId } = await params;

  return (
    <PlaceholderPage
      title="Edit Step"
      description={`Step edit placeholder for ${stepId}. Loading and mutations are implemented in later tasks.`}
    />
  );
}
