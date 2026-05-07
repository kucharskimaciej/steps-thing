export type OwnerScopedRecord = {
  ownerId: string;
};

export type IdentifierRecord = {
  identifier: number;
};

export type PracticeRecordLike = {
  date: number;
  startOfDay: number;
  collectionId?: string;
};

export function assertOwner<T extends OwnerScopedRecord>(
  record: T | null,
  userId: string,
): T {
  if (!record || record.ownerId !== userId) {
    throw new Error("Not found");
  }

  return record;
}

export function nextIdentifier(records: IdentifierRecord[]): number {
  const lastIdentifier = records.reduce(
    (max, record) => Math.max(max, record.identifier),
    0,
  );

  return lastIdentifier + 1;
}

export function prependViewRecord(records: number[], viewedAt: number): number[] {
  return [viewedAt, ...records];
}

export function upsertPracticeRecord<T extends PracticeRecordLike>(
  records: T[],
  record: T,
): T[] {
  const exists = records.some(
    (candidate) =>
      candidate.startOfDay === record.startOfDay &&
      candidate.collectionId === record.collectionId,
  );

  if (exists) {
    return records;
  }

  return [record, ...records];
}
