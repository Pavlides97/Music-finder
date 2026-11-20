"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Globe, Link2, Music, Plus, SquarePlay, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { COUNTRIES, LOCATIONS } from "@/lib/constants";
import type { CompletionItem } from "@/lib/completion";
import { cn } from "@/lib/utils";

/** Card section with an anchor id the completion meter can jump to. */
export function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="card scroll-mt-28 space-y-6 p-5 sm:p-7">
      <h2 className="display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function Field({ label, children, hint, id, required, counter }: { label: string; children: React.ReactNode; hint?: string; id?: string; required?: boolean; counter?: string }) {
  return (
    <label id={id} className="block scroll-mt-28">
      <span className="label flex items-center justify-between gap-2">
        <span>
          {label}
          {required && <span className="ml-1 text-flame" aria-hidden>*</span>}
        </span>
        {counter && <span className="font-normal normal-case tracking-normal text-dim">{counter}</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Big two-button Yes/No switch backed by a hidden radio group. */
export function YesNo({ name, label, defaultValue, yes, no, id }: { name: string; label: string; defaultValue: boolean; yes: string; no: string; id?: string }) {
  const [on, setOn] = useState(defaultValue);
  return (
    <fieldset id={id} className="scroll-mt-28">
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          [true, yes],
          [false, no],
        ].map(([val, text]) => (
          <label
            key={String(val)}
            className={cn(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition",
              on === val ? (val ? "border-lime/60 bg-lime/10 text-fg" : "border-line-strong bg-white/[0.06] text-fg") : "border-line text-muted hover:border-line-strong",
            )}
          >
            <input type="radio" name={name} value={val ? "1" : "0"} checked={on === val} onChange={() => setOn(val as boolean)} className="sr-only" />
            <span className={cn("grid h-5 w-5 place-items-center rounded-full border", on === val ? (val ? "border-lime bg-lime text-ink" : "border-fg bg-fg text-ink") : "border-line-strong")}>
              {on === val && <Check className="h-3 w-3" />}
            </span>
            {text as string}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Single choice shown as chips (radio). */
export function ChoiceChips({ name, label, options, defaultValue, id, required }: { name: string; label: string; options: readonly string[]; defaultValue?: string; id?: string; required?: boolean }) {
  const { L } = useI18n();
  const [sel, setSel] = useState(defaultValue ?? "");
  return (
    <fieldset id={id} className="scroll-mt-28">
      <legend className="label">
        {label}
        {required && <span className="ml-1 text-flame" aria-hidden>*</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className={cn("chip min-h-10 cursor-pointer select-none px-4 text-sm transition", sel === o && "border-flame/60 bg-flame/15 text-fg")}>
            <input type="radio" name={name} value={o} checked={sel === o} onChange={() => setSel(o)} className="sr-only" />
            {L(o)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Country + city. Cyprus → pick from the city list, elsewhere type the city. */
export function LocationFields({ country, city, id }: { country?: string; city?: string; id?: string }) {
  const { t, L } = useI18n();
  const [c, setC] = useState(country || "Cyprus");
  const cyprus = c === "Cyprus";
  return (
    <div id={id} className="grid scroll-mt-28 grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t.pf.country} required>
        <select name="country" value={c} onChange={(e) => setC(e.target.value)} className="input">
          {COUNTRIES.map((x) => (
            <option key={x} value={x}>
              {L(x)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.pf.city} required>
        {cyprus ? (
          <select name="city" defaultValue={LOCATIONS.includes(city as never) ? city : ""} className="input" required>
            <option value="" disabled>
              {t.pf.cityPh}
            </option>
            {LOCATIONS.map((x) => (
              <option key={x} value={x}>
                {L(x)}
              </option>
            ))}
          </select>
        ) : (
          <input name="city_text" defaultValue={LOCATIONS.includes(city as never) ? "" : city} className="input" placeholder={t.pf.cityPh} required />
        )}
      </Field>
    </div>
  );
}

const linkIcon = (u: string) => (/youtu/.test(u) ? SquarePlay : /spotify|soundcloud|apple|deezer|bandcamp/.test(u) ? Music : /^https?:\/\//.test(u) ? Globe : Link2);

/** Editable list of URLs (YouTube, Spotify, SoundCloud, Instagram, website…). */
export function LinksField({ defaultValue, id }: { defaultValue: string[]; id?: string }) {
  const { t } = useI18n();
  const [items, setItems] = useState<string[]>(defaultValue.length ? defaultValue : [""]);
  return (
    <div id={id} className="scroll-mt-28">
      <span className="label">
        {t.pf.links} <span className="normal-case tracking-normal text-dim">({t.pf.optional})</span>
      </span>
      <p className="-mt-1 mb-3 text-xs text-muted">{t.pf.linksHint}</p>
      <div className="space-y-2">
        {items.map((v, i) => {
          const Icon = linkIcon(v);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
                <input
                  name="links"
                  type="url"
                  inputMode="url"
                  value={v}
                  onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={t.pf.linkPh}
                  className="input pl-10"
                  aria-label={`${t.pf.links} ${i + 1}`}
                />
              </div>
              {(items.length > 1 || v) && (
                <button type="button" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [""])} className="btn-quiet h-11 w-11 shrink-0 p-0" aria-label={t.pf.removeLink}>
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {items.length < 6 && (
        <button type="button" onClick={() => setItems([...items, ""])} className="btn-ghost btn-sm mt-3 min-h-9">
          <Plus className="h-4 w-4" /> {t.pf.addLink}
        </button>
      )}
    </div>
  );
}

/** Ring + list of missing items, each a jump link to its field. */
export function CompletionMeter({ items, labels, compact, href }: { items: CompletionItem[]; labels: Record<string, string>; compact?: boolean; href?: string }) {
  const { t } = useI18n();
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  const missing = items.filter((i) => !i.done);
  const ring = (
    <div
      className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${pct === 100 ? "#c6f432" : "#ff7a1a"} ${pct}%, rgb(255 255 255 / 0.08) ${pct}% 100%)` }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t.pf.completeTitle(pct)}
    >
      <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-surface">
        <span className="display text-lg font-extrabold">{pct}%</span>
      </div>
    </div>
  );
  return (
    <div className={cn("glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5", pct === 100 && "border-lime/30")}>
      {ring}
      <div className="min-w-0 flex-1">
        <p className="font-bold">{pct === 100 ? t.pf.complete100 : t.pf.completeTitle(pct)}</p>
        {pct < 100 && (
          <>
            {!compact && <p className="mt-0.5 text-sm text-muted">{t.pf.completeHint}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missing.map((m) => (
                <a key={m.key} href={`${href ?? ""}#pf-${m.key}`} className="chip min-h-8 border-flame/30 text-flame hover:bg-flame/10">
                  <Plus className="h-3 w-3" /> {labels[m.key] ?? m.key}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
      {compact && pct < 100 && (
        <Link href={href ?? "/dashboard/profile"} className="btn-primary btn-sm min-h-9 self-start sm:self-center">
          {t.pf.finish}
        </Link>
      )}
    </div>
  );
}
