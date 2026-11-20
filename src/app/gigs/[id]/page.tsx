import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Euro, Hourglass, MapPin, Music2, PartyPopper, Users } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { getApplication, getBusinessById, getGig, searchGigs } from "@/lib/data";
import { daysUntil } from "@/lib/utils";
import { Photo } from "@/components/ui/Photo";
import { StatusPill } from "@/components/ui/StatusPill";
import { ApplyForm } from "@/components/ApplyForm";
import { GigCard } from "@/components/cards";
import { getI18n } from "@/lib/i18n/server";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = getGig(Number((await params).id));
  const { L, tr } = await getI18n();
  return g ? { title: `${tr(g.title, g.title_el, g.title_ru)} — ${L(g.location)}`, description: tr(g.description, g.description_el, g.description_ru).slice(0, 160) } : {};
}

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const g = getGig(Number((await params).id));
  if (!g) notFound();
  const biz = getBusinessById(g.business_id)!;
  const v = await getViewer();
  const { t, L, d, dLong, budget, tr } = await getI18n();
  const app = v?.role === "musician" ? getApplication(g.id, v.musician.id) : undefined;
  const isOwner = v?.role === "business" && v.business.id === g.business_id;
  const left = daysUntil(g.deadline);
  const open = g.status === "open" && left >= 0;
  const more = searchGigs({ genre: g.genres[0] }, 4).filter((x) => x.id !== g.id).slice(0, 3);

  const facts = [
    [CalendarDays, t.common.date, dLong(g.event_date)],
    [Clock, t.common.time, `${g.start_time}${g.end_time ? ` – ${g.end_time}` : ""}`],
    [MapPin, t.common.location, `${g.venue ? g.venue + ", " : ""}${L(g.location)}`],
    [Music2, t.common.performer, L(g.performer_type)],
    [PartyPopper, t.common.eventType, L(g.event_type)],
    [Euro, t.common.budget, budget(g.budget_min, g.budget_max)],
  ] as const;

  const ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: g.title,
    description: g.description,
    datePosted: g.created_at.slice(0, 10),
    validThrough: g.deadline,
    employmentType: "CONTRACTOR",
    url: `${SITE_URL}/gigs/${g.id}`,
    hiringOrganization: { "@type": "Organization", name: g.business_name, sameAs: `${SITE_URL}/venues/${g.business_slug}` },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: g.location, addressCountry: "CY" } },
    ...(g.budget_min || g.budget_max
      ? { baseSalary: { "@type": "MonetaryAmount", currency: "EUR", value: { "@type": "QuantitativeValue", minValue: g.budget_min ?? undefined, maxValue: g.budget_max ?? undefined, unitText: "EVENT" } } }
      : {}),
  };

  return (
    <div className="container-x py-10">
      <JsonLd data={ld} />
      <Link href="/gigs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> {t.gig.allGigs}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={open ? "open" : g.status === "open" ? "closed" : g.status} />
            {g.urgent ? <span className="chip border-rose/30 bg-rose/10 text-rose">{t.common.urgent}</span> : null}
            {g.genres.map((x) => <span key={x} className="chip">{L(x)}</span>)}
          </div>
          <h1 className="display mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{tr(g.title, g.title_el, g.title_ru)}</h1>
          <Link href={`/venues/${g.business_slug}`} className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 pr-4 hover:border-line-strong">
            <Photo src={g.business_logo} alt={g.business_name} w={120} className="h-11 w-11 rounded-xl" />
            <span>
              <span className="flex items-center gap-1 text-sm font-semibold">{g.business_name} {g.business_verified ? <BadgeCheck className="h-4 w-4 text-violet-2" /> : null}</span>
              <span className="text-xs text-muted">{L(g.business_category)} · {L(biz.location)}</span>
            </span>
          </Link>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {facts.map(([Icon, k, val]) => (
              <li key={k} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame/10 text-flame"><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs text-muted">{k}</p>
                  <p className="font-semibold">{val}</p>
                </div>
              </li>
            ))}
          </ul>

          <section className="mt-10">
            <h2 className="display mb-3 text-2xl font-bold">{t.gig.about}</h2>
            <p className="whitespace-pre-line leading-relaxed text-fg/85">{tr(g.description, g.description_el, g.description_ru)}</p>
          </section>

          <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-2 font-bold">{t.gig.aboutVenue(g.business_name)}</h2>
            <p className="line-clamp-3 text-sm text-muted">{tr(biz.description, biz.description_el, biz.description_ru)}</p>
            <Link href={`/venues/${g.business_slug}`} className="mt-3 inline-block text-sm font-semibold text-flame hover:underline">{t.gig.viewVenue}</Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/[0.04] p-3">
                <Hourglass className="mx-auto h-4 w-4 text-flame" />
                <p className="mt-1 text-xs text-muted">{t.gig.applyBy}</p>
                <p className="text-sm font-semibold">{d(g.deadline)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3">
                <Users className="mx-auto h-4 w-4 text-flame" />
                <p className="mt-1 text-xs text-muted">{t.gig.applicants}</p>
                <p className="text-sm font-semibold">{g.applicant_count}</p>
              </div>
            </div>
            <div className="my-6 h-px bg-line" />
            {isOwner ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">{t.gig.ownerNote}</p>
                <Link href={`/dashboard/gigs#gig-${g.id}`} className="btn-primary w-full">{t.gig.manageApplicants}</Link>
              </div>
            ) : !open ? (
              <p className="text-sm text-muted">{t.gig.closed}</p>
            ) : v?.role === "musician" ? (
              <div className="space-y-4">
                {app && app.status !== "withdrawn" && (
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-sm">
                    <span>{t.gig.yourApplication}</span>
                    <StatusPill status={app.status} />
                  </div>
                )}
                {app && (app.status === "accepted" || app.status === "shortlisted") ? (
                  <Link href="/messages" className="btn-primary w-full">{t.gig.openMessages}</Link>
                ) : (
                  <ApplyForm gigId={g.id} suggested={app?.quote ?? g.budget_max ?? g.budget_min} again={!!app && app.status !== "withdrawn"} />
                )}
              </div>
            ) : v?.role === "business" ? (
              <p className="text-sm text-muted">{t.gig.venueNote}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">{t.gig.guestNote}</p>
                <Link href={`/signup?role=musician`} className="btn-primary w-full">{t.gig.applyFree}</Link>
                <Link href={`/login?next=/gigs/${g.id}`} className="btn-ghost w-full">{t.gig.haveAccount}</Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-6 text-2xl font-bold">{t.gig.similar}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {more.map((x) => <GigCard key={x.id} g={x} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
