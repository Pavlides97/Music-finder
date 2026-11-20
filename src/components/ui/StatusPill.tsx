"use client";

import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  countered: "bg-violet/15 text-violet-2 ring-violet/30",
  confirmed: "bg-lime/10 text-lime ring-lime/25",
  completed: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
  declined: "bg-rose/10 text-rose ring-rose/25",
  cancelled: "bg-white/5 text-dim ring-white/10",
  shortlisted: "bg-violet/15 text-violet-2 ring-violet/30",
  accepted: "bg-lime/10 text-lime ring-lime/25",
  withdrawn: "bg-white/5 text-dim ring-white/10",
  open: "bg-lime/10 text-lime ring-lime/25",
  closed: "bg-white/5 text-dim ring-white/10",
  filled: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const { t } = useI18n();
  const label = (t.status as Record<string, string>)[status] ?? status;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STYLES[status] ?? STYLES.cancelled, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
