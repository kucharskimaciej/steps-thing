export type StepVideo = {
  hash: string;
  storageKey: string;
};

export type ExistingVideoMatch = StepVideo & {
  duplicateStepId?: string;
  duplicateStepName?: string;
};

export type UploadedStepVideo = StepVideo & {
  duplicateOf?: {
    stepId: string;
    stepName: string;
  };
};

type UploadTarget = {
  uploadUrl: string;
  storageKey: string;
};

type UploadVideoForStepArgs = {
  file: File;
  hash: string;
  existing: ExistingVideoMatch | null;
  requestUpload: (input: {
    hash: string;
    contentType: string;
  }) => Promise<UploadTarget>;
  upload?: (uploadUrl: string, file: File, contentType: string) => Promise<void>;
};

export { buildOwnerVideoStorageKey } from "./storage-key";

export function addVideoSelection<T extends StepVideo>(
  videos: T[],
  candidate: T,
):
  | { videos: T[]; added: true; reason?: never }
  | { videos: T[]; added: false; reason: "already-selected" } {
  if (videos.some((video) => video.hash === candidate.hash)) {
    return { videos, added: false, reason: "already-selected" };
  }

  return { videos: [...videos, candidate], added: true };
}

export async function putVideoFile(
  uploadUrl: string,
  file: File,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Video upload failed with status ${response.status}`);
  }
}

export async function uploadVideoForStep({
  file,
  hash,
  existing,
  requestUpload,
  upload = putVideoFile,
}: UploadVideoForStepArgs): Promise<UploadedStepVideo> {
  if (existing) {
    return {
      hash,
      storageKey: existing.storageKey,
      duplicateOf:
        existing.duplicateStepId && existing.duplicateStepName
          ? {
              stepId: existing.duplicateStepId,
              stepName: existing.duplicateStepName,
            }
          : undefined,
    };
  }

  const contentType = file.type || "video/mp4";
  const target = await requestUpload({ hash, contentType });

  await upload(target.uploadUrl, file, contentType);

  return {
    hash,
    storageKey: target.storageKey,
  };
}
