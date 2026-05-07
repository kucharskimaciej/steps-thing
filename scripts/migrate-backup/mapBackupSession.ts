import type {
  BackupDocument,
  MappedSession,
  RawBackupSession,
} from "./types";

export function mapBackupSession(
  source: BackupDocument<RawBackupSession>,
): MappedSession {
  return {
    legacyId: source.legacyId,
    ownerId: source.data.owner_uid,
    name: source.data.name,
    legacyStepIds: source.data.steps,
    locked: source.data.locked,
    createdAt: source.data.created_at,
    updatedAt: source.data.updated_at ?? source.data.created_at,
  };
}
