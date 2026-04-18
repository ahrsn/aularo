"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * FitBox — scales a fixed 1920×1080 canvas down to fit its container,
 * preserving aspect ratio. Use for builder previews so every slide
 * renderer can be authored at "display" dimensions and scaled as needed.
 *
 * For actual display playback, wrap with <FitBox fill /> which skips the
 * scale transform and fills the viewport.
 */
export function FitBox({
  children,
  fill = false,
  baseWidth = 1920,
  baseHeight = 1080,
}: {
  children: ReactNode;
  fill?: boolean;
  baseWidth?: number;
  baseHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (fill) return;
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const scaleX = rect.width / baseWidth;
      const scaleY = rect.height / baseHeight;
      setScale(Math.min(scaleX, scaleY));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill, baseWidth, baseHeight]);

  if (fill) {
    return <div className="h-screen w-screen overflow-hidden">{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ aspectRatio: `${baseWidth} / ${baseHeight}` }}
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
