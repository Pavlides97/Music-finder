"use client";

import Link from "next/link";
import { BadgeCheck, CalendarDays, Clock, Euro, MapPin, Users, Flame, Music2 } from "lucide-react";
import type { Business, Gig, Musician } from "@/lib/data";
import { daysUntil } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { Photo } from "./ui/Photo";
import { Tilt } from "./ui/Tilt";
import { RatingBadge } from "./ui/Stars";

export function MusicianCard({ m, priority }: { m: Musician; priority?: boolean }) {
  const { t, L, price } = useI18n();
  return (
    <Tilt className="h-full rounded-2xl">
    <Link
      href={`/musicians/${m.slug}`}
      className="group elevated relative flex h-full flex-col overflow-hidden rounded-2xl border border-line transition duration-300 hover:border-line-strong"
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
          <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-fg backdrop-blur">{L(m.performer_type)}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="display flex items-center gap-1.5 text-xl font-bold leading-tight text-white">
            <span className="truncate">{m.name}</span>
            {m.verified ? <BadgeCheck className="h-5 w-5 shrink-0 text-violet-2" aria-label={t.common.verified} /> : null}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/70">{m.tagline ? L(m.tagline) : `${L(m.performer_type)} · ${L(m.location)}`}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {m.genres.slice(0, 3).map((g) => (
            <span key={g} className="chip">{L(g)}</span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-muted">
            <MapPin className="h-3.5 w-3.5" /> {L(m.location)}
          </span>
          <RatingBadge rating={m.rating} count={m.review_count} />
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          {price(m.price_from, m.price_to) ? (
            <>
              <span className="text-xs text-muted">{t.common.perEvent}</span>
              <span className="display text-lg font-bold text-fg">{price(m.price_from, m.price_to)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-muted">{t.common.priceOnRequest}</span>
          )}
        </div>
      </div>
    </Link>
    </Tilt>
  );
}

export function GigCard({ g, compact }: { g: Gig; compact?: boolean }) {
  const { t, L, d, budget, tr } = useI18n();
  const left = daysUntil(g.deadline);
  return (
    <Tilt className="h-full rounded-2xl" max={4}>
    <Link
      href={`/gigs/${g.id}`}
      className="group elevated flex h-full flex-col gap-4 rounded-2xl border border-line p-5 transition hover:border-flame/40"
    >
      <div className="flex items-start gap-3">
        <Photo src={g.business_logo} alt={g.business_name} w={160} className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-medium text-muted">
            {g.business_name}
            {g.business_verified ? <BadgeCheck className="h-3.5 w-3.5 text-violet-2" /> : null}
          </p>
          <h3 className="display mt-0.5 line-clamp-2 text-lg font-bold leading-snug text-fg group-hover:text-flame-2">{tr(g.title, g.title_el, g.title_ru)}</h3>
        </div>
        {g.urgent ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose/15 px-2 py-1 text-[11px] font-bold text-rose">
            <Flame className="h-3 w-3" /> {t.common.urgent}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-flame" /> {d(g.event_date)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-flame" /> {g.start_time}{g.end_time ? `–${g.end_time}` : ""}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-flame" /> {L(g.location)}</span>
        <span className="inline-flex items-center gap-1.5"><Music2 className="h-4 w-4 text-flame" /> {L(g.performer_type)}</span>
      </div>
      {!compact && <p className="line-clamp-2 text-sm text-muted">{tr(g.description, g.description_el, g.description_ru)}</p>}
      <div className="flex flex-wrap gap-1.5">
        {g.genres.slice(0, 3).map((x) => (
          <span key={x} className="chip">{L(x)}</span>
        ))}
        <span className="chip">{L(g.event_type)}</span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="inline-flex items-center gap-1 font-semibold text-lime">
          <Euro className="h-4 w-4" />
          {budget(g.budget_min, g.budget_max).replace(/€/g, "")}
        </span>
        <span className="text-xs text-muted">
          {t.common.daysLeft(left)} · <Users className="inline h-3 w-3" /> {g.applicant_count}
        </span>
      </div>
    </Link>
    </Tilt>
  );
}

export function VenueCard({ b }: { b: Business }) {
  const { t, L, tr } = useI18n();
  return (
    <Tilt className="h-full rounded-2xl">
    <Link href={`/venues/${b.slug}`} className="group elevated block h-full overflow-hidden rounded-2xl border border-line transition hover:border-line-strong">
      <div className="relative h-36">
        <Photo src={b.cover} alt={b.name} w={700} label="" className="absolute inset-0" imgClassName="transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        {b.open_gigs ? (
          <span className="absolute right-3 top-3 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">
            {t.cards.openGigs(b.open_gigs)}
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
            {L(b.category)} · {L(b.location)}
          </p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="line-clamp-2 text-sm text-muted">{tr(b.description, b.description_el, b.description_ru)}</p>
        <div className="flex flex-wrap gap-1.5">
          {b.music_wanted.slice(0, 3).map((g) => (
            <span key={g} className="chip">{L(g)}</span>
          ))}
        </div>
      </div>
    </Link>
    </Tilt>
  );
}
