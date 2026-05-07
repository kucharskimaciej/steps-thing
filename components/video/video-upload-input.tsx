"use client";

import { Upload } from "lucide-react";
import { useId, useState } from "react";
import { hashVideoFile } from "@/lib/video/hash-file";
import {
  addVideoSelection,
  type ExistingVideoMatch,
  type StepVideo,
  type UploadedStepVideo,
  uploadVideoForStep,
} from "@/lib/video/storage-client";

type VideoUploadInputProps = {
  videos: StepVideo[];
  existingMatches: ExistingVideoMatch[];
  onSelect: (videos: StepVideo[], selected: UploadedStepVideo) => void;
  onTouched: () => void;
  findExistingByHash?: (hash: string) => Promise<ExistingVideoMatch | null>;
  requestUpload?: (input: {
    hash: string;
    contentType: string;
  }) => Promise<{ uploadUrl: string; storageKey: string }>;
  onError?: (message: string) => void;
};

export function VideoUploadInput({
  videos,
  existingMatches,
  onSelect,
  onTouched,
  findExistingByHash,
  requestUpload,
  onError,
}: VideoUploadInputProps) {
  const inputId = useId();
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onTouched();
    const file = event.target.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    setIsBusy(true);
    setStatus("Hashing video");

    try {
      const hash = await hashVideoFile(file);

      if (videos.some((video) => video.hash === hash)) {
        setStatus("Already selected");
        return;
      }

      const existing =
        existingMatches.find((match) => match.hash === hash) ??
        (findExistingByHash ? await findExistingByHash(hash) : null);

      if (!existing && !requestUpload) {
        throw new Error("Video upload is not configured");
      }

      setStatus(existing ? "Reusing existing video" : "Uploading video");

      const selected = await uploadVideoForStep({
        file,
        hash,
        existing,
        requestUpload: requestUpload ?? missingUploadTarget,
      });
      const next = addVideoSelection(videos, selected);

      if (next.added) {
        onSelect(next.videos, selected);
      }

      setStatus(
        selected.duplicateOf
          ? `Duplicate of ${selected.duplicateOf.stepName}`
          : "Video ready",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video upload failed";
      setStatus(message);
      onError?.(message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium shadow-sm"
      >
        <Upload size={16} aria-hidden="true" />
        Add video
      </label>
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept="video/*"
        disabled={isBusy}
        onClick={onTouched}
        onChange={handleChange}
      />
      <p className="min-h-5 text-sm text-[var(--muted-foreground)]" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

async function missingUploadTarget(): Promise<never> {
  throw new Error("Video upload is not configured");
}
