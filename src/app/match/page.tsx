import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Info, MapPin, MessageSquareText, RotateCcw, Sparkles, TriangleAlert, X } from "lucide-react";
import { matchMusicians, type MatchReason } from "@/lib/match";
import { getI18n } from "@/lib/i18n/server";
import type { I18n } from "@/lib/i18n";
import { MatchWizard } from "@/components/match/MatchWizard";
import { DescribeEvent } from "@/components/match/DescribeEvent";
import { aiAvailable } from "@/lib/eventAI";
import { Photo } from "@/components/ui/Photo";
import { Tilt } from "@/components/ui/Tilt";
import { EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.match.meta, description: t.match.metaDesc };
}

type SP = Promise<Record<string, string | undefined>>;

export default async function MatchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const i18n = await getI18n();
  const { t, L, d, eur, price } = i18n;

  // Only accept known values from the URL.
  const init = {
    event: EVENT_TYPES.includes(sp.event as never) ? sp.event : undefined,
    city: LOCATIONS.includes(sp.city as never) ? sp.city : undefined,
    genres: (sp.genres ?? "").split(",").filter((g) => GENRES.includes(g as never)),
    budget: Number(sp.budget) > 0 ? Math.round(Number(sp.budget)) : undefined,
    date: sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined,
    type: PERFORMER_TYPES.includes(sp.type as never) ? sp.type : undefined,
  };
  const fromAI = sp.ai === "1";
  const showResults = sp.go === "1";
  const results = showResults ? matchMusicians(init, 6) : [];

  // Each chip knows how to remove itself (link to the same search without it).
  const without = (key: string, genre?: string) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    if (genre) {
      const rest = init.genres.filter((g) => g !== genre);
      if (rest.length) p.set("genres", rest.join(","));
      else p.delete("genres");
    } else p.delete(key);
    return `/match?${p.toString()}`;
  };
  const chips = [
    init.event && { key: "event", label: L(init.event), href: without("event") },
    init.type && { key: "type", label: L(init.type), href: without("type") },
    init.city && { key: "city", label: init.city === "Island-wide" ? t.match.anywhere : L(init.city), href: without("city") },
    ...init.genres.map((g) => ({ key: `g-${g}`, label: L(g), href: without("genres", g) })),
    init.date && { key: "date", label: d(init.date), href: without("date") },
    init.budget && { key: "budget", label: `≤ ${eur(init.budget)}`, href: without("budget") },
  ].filter(Boolean) as { key: string; label: string; href: string }[];

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-40 -top-20 h-[480px] w-[480px] rounded-full bg-flame/15 blur-[130px]" />
        <div className="absolute -right-40 top-40 h-[480px] w-[480px] rounded-full bg-violet/20 blur-[130px]" />
      </div>

      <div className="container-x py-10 sm:py-16">
        {!showResults ? (
          <>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="eyebrow inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t.match.eyebrow}</p>
              <h1 className="display mt-3 text-4xl font-extrabold sm:text-6xl">{t.match.title}</h1>
              <p className="mt-4 text-lg text-muted">{t.match.intro}</p>
            </div>
            <DescribeEvent available={aiAvailable()} />
            <div className="mx-auto my-8 flex max-w-3xl items-center gap-4 text-xs font-semibold uppercase tracking-wider text-dim" aria-hidden>
              <span className="h-px flex-1 bg-line" /> {t.ai.or} <span className="h-px flex-1 bg-line" />
            </div>
            <div id="quick-questions" className="scroll-mt-24">
              <MatchWizard init={init} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t.match.resultsEyebrow}</p>
                <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">{t.match.resultsTitle(results.length)}</h1>
                {chips.length > 0 && (
                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      {fromAI ? <><MessageSquareText className="h-4 w-4 text-flame" aria-hidden /> <strong className="text-fg">{t.ai.understood}</strong> · {t.ai.fromText}</> : <>{t.match.summary}:</>}
                    </p>
                    <ul className="mt-2 flex flex-wrap items-center gap-2">
                      {chips.map((c) => (
                        <li key={c.key} className="chip border-flame/30 py-0.5 pl-3 pr-1 text-sm text-fg">
                          {c.label}
                          <Link href={c.href} scroll={false} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-fg" aria-label={t.ai.remove(c.label)}>
                            <X className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {fromAI && <p className="mt-2 text-xs text-dim">{t.ai.edit}</p>}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/match?${new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "go") as [string, string][])}`} className="btn-ghost">
                  {t.match.edit}
                </Link>
                <Link href="/match" className="btn-quiet"><RotateCcw className="h-4 w-4" /> {t.match.startOver}</Link>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <Tilt key={r.m.id} className="h-full rounded-3xl" max={5}>
                  <article className={cn("elevated relative flex h-full flex-col overflow-hidden rounded-3xl border p-5", i === 0 ? "border-flame/50" : "border-line")}>
                    {i === 0 && <span className="absolute right-4 top-4 rounded-full bg-flame px-3 py-1 text-xs font-bold text-ink">{t.match.best}</span>}
                    <div className="flex items-center gap-4">
                      <ScoreRing value={r.score} label={t.match.matchPct(r.score)} />
                      <div className="min-w-0">
                        <h2 className="display truncate text-xl font-bold">
                          <Link href={`/musicians/${r.m.slug}`} className="hover:text-flame">{r.m.name}</Link>
                        </h2>
                        <p className="truncate text-sm text-muted">{r.m.tagline ? L(r.m.tagline) : L(r.m.performer_type)}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3 text-flame" /> {L(r.m.location)}</p>
                      </div>
                    </div>
                    <Photo src={r.m.avatar} alt={r.m.name} w={600} className="mt-5 h-36 rounded-2xl" />
                    <ul className="mt-5 space-y-2 text-sm">
                      {r.busy && (
                        <li className="flex items-start gap-2 text-rose"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {r.m.available ? t.match.busy : t.pf.unavailableBadge}</li>
                      )}
                      {r.overBudget && (
                        <li className="flex items-start gap-2 text-amber-300"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {t.match.over}</li>
                      )}
                      {r.reasons.map((reason, k) => (
                        <li key={k} className="flex items-start gap-2 text-fg/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {reasonText(reason, i18n)}</li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="text-sm font-semibold">{price(r.m.price_from, r.m.price_to) ?? t.common.priceOnRequest}</span>
                      <Link href={`/musicians/${r.m.slug}`} className="btn-primary btn-sm">
                        <CalendarCheck className="h-4 w-4" /> {t.match.book}
                      </Link>
                    </div>
                  </article>
                </Tilt>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-5 text-sm text-muted sm:flex-row sm:items-center">
              <p className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-flame" /> <span><strong className="text-fg">{t.match.how}:</strong> {t.match.howText}{fromAI && <> {t.ai.powered}</>}</span></p>
              <Link href="/musicians" className="btn-ghost btn-sm shrink-0">{t.match.seeAll} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function reasonText(r: MatchReason, { t, L, d }: I18n) {
  switch (r.k) {
    case "genres":
      return t.match.r.genres(r.genres.map(L).join(", "));
    case "sameCity":
      return t.match.r.sameCity(L(r.city));
    case "nearCity":
      return t.match.r.nearCity(L(r.city), r.km);
    case "islandWide":
      return t.match.r.islandWide;
    case "inBudget":
      return t.match.r.inBudget;
    case "partBudget":
      return t.match.r.partBudget;
    case "onRequest":
      return t.match.r.onRequest;
    case "event":
      return t.match.r.event(L(r.event));
    case "free":
      return t.match.r.free(d(r.date));
    case "rated":
      return t.match.r.rated(r.rating.toFixed(1));
    case "type":
      return t.match.r.type(L(r.type));
  }
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(#ff7a1a 0%, #ff4d8d ${value / 2}%, #8b5cf6 ${value}%, rgb(255 255 255 / 0.08) ${value}% 100%)` }}
      role="img"
      aria-label={label}
    >
      <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-surface">
        <span className="display text-lg font-extrabold leading-none">{value}<span className="text-[10px] text-muted">%</span></span>
      </div>
    </div>
  );
}
