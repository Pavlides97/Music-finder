import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, ensureConversation } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { BookingCard } from "@/components/messages/Chat";
import { StatusPill } from "@/components/ui/StatusPill";
import { Photo } from "@/components/ui/Photo";
import { ReviewForm } from "@/components/dashboard/ReviewForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.bookings, robots: { index: false } };
}

export default async function BookingsPage() {
  const v = await requireViewer("/dashboard/bookings");
  const all = bookingsFor(v.role, v.profileId);
  const { t, d, eur, L } = await getI18n();
  const open = (s: string) => s === "pending" || s === "countered";
  const needs = all.filter((b) => open(b.status) && b.last_action_by !== v.role);
  const waiting = all.filter((b) => open(b.status) && b.last_action_by === v.role);
  const confirmed = all.filter((b) => b.status === "confirmed");
  const history = all.filter((b) => !open(b.status) && b.status !== "confirmed").reverse();
  const isM = v.role === "musician";

  const Row = ({ title, items, emptyText }: { title: string; items: typeof all; emptyText: string }) => (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-bold">{title} <span className="text-sm font-normal text-muted">({items.length})</span></h2>
      {items.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">{items.map((b) => <BookingCard key={b.id} b={b} role={v.role} />)}</div>
      ) : (
        <Empty>{emptyText}</Empty>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <PageHead
        title={t.dash.bookings}
        subtitle={isM ? t.dash.bookingsSubM : t.dash.bookingsSubB}
        action={!isM ? <Link href="/musicians" className="btn-primary">{t.dash.bookMusician}</Link> : undefined}
      />
      <Row title={t.dash.needsResponse} items={needs} emptyText={t.dash.nothingWaiting} />
      <Row title={isM ? t.dash.waitingOnVenueTitle : t.dash.waitingOnMusicianTitle} items={waiting} emptyText={t.dash.noOutstanding} />
      <Row title={isM ? t.dash.confirmedPerformances : t.dash.confirmedEvents} items={confirmed} emptyText={t.dash.noConfirmedBookings} />

      <section>
        <h2 className="mb-3 font-bold">{t.dash.history}</h2>
        {history.length ? (
          <div className="card divide-y divide-line">
            {history.map((b) => {
              const cid = ensureConversation(b.musician_id, b.business_id);
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-4 p-4">
                  <Photo src={isM ? b.business_logo : b.musician_avatar} alt={isM ? b.business_name : b.musician_name} w={100} className="h-11 w-11 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{isM ? b.business_name : b.musician_name}</p>
                    <p className="text-xs text-muted">{d(b.event_date)} · {L(b.event_type)} · {eur(b.price)}</p>
                  </div>
                  <StatusPill status={b.status} />
                  <Link href={`/messages?c=${cid}`} className="btn-quiet btn-sm" aria-label={t.dash.openConversation}><MessageCircle className="h-4 w-4" /></Link>
                  {!isM && b.status === "completed" && !b.has_review && <ReviewForm bookingId={b.id} name={b.musician_name} />}
                  {b.status === "completed" && b.has_review ? <span className="text-xs text-lime">{t.dash.reviewed}</span> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <Empty>{t.dash.pastBookings}</Empty>
        )}
      </section>
    </div>
  );
}

