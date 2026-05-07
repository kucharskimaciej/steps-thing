export type LockableRecord = {
  locked: boolean;
};

export function assertUnlocked<T extends LockableRecord>(record: T): T {
  if (record.locked) {
    throw new Error("Session locked");
  }

  return record;
}
