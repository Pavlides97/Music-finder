import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Eye, MapPin, PlusCircle, Star, X } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { applicationsForGig, gigsForBusiness } from "@/lib/data";
import { isoDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { StatusPill } from "@/components/ui/StatusPill";
import { Photo } from "@/components/ui/Photo";
import { setApplicationStatusAction, setGigStatusAction } from "@/app/actions";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.postedGigs, robots: { index: false } };
}

export default async function MyGigsPage({ searchParams }: { searchParams: Promise<{ posted?: string }> }) {
  const v = await requireViewer("/dashboard/gigs");
  if (v.role !== "business") redirect("/dashboard/applications");
  const { posted } = await searchParams;
  const gigs = gigsForBusiness(v.business.id);
  const today = isoDate(new Date());
  const { t, d, eur, L, budget, ago, tr } = await getI18n();

  return (
    <div>
      <PageHead title={t.dash.postedGigs} subtitle={t.dash.gigsSub} action={<Link href="/dashboard/gigs/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> {t.dash.postGig}</Link>} />
      {posted && (
        <p className="mb-6 rounded-2xl border border-lime/25 bg-lime/[0.06] p-4 text-sm text-lime">
          {t.dash.gigLive} <Link href={`/gigs/${posted}`} className="underline">{t.dash.viewListing}</Link>
        </p>
      )}
      {gigs.length === 0 ? (
        <Empty>{t.dash.noGigsPosted} <Link href="/dashboard/gigs/new" className="text-flame">{t.dash.postFirst}</Link> {t.dash.twoMinutes}</Empty>
      ) : (
        <div className="space-y-6">
          {gigs.map((g) => {
            const apps = applicationsForGig(g.id).filter((a) => a.status !== "withdrawn");
            const expired = g.status === "open" && g.deadline < today;
            return (
              <section key={g.id} id={`gig-${g.id}`} className="card scroll-mt-24 overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={expired ? "closed" : g.status} />
                      {g.genres.map((x) => <span key={x} className="chip">{L(x)}</span>)}
                    </div>
                    <h2 className="display mt-2 text-xl font-bold">{tr(g.title, g.title_el, g.title_ru)}</h2>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {d(g.event_date)} · {g.start_time}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {L(g.location)}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t.dash.applyByShort(d(g.deadline))}</span>
                      <span className="text-lime">{budget(g.budget_min, g.budget_max)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/gigs/${g.id}`} className="btn-ghost btn-sm"><Eye className="h-3.5 w-3.5" /> {t.common.view}</Link>
                    <form action={setGigStatusAction}>
                      <input type="hidden" name="gig_id" value={g.id} />
                      <input type="hidden" name="status" value={g.status === "open" ? "closed" : "open"} />
                      <button className="btn-ghost btn-sm">{g.status === "open" ? t.dash.close : t.dash.reopen}</button>
                    </form>
                  </div>
                </div>
                <div className="p-5">
                  <p className="label">{t.dash.applicantCount(apps.length)}</p>
                  {apps.length === 0 ? (
                    <p className="text-sm text-muted">{t.dash.noAppsGig} <Link href={`/musicians?genre=${encodeURIComponent(g.genres[0] ?? "")}&location=${encodeURIComponent(g.location)}`} className="text-flame">{t.dash.invite}</Link></p>
                  ) : (
                    <ul className="space-y-3">
                      {apps.map((a) => (
                        <li key={a.id} className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4 lg:flex-row lg:items-center">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <Photo src={a.musician_avatar} alt={a.musician_name} w={100} className="h-12 w-12 shrink-0 rounded-xl" />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/musicians/${a.musician_slug}`} className="font-semibold hover:text-flame">{a.musician_name}</Link>
                                <StatusPill status={a.status} />
                              </div>
                              <p className="text-xs text-muted">{L(a.musician_type)} · {L(a.musician_location)}{a.rating ? ` · ★ ${Number(a.rating).toFixed(1)}` : ""} · {ago(a.created_at)}</p>
                              <p className="mt-1.5 line-clamp-2 text-sm text-fg/80">{a.message}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            <span className="display mr-2 text-lg font-bold">{eur(a.quote)}</span>
                            {g.status === "open" && a.status !== "accepted" && a.status !== "declined" && (
                              <>
                                {a.status !== "shortlisted" && <AppBtn id={a.id} status="shortlisted" cls="btn-ghost btn-sm"><Star className="h-3.5 w-3.5" /> {t.dash.shortlist}</AppBtn>}
                                <AppBtn id={a.id} status="accepted" cls="btn btn-sm bg-lime text-ink hover:bg-lime/90"><CheckCircle2 className="h-3.5 w-3.5" /> {t.dash.hire}</AppBtn>
                                <AppBtn id={a.id} status="declined" cls="btn-quiet btn-sm text-rose" label={t.dash.declineApp}><X className="h-3.5 w-3.5" /></AppBtn>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AppBtn({ id, status, cls, label, children }: { id: number; status: string; cls: string; label?: string; children: React.ReactNode }) {
  return (
    <form action={setApplicationStatusAction}>
      <input type="hidden" name="application_id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={cls} data-status={status} aria-label={label}>{children}</button>
    </form>
  );
}
