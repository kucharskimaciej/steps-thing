import type { Id } from "@/convex/_generated/dataModel";

type PracticeRecord = {
  date?: number;
  startOfDay: number;
  collectionId?: Id<"practiceSessions">;
};

export function hasRecordedPractice({
  records,
  startOfDay,
  collectionId,
}: {
  records: PracticeRecord[] | undefined;
  startOfDay: number;
  collectionId?: Id<"practiceSessions">;
}): boolean {
  return (records ?? []).some(
    (record) =>
      record.startOfDay === startOfDay && record.collectionId === collectionId,
  );
}
