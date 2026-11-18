"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, X } from "lucide-react";
import { requestBookingAction } from "@/app/actions";
import { EVENT_TYPES } from "@/lib/constants";
import { euro, fmtDateLong, isoDate } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";

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
  const [date, setDate] = useState("");
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
        <p className="mb-3 text-sm font-semibold">Availability</p>
        <AvailabilityCalendar blocked={blocked} booked={booked} onPick={(d) => openWith(d)} selected={date} />
        <p className="mt-2 text-[11px] text-dim">Tap an available date to start a booking request.</p>
      </div>
      <button onClick={() => openWith()} className="btn-primary btn-lg mt-5 w-full">
        <CalendarCheck className="h-5 w-5" /> Request booking
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Book ${musician.name}`}>
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line-strong bg-surface p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Booking request</p>
                <h3 className="display mt-1 text-2xl font-bold">Book {musician.name}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="btn-quiet" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewerRole !== "business" ? (
              <div className="space-y-4 text-sm text-muted">
                {viewerRole === "musician" ? (
                  <p>You&apos;re logged in as a musician. Booking requests are sent from venue or organiser accounts.</p>
                ) : (
                  <p>Create a free venue / organiser account (or log in) to send booking requests, negotiate and confirm performances.</p>
                )}
                {viewerRole !== "musician" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? location.pathname : "/")}`} className="btn-ghost">Log in</Link>
                    <Link href="/signup?role=business" className="btn-primary">Sign up free</Link>
                  </div>
                )}
                <p className="rounded-xl bg-white/[0.04] p-3 text-xs">
                  Demo tip: log in as <strong className="text-fg">The Old Port Bistro</strong> from the login page to try the full booking flow.
                </p>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <input type="hidden" name="musician_id" value={musician.id} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 block sm:col-span-1">
                    <span className="label">Date</span>
                    <input name="event_date" type="date" required min={isoDate(new Date())} value={date} onChange={(e) => setDate(e.target.value)} className="input [color-scheme:dark]" />
                  </label>
                  <label className="block">
                    <span className="label">Start</span>
                    <input name="start_time" type="time" required defaultValue="20:00" className="input [color-scheme:dark]" />
                  </label>
                  <label className="block">
                    <span className="label">End</span>
                    <input name="end_time" type="time" defaultValue="23:00" className="input [color-scheme:dark]" />
                  </label>
                  <label className="col-span-2 block sm:col-span-1">
                    <span className="label">Event type</span>
                    <select name="event_type" className="input" defaultValue={musician.event_types[0] ?? "Private parties"}>
                      {EVENT_TYPES.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </label>
                </div>
                {date && blocked.includes(date) && <p className="text-xs text-rose">Heads up: {musician.name} marked {fmtDateLong(date)} as unavailable.</p>}
                <label className="block">
                  <span className="label">Venue / address</span>
                  <input name="venue" className="input" defaultValue={defaultVenue} placeholder="Where is the performance?" />
                </label>
                <label className="block">
                  <span className="label">Your offer (EUR)</span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">€</span>
                    <input name="price" type="number" min={1} required defaultValue={musician.price_from} className="input pl-8" />
                  </div>
                  <span className="mt-1 block text-[11px] text-dim">{musician.name}&apos;s rates start from {euro(musician.price_from)}. They can accept or send a counter-offer.</span>
                </label>
                <label className="block">
                  <span className="label">Message</span>
                  <textarea name="notes" rows={3} className="input" placeholder="Tell them about the event: guests, vibe, song requests, equipment…" />
                </label>
                <FormMessage state={state} />
                <SubmitButton className="btn-lg w-full" pendingText="Sending…">Send booking request</SubmitButton>
                <p className="text-center text-[11px] text-dim">No payment now. You&apos;ll confirm details together in Messages.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
