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
import { euro, fmtDate, isoDate } from "@/lib/utils";
import { Empty, PageHead, Panel, Stat } from "@/components/dashboard/ui";
import { BookingCard } from "@/components/messages/Chat";
import { GigCard, MusicianCard } from "@/components/cards";
import { Photo } from "@/components/ui/Photo";
import { StatusPill } from "@/components/ui/StatusPill";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardHome() {
  const v = await requireViewer();
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
    const checklist = profileChecklist(m);
    const done = checklist.filter((c) => c.done).length;

    return (
      <div className="space-y-6">
        <PageHead title={`Kalimera, ${first} 👋`} subtitle="Here's what's happening with your bookings." action={<Link href="/gigs" className="btn-primary"><Search className="h-4 w-4" /> Find gigs</Link>} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Needs your reply" value={needs.length} tone="flame" hint="Booking requests & offers" />
          <Stat label="Upcoming gigs" value={upcoming.length} tone="lime" hint={upcoming[0] ? `Next: ${fmtDate(upcoming[0].event_date)}` : "Nothing booked yet"} />
          <Stat label="Active applications" value={apps.filter((a) => a.status === "pending" || a.status === "shortlisted").length} tone="violet" />
          <Stat label="Booked value" value={euro(earnings)} tone="sky" hint={m.review_count ? `★ ${m.rating.toFixed(1)} from ${m.review_count} reviews` : "No reviews yet"} />
        </div>

        {done < checklist.length && (
          <Panel title={`Complete your profile — ${Math.round((done / checklist.length) * 100)}%`} href="/dashboard/profile" cta="Edit profile">
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

        <Panel title="Needs your response" href="/dashboard/bookings">
          {needs.length ? (
            <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1">{needs.map((b) => <BookingCard key={b.id} b={b} role="musician" />)}</div>
          ) : (
            <Empty>You&apos;re all caught up. {waiting.length ? `${waiting.length} offer(s) waiting on the venue.` : ""}</Empty>
          )}
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Upcoming performances" href="/dashboard/bookings">
            <BookingList items={upcoming.slice(0, 5)} role="musician" empty="No confirmed gigs yet — apply to open gigs to fill your calendar." />
          </Panel>
          <Panel title="My applications" href="/dashboard/applications">
            {apps.length ? (
              <ul className="divide-y divide-line">
                {apps.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/gigs/${a.gig_id}`} className="block truncate text-sm font-semibold hover:text-flame">{a.gig_title}</Link>
                      <p className="text-xs text-muted">{a.business_name} · {fmtDate(a.gig_date)}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No applications yet. <Link href="/gigs" className="text-flame">Browse gigs</Link></Empty>
            )}
          </Panel>
        </div>

        <section>
          <h2 className="mb-4 font-bold">Gigs that match your sound</h2>
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
        title={`Welcome back, ${first} 👋`}
        subtitle={`${b.category} · ${b.location}`}
        action={<Link href="/dashboard/gigs/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> Post a gig</Link>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Needs your reply" value={needs.length} tone="flame" hint="Counter-offers & requests" />
        <Stat label="Upcoming events" value={upcoming.length} tone="lime" hint={upcoming[0] ? `Next: ${fmtDate(upcoming[0].event_date)}` : "Nothing confirmed"} />
        <Stat label="Open gigs" value={openGigs.length} tone="violet" hint={`${applicants.length} applicants to review`} />
        <Stat label="Saved musicians" value={saved.length} tone="sky" />
      </div>

      <Panel title="Needs your response" href="/dashboard/bookings">
        {needs.length ? (
          <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1">{needs.map((x) => <BookingCard key={x.id} b={x} role="business" />)}</div>
        ) : (
          <Empty>All caught up. {waiting.length ? `${waiting.length} request(s) waiting on musicians.` : ""}</Empty>
        )}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Confirmed events" href="/dashboard/bookings">
          <BookingList items={upcoming.slice(0, 5)} role="business" empty="No confirmed events yet. Find a musician or post a gig." />
        </Panel>
        <Panel title="New applicants" href="/dashboard/gigs">
          {applicants.length ? (
            <ul className="divide-y divide-line">
              {applicants.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Photo src={a.musician_avatar} alt={a.musician_name} w={100} className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/musicians/${a.musician_slug}`} className="block truncate text-sm font-semibold hover:text-flame">{a.musician_name}</Link>
                    <p className="truncate text-xs text-muted">{a.gig_title}</p>
                  </div>
                  <span className="text-sm font-semibold">{euro(a.quote)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No new applicants. <Link href="/dashboard/gigs/new" className="text-flame">Post a gig</Link> to attract musicians.</Empty>
          )}
        </Panel>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Recommended for {b.name}</h2>
          <Link href={`/musicians?location=${encodeURIComponent(b.location)}`} className="text-xs font-semibold text-flame hover:underline">Search musicians →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{recommended.map((m) => <MusicianCard key={m.id} m={m} />)}</div>
      </section>
    </div>
  );
}

function BookingList({ items, role, empty }: { items: Booking[]; role: "musician" | "business"; empty: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-line">
      {items.map((b) => {
        const d = new Date(b.event_date + "T12:00:00");
        return (
          <li key={b.id} className="flex items-center gap-4 py-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-center leading-none">
              <span className="text-[10px] font-bold uppercase text-flame">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
              <span className="display text-lg font-bold">{d.getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{role === "musician" ? b.business_name : b.musician_name}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <CalendarDays className="h-3 w-3" /> {b.start_time} · <MapPin className="h-3 w-3" /> {b.venue}
              </p>
            </div>
            <span className="text-sm font-semibold text-lime">{euro(b.price)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function profileChecklist(m: Musician) {
  return [
    { label: "Profile photo", done: !!m.avatar },
    { label: "Cover image", done: !!m.cover },
    { label: "Bio (100+ characters)", done: m.bio.length >= 100 },
    { label: "Genres & event types", done: m.genres.length > 0 && m.event_types.length > 0 },
    { label: "Audio samples", done: m.tracks.length > 0 },
    { label: "Performance photos", done: m.photos.length > 0 },
    { label: "Performance options", done: m.performances.length > 0 },
    { label: "Video or Spotify link", done: m.videos.length > 0 },
  ];
}
