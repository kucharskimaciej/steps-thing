"use client";

import { useEffect, useMemo, useState } from "react";

type AspectAwareVideoProps = {
  children: React.ReactNode;
  width?: number;
  height?: number;
};

export function AspectAwareVideo({
  children,
  width,
  height,
}: AspectAwareVideoProps) {
  const [isPortraitClient, setIsPortraitClient] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia(
      "(orientation: portrait), (max-width: 700px)",
    );
    const update = () => setIsPortraitClient(query.matches);

    update();
    query.addEventListener?.("change", update);

    return () => query.removeEventListener?.("change", update);
  }, []);

  const rotate = useMemo(() => {
    if (!width || !height) {
      return false;
    }

    return isPortraitClient && width > height;
  }, [height, isPortraitClient, width]);

  return (
    <div
      data-testid="aspect-aware-video-frame"
      data-rotated={rotate ? "true" : "false"}
      className="grid h-full w-full place-items-center overflow-hidden"
    >
      <div
        className="grid max-h-full max-w-full place-items-center"
        style={
          rotate
            ? {
                aspectRatio: `${height} / ${width}`,
                height: "min(100vw, 100vh)",
                transform: "rotate(90deg)",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
