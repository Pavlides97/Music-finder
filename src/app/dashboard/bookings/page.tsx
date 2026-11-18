import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, ensureConversation } from "@/lib/data";
import { euro, fmtDate } from "@/lib/utils";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { BookingCard } from "@/components/messages/Chat";
import { StatusPill } from "@/components/ui/StatusPill";
import { Photo } from "@/components/ui/Photo";
import { ReviewForm } from "@/components/dashboard/ReviewForm";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage() {
  const v = await requireViewer("/dashboard/bookings");
  const all = bookingsFor(v.role, v.profileId);
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
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{items.map((b) => <BookingCard key={b.id} b={b} role={v.role} />)}</div>
      ) : (
        <Empty>{emptyText}</Empty>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      <PageHead
        title="Bookings"
        subtitle={isM ? "Requests, offers and confirmed performances." : "Booking requests, negotiations and confirmed events."}
        action={!isM ? <Link href="/musicians" className="btn-primary">Book a musician</Link> : undefined}
      />
      <Row title="Needs your response" items={needs} emptyText="Nothing waiting on you." />
      <Row title={`Waiting on ${isM ? "venue" : "musician"}`} items={waiting} emptyText="No outstanding offers." />
      <Row title={isM ? "Confirmed performances" : "Confirmed events"} items={confirmed} emptyText="No confirmed bookings yet." />

      <section>
        <h2 className="mb-3 font-bold">History</h2>
        {history.length ? (
          <div className="card divide-y divide-line">
            {history.map((b) => {
              const cid = ensureConversation(b.musician_id, b.business_id);
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-4 p-4">
                  <Photo src={isM ? b.business_logo : b.musician_avatar} alt={isM ? b.business_name : b.musician_name} w={100} className="h-11 w-11 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{isM ? b.business_name : b.musician_name}</p>
                    <p className="text-xs text-muted">{fmtDate(b.event_date)} · {b.event_type} · {euro(b.price)}</p>
                  </div>
                  <StatusPill status={b.status} />
                  <Link href={`/messages?c=${cid}`} className="btn-quiet btn-sm" aria-label="Open conversation"><MessageCircle className="h-4 w-4" /></Link>
                  {!isM && b.status === "completed" && !b.has_review && <ReviewForm bookingId={b.id} name={b.musician_name} />}
                  {b.status === "completed" && b.has_review ? <span className="text-xs text-lime">Reviewed ✓</span> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <Empty>Past bookings will appear here.</Empty>
        )}
      </section>
    </div>
  );
}

