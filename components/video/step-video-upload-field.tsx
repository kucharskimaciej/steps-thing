"use client";

import { useAction, useConvex } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { VideoUploadInput } from "./video-upload-input";
import type {
  ExistingVideoMatch,
  StepVideo,
  UploadedStepVideo,
} from "@/lib/video/storage-client";

type StepVideoUploadFieldProps = {
  initialVideos?: StepVideo[];
  currentStepId?: Id<"steps">;
  onVideosChange?: (videos: StepVideo[]) => void;
};

export function StepVideoUploadField({
  initialVideos = [],
  currentStepId,
  onVideosChange,
}: StepVideoUploadFieldProps) {
  const convex = useConvex();
  const requestUpload = useAction(api.videoStorageActions.createUploadUrl);
  const [videos, setVideos] = useState(initialVideos);
  const [touched, setTouched] = useState(false);
  const [duplicate, setDuplicate] = useState<UploadedStepVideo["duplicateOf"]>();
  const [error, setError] = useState("");

  function handleSelect(nextVideos: StepVideo[], selected: UploadedStepVideo) {
    setVideos(nextVideos);
    setDuplicate(selected.duplicateOf);
    onVideosChange?.(nextVideos);
  }

  async function findExistingByHash(hash: string): Promise<ExistingVideoMatch | null> {
    const matches = await convex.query(api.videoStorage.findExistingVideosByHash, {
      hashes: [hash],
      excludeStepId: currentStepId,
    });

    return matches[0] ?? null;
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="videos-heading">
      <div>
        <h2 id="videos-heading" className="text-base font-semibold">
          Videos
        </h2>
        {touched && videos.length === 0 ? (
          <p className="mt-1 text-sm text-red-700">Add at least one video.</p>
        ) : null}
        {duplicate ? (
          <p className="mt-1 text-sm text-red-700">
            Duplicate of {duplicate.stepName}
          </p>
        ) : null}
        {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
      </div>
      <VideoUploadInput
        videos={videos}
        existingMatches={[]}
        onSelect={handleSelect}
        onTouched={() => setTouched(true)}
        findExistingByHash={findExistingByHash}
        requestUpload={requestUpload}
        onError={setError}
      />
      {videos.length > 0 ? (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-white">
          {videos.map((video) => (
            <li key={video.hash} className="px-3 py-2 text-sm">
              <span className="font-medium">{video.hash.slice(0, 12)}</span>
              <span className="ml-2 text-[var(--muted-foreground)]">
                {video.storageKey}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
