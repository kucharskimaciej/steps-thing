"use client";

type VideoProgressProps = {
  progress: number;
};

export function VideoProgress({ progress }: VideoProgressProps) {
  const value = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-1 bg-black/35"
      role="progressbar"
      aria-label="Video progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className="h-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.75)] transition-[width]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
