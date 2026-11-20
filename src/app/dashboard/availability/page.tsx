import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, getBusyDates } from "@/lib/data";
import { isoDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { PageHead } from "@/components/dashboard/ui";
import { AvailabilityCalendar } from "@/components/profile/AvailabilityCalendar";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.availability, robots: { index: false } };
}

export default async function AvailabilityPage() {
  const v = await requireViewer("/dashboard/availability");
  if (v.role !== "musician") redirect("/dashboard");
  const { blocked, booked } = getBusyDates(v.musician.id);
  const { t, d } = await getI18n();
  const upcoming = bookingsFor("musician", v.musician.id).filter((b) => b.status === "confirmed" && b.event_date >= isoDate(new Date()));
  return (
    <div>
      <PageHead title={t.dash.availability} subtitle={t.dash.availSub} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="card p-5 sm:p-6">
          <AvailabilityCalendar blocked={blocked} booked={booked} editable months={2} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 font-bold">{t.dash.bookedDates}</h2>
          {upcoming.length ? (
            <ul className="space-y-3 text-sm">
              {upcoming.map((b) => (
                <li key={b.id} className="rounded-xl bg-violet/10 p-3">
                  <p className="font-semibold text-violet-2">{d(b.event_date)} · {b.start_time}</p>
                  <p className="text-xs text-muted">{b.business_name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t.dash.noConfirmedBookings}</p>
          )}
          <p className="mt-6 text-xs text-dim">{t.dash.blockedCount(blocked.length)}</p>
        </div>
      </div>
    </div>
  );
}
