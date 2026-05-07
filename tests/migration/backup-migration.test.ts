import { describe, expect, it } from "vitest";
import { getFunctionName } from "convex/server";
import { getAppConfig } from "@/lib/domain/config";
import {
  auditBackup,
  auditMappedBackup,
  loadBackup,
  type RawBackupStep,
} from "@/scripts/migrate-backup/auditBackup";
import { importMappedBackup } from "@/scripts/migrate-backup/importBackupToConvex";
import { mapBackupStep } from "@/scripts/migrate-backup/mapBackupStep";
import { mapBackupSession } from "@/scripts/migrate-backup/mapBackupSession";
import { readFirestoreValue } from "@/scripts/migrate-backup/readFirestoreValue";

const backupPath = "backups/database.20260507-110251";

describe("backup audit", () => {
  it("reports current backup counts without Convex credentials", () => {
    const report = auditBackup({ backupPath, config: getAppConfig("kizomba") });

    expect(report.counts).toMatchObject({
      steps: 203,
      sessions: 2,
      videos: 206,
      practiceRecords: 95,
      viewRecords: 2088,
    });
    expect(report.errors).toEqual([]);
  });

  it("fails on unsupported constrained values", () => {
    const backup = loadBackup(backupPath);
    const [step] = backup.steps;
    const report = auditMappedBackup({
      config: getAppConfig("kizomba"),
      steps: [
        {
          ...step,
          data: {
            ...step.data,
            kind: "combo",
            difficulty: 13,
            feeling: ["urban", "unknown"],
            smart_tags: ["Unknown smart tag"],
          } as RawBackupStep,
        },
      ],
      sessions: backup.sessions.slice(0, 1),
    });

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("unsupported kind"),
        expect.stringContaining("unsupported difficulty"),
        expect.stringContaining("unsupported feeling"),
        expect.stringContaining("unsupported smart_tags"),
      ]),
    );
  });

  it("confirms observed constrained backup values match domain config", () => {
    const report = auditBackup({ backupPath, config: getAppConfig("kizomba") });

    expect(report.distinct.kind).toEqual(["inspiration", "routine", "step"]);
    expect(report.distinct.difficulty).toEqual([1, 2, 3, 5, 8]);
    expect(report.distinct.feeling).toEqual([
      "doucer",
      "fusion",
      "kizomba",
      "semba",
      "tarraxa",
      "urban",
    ]);
    expect(report.errors).toEqual([]);
  });
});

describe("backup mapping", () => {
  it("unwraps Firestore export values recursively", () => {
    expect(
      readFirestoreValue({
        type: "object",
        value: {
          list: {
            type: "array",
            value: [{ type: "string", value: "a" }],
          },
        },
      }),
    ).toEqual({ list: ["a"] });
  });

  it("maps a complete backup step into canonical camelCase fields", () => {
    const backup = loadBackup(backupPath);
    const mapped = mapBackupStep(backup.steps[0]);

    expect(mapped).toMatchObject({
      legacyId: backup.steps[0].legacyId,
      ownerId: backup.steps[0].data.owner_uid,
      identifier: backup.steps[0].data.identifier,
      name: backup.steps[0].data.name,
      difficulty: backup.steps[0].data.difficulty,
      feeling: backup.steps[0].data.feeling,
      kind: backup.steps[0].data.kind,
      tags: backup.steps[0].data.tags,
      artists: backup.steps[0].data.artists,
      notes: backup.steps[0].data.notes,
      smartTags: backup.steps[0].data.smart_tags,
      removedSmartTags: backup.steps[0].data.removed_smart_tags,
      tokens: backup.steps[0].data.tokens,
      variationKey: backup.steps[0].data.variationKey,
      practiceRecords: backup.steps[0].data.practice_records ?? [],
      viewRecords: backup.steps[0].data.view_records ?? [],
      createdAt: backup.steps[0].data.created_at,
      updatedAt: backup.steps[0].data.created_at,
    });
    expect(mapped.videos[0]).toMatchObject({
      hash: backup.steps[0].data.videos[0].hash,
      storageKey: `videos/${backup.steps[0].data.owner_uid}/${backup.steps[0].data.videos[0].hash}`,
      snapshotStorageKey: backup.steps[0].data.videos[0].snapshot_url,
      thumbnailStorageKey: backup.steps[0].data.videos[0].thumbnail_url,
    });
  });

  it("backfills kind, updatedAt, null dance, and missing startOfDay", () => {
    const backup = loadBackup(backupPath);
    const source = {
      legacyId: "legacy-step",
      data: {
        ...backup.steps[0].data,
        kind: undefined,
        updated_at: undefined,
        dance: null,
        feeling: ["urban"],
        practice_records: [{ date: 100 }],
      },
    };

    expect(mapBackupStep(source)).toMatchObject({
      kind: "step",
      updatedAt: source.data.created_at,
      feeling: ["urban"],
      practiceRecords: [{ date: 100, startOfDay: 100 }],
    });
  });

  it("converts non-null legacy dance to feeling", () => {
    const backup = loadBackup(backupPath);

    expect(
      mapBackupStep({
        legacyId: "legacy-step",
        data: {
          ...backup.steps[0].data,
          dance: "semba",
          feeling: undefined,
        },
      }).feeling,
    ).toEqual(["semba"]);
  });

  it("maps practice sessions with legacy step ids", () => {
    expect(
      mapBackupSession({
        legacyId: "session-a",
        data: {
          owner_uid: "user-a",
          name: "Practice",
          steps: ["step-a"],
          locked: false,
          created_at: 10,
        },
      }),
    ).toEqual({
      legacyId: "session-a",
      ownerId: "user-a",
      name: "Practice",
      legacyStepIds: ["step-a"],
      locked: false,
      createdAt: 10,
      updatedAt: 10,
    });
  });
});

describe("Convex import CLI core", () => {
  it("dry run reports counts and performs no writes", async () => {
    const backup = loadBackup(backupPath);
    const calls: unknown[] = [];

    const result = await importMappedBackup({
      backup,
      dryRun: true,
      batchSize: 50,
      client: {
        mutation: async (...args: unknown[]) => {
          calls.push(args);
        },
      },
    });

    expect(result).toEqual({ steps: 203, sessions: 2, batches: 0, wrote: false });
    expect(calls).toEqual([]);
  });

  it("write mode pushes steps and sessions through explicit admin mutation", async () => {
    const backup = loadBackup(backupPath);
    const calls: unknown[][] = [];

    const result = await importMappedBackup({
      backup: {
        steps: backup.steps.slice(0, 2),
        sessions: backup.sessions.slice(0, 1),
      },
      dryRun: false,
      batchSize: 2,
      client: {
        mutation: async (...args: unknown[]) => {
          calls.push(args);
          return { steps: 2, sessions: 1 };
        },
      },
    });

    expect(result).toEqual({ steps: 2, sessions: 1, batches: 1, wrote: true });
    expect(calls).toHaveLength(1);
    expect(getFunctionName(calls[0][0] as never)).toBe(
      "adminImport:importBackupBatch",
    );
  });
});
