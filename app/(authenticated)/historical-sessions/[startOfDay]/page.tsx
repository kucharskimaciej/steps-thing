import { PlaceholderPage } from "@/components/placeholder-page";

type HistoricalSessionPageProps = {
  params: Promise<{
    startOfDay: string;
  }>;
};

export default async function HistoricalSessionPage({
  params,
}: HistoricalSessionPageProps) {
  const { startOfDay } = await params;

  return (
    <PlaceholderPage
      title="Historical Session"
      description={`Historical practice placeholder for ${startOfDay}. Practice history queries are implemented in later tasks.`}
    />
  );
}
