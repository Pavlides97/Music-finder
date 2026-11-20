import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Circle, MapPin, PlusCircle, Search } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import {
  applicationsForGig,
  applicationsForMusician,
  bookingsFor,
  gigsForBusiness,
  savedMusicians,
  searchGigs,
  searchMusicians,
  type Booking,
  type Musician,
} from "@/lib/data";
import { isoDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import type { I18n } from "@/lib/i18n";
import { Empty, PageHead, Panel, Stat } from "@/components/dashboard/ui";
import { BookingCard } from "@/components/messages/Chat";
import { GigCard, MusicianCard } from "@/components/cards";
import { Photo } from "@/components/ui/Photo";
import { StatusPill } from "@/components/ui/StatusPill";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.meta, robots: { index: false } };
}

export default async function DashboardHome() {
  const v = await requireViewer();
  const i18n = await getI18n();
  const { t, d, eur } = i18n;
  const bookings = bookingsFor(v.role, v.profileId);
  const today = isoDate(new Date());
  const needs = bookings.filter((b) => (b.status === "pending" || b.status === "countered") && b.last_action_by !== v.role);
  const waiting = bookings.filter((b) => (b.status === "pending" || b.status === "countered") && b.last_action_by === v.role);
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.event_date >= today);
  const solo = v.role === "musician" && ["Solo artist", "Singer", "Instrumentalist"].includes(v.musician.performer_type);
  const first = solo && !/^(the|dj)\b/i.test(v.user.name) ? v.user.name.split(" ")[0] : v.user.name;

  if (v.role === "musician") {
    const m = v.musician;
    const apps = applicationsForMusician(m.id).filter((a) => a.status !== "withdrawn");
    const recommended = m.genres.length
      ? [...new Map(m.genres.flatMap((g) => searchGigs({ genre: g }, 4)).map((g) => [g.id, g])).values()].slice(0, 4)
      : searchGigs({}, 4);
    const earnings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.price, 0);
    const checklist = profileChecklist(m, t);
    const done = checklist.filter((c) => c.done).length;

    return (
      <div className="space-y-6">
        <PageHead title={t.dash.helloMusician(first)} subtitle={t.dash.musicianSub} action={<Link href="/gigs" className="btn-primary"><Search className="h-4 w-4" /> {t.dash.findGigs}</Link>} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={t.dash.needsReply} value={needs.length} tone="flame" hint={t.dash.needsReplyHintM} />
          <Stat label={t.dash.upcomingGigs} value={upcoming.length} tone="lime" hint={upcoming[0] ? t.dash.next(d(upcoming[0].event_date)) : t.dash.nothingBooked} />
          <Stat label={t.dash.activeApps} value={apps.filter((a) => a.status === "pending" || a.status === "shortlisted").length} tone="violet" />
          <Stat label={t.dash.bookedValue} value={eur(earnings)} tone="sky" hint={m.review_count ? t.dash.ratingHint(m.rating.toFixed(1), m.review_count) : t.dash.noReviews} />
        </div>

        {done < checklist.length && (
          <Panel title={t.dash.complete(Math.round((done / checklist.length) * 100))} href="/dashboard/profile" cta={t.profile.editProfile} viewAll={t.common.viewAll}>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(done / checklist.length) * 100}%` }} />
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {checklist.map((c) => (
                <li key={c.label} className={`flex items-center gap-2 text-sm ${c.done ? "text-muted line-through" : ""}`}>
                  {c.done ? <CheckCircle2 className="h-4 w-4 text-lime" /> : <Circle className="h-4 w-4 text-dim" />} {c.label}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title={t.dash.needsResponse} href="/dashboard/bookings" viewAll={t.common.viewAll}>
          {needs.length ? (
            <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1">{needs.map((b) => <BookingCard key={b.id} b={b} role="musician" />)}</div>
          ) : (
            <Empty>{t.dash.caughtUp} {waiting.length ? t.dash.waitingOnVenue(waiting.length) : ""}</Empty>
          )}
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={t.dash.upcomingPerformances} href="/dashboard/bookings" viewAll={t.common.viewAll}>
            <BookingList items={upcoming.slice(0, 5)} role="musician" empty={t.dash.noConfirmedGigs} i18n={i18n} />
          </Panel>
          <Panel title={t.dash.myApplications} href="/dashboard/applications" viewAll={t.common.viewAll}>
            {apps.length ? (
              <ul className="divide-y divide-line">
                {apps.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/gigs/${a.gig_id}`} className="block truncate text-sm font-semibold hover:text-flame">{a.gig_title}</Link>
                      <p className="text-xs text-muted">{a.business_name} · {d(a.gig_date)}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>{t.dash.noApplications} <Link href="/gigs" className="text-flame">{t.dash.browseGigs}</Link></Empty>
            )}
          </Panel>
        </div>

        <section>
          <h2 className="mb-4 font-bold">{t.dash.matchingGigs}</h2>
          <div className="grid gap-4 md:grid-cols-2">{recommended.map((g) => <GigCard key={g.id} g={g} compact />)}</div>
        </section>
      </div>
    );
  }

  /* ---------- Business ---------- */
  const b = v.business;
  const gigs = gigsForBusiness(b.id);
  const openGigs = gigs.filter((g) => g.status === "open" && g.deadline >= today);
  const applicants = openGigs.flatMap((g) => applicationsForGig(g.id)).filter((a) => a.status === "pending" || a.status === "shortlisted");
  const saved = savedMusicians(b.id);
  const recs: Musician[] = [...new Map((b.music_wanted.length ? b.music_wanted : [""]).flatMap((g) => searchMusicians({ genre: g || undefined, location: b.location }, 4)).map((m) => [m.id, m])).values()].slice(0, 4);
  const recommended = recs.length >= 2 ? recs : searchMusicians({ genre: b.music_wanted[0] }, 4);

  return (
    <div className="space-y-6">
      <PageHead
        title={t.dash.helloVenue(first)}
        subtitle={`${i18n.L(b.category)} · ${i18n.L(b.location)}`}
        action={<Link href="/dashboard/gigs/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> {t.dash.postGig}</Link>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.dash.needsReply} value={needs.length} tone="flame" hint={t.dash.needsReplyHintB} />
        <Stat label={t.dash.upcomingEvents} value={upcoming.length} tone="lime" hint={upcoming[0] ? t.dash.next(d(upcoming[0].event_date)) : t.dash.nothingConfirmed} />
        <Stat label={t.dash.openGigs} value={openGigs.length} tone="violet" hint={t.dash.toReview(applicants.length)} />
        <Stat label={t.dash.savedMusicians} value={saved.length} tone="sky" />
      </div>

      <Panel title={t.dash.needsResponse} href="/dashboard/bookings" viewAll={t.common.viewAll}>
        {needs.length ? (
          <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1">{needs.map((x) => <BookingCard key={x.id} b={x} role="business" />)}</div>
        ) : (
          <Empty>{t.dash.caughtUp} {waiting.length ? t.dash.waitingOnMusician(waiting.length) : ""}</Empty>
        )}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={t.dash.confirmedEvents} href="/dashboard/bookings" viewAll={t.common.viewAll}>
          <BookingList items={upcoming.slice(0, 5)} role="business" empty={t.dash.noConfirmedEvents} i18n={i18n} />
        </Panel>
        <Panel title={t.dash.newApplicants} href="/dashboard/gigs" viewAll={t.common.viewAll}>
          {applicants.length ? (
            <ul className="divide-y divide-line">
              {applicants.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Photo src={a.musician_avatar} alt={a.musician_name} w={100} className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/musicians/${a.musician_slug}`} className="block truncate text-sm font-semibold hover:text-flame">{a.musician_name}</Link>
                    <p className="truncate text-xs text-muted">{a.gig_title}</p>
                  </div>
                  <span className="text-sm font-semibold">{eur(a.quote)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{t.dash.noApplicants} <Link href="/dashboard/gigs/new" className="text-flame">{t.dash.postGig}</Link> {t.dash.toAttract}</Empty>
          )}
        </Panel>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">{t.dash.recommendedFor(b.name)}</h2>
          <Link href={`/musicians?location=${encodeURIComponent(b.location)}`} className="text-xs font-semibold text-flame hover:underline">{t.dash.searchMusicians}</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{recommended.map((m) => <MusicianCard key={m.id} m={m} />)}</div>
      </section>
    </div>
  );
}

function BookingList({ items, role, empty, i18n }: { items: Booking[]; role: "musician" | "business"; empty: string; i18n: I18n }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-line">
      {items.map((b) => {
        const d = new Date(b.event_date + "T12:00:00");
        return (
          <li key={b.id} className="flex items-center gap-4 py-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-center leading-none">
              <span className="text-[10px] font-bold uppercase text-flame">{i18n.d(b.event_date, { month: "short" })}</span>
              <span className="display text-lg font-bold">{d.getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{role === "musician" ? b.business_name : b.musician_name}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <CalendarDays className="h-3 w-3" /> {b.start_time} · <MapPin className="h-3 w-3" /> {b.venue}
              </p>
            </div>
            <span className="text-sm font-semibold text-lime">{i18n.eur(b.price)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function profileChecklist(m: Musician, t: I18n["t"]) {
  return [
    { label: t.dash.check.photo, done: !!m.avatar },
    { label: t.dash.check.cover, done: !!m.cover },
    { label: t.dash.check.bio, done: m.bio.length >= 100 },
    { label: t.dash.check.genres, done: m.genres.length > 0 && m.event_types.length > 0 },
    { label: t.dash.check.audio, done: m.tracks.length > 0 },
    { label: t.dash.check.photos, done: m.photos.length > 0 },
    { label: t.dash.check.performances, done: m.performances.length > 0 },
    { label: t.dash.check.video, done: m.videos.length > 0 },
  ];
}
