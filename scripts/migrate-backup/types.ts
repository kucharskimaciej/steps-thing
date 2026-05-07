import type { Difficulty, StepKind } from "../../lib/domain/config";

export type RawBackupVideo = {
  hash: string;
  url: string;
  snapshot_url?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
};

export type RawBackupPracticeRecord = {
  date: number;
  start_of_day?: number;
};

export type RawBackupStep = {
  owner_uid: string;
  identifier: number;
  name: string;
  videos: RawBackupVideo[];
  difficulty: number;
  feeling?: string[];
  dance?: string | null;
  kind?: string;
  tags: string[];
  artists: string[];
  notes: string;
  smart_tags: string[];
  removed_smart_tags: string[];
  tokens: string[];
  variationKey: string;
  practice_records?: RawBackupPracticeRecord[];
  view_records?: number[];
  created_at: number;
  updated_at?: number;
  last_viewed_at?: number;
  __t?: string;
};

export type RawBackupSession = {
  owner_uid: string;
  name: string;
  steps: string[];
  locked: boolean;
  created_at: number;
  updated_at?: number;
};

export type BackupDocument<T> = {
  legacyId: string;
  data: T;
};

export type LoadedBackup = {
  steps: BackupDocument<RawBackupStep>[];
  sessions: BackupDocument<RawBackupSession>[];
};

export type MappedVideo = {
  hash: string;
  storageKey: string;
  snapshotStorageKey?: string;
  thumbnailStorageKey?: string;
  width?: number;
  height?: number;
};

export type MappedPracticeRecord = {
  date: number;
  startOfDay: number;
};

export type MappedStep = {
  legacyId: string;
  ownerId: string;
  identifier: number;
  name: string;
  videos: MappedVideo[];
  videoHashes: string[];
  difficulty: Difficulty;
  feeling: string[];
  kind: StepKind;
  tags: string[];
  artists: string[];
  notes: string;
  smartTags: string[];
  removedSmartTags: string[];
  tokens: string[];
  variationKey: string;
  practiceRecords: MappedPracticeRecord[];
  viewRecords: number[];
  createdAt: number;
  updatedAt: number;
  lastViewedAt?: number;
  needsVideoProcessing: boolean;
};

export type MappedSession = {
  legacyId: string;
  ownerId: string;
  name: string;
  legacyStepIds: string[];
  locked: boolean;
  createdAt: number;
  updatedAt: number;
};
