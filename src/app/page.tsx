import Link from "next/link";
import { ArrowRight, CalendarCheck, Headphones, MessageCircle, Mic2, Search, Sparkles, Store, UserRoundPlus, Wallet } from "lucide-react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HeroScene } from "@/components/three/HeroScene";
import { GigCard, MusicianCard } from "@/components/cards";
import { Tilt } from "@/components/ui/Tilt";
import { featuredMusicians, genreCounts, platformStats, upcomingGigs } from "@/lib/data";
import { CATEGORY_TILES } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { t, L } = await getI18n();
  const featured = featuredMusicians(8);
  const gigs = upcomingGigs(3);
  const stats = platformStats();
  const counts = Object.fromEntries(genreCounts().map((g) => [g.genre, g.n]));

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-48 -top-32 h-[560px] w-[560px] rounded-full bg-flame/15 blur-[140px]" />
          <div className="absolute -right-40 top-24 h-[560px] w-[560px] rounded-full bg-violet/20 blur-[140px]" />
          <div className="perspective-grid absolute inset-x-[-20%] bottom-0 h-[55%] opacity-60" />
        </div>

        <div className="container-x grid items-center gap-6 pb-12 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-16">
          <div className="relative z-10 order-2 lg:order-1">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime" /> {t.home.badge(stats.musicians, stats.openGigs)}
            </span>
            <h1 className="display mt-6 text-[clamp(2.75rem,7.5vw,5.75rem)] font-extrabold leading-[0.95]">
              {t.home.title1}
              <br />
              {t.home.title2} <span className="text-gradient">{t.home.title3}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">{t.home.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/musicians" className="btn-primary btn-lg">
                <Headphones className="h-5 w-5" /> {t.common.findMusicians}
              </Link>
              <Link href="/gigs" className="btn-ghost btn-lg">
                <Mic2 className="h-5 w-5" /> {t.common.findGigs}
              </Link>
            </div>
            <Link href="/match" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-flame-2 hover:text-flame">
              <Sparkles className="h-4 w-4" /> {t.home.matchCta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
          <HeroScene className="relative order-1 mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:order-2 lg:max-w-[560px]" />
        </div>

        <div className="container-x relative z-10 pb-20">
          <HeroSearch />
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="container-x py-20">
        <SectionHead eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} href="/musicians" cta={t.home.allMusicians} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((m, i) => (
            <MusicianCard key={m.id} m={m} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ---------------- GENRES ---------------- */}
      <section className="container-x pb-20">
        <SectionHead eyebrow={t.home.genresEyebrow} title={t.home.genresTitle} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORY_TILES.map((c) => (
            <Tilt key={c.genre} className="rounded-2xl" max={10}>
              <Link href={`/musicians?genre=${encodeURIComponent(c.genre)}`} className="elevated group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-line p-4 sm:p-5">
                <span
                  className="orb h-12 w-12 shrink-0 transition duration-500 group-hover:scale-110 sm:h-14 sm:w-14"
                  style={{ "--orb-a": `hsl(${c.hue} 85% 60%)`, "--orb-b": `hsl(${(c.hue + 35) % 360} 70% 30%)`, "--orb-glow": `hsl(${c.hue} 90% 55% / .35)` } as React.CSSProperties}
                />
                <span className="min-w-0">
                  <span className="display block truncate text-lg font-bold">{L(c.genre)}</span>
                  <span className="hidden truncate text-xs text-muted sm:block">{(t.genreBlurb as Record<string, string>)[c.genre] ?? ""}</span>
                  <span className="block text-xs font-semibold text-flame">{t.common.artists(counts[c.genre] ?? 0)}</span>
                </span>
              </Link>
            </Tilt>
          ))}
        </div>
      </section>

      {/* ---------------- GIGS ---------------- */}
      <section className="container-x pb-20">
        <SectionHead eyebrow={t.home.gigsEyebrow} title={t.home.gigsTitle} href="/gigs" cta={t.home.allGigs} />
        <div className="grid gap-6 md:grid-cols-3">
          {gigs.map((g) => (
            <GigCard key={g.id} g={g} compact />
          ))}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="container-x scroll-mt-20 pb-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">{t.home.howEyebrow}</p>
          <h2 className="display mt-3 text-4xl font-extrabold sm:text-5xl">{t.home.howTitle}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <HowColumn
            tone="flame"
            icon={<Store className="h-6 w-6" />}
            title={t.home.forVenues}
            steps={[
              [Search, t.home.v1t, t.home.v1d],
              [MessageCircle, t.home.v2t, t.home.v2d],
              [CalendarCheck, t.home.v3t, t.home.v3d],
            ]}
            cta={{ href: "/signup?role=business", label: t.home.createVenue }}
          />
          <HowColumn
            tone="violet"
            icon={<Mic2 className="h-6 w-6" />}
            title={t.home.forMusicians}
            steps={[
              [UserRoundPlus, t.home.m1t, t.home.m1d],
              [Sparkles, t.home.m2t, t.home.m2d],
              [Wallet, t.home.m3t, t.home.m3d],
            ]}
            cta={{ href: "/signup?role=musician", label: t.home.createArtist }}
          />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-x">
        <div className="relative isolate overflow-hidden rounded-3xl border border-line-strong px-8 py-14 text-center sm:px-14 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_0%_0%,rgb(255_122_26/0.35),transparent_60%),radial-gradient(80%_120%_at_100%_100%,rgb(139_92_246/0.4),transparent_60%),#10121c]" />
          <div className="perspective-grid absolute inset-x-0 bottom-0 -z-10 h-2/3 opacity-50" />
          <h2 className="display mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t.home.ctaText}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup?role=musician" className="btn-primary btn-lg">
              {t.home.imMusician} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/signup?role=business" className="btn-ghost btn-lg">
              {t.home.imBooking} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:inline-flex">
          {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function HowColumn({
  tone,
  icon,
  title,
  steps,
  cta,
}: {
  tone: "flame" | "violet";
  icon: React.ReactNode;
  title: string;
  steps: [typeof Search, string, string][];
  cta: { href: string; label: string };
}) {
  const accent = tone === "flame" ? "text-flame bg-flame/10 ring-flame/20" : "text-violet-2 bg-violet/15 ring-violet/25";
  return (
    <div className="card relative overflow-hidden p-7 sm:p-9">
      <div className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl ${tone === "flame" ? "bg-flame/15" : "bg-violet/20"}`} />
      <div className="relative">
        <div className="flex items-center gap-4">
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${accent}`}>{icon}</span>
          <h3 className="display text-2xl font-bold">{title}</h3>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map(([Icon, t, d], i) => (
            <li key={t} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${tone === "flame" ? "text-flame" : "text-violet-2"}`} />
                <span className="display text-sm font-bold text-dim">0{i + 1}</span>
              </div>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <Link href={cta.href} className={`mt-8 ${tone === "flame" ? "btn-primary" : "btn-violet"}`}>
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
