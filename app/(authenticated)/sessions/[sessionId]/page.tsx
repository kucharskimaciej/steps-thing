import { PlaceholderPage } from "@/components/placeholder-page";

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { sessionId } = await params;

  return (
    <PlaceholderPage
      title="Session Detail"
      description={`Session placeholder for ${sessionId}. Cart feed and practice recording are implemented in later tasks.`}
    />
  );
}
