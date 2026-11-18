import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Euro, Globe, Mail, MapPin, MessageCircle, Music, Pencil, Phone, Users } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { getBusinessBySlug, gigsForBusiness } from "@/lib/data";
import { budgetRange } from "@/lib/utils";
import { Photo } from "@/components/ui/Photo";
import { GigCard } from "@/components/cards";
import { startConversationAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBusinessBySlug((await params).slug);
  return b ? { title: `${b.name} — ${b.category} in ${b.location}` } : {};
}

export default async function VenueProfile({ params }: { params: Promise<{ slug: string }> }) {
  const b = getBusinessBySlug((await params).slug);
  if (!b) notFound();
  const v = await getViewer();
  const gigs = gigsForBusiness(b.id, false);
  const isOwner = v?.role === "business" && v.business.id === b.id;

  return (
    <div>
      <section className="relative h-[260px] sm:h-[340px]">
        <Photo src={b.cover} alt={b.name} label="" w={1800} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
      </section>
      <div className="container-x relative -mt-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <Photo src={b.logo} alt={b.name} w={300} className="h-28 w-28 shrink-0 rounded-3xl ring-4 ring-night" />
          <div className="flex-1">
            <span className="chip border-violet/30 bg-violet/10 text-violet-2"><Building2 className="h-3.5 w-3.5" /> {b.category}</span>
            <h1 className="display mt-3 flex items-center gap-2 text-4xl font-extrabold sm:text-5xl">
              {b.name} {b.verified ? <BadgeCheck className="h-8 w-8 text-violet-2" /> : null}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-muted"><MapPin className="h-4 w-4 text-flame" /> {b.address || b.location}</p>
          </div>
          {isOwner ? (
            <Link href="/dashboard/profile" className="btn-ghost self-start sm:self-end"><Pencil className="h-4 w-4" /> Edit profile</Link>
          ) : v?.role === "musician" ? (
            <form action={startConversationAction} className="self-start sm:self-end">
              <input type="hidden" name="business_id" value={b.id} />
              <button className="btn-primary"><MessageCircle className="h-4 w-4" /> Message venue</button>
            </form>
          ) : null}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="display mb-4 text-2xl font-bold">About</h2>
              <p className="whitespace-pre-line leading-relaxed text-fg/85">{b.description || "No description yet."}</p>
            </section>
            <section>
              <h2 className="display mb-4 text-2xl font-bold">Upcoming events & open gigs</h2>
              {gigs.length ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {gigs.map((g) => <GigCard key={g.id} g={g} compact />)}
                </div>
              ) : (
                <p className="card p-6 text-sm text-muted">No open gigs right now. {v?.role === "musician" ? "Send a message to pitch yourself for future events." : ""}</p>
              )}
            </section>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card space-y-5 p-6">
              <div>
                <p className="label flex items-center gap-1.5"><Music className="h-3.5 w-3.5" /> Music we&apos;re looking for</p>
                <div className="flex flex-wrap gap-1.5">
                  {b.music_wanted.length ? b.music_wanted.map((g) => (
                    <Link key={g} href={`/musicians?genre=${encodeURIComponent(g)}&location=${encodeURIComponent(b.location)}`} className="chip hover:text-fg">{g}</Link>
                  )) : <span className="text-sm text-muted">Open to all styles</span>}
                </div>
              </div>
              <div>
                <p className="label flex items-center gap-1.5"><Euro className="h-3.5 w-3.5" /> Typical budget</p>
                <p className="display text-2xl font-bold text-lime">{budgetRange(b.budget_min, b.budget_max)}</p>
                <p className="text-xs text-muted">per performance</p>
              </div>
              {b.capacity ? (
                <div>
                  <p className="label flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Capacity</p>
                  <p className="font-semibold">{b.capacity.toLocaleString()} guests</p>
                </div>
              ) : null}
            </div>
            <div className="card space-y-3 p-6 text-sm">
              <p className="label">Contact</p>
              {v ? (
                <>
                  {b.phone && <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted" /><a className="hover:text-flame" href={`tel:${b.phone}`}>{b.phone}</a></p>}
                  {b.public_email && <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted" /><a className="break-all hover:text-flame" href={`mailto:${b.public_email}`}>{b.public_email}</a></p>}
                  {b.website && <p className="flex items-center gap-3"><Globe className="h-4 w-4 text-muted" />{b.website}</p>}
                </>
              ) : (
                <p className="text-xs text-muted"><Link href={`/login?next=/venues/${b.slug}`} className="font-semibold text-flame">Log in</Link> to see contact details.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
