import Link from "next/link";
import { BadgeCheck, CalendarDays, Clock, Euro, MapPin, Users, Flame, Music2 } from "lucide-react";
import type { Business, Gig, Musician } from "@/lib/data";
import { budgetRange, daysUntil, fmtDate, priceRange } from "@/lib/utils";
import { Photo } from "./ui/Photo";
import { RatingBadge } from "./ui/Stars";

export function MusicianCard({ m, priority }: { m: Musician; priority?: boolean }) {
  return (
    <Link
      href={`/musicians/${m.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_20px_60px_-20px_rgb(255_122_26/0.35)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Photo
          src={m.avatar}
          alt={m.name}
          w={priority ? 900 : 700}
          className="absolute inset-0 h-full w-full"
          imgClassName="transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-fg backdrop-blur">{m.performer_type}</span>
          {m.featured ? <span className="rounded-full bg-flame px-2.5 py-1 text-[11px] font-bold text-ink">Featured</span> : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="display flex items-center gap-1.5 text-xl font-bold leading-tight text-white">
            <span className="truncate">{m.name}</span>
            {m.verified ? <BadgeCheck className="h-5 w-5 shrink-0 text-violet-2" aria-label="Verified" /> : null}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/70">{m.tagline}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {m.genres.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-muted">
            <MapPin className="h-3.5 w-3.5" /> {m.location}
          </span>
          <RatingBadge rating={m.rating} count={m.review_count} />
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          {priceRange(m.price_from, m.price_to) ? (
            <>
              <span className="text-xs text-muted">Per event</span>
              <span className="display text-lg font-bold text-fg">{priceRange(m.price_from, m.price_to)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-muted">Price on request</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function GigCard({ g, compact }: { g: Gig; compact?: boolean }) {
  const left = daysUntil(g.deadline);
  return (
    <Link
      href={`/gigs/${g.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:border-flame/40 hover:bg-surface-2"
    >
      <div className="flex items-start gap-3">
        <Photo src={g.business_logo} alt={g.business_name} w={160} className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-medium text-muted">
            {g.business_name}
            {g.business_verified ? <BadgeCheck className="h-3.5 w-3.5 text-violet-2" /> : null}
          </p>
          <h3 className="display mt-0.5 line-clamp-2 text-lg font-bold leading-snug text-fg group-hover:text-flame-2">{g.title}</h3>
        </div>
        {g.urgent ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose/15 px-2 py-1 text-[11px] font-bold text-rose">
            <Flame className="h-3 w-3" /> Urgent
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-flame" /> {fmtDate(g.event_date)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-flame" /> {g.start_time}{g.end_time ? `–${g.end_time}` : ""}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-flame" /> {g.location}</span>
        <span className="inline-flex items-center gap-1.5"><Music2 className="h-4 w-4 text-flame" /> {g.performer_type}</span>
      </div>
      {!compact && <p className="line-clamp-2 text-sm text-muted">{g.description}</p>}
      <div className="flex flex-wrap gap-1.5">
        {g.genres.slice(0, 3).map((x) => (
          <span key={x} className="chip">{x}</span>
        ))}
        <span className="chip">{g.event_type}</span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="inline-flex items-center gap-1 font-semibold text-lime">
          <Euro className="h-4 w-4" />
          {budgetRange(g.budget_min, g.budget_max).replace(/€/g, "")}
        </span>
        <span className="text-xs text-muted">
          {left <= 0 ? "Closes today" : `${left} day${left === 1 ? "" : "s"} left`} · <Users className="inline h-3 w-3" /> {g.applicant_count}
        </span>
      </div>
    </Link>
  );
}

export function VenueCard({ b }: { b: Business }) {
  return (
    <Link href={`/venues/${b.slug}`} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-1 hover:border-line-strong">
      <div className="relative h-36">
        <Photo src={b.cover} alt={b.name} w={700} label="" className="absolute inset-0" imgClassName="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        {b.open_gigs ? (
          <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">
            {b.open_gigs} open gig{b.open_gigs > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
      <div className="relative -mt-8 flex items-end gap-3 px-4">
        <Photo src={b.logo} alt={b.name} w={160} className="h-14 w-14 shrink-0 rounded-xl ring-4 ring-surface" />
        <div className="min-w-0 pb-1">
          <h3 className="flex items-center gap-1 truncate font-bold text-fg">
            {b.name} {b.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-violet-2" /> : null}
          </h3>
          <p className="text-xs text-muted">
            {b.category} · {b.location}
          </p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="line-clamp-2 text-sm text-muted">{b.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {b.music_wanted.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
