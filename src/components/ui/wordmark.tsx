import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  size?: number;
  showWord?: boolean;
  className?: string;
  color?: string;
};

/**
 * Aularo wordmark — original mark + serif name.
 * Inherits currentColor.
 */
export function Wordmark({
  size = 22,
  showWord = true,
  className,
  color,
}: WordmarkProps) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap: Math.round(size * 0.42), color: color ?? undefined }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 1000 1000"
        fill="currentColor"
        className="shrink-0"
        aria-hidden
      >
        <path d="M243.26,310.85l355.46-.47c17.78,1.82,25.85,10.76,24.02,28.82-40.05,104.52-75.94,211.42-118.47,315-10.84,26.41-20.37,48.28-50.83,56.37-117.53,3.77-236.84,3.83-354.32-.02-21.32-5.34-31.14-27.21-24.38-47.75l118.9-313.03c9.74-19.9,27.69-34.52,49.63-38.93Z" />
        <path d="M330.65,274.71c9.16-32.46,26.5-58.77,62.95-62.12,45.27-4.16,103.96-.19,150.75-.1,55.47.11,111.9.94,167.68,1.69,22.24.3,53.59-5.45,64.15,19.75,4.78,11.42,3.9,19.47.83,31.11l-121.58,325.89c-6.45,17.79-29.54,38.02-48.99,38.02h-49.72c-.58,0-2.36-2.02-3.89-1.57-.51-.7,2.47-8.22,3.09-10.11,28.74-86.52,73.56-174.53,99.51-260.95,6.74-22.44,7.04-45.29-9.4-63.72-6.68-7.48-26.72-17.9-36.48-17.9h-278.89Z" />
        <path d="M517.09,712.86c8.69-12.56,10.19-35.75,23.76-43.83,14.09-8.39,47.98-3.1,65.64-4.28,41.69-2.78,65.2-23.19,81.12-60.27,41.11-95.75,71.28-199.43,110.98-296.09,3.81-7.55,11.06-13.25,19.51-14.67,10.62-1.78,36.52-1.29,47.86-.43,21.02,1.58,32.66,15.41,30.29,36.65l-126.13,339.97c-8.03,21.28-36.83,42.95-59.6,42.95h-193.44Z" />
      </svg>
      {showWord && (
        <span
          className="font-serif"
          style={{
            fontSize: size - 2,
            letterSpacing: "-0.02em",
            fontWeight: 500,
            lineHeight: 1,
            fontVariationSettings: "'opsz' 48",
          }}
        >
          {SITE_NAME}
        </span>
      )}
    </span>
  );
}
