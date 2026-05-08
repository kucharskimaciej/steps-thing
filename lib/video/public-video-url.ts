import type { PublicStep } from "@/convex/model/steps";
import { createSignedGcsUrl, getGcsConfigFromEnv } from "./gcs";

const publicReadTtlSeconds = 15 * 60;

type PublicStepVideo = PublicStep["videos"][number];

export type ResolvedPublicStepVideo = PublicStepVideo & {
  videoUrl: string;
  snapshotUrl?: string;
};

export function resolvePublicStepVideoUrls({
  step,
  now = Date.now(),
}: {
  step: Pick<PublicStep, "videos">;
  now?: number;
}): { primaryVideo: ResolvedPublicStepVideo | null } {
  const primaryVideo = step.videos[0];

  if (!primaryVideo) {
    return { primaryVideo: null };
  }

  const config = getGcsConfigFromEnv();
  const expires = Math.floor(now / 1000) + publicReadTtlSeconds;
  const signReadUrl = (storageKey: string) =>
    createSignedGcsUrl({
      ...config,
      storageKey,
      method: "GET",
      expires,
    });

  return {
    primaryVideo: {
      ...primaryVideo,
      videoUrl: signReadUrl(primaryVideo.storageKey),
      snapshotUrl: primaryVideo.snapshotStorageKey
        ? signReadUrl(primaryVideo.snapshotStorageKey)
        : undefined,
    },
  };
}
