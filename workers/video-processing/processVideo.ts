import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  downloadGcsObject,
  type GcsConfig,
  getGcsConfigFromEnv,
  uploadGcsObject,
} from "../../lib/video/gcs";
import type { ProcessedVideoMetadata } from "../../lib/video/processing-status";
import {
  buildOwnerVideoSnapshotStorageKey,
  buildOwnerVideoThumbnailStorageKey,
} from "../../lib/video/storage-key";

const execFileAsync = promisify(execFile);

type VideoProbe = {
  durationSeconds: number;
  width: number;
  height: number;
};

export async function processVideoFromGcs({
  ownerId,
  hash,
  storageKey,
  config = getGcsConfigFromEnv(),
}: {
  ownerId: string;
  hash: string;
  storageKey: string;
  config?: GcsConfig;
}): Promise<ProcessedVideoMetadata> {
  const workDir = await mkdtemp(path.join(tmpdir(), "steps-video-"));
  const inputPath = path.join(workDir, "source-video");
  const snapshotPath = path.join(workDir, "snapshot.jpg");
  const thumbnailPath = path.join(workDir, "thumbnail.jpg");
  const snapshotStorageKey = buildOwnerVideoSnapshotStorageKey(ownerId, hash);
  const thumbnailStorageKey = buildOwnerVideoThumbnailStorageKey(ownerId, hash);

  try {
    await writeFile(inputPath, await downloadGcsObject({ config, storageKey }));

    const probe = await probeVideo(inputPath);
    const snapshotSecond = Math.max(probe.durationSeconds / 2, 0);

    await extractFrame({
      inputPath,
      outputPath: snapshotPath,
      atSecond: snapshotSecond,
    });
    await extractFrame({
      inputPath,
      outputPath: thumbnailPath,
      atSecond: snapshotSecond,
      videoFilter: "scale=256:-2",
    });

    await uploadGcsObject({
      config,
      storageKey: snapshotStorageKey,
      contentType: "image/jpeg",
      body: await readFile(snapshotPath),
    });
    await uploadGcsObject({
      config,
      storageKey: thumbnailStorageKey,
      contentType: "image/jpeg",
      body: await readFile(thumbnailPath),
    });

    return {
      hash,
      storageKey,
      snapshotStorageKey,
      thumbnailStorageKey,
      width: probe.width,
      height: probe.height,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

async function probeVideo(inputPath: string): Promise<VideoProbe> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height:format=duration",
    "-of",
    "json",
    inputPath,
  ]);
  const parsed = JSON.parse(stdout) as {
    streams?: Array<{ width?: number; height?: number }>;
    format?: { duration?: string };
  };
  const stream = parsed.streams?.[0];
  const durationSeconds = Number.parseFloat(parsed.format?.duration ?? "0");

  if (!stream?.width || !stream.height) {
    throw new Error("Unable to read video dimensions");
  }

  return {
    width: stream.width,
    height: stream.height,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
  };
}

async function extractFrame({
  inputPath,
  outputPath,
  atSecond,
  videoFilter,
}: {
  inputPath: string;
  outputPath: string;
  atSecond: number;
  videoFilter?: string;
}) {
  const args = [
    "-y",
    "-ss",
    atSecond.toString(),
    "-i",
    inputPath,
    "-frames:v",
    "1",
  ];

  if (videoFilter) {
    args.push("-vf", videoFilter);
  }

  args.push(outputPath);

  await execFileAsync("ffmpeg", args);
}
