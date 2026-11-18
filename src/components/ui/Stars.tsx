import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? "fill-flame text-flame" : "fill-transparent text-dim"}
        />
      ))}
    </span>
  );
}

export function RatingBadge({ rating, count, className }: { rating: number; count: number; className?: string }) {
  if (!count) return <span className={cn("text-xs font-medium text-lime", className)}>New on SoundCY</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-3.5 w-3.5 fill-flame text-flame" />
      <span className="font-semibold text-fg">{rating.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}
