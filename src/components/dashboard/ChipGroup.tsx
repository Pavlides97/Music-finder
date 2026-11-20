"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export function ChipGroup({ name, options, defaultValue = [], label, tone = "violet" }: { name: string; options: readonly string[]; defaultValue?: string[]; label: string; tone?: "violet" | "flame" }) {
  const [sel, setSel] = useState<string[]>(defaultValue);
  const { L } = useI18n();
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = sel.includes(o);
          return (
            <label
              key={o}
              className={cn(
                "chip cursor-pointer select-none px-3 py-1.5 text-sm transition",
                on && (tone === "violet" ? "border-violet/50 bg-violet/15 text-fg" : "border-flame/50 bg-flame/15 text-fg"),
              )}
            >
              <input type="checkbox" name={name} value={o} className="sr-only" checked={on} onChange={() => setSel(on ? sel.filter((x) => x !== o) : [...sel, o])} />
              {L(o)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
