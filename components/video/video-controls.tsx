"use client";

import {
  Maximize2,
  RotateCcw,
  SkipBack,
  StepBack,
  StepForward,
  Volume2,
  VolumeX,
} from "lucide-react";

type VideoControlsProps = {
  muted: boolean;
  slowMotion: boolean;
  enableFullSize: boolean;
  onToggleMuted: () => void;
  onOpenFullSize: () => void;
  onSeek: (seconds: number) => void;
  onRestart: () => void;
  onToggleSlowMotion: () => void;
};

export function VideoControls({
  muted,
  slowMotion,
  enableFullSize,
  onToggleMuted,
  onOpenFullSize,
  onSeek,
  onRestart,
  onToggleSlowMotion,
}: VideoControlsProps) {
  return (
    <fieldset className="contents">
      <legend className="sr-only">Video controls</legend>
      <div className="absolute right-3 top-3 flex gap-2">
        <IconButton
          label={muted ? "Unmute video" : "Mute video"}
          onClick={onToggleMuted}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </IconButton>
        {enableFullSize ? (
          <IconButton label="Open full size video" onClick={onOpenFullSize}>
            <Maximize2 size={17} />
          </IconButton>
        ) : null}
      </div>
      <div className="absolute bottom-4 right-3 flex gap-2">
        <IconButton label="Back 5 seconds" onClick={() => onSeek(-5)}>
          <SkipBack size={17} />
        </IconButton>
        <IconButton label="Back 1 second" onClick={() => onSeek(-1)}>
          <StepBack size={17} />
        </IconButton>
        <IconButton label="Forward 1 second" onClick={() => onSeek(1)}>
          <StepForward size={17} />
        </IconButton>
        <IconButton label="Play from start" onClick={onRestart}>
          <RotateCcw size={17} />
        </IconButton>
        <button
          type="button"
          className="grid h-9 min-w-9 place-items-center rounded-md bg-black/55 px-2 text-xs font-semibold text-white shadow-sm backdrop-blur transition hover:bg-black/70"
          aria-label={slowMotion ? "Disable slow motion" : "Enable slow motion"}
          onClick={onToggleSlowMotion}
        >
          {slowMotion ? "0.5x" : "1x"}
        </button>
      </div>
    </fieldset>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="grid h-9 w-9 place-items-center rounded-md bg-black/55 text-white shadow-sm backdrop-blur transition hover:bg-black/70"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
