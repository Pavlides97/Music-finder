import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CircleCheck,
  Headphones,
  MessageCircle,
  Mic2,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRoundPlus,
  Wallet,
} from "lucide-react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { GigCard, MusicianCard, VenueCard } from "@/components/cards";
import { Photo } from "@/components/ui/Photo";
import { Equalizer } from "@/components/ui/Equalizer";
import { featuredMusicians, genreCounts, listBusinesses, platformStats, upcomingGigs } from "@/lib/data";
import { CATEGORY_TILES, LOCATIONS } from "@/lib/constants";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const featured = featuredMusicians(8);
  const gigs = upcomingGigs(6);
  const venues = listBusinesses().slice(0, 4);
  const stats = platformStats();
  const counts = Object.fromEntries(genreCounts().map((g) => [g.genre, g.n]));
  const byLocation = Object.fromEntries(
    (db().prepare("SELECT location, COUNT(*) n FROM musicians GROUP BY location").all() as { location: string; n: number }[]).map((r) => [r.location, r.n]),
  );
  const heroShots = featured.slice(0, 3);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="grain relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Photo src="photo-1501386761578-eac5c94b800a" alt="Live concert" label="" w={1800} className="absolute inset-0 opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-night/60 via-night/80 to-night" />
          <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-flame/25 blur-[120px]" />
          <div className="absolute -right-40 top-40 h-[520px] w-[520px] rounded-full bg-violet/30 blur-[120px]" />
        </div>

        <div className="container-x grid items-center gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink/50 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur">
              <Equalizer className="h-3 text-lime" /> {stats.openGigs} gigs open right now across Cyprus
            </span>
            <h1 className="display mt-6 text-[clamp(2.75rem,8vw,6rem)] font-extrabold leading-[0.95]">
              Where Cyprus <br className="hidden sm:block" />
              finds its <span className="text-gradient">sound.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">Discover musicians. Find gigs. Create unforgettable experiences.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/musicians" className="btn-primary btn-lg">
                <Headphones className="h-5 w-5" /> Find Musicians
              </Link>
              <Link href="/gigs" className="btn-ghost btn-lg">
                <Mic2 className="h-5 w-5" /> Find Gigs
              </Link>
            </div>
          </div>

          {/* Collage */}
          <div className="relative hidden h-[460px] lg:block" aria-hidden>
            {heroShots[0] && (
              <div className="floaty absolute right-0 top-0 w-64 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-2xl">
                <Photo src={heroShots[0].avatar} alt={heroShots[0].name} className="h-72" w={600} />
                <div className="p-3">
                  <p className="text-sm font-bold">{heroShots[0].name}</p>
                  <p className="text-xs text-muted">{heroShots[0].genres.slice(0, 2).join(" · ")} · {heroShots[0].location}</p>
                </div>
              </div>
            )}
            {heroShots[1] && (
              <div className="floaty absolute left-0 top-24 w-56 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-2xl" style={{ animationDelay: "-2s" }}>
                <Photo src={heroShots[1].avatar} alt={heroShots[1].name} className="h-56" w={600} />
                <div className="p-3">
                  <p className="text-sm font-bold">{heroShots[1].name}</p>
                  <p className="text-xs text-muted">{heroShots[1].performer_type} · {heroShots[1].location}</p>
                </div>
              </div>
            )}
            <div className="floaty absolute bottom-2 right-10 w-72 rounded-2xl border border-line-strong bg-surface-2/95 p-4 shadow-2xl backdrop-blur" style={{ animationDelay: "-4s" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-lime/15 text-lime">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Booking confirmed</p>
                  <p className="text-xs text-muted">Jazz duo · Limassol Old Port · €380</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-x -mt-6 pb-16 sm:pb-20">
          <HeroSearch />
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [stats.musicians, "Artists & bands"],
              [stats.venues, "Venues & organisers"],
              [stats.openGigs, "Open gigs"],
              [Object.keys(byLocation).length, "Cities & regions"],
            ].map(([n, l]) => (
              <div key={String(l)}>
                <dt className="display text-3xl font-extrabold">{n}</dt>
                <dd className="text-sm text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="overflow-hidden border-y border-line bg-surface/50 py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {["Weddings in Paphos", "Jazz in Limassol", "Sunset DJs in Ayia Napa", "Bouzouki nights in Nicosia", "Festivals in Larnaca", "Pool parties in Protaras", "Tavernas in Troodos", "Corporate galas"].map((t) => (
                <span key={t} className="display flex items-center gap-10 text-lg font-bold text-dim">
                  {t} <Sparkles className="h-4 w-4 text-flame" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- FEATURED ---------------- */}
      <section className="container-x pt-20">
        <SectionHead eyebrow="Featured talent" title="The island's most-booked performers" href="/musicians" cta="Browse all musicians" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((m, i) => (
            <MusicianCard key={m.id} m={m} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="container-x pt-24">
        <SectionHead eyebrow="Popular categories" title="Find the right sound for every moment" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.genre}
              href={`/musicians?genre=${encodeURIComponent(c.genre)}`}
              className="group relative overflow-hidden rounded-2xl border border-line"
            >
              <Photo src={c.image} alt={c.label} label="" w={700} className="h-44 w-full sm:h-60" imgClassName="transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="display text-lg font-bold text-white sm:text-xl">{c.label}</p>
                <p className="hidden text-sm text-white/70 sm:block">{c.blurb}</p>
                <p className="mt-1 text-xs font-semibold text-flame">{counts[c.genre] ?? 0} artists →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- GIGS ---------------- */}
      <section className="relative mt-24 border-y border-line bg-surface/40 py-20">
        <div className="container-x">
          <SectionHead eyebrow="Gig marketplace" title="Upcoming events & open opportunities" href="/gigs" cta="See all gigs" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((g) => (
              <GigCard key={g.id} g={g} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="container-x scroll-mt-20 pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 className="display mt-3 text-4xl font-extrabold sm:text-5xl">One platform. Both sides of the stage.</h2>
          <p className="mt-4 text-muted">Whether you&apos;re filling a terrace on a Friday night or filling your calendar for the summer, SoundCY makes it simple.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <HowColumn
            tone="flame"
            icon={<Store className="h-6 w-6" />}
            title="For venues & organisers"
            subtitle="Restaurants, hotels, bars, clubs, wedding planners, festivals"
            steps={[
              [Search, "Search & shortlist", "Filter by location, genre, budget and date. Listen to samples, read reviews, save favourites."],
              [MessageCircle, "Request & negotiate", "Send a booking request with your date and offer. Chat directly and agree a price in minutes."],
              [CalendarCheck, "Confirm & enjoy", "Confirmed bookings land in your dashboard. Or post a gig and let musicians come to you."],
            ]}
            cta={{ href: "/signup?role=business", label: "Create a venue profile" }}
          />
          <HowColumn
            tone="violet"
            icon={<Mic2 className="h-6 w-6" />}
            title="For musicians & performers"
            subtitle="Singers, bands, DJs, instrumentalists, orchestras"
            steps={[
              [UserRoundPlus, "Build your profile", "Photos, audio samples, videos, rates and availability — a professional EPK in 10 minutes."],
              [Sparkles, "Get discovered & apply", "Venues find you in search. Browse open gigs island-wide and apply with one click."],
              [Wallet, "Get booked", "Accept requests, counter-offer, manage your calendar and collect reviews that win more work."],
            ]}
            cta={{ href: "/signup?role=musician", label: "Create an artist profile" }}
          />
        </div>
      </section>

      {/* ---------------- LOCATIONS + VENUES ---------------- */}
      <section className="container-x pt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Across the island</p>
            <h2 className="display mt-3 text-4xl font-extrabold">From Paphos to Protaras</h2>
            <p className="mt-4 text-muted">Local talent in every corner of Cyprus. Search near your venue to save on travel and set-up.</p>
            <div className="mt-8 grid grid-cols-2 gap-2">
              {LOCATIONS.filter((l) => l !== "Island-wide" && l !== "Kyrenia").map((l) => (
                <Link key={l} href={`/musicians?location=${encodeURIComponent(l)}`} className="group flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-flame/50">
                  <span className="text-sm font-semibold">{l}</span>
                  <span className="text-xs text-muted group-hover:text-flame">{byLocation[l] ?? 0} →</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-6 flex items-end justify-between">
              <h3 className="display text-2xl font-bold">Venues booking now</h3>
              <Link href="/venues" className="text-sm font-semibold text-flame hover:underline">All venues</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {venues.map((b) => (
                <VenueCard key={b.id} b={b} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST + CTA ---------------- */}
      <section className="container-x pt-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [BadgeCheck, "Verified profiles", "Artists and venues are reviewed by our Cyprus team before getting the verified badge."],
            [ShieldCheck, "Reviews you can trust", "Only businesses with a completed booking can leave a review."],
            [CircleCheck, "Free to join", "Create a profile, search and message for free. No booking fees during launch."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof BadgeCheck;
            return (
              <div key={t as string} className="card p-6">
                <I className="h-6 w-6 text-lime" />
                <h3 className="mt-4 font-bold">{t as string}</h3>
                <p className="mt-1 text-sm text-muted">{d as string}</p>
              </div>
            );
          })}
        </div>

        <div className="grain relative mt-16 overflow-hidden rounded-3xl bg-brand p-10 text-ink sm:p-14">
          <div className="relative z-10 max-w-2xl">
            <h2 className="display text-4xl font-extrabold leading-tight sm:text-5xl">Ready to make some noise?</h2>
            <p className="mt-4 text-lg text-ink/80">Join the musicians, venues and planners building Cyprus&apos;s live music scene.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?role=musician" className="btn btn-lg bg-ink text-fg hover:bg-ink/85">
                I&apos;m a musician <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/signup?role=business" className="btn btn-lg bg-white/90 text-ink hover:bg-white">
                I&apos;m booking music <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <Equalizer bars={7} className="absolute -right-4 bottom-0 hidden h-64 w-64 gap-3 text-ink/15 sm:flex [&>span]:w-6" />
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-fg hover:text-flame">
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
  subtitle,
  steps,
  cta,
}: {
  tone: "flame" | "violet";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  steps: [typeof Search, string, string][];
  cta: { href: string; label: string };
}) {
  const accent = tone === "flame" ? "text-flame bg-flame/10" : "text-violet-2 bg-violet/15";
  return (
    <div className="card relative overflow-hidden p-7 sm:p-9">
      <div className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl ${tone === "flame" ? "bg-flame/15" : "bg-violet/20"}`} />
      <div className="relative">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}>{icon}</span>
        <h3 className="display mt-5 text-2xl font-bold">{title}</h3>
        <p className="text-sm text-muted">{subtitle}</p>
        <ol className="mt-8 space-y-6">
          {steps.map(([Icon, t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">
                  <span className="mr-2 text-dim">0{i + 1}</span>
                  {t}
                </p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
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
