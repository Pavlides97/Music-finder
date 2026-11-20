import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Box,
  CalendarHeart,
  CircleDollarSign,
  Gift,
  Languages,
  Megaphone,
  MessageCircle,
  Mic2,
  Rocket,
  Sparkles,
  Star,
  Store,
  TriangleAlert,
} from "lucide-react";
import { aboutStats } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { Reveal } from "@/components/ui/Reveal";
import { Tilt } from "@/components/ui/Tilt";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.about.meta, description: t.about.metaDesc, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  const s = aboutStats();
  const a = t.about;

  const numbers: [string, number][] = [
    [a.nArtists, s.musicians],
    [a.nVenues, s.venues],
    [a.nCities, s.cities],
    [a.nGenres, s.genres],
    [a.nGigs, s.openGigs],
    [a.nLooking, s.lookingVenues],
    [a.nShows, s.upcomingShows],
    [a.nLangs, 3],
  ];

  const features = [
    [Sparkles, a.f1t, a.f1, "/match"],
    [Languages, a.f2t, a.f2, null],
    [CalendarHeart, a.f3t, a.f3, "/whats-on"],
    [MessageCircle, a.f4t, a.f4, null],
    [Box, a.f5t, a.f5, "/"],
    [Accessibility, a.f6t, a.f6, null],
  ] as const;

  const revenue = [
    [CircleDollarSign, a.b1t, a.b1],
    [Star, a.b2t, a.b2],
    [Store, a.b3t, a.b3],
    [Gift, a.b4t, a.b4],
  ] as const;

  const roadmap = [
    { title: a.now, tone: "lime", items: [a.r1, a.r2, a.r3] },
    { title: a.next, tone: "flame", items: [a.r4, a.r5] },
    { title: a.later, tone: "violet", items: [a.r6, a.r7, a.r8, a.r9] },
  ] as const;

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-40 -top-24 h-[520px] w-[520px] rounded-full bg-flame/15 blur-[140px]" />
        <div className="absolute -right-40 top-[40rem] h-[520px] w-[520px] rounded-full bg-violet/20 blur-[140px]" />
      </div>

      {/* ---------- Hero ---------- */}
      <header className="container-x pb-12 pt-12 sm:pt-20">
        <p className="eyebrow">{a.eyebrow}</p>
        <h1 className="display mt-3 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">{a.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{a.intro}</p>
      </header>

      {/* ---------- Problem / solution ---------- */}
      <section className="container-x grid grid-cols-1 gap-6 pb-16 lg:grid-cols-2" aria-label={`${a.problemTitle} · ${a.solutionTitle}`}>
        <Reveal className="h-full">
          <div className="card h-full p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold"><TriangleAlert className="h-5 w-5 text-amber-300" aria-hidden /> {a.problemTitle}</h2>
            <ol className="mt-5 space-y-4">
              {[a.p1, a.p2, a.p3].map((p, i) => (
                <li key={i} className="flex gap-3 text-muted">
                  <span className="display grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-sm font-bold text-fg">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <div className="relative isolate h-full overflow-hidden rounded-2xl border border-flame/30 p-6 sm:p-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_100%_0%,rgb(255_122_26/0.22),transparent_60%),radial-gradient(90%_120%_at_0%_100%,rgb(139_92_246/0.25),transparent_60%),#10121c]" />
            <h2 className="flex items-center gap-2 text-xl font-bold"><Rocket className="h-5 w-5 text-flame" aria-hidden /> {a.solutionTitle}</h2>
            <p className="mt-4 text-fg/90">{a.solution}</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HowList icon={<Store className="h-4 w-4" aria-hidden />} title={a.forVenues} items={[a.v1, a.v2, a.v3]} />
              <HowList icon={<Mic2 className="h-4 w-4" aria-hidden />} title={a.forArtists} items={[a.a1, a.a2, a.a3]} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Live numbers ---------- */}
      <section aria-labelledby="numbers" className="container-x pb-16">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="numbers" className="display text-3xl font-extrabold sm:text-4xl">{a.numbersTitle}</h2>
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="relative flex h-2 w-2" aria-hidden><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:animate-none" /><span className="relative inline-flex h-2 w-2 rounded-full bg-lime" /></span>
            {a.numbersNote}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {numbers.map(([label, value], i) => (
            <li key={label}>
              <Reveal delay={(i % 4) * 70} className="h-full">
                <Tilt className="h-full rounded-2xl" max={6}>
                  <p className="glass flex h-full flex-col rounded-2xl p-4 sm:p-5">
                    <span className="display text-gradient text-4xl font-extrabold tabular-nums sm:text-5xl">{value}</span>
                    <span className="mt-1 text-xs text-muted sm:text-sm">{label}</span>
                  </p>
                </Tilt>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Features ---------- */}
      <section aria-labelledby="features" className="container-x pb-16">
        <h2 id="features" className="display mb-6 text-3xl font-extrabold sm:text-4xl">{a.featuresTitle}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, text, href], i) => (
            <Reveal key={title} delay={(i % 3) * 80} className="h-full">
              <div className="card flex h-full flex-col p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-flame"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted">{text}</p>
                {href && (
                  <Link href={href} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-fg hover:text-flame" aria-label={`${title} →`}>
                    {t.common.view} <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Business model (plan) ---------- */}
      <section aria-labelledby="biz" className="container-x pb-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 id="biz" className="display text-3xl font-extrabold sm:text-4xl">{a.bizTitle}</h2>
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">{a.planBadge}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {revenue.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-dashed border-line-strong bg-white/[0.02] p-5">
              <Icon className="h-6 w-6 text-flame" aria-hidden />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Roadmap ---------- */}
      <section aria-labelledby="roadmap" className="container-x pb-16">
        <h2 id="roadmap" className="display mb-6 text-3xl font-extrabold sm:text-4xl">{a.roadmapTitle}</h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {roadmap.map((col, i) => (
            <li key={col.title}>
              <Reveal delay={i * 100} className="h-full">
                <div className={cn("card h-full border-t-4 p-5", col.tone === "lime" ? "border-t-lime" : col.tone === "flame" ? "border-t-flame" : "border-t-violet")}>
                  <h3 className="display text-xl font-bold">{col.title}</h3>
                  {col.tone !== "lime" && <p className="text-xs uppercase tracking-wider text-dim">{a.planned}</p>}
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {col.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-fg/85">
                        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", col.tone === "lime" ? "bg-lime" : col.tone === "flame" ? "bg-flame" : "bg-violet")} aria-hidden />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-x">
        <div className="relative isolate overflow-hidden rounded-3xl border border-line-strong px-6 py-12 text-center sm:px-14 sm:py-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_0%_0%,rgb(255_122_26/0.35),transparent_60%),radial-gradient(80%_120%_at_100%_100%,rgb(139_92_246/0.4),transparent_60%),#10121c]" />
          <div className="perspective-grid absolute inset-x-0 bottom-0 -z-10 h-2/3 opacity-50" />
          <h2 className="display mx-auto max-w-2xl text-3xl font-extrabold sm:text-5xl">{a.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted">{a.ctaText}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup?role=musician" className="btn-primary btn-lg">{t.home.imMusician} <ArrowRight className="h-5 w-5" aria-hidden /></Link>
            <Link href="/dashboard/gigs/new" className="btn-ghost btn-lg"><Megaphone className="h-5 w-5" aria-hidden /> {t.dir.postGigFree}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HowList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-line bg-ink/40 p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-flame">{icon} {title}</h3>
      <ol className="mt-3 space-y-2 text-sm text-fg/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="text-dim">{i + 1}.</span> {it}</li>
        ))}
      </ol>
    </div>
  );
}
