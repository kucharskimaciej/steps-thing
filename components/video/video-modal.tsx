"use client";

import { X } from "lucide-react";
import { AspectAwareVideo } from "./aspect-aware-video";

type VideoModalProps = {
  open: boolean;
  videoUrl: string;
  snapshotUrl?: string;
  width?: number;
  height?: number;
  onClose: () => void;
};

export function VideoModal({
  open,
  videoUrl,
  snapshotUrl,
  width,
  height,
  onClose,
}: VideoModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full size video"
      data-borderless="true"
      className="fixed inset-0 z-50 grid bg-black"
    >
      {snapshotUrl ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-2xl"
          style={{ backgroundImage: `url("${snapshotUrl}")` }}
          aria-hidden="true"
        />
      ) : null}
      <button
        type="button"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-md bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
        aria-label="Close full size video"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <AspectAwareVideo width={width} height={height}>
        <video
          aria-label="Full size video player"
          className="relative z-[1] max-h-screen max-w-screen object-contain"
          src={videoUrl}
          loop
          playsInline
          preload="metadata"
          muted
          autoPlay
          controls
          poster={snapshotUrl}
        />
      </AspectAwareVideo>
    </div>
  );
}
