"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectAwareVideo } from "./aspect-aware-video";
import { VideoControls } from "./video-controls";
import { VideoModal } from "./video-modal";
import { VideoProgress } from "./video-progress";

type VideoPlayerProps = {
  videoUrl: string;
  snapshotUrl?: string;
  snapshotStorageKey?: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  enableFullSize?: boolean;
  modalOpen?: boolean;
  ariaLabel?: string;
  onViewed?: () => void;
};

export function VideoPlayer({
  videoUrl,
  snapshotUrl,
  snapshotStorageKey: _snapshotStorageKey,
  width,
  height,
  autoPlay = false,
  enableFullSize = false,
  modalOpen = false,
  ariaLabel = "Step video",
  onViewed,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [slowMotion, setSlowMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(modalOpen);
  const [dimensions, setDimensions] = useState({
    width,
    height,
  });

  const updateProgress = useCallback(() => {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    const nextProgress = video.currentTime / video.duration;
    setProgress(nextProgress);

    if (nextProgress < 0.1) {
      viewedRef.current = false;
    }

    if (nextProgress >= 0.8 && !viewedRef.current) {
      viewedRef.current = true;
      onViewed?.();
    }
  }, [onViewed]);

  useEffect(() => {
    setOpen(modalOpen);
  }, [modalOpen]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = muted;
    video.playbackRate = slowMotion ? 0.5 : 1;
  }, [muted, slowMotion]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !autoPlay) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      void playVideo(video);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void playVideo(video);
      } else {
        video.pause();
      }
    });

    observer.observe(video);

    return () => observer.disconnect();
  }, [autoPlay]);

  function syncDimensions() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextWidth = width ?? video.videoWidth;
    const nextHeight = height ?? video.videoHeight;

    if (nextWidth && nextHeight) {
      setDimensions({ width: nextWidth, height: nextHeight });
    }
  }

  async function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (playing) {
      video.pause();
      return;
    }

    await playVideo(video);
  }

  function seek(seconds: number) {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const duration = Number.isFinite(video.duration)
      ? video.duration
      : Infinity;
    video.currentTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds),
    );
    updateProgress();
  }

  function restart() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    updateProgress();
    void playVideo(video);
  }

  return (
    <>
      <div className="relative isolate overflow-hidden rounded-md bg-black text-white">
        {snapshotUrl ? (
          <div
            data-testid="video-snapshot-background"
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-xl"
            style={{ backgroundImage: `url("${snapshotUrl}")` }}
            aria-hidden="true"
          />
        ) : null}
        <AspectAwareVideo width={dimensions.width} height={dimensions.height}>
          <video
            ref={videoRef}
            aria-label={ariaLabel}
            className="relative z-[1] aspect-video h-full max-h-[78vh] w-full bg-black object-contain"
            src={videoUrl}
            loop
            playsInline
            preload="metadata"
            muted={muted}
            autoPlay={autoPlay}
            poster={snapshotUrl}
            onLoadedMetadata={syncDimensions}
            onTimeUpdate={updateProgress}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        </AspectAwareVideo>
        <button
          type="button"
          className="absolute inset-0 z-[2] grid place-items-center bg-transparent text-white"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={togglePlayback}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-black/45 shadow-lg backdrop-blur transition hover:bg-black/60">
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </span>
        </button>
        <div className="pointer-events-none absolute inset-0 z-[3]">
          <div className="pointer-events-auto">
            <VideoControls
              muted={muted}
              slowMotion={slowMotion}
              enableFullSize={enableFullSize}
              onToggleMuted={() => setMuted((current) => !current)}
              onOpenFullSize={() => setOpen(true)}
              onSeek={seek}
              onRestart={restart}
              onToggleSlowMotion={() => setSlowMotion((current) => !current)}
            />
          </div>
          <VideoProgress progress={progress} />
        </div>
      </div>
      <VideoModal
        open={open}
        videoUrl={videoUrl}
        snapshotUrl={snapshotUrl}
        width={dimensions.width}
        height={dimensions.height}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

async function playVideo(video: HTMLVideoElement) {
  try {
    await video.play();
  } catch {
    // Browsers can reject play() for codec, preload, or autoplay policy reasons.
  }
}
