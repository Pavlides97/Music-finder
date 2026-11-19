import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AtSign,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Clock,
  Globe,
  Languages,
  MapPin,
  MessageCircle,
  Mic2,
  Pencil,
  Phone,
  Mail,
  Users,
  CheckCircle2,
} from "lucide-react";
import { getViewer } from "@/lib/auth";
import { getBusyDates, getMusicianBySlug, getReviews, isSaved, similarMusicians } from "@/lib/data";
import { toEmbed } from "@/lib/embed";
import { euro, timeAgo } from "@/lib/utils";
import { Photo } from "@/components/ui/Photo";
import { RatingBadge, Stars } from "@/components/ui/Stars";
import { AudioPlayer } from "@/components/profile/AudioPlayer";
import { BookingPanel } from "@/components/profile/BookingPanel";
import { MusicianCard } from "@/components/cards";
import { startConversationAction, toggleSaveAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = getMusicianBySlug((await params).slug);
  return m ? { title: `${m.name} — ${m.performer_type} in ${m.location}`, description: m.tagline } : {};
}

export default async function MusicianProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMusicianBySlug(slug);
  if (!m) notFound();
  const v = await getViewer();
  const reviews = getReviews(m.id);
  const { blocked, booked } = getBusyDates(m.id);
  const similar = similarMusicians(m, 4);
  const saved = v?.role === "business" ? isSaved(v.business.id, m.id) : false;
  const isOwner = v?.role === "musician" && v.musician.id === m.id;
  const embeds = m.videos.map(toEmbed).filter(Boolean) as NonNullable<ReturnType<typeof toEmbed>>[];
  const dist = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);

  return (
    <div>
      {/* Cover */}
      <section className="relative h-[280px] sm:h-[380px]">
        <Photo src={m.cover} alt={`${m.name} performing`} label="" w={1800} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
      </section>

      <div className="container-x relative -mt-28 sm:-mt-36">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <Photo src={m.avatar} alt={m.name} w={500} className="h-32 w-32 shrink-0 rounded-3xl ring-4 ring-night sm:h-44 sm:w-44" />
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-flame/30 bg-flame/10 text-flame">{m.performer_type}</span>
              {m.verified ? (
                <span className="chip border-violet/30 bg-violet/10 text-violet-2"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>
              ) : null}
              {m.featured ? <span className="chip">★ Featured</span> : null}
            </div>
            <h1 className="display mt-3 text-4xl font-extrabold leading-none sm:text-6xl">{m.name}</h1>
            <p className="mt-3 text-lg text-muted">{m.tagline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-flame" /> {m.location}, Cyprus</span>
              <RatingBadge rating={m.rating} count={m.review_count} />
              <span className="inline-flex items-center gap-1.5"><Mic2 className="h-4 w-4 text-flame" /> {m.years_active}+ years performing</span>
              {m.members > 1 && <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-flame" /> {m.members} members</span>}
            </div>
          </div>
          {isOwner && (
            <Link href="/dashboard/profile" className="btn-ghost self-start sm:self-end">
              <Pencil className="h-4 w-4" /> Edit profile
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Main */}
          <div className="min-w-0 space-y-12">
            <div className="flex flex-wrap gap-2">
              {m.genres.map((g) => (
                <Link key={g} href={`/musicians?genre=${encodeURIComponent(g)}`} className="chip px-3 py-1.5 text-sm hover:border-flame/40 hover:text-fg">{g}</Link>
              ))}
            </div>

            <Section title="About">
              <div className="space-y-4 whitespace-pre-line text-[15px] leading-relaxed text-fg/85">{m.bio || "This artist hasn't written a bio yet."}</div>
              {m.experience && (
                <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
                  <p className="label">Experience & highlights</p>
                  <p className="text-sm leading-relaxed text-fg/85">{m.experience}</p>
                </div>
              )}
            </Section>

            {m.tracks.length > 0 && (
              <Section title="Listen">
                <AudioPlayer tracks={m.tracks} artist={m.name} />
              </Section>
            )}

            {embeds.length > 0 && (
              <Section title="Watch & stream">
                <div className="grid gap-4 sm:grid-cols-2">
                  {embeds.map((e, i) => (
                    <div key={i} className={e.kind === "youtube" ? "aspect-video overflow-hidden rounded-2xl border border-line" : "h-[152px] overflow-hidden rounded-2xl"}>
                      <iframe src={e.src} title={`${m.name} media ${i + 1}`} className="h-full w-full" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Performances offered">
              <div className="grid gap-3 sm:grid-cols-2">
                {m.performances.map((p) => (
                  <div key={p} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                    <span className="text-sm">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="text-sm text-muted">Perfect for:</span>
                {m.event_types.map((e) => <span key={e} className="chip">{e}</span>)}
              </div>
            </Section>

            {m.photos.length > 0 && (
              <Section title="Gallery">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {m.photos.map((p, i) => (
                    <Photo key={i} src={p} alt={`${m.name} photo ${i + 1}`} w={700} label="" className={`rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:h-full" : "aspect-square"}`} imgClassName="transition duration-500 hover:scale-105" />
                  ))}
                </div>
              </Section>
            )}

            <Section title="Reviews" id="reviews">
              {reviews.length ? (
                <>
                  <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center">
                    <div className="text-center sm:w-40">
                      <p className="display text-5xl font-extrabold">{m.rating.toFixed(1)}</p>
                      <Stars value={m.rating} size={16} className="mt-1" />
                      <p className="mt-1 text-xs text-muted">{m.review_count} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {dist.map((n, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-muted">
                          <span className="w-3">{5 - i}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-flame" style={{ width: `${(n / reviews.length) * 100}%` }} />
                          </div>
                          <span className="w-4 text-right">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <article key={r.id} className="rounded-2xl border border-line bg-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet/20 text-sm font-bold text-violet-2">{r.author_name[0]}</span>
                            <div>
                              {r.business_slug ? (
                                <Link href={`/venues/${r.business_slug}`} className="text-sm font-semibold hover:text-flame">{r.author_name}</Link>
                              ) : (
                                <p className="text-sm font-semibold">{r.author_name}</p>
                              )}
                              <p className="text-xs text-muted">{r.event_type} · {timeAgo(r.created_at)}</p>
                            </div>
                          </div>
                          <Stars value={r.rating} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-fg/85">{r.body}</p>
                        {r.business_slug && <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-lime"><BadgeCheck className="h-3 w-3" /> Verified booking</p>}
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted">No reviews yet — be the first to book {m.name}.</p>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted">{m.price_from > 0 ? "Starting from" : "Pricing"}</p>
                  <p className="display text-4xl font-extrabold">{m.price_from > 0 ? euro(m.price_from) : "On request"}</p>
                </div>
                {m.hourly_rate ? (
                  <div className="text-right">
                    <p className="text-xs text-muted">Hourly</p>
                    <p className="text-lg font-semibold">{euro(m.hourly_rate)}/h</p>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-lime/[0.07] px-3 py-2 text-xs text-lime">
                <Clock className="h-3.5 w-3.5" /> Usually responds within {m.response_hours < 24 ? `${m.response_hours} hour${m.response_hours > 1 ? "s" : ""}` : `${Math.round(m.response_hours / 24)} day(s)`}
              </div>
              <div className="my-6 h-px bg-line" />
              {isOwner ? (
                <div className="space-y-3 text-sm text-muted">
                  <p>This is how venues see your profile.</p>
                  <Link href="/dashboard/availability" className="btn-primary w-full">Manage availability</Link>
                </div>
              ) : (
                <>
                  <BookingPanel
                    musician={{ id: m.id, name: m.name, price_from: m.price_from, event_types: m.event_types }}
                    blocked={blocked}
                    booked={booked}
                    viewerRole={v?.role ?? null}
                    defaultVenue={v?.role === "business" ? `${v.business.name}${v.business.address ? ", " + v.business.address : ""}` : undefined}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <form action={startConversationAction}>
                      <input type="hidden" name="musician_id" value={m.id} />
                      <input type="hidden" name="target" value={`/musicians/${m.slug}`} />
                      <button className="btn-ghost w-full" disabled={v?.role === "musician"}>
                        <MessageCircle className="h-4 w-4" /> Message
                      </button>
                    </form>
                    <form action={toggleSaveAction}>
                      <input type="hidden" name="musician_id" value={m.id} />
                      <button className={`btn-ghost w-full ${saved ? "border-flame/40 text-flame" : ""}`} disabled={v?.role === "musician"}>
                        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />} {saved ? "Saved" : "Save"}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            <div className="card mt-4 space-y-3 p-6 text-sm">
              <p className="label">Details & contact</p>
              {m.languages.length > 0 && <Row icon={<Languages className="h-4 w-4" />}>{m.languages.join(", ")}</Row>}
              {v ? (
                <>
                  {m.phone && <Row icon={<Phone className="h-4 w-4" />}><a href={`tel:${m.phone}`} className="hover:text-flame">{m.phone}</a></Row>}
                  {m.public_email && <Row icon={<Mail className="h-4 w-4" />}><a href={`mailto:${m.public_email}`} className="break-all hover:text-flame">{m.public_email}</a></Row>}
                  {m.instagram && <Row icon={<AtSign className="h-4 w-4" />}>@{m.instagram}</Row>}
                  {m.website && <Row icon={<Globe className="h-4 w-4" />}>{m.website}</Row>}
                </>
              ) : (
                <p className="rounded-xl bg-white/[0.04] p-3 text-xs text-muted">
                  <Link href={`/login?next=/musicians/${m.slug}`} className="font-semibold text-flame">Log in</Link> to see phone and email. Messaging on SoundCY keeps your booking history in one place.
                </p>
              )}
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="display mb-6 text-2xl font-bold">You might also like</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => <MusicianCard key={s.id} m={s} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="display mb-5 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-fg/85">
      <span className="mt-0.5 text-muted">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}
