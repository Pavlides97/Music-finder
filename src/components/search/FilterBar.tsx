"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterDef =
  | { name: string; label: string; type: "select"; options: readonly (string | { value: string; label: string })[]; placeholder: string }
  | { name: string; label: string; type: "date"; min?: string };

export function FilterBar({
  filters,
  sorts,
  searchPlaceholder,
  total,
  noun,
}: {
  filters: FilterDef[];
  sorts: { value: string; label: string }[];
  searchPlaceholder: string;
  total: number;
  noun: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    start(() => router.replace(`${pathname}${p.size ? "?" + p.toString() : ""}`, { scroll: false }));
  };
  const active = filters.filter((f) => params.get(f.name));
  const clearAll = () => {
    setQ("");
    start(() => router.replace(pathname, { scroll: false }));
  };

  const controls = (
    <>
      {filters.map((f) => (
        <label key={f.name} className="block">
          <span className="label">{f.label}</span>
          {f.type === "select" ? (
            <select className="input" value={params.get(f.name) ?? ""} onChange={(e) => update(f.name, e.target.value)}>
              <option value="">{f.placeholder}</option>
              {f.options.map((o) => {
                const v = typeof o === "string" ? { value: o, label: o } : o;
                return (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input type="date" min={f.min} className="input [color-scheme:dark]" value={params.get(f.name) ?? ""} onChange={(e) => update(f.name, e.target.value)} />
          )}
        </label>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            update("q", q.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input className="input rounded-full py-3 pl-11 pr-24" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label="Search" />
          <button className="btn-primary btn-sm absolute right-1.5 top-1/2 -translate-y-1/2">Search</button>
        </form>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="btn-ghost lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters {active.length ? <span className="rounded-full bg-flame px-1.5 text-[10px] text-ink">{active.length}</span> : null}
          </button>
          <select className="input w-auto rounded-full" value={params.get("sort") ?? ""} onChange={(e) => update("sort", e.target.value)} aria-label="Sort">
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass hidden grid-cols-2 gap-3 rounded-2xl p-4 lg:grid lg:grid-cols-6">{controls}</div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {pending ? <Loader2 className="h-4 w-4 animate-spin text-flame" /> : null}
        <span>
          <strong className="text-fg">{total}</strong> {noun}
          {total === 1 ? "" : "s"}
        </span>
        {params.get("q") && (
          <button onClick={() => { setQ(""); update("q", ""); }} className="chip hover:text-fg">
            “{params.get("q")}” <X className="h-3 w-3" />
          </button>
        )}
        {active.map((f) => (
          <button key={f.name} onClick={() => update(f.name, "")} className="chip border-flame/30 text-flame hover:text-fg">
            {f.name === "budget" ? `Max €${params.get(f.name)}` : f.name === "date" ? `Free on ${params.get(f.name)}` : params.get(f.name)} <X className="h-3 w-3" />
          </button>
        ))}
        {(active.length > 0 || params.get("q")) && (
          <button onClick={clearAll} className="text-xs font-semibold text-muted underline-offset-2 hover:text-fg hover:underline">
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-line-strong bg-surface p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="display text-xl font-bold">Filters</h3>
              <button onClick={() => setOpen(false)} className="btn-quiet" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">{controls}</div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={clearAll} className="btn-ghost">Clear</button>
              <button onClick={() => setOpen(false)} className={cn("btn-primary")}>Show {total} results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
