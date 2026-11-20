"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Briefcase,
  Castle,
  Check,
  Globe,
  Heart,
  Hotel,
  Landmark,
  Martini,
  Mountain,
  PartyPopper,
  Sailboat,
  Sparkles,
  Sun,
  Tent,
  TreePalm,
  UtensilsCrossed,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn, isoDate } from "@/lib/utils";

const EVENTS = [
  ["Weddings", Heart],
  ["Restaurants", UtensilsCrossed],
  ["Corporate events", Briefcase],
  ["Private parties", PartyPopper],
  ["Festivals", Tent],
  ["Nightlife", Martini],
  ["Hotels & resorts", Hotel],
  ["Christenings", Baby],
] as const;

const CITIES = [
  ["Nicosia", Landmark],
  ["Limassol", Sailboat],
  ["Larnaca", Sun],
  ["Paphos", Castle],
  ["Ayia Napa", TreePalm],
  ["Protaras", TreePalm],
  ["Troodos", Mountain],
  ["Island-wide", Globe],
] as const;

const GENRE_HUES: [string, number][] = [
  ["Laiko", 24],
  ["Entexno", 330],
  ["Pop", 290],
  ["Retro", 40],
  ["Rock", 355],
  ["Palio Laiko", 15],
  ["Rebetiko", 260],
  ["Paradosiako", 160],
  ["Jazz", 200],
];

const BUDGETS = [300, 500, 800, 1200, 2000];

export type WizardInit = { event?: string; city?: string; genres: string[]; budget?: number; date?: string };

export function MatchWizard({ init }: { init: WizardInit }) {
  const { t, L } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<WizardInit>(init);
  const TOTAL = 4;

  const submit = (ans = a) => {
    const p = new URLSearchParams();
    if (ans.event) p.set("event", ans.event);
    if (ans.city) p.set("city", ans.city);
    if (ans.genres.length) p.set("genres", ans.genres.join(","));
    if (ans.budget) p.set("budget", String(ans.budget));
    if (ans.date) p.set("date", ans.date);
    p.set("go", "1");
    router.push(`/match?${p.toString()}`, { scroll: true });
  };

  const pickAndNext = (patch: Partial<WizardInit>) => {
    setA((x) => ({ ...x, ...patch }));
    setStep((s) => Math.min(TOTAL - 1, s + 1));
  };

  const Tile = ({ active, onClick, icon, label, hue }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string; hue?: number }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "elevated group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 sm:p-5",
        active ? "border-flame bg-flame/10 shadow-[0_20px_40px_-20px_rgb(255_122_26/0.6)]" : "border-line hover:border-line-strong",
      )}
    >
      {hue != null ? (
        <span
          className="orb h-10 w-10 shrink-0"
          style={{ "--orb-a": `hsl(${hue} 85% 60%)`, "--orb-b": `hsl(${(hue + 35) % 360} 70% 30%)`, "--orb-glow": `hsl(${hue} 90% 55% / .3)` } as React.CSSProperties}
        />
      ) : (
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl transition", active ? "bg-flame text-ink" : "bg-white/[0.06] text-flame")}>{icon}</span>
      )}
      <span className="font-semibold">{label}</span>
      {active && <Check className="absolute right-3 top-3 h-4 w-4 text-flame" />}
    </button>
  );

  return (
    <div className="glass mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t.match.step(step + 1, TOTAL)}</p>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-brand" : "bg-white/10")} />
          ))}
        </div>
      </div>

      <div key={step} className="animate-[stepIn_.35s_ease-out]">
        {step === 0 && (
          <>
            <h2 className="display text-2xl font-bold sm:text-3xl">{t.match.q1}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {EVENTS.map(([v, Icon]) => (
                <Tile key={v} active={a.event === v} onClick={() => pickAndNext({ event: v })} icon={<Icon className="h-5 w-5" />} label={L(v)} />
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="display text-2xl font-bold sm:text-3xl">{t.match.q2}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CITIES.map(([v, Icon]) => (
                <Tile key={v} active={a.city === v} onClick={() => pickAndNext({ city: v })} icon={<Icon className="h-5 w-5" />} label={v === "Island-wide" ? t.match.anywhere : L(v)} />
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="display text-2xl font-bold sm:text-3xl">{t.match.q3}</h2>
            <p className="mt-1 text-sm text-muted">{t.match.q3hint}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {GENRE_HUES.map(([g, hue]) => {
                const on = a.genres.includes(g);
                return <Tile key={g} active={on} hue={hue} label={L(g)} onClick={() => setA((x) => ({ ...x, genres: on ? x.genres.filter((y) => y !== g) : [...x.genres, g] }))} />;
              })}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="display text-2xl font-bold sm:text-3xl">{t.match.q4}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="label">{t.match.dateOptional}</span>
                <input type="date" min={isoDate(new Date())} value={a.date ?? ""} onChange={(e) => setA((x) => ({ ...x, date: e.target.value || undefined }))} className="input [color-scheme:dark]" />
              </label>
              <div>
                <span className="label">{t.match.budgetLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button key={b} type="button" onClick={() => setA((x) => ({ ...x, budget: b }))} aria-pressed={a.budget === b} className={cn("chip px-3.5 py-2 text-sm", a.budget === b && "border-flame/60 bg-flame/15 text-fg")}>
                      €{b.toLocaleString()}
                    </button>
                  ))}
                  <button type="button" onClick={() => setA((x) => ({ ...x, budget: undefined }))} aria-pressed={!a.budget} className={cn("chip px-3.5 py-2 text-sm", !a.budget && "border-flame/60 bg-flame/15 text-fg")}>
                    {t.match.noLimit}
                  </button>
                </div>
                <input
                  type="range"
                  min={150}
                  max={3000}
                  step={50}
                  value={a.budget ?? 3000}
                  onChange={(e) => setA((x) => ({ ...x, budget: Number(e.target.value) >= 3000 ? undefined : Number(e.target.value) }))}
                  className="mt-4 w-full accent-[#ff7a1a]"
                  aria-label={t.match.budgetLabel}
                />
                <p className="mt-1 text-right text-sm font-semibold text-flame">{a.budget ? `≤ €${a.budget.toLocaleString()}` : t.match.noLimit}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-quiet disabled:invisible">
          <ArrowLeft className="h-4 w-4" /> {t.match.back}
        </button>
        {step < TOTAL - 1 ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-quiet">{t.match.skip}</button>
            {step === 2 && (
              <button type="button" onClick={() => setStep(3)} className="btn-primary">
                {t.match.next} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => submit()} className="btn-primary btn-lg">
            <Sparkles className="h-5 w-5" /> {t.match.showMatches}
          </button>
        )}
      </div>
    </div>
  );
}
