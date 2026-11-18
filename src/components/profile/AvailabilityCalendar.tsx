"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toggleAvailabilityAction } from "@/app/actions";
import { cn, isoDate } from "@/lib/utils";

const WD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function AvailabilityCalendar({
  blocked: initialBlocked,
  booked,
  editable,
  onPick,
  selected,
  months = 1,
}: {
  blocked: string[];
  booked: string[];
  editable?: boolean;
  onPick?: (date: string) => void;
  selected?: string;
  months?: number;
}) {
  const [offset, setOffset] = useState(0);
  const [blocked, setBlocked] = useState(() => new Set(initialBlocked));
  const [, start] = useTransition();
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const today = isoDate(new Date());

  const click = (d: string) => {
    if (d < today || bookedSet.has(d)) return;
    if (editable) {
      const next = new Set(blocked);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      setBlocked(next);
      start(async () => {
        await toggleAvailabilityAction(d);
      });
    } else if (onPick && !blocked.has(d)) onPick(d);
  };

  const base = new Date();
  base.setDate(1);

  return (
    <div>
      <div className={cn("grid gap-6", months > 1 && "md:grid-cols-2")}>
        {Array.from({ length: months }).map((_, mi) => {
          const first = new Date(base.getFullYear(), base.getMonth() + offset + mi, 1);
          const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
          const lead = (first.getDay() + 6) % 7;
          return (
            <div key={mi}>
              <div className="mb-3 flex items-center justify-between">
                {mi === 0 ? (
                  <button type="button" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} className="btn-quiet h-8 w-8 p-0 disabled:opacity-30" aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : <span className="w-8" />}
                <p className="text-sm font-semibold">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                {mi === months - 1 ? (
                  <button type="button" onClick={() => setOffset((o) => Math.min(11, o + 1))} className="btn-quiet h-8 w-8 p-0" aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : <span className="w-8" />}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WD.map((w) => (
                  <span key={w} className="pb-1 text-[10px] font-semibold uppercase text-dim">{w}</span>
                ))}
                {Array.from({ length: lead }).map((_, i) => <span key={"l" + i} />)}
                {Array.from({ length: daysIn }).map((_, i) => {
                  const d = isoDate(new Date(first.getFullYear(), first.getMonth(), i + 1));
                  const past = d < today;
                  const isBooked = bookedSet.has(d);
                  const isBlocked = blocked.has(d);
                  const isSel = selected === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => click(d)}
                      disabled={past || isBooked || (!editable && !onPick)}
                      title={isBooked ? "Booked" : isBlocked ? "Unavailable" : past ? "" : "Available"}
                      className={cn(
                        "relative aspect-square rounded-lg text-xs font-medium transition",
                        past && "text-dim/50",
                        !past && !isBooked && !isBlocked && "bg-lime/[0.07] text-fg",
                        !past && !isBooked && !isBlocked && (editable || onPick) && "hover:bg-lime/20",
                        isBlocked && !past && "bg-white/[0.03] text-dim line-through",
                        isBlocked && editable && !past && "hover:bg-white/10",
                        isBooked && !past && "bg-violet/25 text-violet-2",
                        isSel && "!bg-flame !text-ink ring-2 ring-flame/40",
                        d === today && "ring-1 ring-flame/60",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-lime/40" /> Available</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-violet/50" /> Booked</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-white/10" /> Unavailable</span>
      </div>
    </div>
  );
}
