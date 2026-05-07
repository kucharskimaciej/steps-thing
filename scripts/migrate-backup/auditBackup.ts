import fs from "node:fs";
import path from "node:path";
import {
  getAppConfig,
  type AppConfig,
  type Difficulty,
  type StepKind,
} from "../../lib/domain/config";
import { isStepKind } from "./mapBackupStep";
import { readFirestoreValue } from "./readFirestoreValue";
import type {
  BackupDocument,
  LoadedBackup,
  RawBackupSession,
  RawBackupStep,
} from "./types";

export type { RawBackupStep } from "./types";

type AuditOptions = {
  backupPath: string;
  config: AppConfig;
};

export type BackupAuditReport = {
  counts: {
    steps: number;
    sessions: number;
    videos: number;
    practiceRecords: number;
    viewRecords: number;
  };
  missingRequiredFields: string[];
  unknownFields: string[];
  distinct: {
    kind: StepKind[];
    difficulty: Difficulty[];
    feeling: string[];
    tags: string[];
    smartTags: string[];
    removedSmartTags: string[];
  };
  domainMismatches: string[];
  errors: string[];
};

const stepRequiredFields = [
  "owner_uid",
  "identifier",
  "name",
  "videos",
  "difficulty",
  "feeling",
  "tags",
  "artists",
  "notes",
  "smart_tags",
  "removed_smart_tags",
  "tokens",
  "variationKey",
  "created_at",
] as const;

const sessionRequiredFields = [
  "owner_uid",
  "name",
  "steps",
  "locked",
  "created_at",
] as const;

const knownStepFields = new Set([
  ...stepRequiredFields,
  "kind",
  "updated_at",
  "last_viewed_at",
  "practice_records",
  "view_records",
  "dance",
  "__t",
]);

const knownSessionFields = new Set([...sessionRequiredFields, "updated_at"]);
const supportedDifficulties = new Set([1, 2, 3, 5, 8]);

export function loadBackup(backupPath: string): LoadedBackup {
  return {
    steps: loadCollection<RawBackupStep>(backupPath, "steps"),
    sessions: loadCollection<RawBackupSession>(backupPath, "practice-sessions"),
  };
}

export function auditBackup(options: AuditOptions): BackupAuditReport {
  return auditMappedBackup({
    ...loadBackup(options.backupPath),
    config: options.config,
  });
}

export function auditMappedBackup({
  steps,
  sessions,
  config,
}: LoadedBackup & { config: AppConfig }): BackupAuditReport {
  const missingRequiredFields: string[] = [];
  const unknownFields: string[] = [];
  const domainMismatches: string[] = [];
  const kinds = new Set<StepKind>();
  const difficulties = new Set<Difficulty>();
  const feelings = new Set<string>();
  const tags = new Set<string>();
  const smartTags = new Set<string>();
  const removedSmartTags = new Set<string>();
  const supportedFeelings = new Set(Object.keys(config.feelings));
  const supportedSmartTags = new Set(
    config.smartTagMatchers.map((matcher) => matcher.tag),
  );

  let videos = 0;
  let practiceRecords = 0;
  let viewRecords = 0;

  for (const step of steps) {
    collectMissing(step, stepRequiredFields, missingRequiredFields, "step");
    collectUnknown(step, knownStepFields, unknownFields, "step");

    videos += step.data.videos?.length ?? 0;
    practiceRecords += step.data.practice_records?.length ?? 0;
    viewRecords += step.data.view_records?.length ?? 0;

    const kind = step.data.kind ?? "step";
    if (isStepKind(kind)) {
      kinds.add(kind);
    } else {
      domainMismatches.push(`${step.legacyId}: unsupported kind ${kind}`);
    }

    if (supportedDifficulties.has(step.data.difficulty)) {
      difficulties.add(step.data.difficulty as Difficulty);
    } else {
      domainMismatches.push(
        `${step.legacyId}: unsupported difficulty ${step.data.difficulty}`,
      );
    }

    for (const feeling of (step.data.feeling ?? legacyDanceValues(step.data.dance))) {
      if (supportedFeelings.has(feeling)) {
        feelings.add(feeling);
      } else {
        domainMismatches.push(`${step.legacyId}: unsupported feeling ${feeling}`);
      }
    }

    collectOpenValues(tags, step.data.tags);
    collectSupportedValues({
      set: smartTags,
      values: step.data.smart_tags,
      supportedValues: supportedSmartTags,
      field: "smart_tags",
      legacyId: step.legacyId,
      errors: domainMismatches,
    });
    collectSupportedValues({
      set: removedSmartTags,
      values: step.data.removed_smart_tags,
      supportedValues: supportedSmartTags,
      field: "removed_smart_tags",
      legacyId: step.legacyId,
      errors: domainMismatches,
    });
  }

  for (const session of sessions) {
    collectMissing(
      session,
      sessionRequiredFields,
      missingRequiredFields,
      "session",
    );
    collectUnknown(session, knownSessionFields, unknownFields, "session");
  }

  const errors = [...missingRequiredFields, ...domainMismatches];

  return {
    counts: {
      steps: steps.length,
      sessions: sessions.length,
      videos,
      practiceRecords,
      viewRecords,
    },
    missingRequiredFields,
    unknownFields,
    distinct: {
      kind: sortStrings([...kinds]),
      difficulty: [...difficulties].sort((left, right) => left - right),
      feeling: sortStrings([...feelings]),
      tags: sortStrings([...tags]),
      smartTags: sortStrings([...smartTags]),
      removedSmartTags: sortStrings([...removedSmartTags]),
    },
    domainMismatches,
    errors,
  };
}

function loadCollection<T>(
  backupPath: string,
  collection: string,
): BackupDocument<T>[] {
  const collectionPath = path.join(backupPath, collection);

  return fs
    .readdirSync(collectionPath)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      legacyId: path.basename(file, ".json"),
      data: readFirestoreValue(
        JSON.parse(fs.readFileSync(path.join(collectionPath, file), "utf8")),
      ) as T,
    }));
}

function collectMissing<T>(
  document: BackupDocument<T>,
  requiredFields: readonly string[],
  output: string[],
  collection: string,
) {
  const data = document.data as Record<string, unknown>;

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      output.push(`${collection} ${document.legacyId}: missing ${field}`);
    }
  }
}

function collectUnknown<T>(
  document: BackupDocument<T>,
  knownFields: Set<string>,
  output: string[],
  collection: string,
) {
  for (const field of Object.keys(document.data as Record<string, unknown>)) {
    if (!knownFields.has(field)) {
      output.push(`${collection} ${document.legacyId}: unknown ${field}`);
    }
  }
}

function collectOpenValues(set: Set<string>, values: string[] | undefined) {
  for (const value of (values ?? [])) {
    set.add(value);
  }
}

function collectSupportedValues({
  set,
  values,
  supportedValues,
  field,
  legacyId,
  errors,
}: {
  set: Set<string>;
  values: string[] | undefined;
  supportedValues: Set<string>;
  field: string;
  legacyId: string;
  errors: string[];
}) {
  for (const value of values ?? []) {
    if (supportedValues.has(value)) {
      set.add(value);
    } else {
      errors.push(`${legacyId}: unsupported ${field} ${value}`);
    }
  }
}

function legacyDanceValues(dance: string | null | undefined): string[] {
  return dance ? [dance] : [];
}

function sortStrings<T extends string>(values: T[]): T[] {
  return values.sort((left, right) => left.localeCompare(right, "pl-PL"));
}

if (process.argv[1]?.endsWith("auditBackup.ts")) {
  const backupPath =
    process.argv.find((arg) => arg.startsWith("--backup="))?.split("=")[1] ??
    "backups/database.20260507-110251";
  const report = auditBackup({
    backupPath,
    config: configFromCli(),
  });

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.errors.length > 0 ? 1 : 0;
}

function configFromCli(): AppConfig {
  return getAppConfig("kizomba");
}
