import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Euro, Hourglass, MapPin, Music2, PartyPopper, Users } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { getApplication, getBusinessById, getGig, searchGigs } from "@/lib/data";
import { budgetRange, daysUntil, fmtDate, fmtDateLong } from "@/lib/utils";
import { Photo } from "@/components/ui/Photo";
import { StatusPill } from "@/components/ui/StatusPill";
import { ApplyForm } from "@/components/ApplyForm";
import { GigCard } from "@/components/cards";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = getGig(Number((await params).id));
  return g ? { title: `${g.title} — ${g.location}` } : {};
}

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const g = getGig(Number((await params).id));
  if (!g) notFound();
  const biz = getBusinessById(g.business_id)!;
  const v = await getViewer();
  const app = v?.role === "musician" ? getApplication(g.id, v.musician.id) : undefined;
  const isOwner = v?.role === "business" && v.business.id === g.business_id;
  const left = daysUntil(g.deadline);
  const open = g.status === "open" && left >= 0;
  const more = searchGigs({ genre: g.genres[0] }, 4).filter((x) => x.id !== g.id).slice(0, 3);

  const facts = [
    [CalendarDays, "Date", fmtDateLong(g.event_date)],
    [Clock, "Time", `${g.start_time}${g.end_time ? ` – ${g.end_time}` : ""}`],
    [MapPin, "Location", `${g.venue ? g.venue + ", " : ""}${g.location}`],
    [Music2, "Performer", g.performer_type],
    [PartyPopper, "Event type", g.event_type],
    [Euro, "Budget", budgetRange(g.budget_min, g.budget_max)],
  ] as const;

  return (
    <div className="container-x py-10">
      <Link href="/gigs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> All gigs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={open ? "open" : g.status === "open" ? "closed" : g.status} />
            {g.urgent ? <span className="chip border-rose/30 bg-rose/10 text-rose">Urgent</span> : null}
            {g.genres.map((x) => <span key={x} className="chip">{x}</span>)}
          </div>
          <h1 className="display mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{g.title}</h1>
          <Link href={`/venues/${g.business_slug}`} className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 pr-4 hover:border-line-strong">
            <Photo src={g.business_logo} alt={g.business_name} w={120} className="h-11 w-11 rounded-xl" />
            <span>
              <span className="flex items-center gap-1 text-sm font-semibold">{g.business_name} {g.business_verified ? <BadgeCheck className="h-4 w-4 text-violet-2" /> : null}</span>
              <span className="text-xs text-muted">{g.business_category} · {biz.location}</span>
            </span>
          </Link>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {facts.map(([Icon, k, val]) => (
              <div key={k} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame/10 text-flame"><Icon className="h-5 w-5" /></span>
                <div>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-semibold">{val}</dd>
                </div>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="display mb-3 text-2xl font-bold">About this gig</h2>
            <p className="whitespace-pre-line leading-relaxed text-fg/85">{g.description}</p>
          </section>

          <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-2 font-bold">About {g.business_name}</h2>
            <p className="line-clamp-3 text-sm text-muted">{biz.description}</p>
            <Link href={`/venues/${g.business_slug}`} className="mt-3 inline-block text-sm font-semibold text-flame hover:underline">View venue profile →</Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/[0.04] p-3">
                <Hourglass className="mx-auto h-4 w-4 text-flame" />
                <p className="mt-1 text-xs text-muted">Apply by</p>
                <p className="text-sm font-semibold">{fmtDate(g.deadline)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <Users className="mx-auto h-4 w-4 text-flame" />
                <p className="mt-1 text-xs text-muted">Applicants</p>
                <p className="text-sm font-semibold">{g.applicant_count}</p>
              </div>
            </div>
            <div className="my-6 h-px bg-line" />
            {isOwner ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">This is your gig. Review applicants and hire from your dashboard.</p>
                <Link href={`/dashboard/gigs#gig-${g.id}`} className="btn-primary w-full">Manage applicants</Link>
              </div>
            ) : !open ? (
              <p className="text-sm text-muted">This gig is no longer accepting applications.</p>
            ) : v?.role === "musician" ? (
              <div className="space-y-4">
                {app && app.status !== "withdrawn" && (
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-sm">
                    <span>Your application</span>
                    <StatusPill status={app.status} />
                  </div>
                )}
                {app && (app.status === "accepted" || app.status === "shortlisted") ? (
                  <Link href="/messages" className="btn-primary w-full">Open messages</Link>
                ) : (
                  <ApplyForm gigId={g.id} suggested={app?.quote ?? g.budget_max ?? g.budget_min} again={!!app && app.status !== "withdrawn"} />
                )}
              </div>
            ) : v?.role === "business" ? (
              <p className="text-sm text-muted">You&apos;re logged in as a venue. Switch to a musician account to apply.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">Create a free musician profile to apply to this gig and hundreds more across Cyprus.</p>
                <Link href={`/signup?role=musician`} className="btn-primary w-full">Apply with a free profile</Link>
                <Link href={`/login?next=/gigs/${g.id}`} className="btn-ghost w-full">I already have an account</Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-6 text-2xl font-bold">Similar gigs</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {more.map((x) => <GigCard key={x.id} g={x} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
