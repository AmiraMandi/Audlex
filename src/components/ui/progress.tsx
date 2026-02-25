import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "brand" | "green" | "amber" | "red" | "orange";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const colors = {
  brand: "bg-brand-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
};

const trackSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  color = "brand",
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-tertiary overflow-hidden", trackSizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
