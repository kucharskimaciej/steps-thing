import { OwnedSessionDetail } from "@/components/sessions/owned-session-detail";

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { sessionId } = await params;

  return <OwnedSessionDetail sessionId={sessionId} />;
}
