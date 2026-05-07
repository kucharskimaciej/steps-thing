import { ConvexHttpClient } from "convex/browser";
import {
  makeFunctionReference,
  type FunctionReference,
} from "convex/server";
import { getAppConfig } from "../../lib/domain/config";
import { auditMappedBackup, loadBackup } from "./auditBackup";
import { mapBackupSession } from "./mapBackupSession";
import { mapBackupStep } from "./mapBackupStep";
import type { LoadedBackup, MappedSession, MappedStep } from "./types";

type ConvexClientLike = {
  mutation: (
    name: FunctionReference<"mutation">,
    args: unknown,
  ) => Promise<unknown>;
};

type ConvexAdminClient = ConvexClientLike & {
  setAdminAuth: (
    token: string,
    identity: { subject: string; issuer: string },
  ) => void;
};

export type ImportResult = {
  steps: number;
  sessions: number;
  batches: number;
  wrote: boolean;
};

const importBackupBatch = makeFunctionReference<
  "mutation",
  {
    steps: MappedStep[];
    sessions: MappedSession[];
  },
  { steps: number; sessions: number }
>("adminImport:importBackupBatch");

export async function importMappedBackup({
  backup,
  dryRun,
  batchSize,
  client,
}: {
  backup: LoadedBackup;
  dryRun: boolean;
  batchSize: number;
  client: ConvexClientLike;
}): Promise<ImportResult> {
  const steps = backup.steps.map(mapBackupStep);
  const sessions = backup.sessions.map(mapBackupSession);

  if (dryRun) {
    return {
      steps: steps.length,
      sessions: sessions.length,
      batches: 0,
      wrote: false,
    };
  }

  let batches = 0;

  for (let start = 0; start < steps.length || start < sessions.length; start += batchSize) {
    await client.mutation(importBackupBatch, {
      steps: steps.slice(start, start + batchSize),
      sessions: sessions.slice(start, start + batchSize),
    });
    batches += 1;
  }

  return {
    steps: steps.length,
    sessions: sessions.length,
    batches,
    wrote: true,
  };
}

if (process.argv[1]?.endsWith("importBackupToConvex.ts")) {
  const args = new Set(process.argv.slice(2));
  const backupPath = readArg("--backup") ?? "backups/database.20260507-110251";
  const batchSize = Number(readArg("--batch-size") ?? "50");
  const dryRun = !args.has("--write");
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
  const adminToken = process.env.CONVEX_ADMIN_TOKEN;
  const adminUserId = process.env.CONVEX_ADMIN_USER_ID;
  const backup = loadBackup(backupPath);
  const audit = auditMappedBackup({
    ...backup,
    config: getAppConfig("kizomba"),
  });

  if (audit.errors.length > 0) {
    console.error(JSON.stringify(audit, null, 2));
    process.exit(1);
  }

  if (!dryRun && !convexUrl) {
    console.error("Write mode requires NEXT_PUBLIC_CONVEX_URL or CONVEX_URL.");
    process.exit(1);
  }

  if (!dryRun && !adminToken) {
    console.error("Write mode requires CONVEX_ADMIN_TOKEN.");
    process.exit(1);
  }

  if (!dryRun && !adminUserId) {
    console.error("Write mode requires CONVEX_ADMIN_USER_ID.");
    process.exit(1);
  }

  const client: ConvexClientLike = dryRun
    ? { mutation: async () => undefined }
    : new ConvexHttpClient(convexUrl ?? "");

  if (!dryRun && adminToken && adminUserId) {
    (client as ConvexAdminClient).setAdminAuth(adminToken, {
      subject: adminUserId,
      issuer: "steps-thing-admin-import",
    });
  }

  const result = await importMappedBackup({
    backup,
    dryRun,
    batchSize,
    client,
  });

  console.log(JSON.stringify({ audit: audit.counts, import: result }, null, 2));
}

function readArg(name: string): string | undefined {
  return process.argv
    .find((arg) => arg.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
