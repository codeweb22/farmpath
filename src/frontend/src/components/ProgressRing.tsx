import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** Completion percentage, 0–100. */
  value: number;
  /** Diameter in pixels. */
  size?: number;
  /** Stroke width in pixels. */
  strokeWidth?: number;
  /** Optional label rendered inside the ring. */
  label?: string;
  /** Optional caption rendered under the label. */
  caption?: string;
  className?: string;
}

/**
 * Circular progress indicator used for journey and crop completion. The ring
 * fills with the lime accent over a translucent track.
 */
export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 9,
  label,
  caption,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-current opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? (
          <span className="numeral font-display text-xl leading-none font-semibold">
            {label}
          </span>
        ) : null}
        {caption ? (
          <span className="mt-0.5 text-[0.65rem] font-medium tracking-wide text-primary-foreground/70 uppercase">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}
