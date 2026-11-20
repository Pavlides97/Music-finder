"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, X } from "lucide-react";
import { requestBookingAction } from "@/app/actions";
import { EVENT_TYPES, isPrivateEvent } from "@/lib/constants";
import { isoDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { PublicToggle } from "../ui/PublicToggle";

export function BookingPanel({
  musician,
  blocked,
  booked,
  viewerRole,
  defaultVenue,
}: {
  musician: { id: number; name: string; price_from: number; event_types: string[] };
  blocked: string[];
  booked: string[];
  viewerRole: "musician" | "business" | null;
  defaultVenue?: string;
}) {
  const [open, setOpen] = useState(false);
  const { t, L, eur, dLong } = useI18n();
  const [date, setDate] = useState("");
  const firstType = musician.event_types[0] ?? "Private parties";
  const [listPublic, setListPublic] = useState(!isPrivateEvent(firstType));
  const [state, action] = useActionState(requestBookingAction, undefined);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const openWith = (d?: string) => {
    if (d) setDate(d);
    setOpen(true);
  };

  return (
    <>
      <div>
        <p className="mb-3 text-sm font-semibold">{t.booking.availability}</p>
        <AvailabilityCalendar blocked={blocked} booked={booked} onPick={(d) => openWith(d)} selected={date} />
        <p className="mt-2 text-[11px] text-dim">{t.booking.tapDate}</p>
      </div>
      <button onClick={() => openWith()} className="btn-primary btn-lg mt-5 w-full">
        <CalendarCheck className="h-5 w-5" /> {t.booking.request}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={t.booking.title(musician.name)}>
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line-strong bg-surface p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{t.booking.eyebrow}</p>
                <h3 className="display mt-1 text-2xl font-bold">{t.booking.title(musician.name)}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="btn-quiet" aria-label={t.common.close}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewerRole !== "business" ? (
              <div className="space-y-4 text-sm text-muted">
                {viewerRole === "musician" ? (
                  <p>{t.booking.musicianNote}</p>
                ) : (
                  <p>{t.booking.guestNote}</p>
                )}
                {viewerRole !== "musician" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? location.pathname : "/")}`} className="btn-ghost">{t.common.logIn}</Link>
                    <Link href="/signup?role=business" className="btn-primary">{t.booking.signUpFree}</Link>
                  </div>
                )}
                <p className="rounded-xl bg-white/[0.04] p-3 text-xs">
                  {t.booking.demoTip}
                </p>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <input type="hidden" name="musician_id" value={musician.id} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 block sm:col-span-1">
                    <span className="label">{t.common.date}</span>
                    <input name="event_date" type="date" required min={isoDate(new Date())} value={date} onChange={(e) => setDate(e.target.value)} className="input [color-scheme:dark]" />
                  </label>
                  <label className="block">
                    <span className="label">{t.common.start}</span>
                    <input name="start_time" type="time" required defaultValue="20:00" className="input [color-scheme:dark]" />
                  </label>
                  <label className="block">
                    <span className="label">{t.common.end}</span>
                    <input name="end_time" type="time" defaultValue="23:00" className="input [color-scheme:dark]" />
                  </label>
                  <label className="col-span-2 block sm:col-span-1">
                    <span className="label">{t.common.eventType}</span>
                    <select name="event_type" className="input" defaultValue={firstType} onChange={(e) => setListPublic(!isPrivateEvent(e.target.value))}>
                      {EVENT_TYPES.map((e) => <option key={e} value={e}>{L(e)}</option>)}
                    </select>
                  </label>
                </div>
                {date && blocked.includes(date) && <p className="text-xs text-rose">{t.booking.unavailable(musician.name, dLong(date))}</p>}
                <label className="block">
                  <span className="label">{t.booking.venue}</span>
                  <input name="venue" className="input" defaultValue={defaultVenue} placeholder={t.booking.venuePh} />
                </label>
                <label className="block">
                  <span className="label">{t.booking.offer}</span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">€</span>
                    <input name="price" type="number" min={1} required defaultValue={musician.price_from || undefined} placeholder={t.booking.offerPh} className="input pl-8" />
                  </div>
                  <span className="mt-1 block text-[11px] text-dim">{musician.price_from > 0 ? t.booking.ratesFrom(musician.name, eur(musician.price_from)) : null}{t.booking.canCounter}</span>
                </label>
                <label className="block">
                  <span className="label">{t.booking.message}</span>
                  <textarea name="notes" rows={3} className="input" placeholder={t.booking.messagePh} />
                </label>
                <PublicToggle checked={listPublic} onChange={setListPublic} />
                <FormMessage state={state} />
                <SubmitButton className="btn-lg w-full" pendingText={t.booking.sending}>{t.booking.send}</SubmitButton>
                <p className="text-center text-[11px] text-dim">{t.booking.noPayment}</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
