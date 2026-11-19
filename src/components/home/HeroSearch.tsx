"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, MapPin, Music, PartyPopper, Search } from "lucide-react";
import { EVENT_TYPES, GENRES, LOCATIONS } from "@/lib/constants";
import { cn, isoDate } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<"musicians" | "gigs">("musicians");
  const [f, setF] = useState({ location: "", genre: "", event: "", date: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v && !(mode === "gigs" && k === "date")) p.set(k, v);
    });
    router.push(`/${mode}${p.size ? "?" + p.toString() : ""}`);
  }

  const field = "flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04] focus-within:bg-white/[0.06]";
  const sel = "w-full min-w-0 appearance-none bg-transparent text-sm font-medium text-fg outline-none [&>option]:bg-surface-2";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="glass mb-3 inline-flex rounded-full p-1">
        {(["musicians", "gigs"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn("rounded-full px-4 py-1.5 text-xs font-semibold transition", mode === m ? "bg-fg text-ink" : "text-muted hover:text-fg")}
          >
            {m === "musicians" ? "Search musicians" : "Search gigs"}
          </button>
        ))}
      </div>
      <form
        onSubmit={submit}
        className="glass grid gap-1 rounded-3xl p-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      >
        <label className={field}>
          <MapPin className="h-4 w-4 shrink-0 text-flame" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dim">Location</span>
            <select className={sel} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })}>
              <option value="">All of Cyprus</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </span>
        </label>
        <label className={field}>
          <Music className="h-4 w-4 shrink-0 text-flame" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dim">Genre</span>
            <select className={sel} value={f.genre} onChange={(e) => setF({ ...f, genre: e.target.value })}>
              <option value="">Any genre</option>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </span>
        </label>
        <label className={field}>
          <PartyPopper className="h-4 w-4 shrink-0 text-flame" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dim">Event type</span>
            <select className={sel} value={f.event} onChange={(e) => setF({ ...f, event: e.target.value })}>
              <option value="">Any event</option>
              {EVENT_TYPES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </span>
        </label>
        <label className={cn(field, mode === "gigs" && "opacity-40")}>
          <CalendarDays className="h-4 w-4 shrink-0 text-flame" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dim">{mode === "gigs" ? "Any date" : "Available on"}</span>
            <input
              type="date"
              disabled={mode === "gigs"}
              min={isoDate(new Date())}
              className={cn(sel, "[color-scheme:dark]", !f.date && "text-dim")}
              value={f.date}
              onChange={(e) => setF({ ...f, date: e.target.value })}
            />
          </span>
        </label>
        <button type="submit" className="btn-primary btn-lg rounded-xl sm:col-span-2 lg:col-span-1">
          <Search className="h-5 w-5" /> Search
        </button>
      </form>
    </div>
  );
}
