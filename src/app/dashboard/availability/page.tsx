import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, getBusyDates } from "@/lib/data";
import { fmtDate, isoDate } from "@/lib/utils";
import { PageHead } from "@/components/dashboard/ui";
import { AvailabilityCalendar } from "@/components/profile/AvailabilityCalendar";

export const metadata: Metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const v = await requireViewer("/dashboard/availability");
  if (v.role !== "musician") redirect("/dashboard");
  const { blocked, booked } = getBusyDates(v.musician.id);
  const upcoming = bookingsFor("musician", v.musician.id).filter((b) => b.status === "confirmed" && b.event_date >= isoDate(new Date()));
  return (
    <div>
      <PageHead title="Availability" subtitle="Tap a date to mark it unavailable. Venues only see dates you're free, and you won't appear in searches for blocked dates." />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="card p-5 sm:p-6">
          <AvailabilityCalendar blocked={blocked} booked={booked} editable months={2} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 font-bold">Booked dates</h2>
          {upcoming.length ? (
            <ul className="space-y-3 text-sm">
              {upcoming.map((b) => (
                <li key={b.id} className="rounded-xl bg-violet/10 p-3">
                  <p className="font-semibold text-violet-2">{fmtDate(b.event_date)} · {b.start_time}</p>
                  <p className="text-xs text-muted">{b.business_name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No confirmed bookings yet.</p>
          )}
          <p className="mt-6 text-xs text-dim">{blocked.length} date{blocked.length === 1 ? "" : "s"} blocked.</p>
        </div>
      </div>
    </div>
  );
}
