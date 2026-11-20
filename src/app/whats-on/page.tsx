import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarHeart, Megaphone, Radio, SearchX } from "lucide-react";
import { EventCard } from "@/components/cards";
import { Reveal } from "@/components/ui/Reveal";
import { genreCounts, whatsOn, type WhatsOnEvent } from "@/lib/data";
import { GENRES, LOCATIONS } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import { cn, cyDate, weekdayOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.wo.meta, description: t.wo.metaDesc, alternates: { canonical: "/whats-on" } };
}

const CITIES = LOCATIONS.filter((l) => l !== "Island-wide");

/** Fri/Sat/Sun of the current or coming weekend, as YYYY-MM-DD. */
function weekendDates() {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = cyDate(i);
    const w = weekdayOf(day);
    if (w === 1 && i > 0) break;
    if (w === 5 || w === 6 || w === 0) out.push(day);
  }
  return out;
}

export default async function WhatsOnPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const city = CITIES.includes(sp.city as (typeof CITIES)[number]) ? sp.city : undefined;
  const genre = (GENRES as readonly string[]).includes(sp.genre ?? "") ? sp.genre : undefined;
  const { t, L, dLong } = await getI18n();

  const events = whatsOn({ city, genre });
  // Only offer genres that artists on the platform actually play (plus the selected one).
  const played = new Set(genreCounts().map((x) => x.genre));
  const genreOptions = GENRES.filter((x) => played.has(x) || x === genre);
  const today = cyDate(0);
  const tomorrow = cyDate(1);
  const weekend = weekendDates().filter((x) => x !== today && x !== tomorrow);
  const tonight = events.filter((e) => e.event_date === today);
  const groups: { key: string; title: string; items: WhatsOnEvent[] }[] = [
    { key: "tomorrow", title: t.wo.tomorrow, items: events.filter((e) => e.event_date === tomorrow) },
    { key: "weekend", title: t.wo.weekend, items: events.filter((e) => weekend.includes(e.event_date)) },
    { key: "later", title: t.wo.later, items: events.filter((e) => e.event_date > tomorrow && !weekend.includes(e.event_date)) },
  ].filter((g) => g.items.length);

  // Tonight per city (unfiltered by city) so the highlight can point to other towns.
  const tonightAll = city ? whatsOn({ genre, days: 0 }) : tonight;
  const byCity = Object.entries(
    tonightAll.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.city]: (acc[e.city] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  const href = (p: { city?: string; genre?: string }) => {
    const q = new URLSearchParams();
    if (p.city) q.set("city", p.city);
    if (p.genre) q.set("genre", p.genre);
    const s = q.toString();
    return s ? `/whats-on?${s}` : "/whats-on";
  };
  const filtered = Boolean(city || genre);

  // Structured data for search engines — only real, confirmed public shows.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.slice(0, 50).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MusicEvent",
        name: `${e.musician_name} — ${e.venue_name}`,
        startDate: `${e.event_date}T${e.start_time}`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: e.venue_name, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: "CY" }, url: `${SITE_URL}/venues/${e.venue_slug}` },
        performer: { "@type": "MusicGroup", name: e.musician_name, url: `${SITE_URL}/musicians/${e.musician_slug}` },
      },
    })),
  };

  return (
    <div className="container-x py-10 sm:py-14">
      {events.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}

      <header className="max-w-3xl">
        <p className="eyebrow">{t.wo.eyebrow}</p>
        <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">{t.wo.title}</h1>
        <p className="mt-3 text-muted">{t.wo.intro}</p>
      </header>

      {/* ---------- Filters ---------- */}
      <div className="mt-8 space-y-3">
        <FilterRow label={t.common.location}>
          <Pill href={href({ genre })} active={!city}>{t.wo.allCities}</Pill>
          {CITIES.map((c) => <Pill key={c} href={href({ city: c, genre })} active={city === c}>{L(c)}</Pill>)}
        </FilterRow>
        <FilterRow label={t.common.genre}>
          <Pill href={href({ city })} active={!genre}>{t.common.anyGenre}</Pill>
          {genreOptions.map((g) => <Pill key={g} href={href({ city, genre: g })} active={genre === g}>{L(g)}</Pill>)}
        </FilterRow>
      </div>

      {/* ---------- Tonight highlight ---------- */}
      <section aria-labelledby="tonight" className="relative isolate mt-10 overflow-hidden rounded-3xl border border-line-strong p-5 sm:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,rgb(255_122_26/0.28),transparent_60%),radial-gradient(70%_120%_at_100%_100%,rgb(139_92_246/0.32),transparent_60%),#10121c]" />
        <div className="perspective-grid absolute inset-x-0 bottom-0 -z-10 h-1/2 opacity-40" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-flame">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                {tonight.length > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame opacity-60 motion-reduce:animate-none" />}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-flame" />
              </span>
              {t.wo.tonight} · {dLong(today)}
            </p>
            <h2 id="tonight" className="display mt-2 text-3xl font-extrabold sm:text-4xl">
              {city ? t.wo.tonightIn(L(city)) : t.wo.tonightAll}
            </h2>
            <p className="mt-1 text-muted">{tonight.length ? t.wo.shows(tonight.length) : t.wo.nothingTonight}</p>
          </div>
          {byCity.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={t.wo.tonight}>
              {byCity.map(([c, n]) => (
                <li key={c}>
                  <Link href={href({ city: c, genre })} aria-current={c === city ? "page" : undefined} className={cn("chip min-h-9 px-3 text-sm hover:text-fg", c === city && "border-flame/60 text-fg")}>
                    <Radio className="h-3.5 w-3.5 text-flame" aria-hidden /> {L(c)} · {n}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {tonight.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tonight.map((e) => <EventCard key={e.id} e={e} showDate={false} />)}
          </div>
        )}
      </section>

      {/* ---------- Upcoming ---------- */}
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`wo-${g.key}`} className="mt-12">
          <h2 id={`wo-${g.key}`} className="display mb-4 flex items-baseline gap-3 text-2xl font-extrabold sm:text-3xl">
            {g.title} <span className="text-sm font-normal text-muted">{t.wo.shows(g.items.length)}</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {g.items.map((e, i) => (
              <Reveal key={e.id} delay={(i % 3) * 80} className="h-full">
                <EventCard e={e} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      {/* ---------- Empty states (never invent events) ---------- */}
      {events.length === 0 &&
        (filtered ? (
          <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-14 text-center">
            <SearchX className="h-10 w-10 text-dim" aria-hidden />
            <h2 className="display text-2xl font-bold">{t.wo.emptyFiltered}</h2>
            <Link href="/whats-on" className="btn-ghost mt-2">{t.dir.resetFilters}</Link>
          </div>
        ) : (
          <div className="card mt-10 flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-flame/30 bg-flame/10">
              <CalendarHeart className="h-8 w-8 text-flame" aria-hidden />
            </div>
            <h2 className="display text-2xl font-bold sm:text-3xl">{t.wo.emptyTitle}</h2>
            <p className="max-w-xl text-muted">{t.wo.emptyText}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/gigs/new" className="btn-primary"><Megaphone className="h-4 w-4" aria-hidden /> {t.dir.postGigFree}</Link>
              <Link href="/musicians" className="btn-ghost">{t.common.findMusicians} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </div>
        ))}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">{children}</ul>
    </nav>
  );
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex min-h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition",
          active ? "border-flame bg-flame text-ink" : "border-line bg-white/[0.04] text-muted hover:border-line-strong hover:text-fg",
        )}
      >
        {children}
      </Link>
    </li>
  );
}
