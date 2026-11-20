"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={t.stars.outOf(value)}>
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
  const { t } = useI18n();
  if (!count) return <span className={cn("text-xs font-medium text-lime", className)}>{t.common.newOnSite}</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-3.5 w-3.5 fill-flame text-flame" />
      <span className="font-semibold text-fg">{rating.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}
