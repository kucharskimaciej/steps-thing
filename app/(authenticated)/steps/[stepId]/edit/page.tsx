import { EditStepWorkflow } from "@/components/steps/edit-step-workflow";

type EditStepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function EditStepPage({ params }: EditStepPageProps) {
  const { stepId } = await params;

  return <EditStepWorkflow stepId={stepId} />;
}
