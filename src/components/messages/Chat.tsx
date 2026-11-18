"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock, Euro, MapPin, Send, Sparkles, X, Repeat2, Ban, Flag } from "lucide-react";
import { bookingAction, sendMessageAction } from "@/app/actions";
import type { Booking, Message } from "@/lib/data";
import { cn, euro, fmtDate } from "@/lib/utils";
import { Photo } from "../ui/Photo";
import { StatusPill } from "../ui/StatusPill";

type Props = {
  conversationId: number;
  me: { userId: number; role: "musician" | "business" };
  other: { name: string; avatar: string | null; href: string; sub: string };
  initialMessages: Message[];
  initialBookings: Booking[];
};

export function Chat({ conversationId, me, other, initialMessages, initialBookings }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [bookings, setBookings] = useState(initialBookings);
  const [text, setText] = useState("");
  const [sending, startSend] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const lastId = useRef(initialMessages.at(-1)?.id ?? 0);

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/conversations/${conversationId}?after=${lastId.current}`, { cache: "no-store" });
      if (!r.ok) return;
      const data = (await r.json()) as { messages: Message[]; bookings: Booking[] };
      if (data.messages.length) {
        lastId.current = data.messages.at(-1)!.id;
        setMessages((m) => [...m, ...data.messages.filter((x) => !m.some((y) => y.id === x.id))]);
      }
      setBookings(data.bookings);
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    const t = setInterval(poll, 4000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    startSend(async () => {
      await sendMessageAction(conversationId, body);
      await poll();
    });
  };

  const active = bookings.filter((b) => ["pending", "countered", "confirmed"].includes(b.status));
  const bookingById = new Map(bookings.map((b) => [b.id, b]));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link href="/messages" className="btn-quiet -ml-2 px-2 md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Photo src={other.avatar} alt={other.name} w={100} className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <Link href={other.href} className="block truncate font-semibold hover:text-flame">{other.name}</Link>
          <p className="truncate text-xs text-muted">{other.sub}</p>
        </div>
        {me.role === "business" && (
          <Link href={other.href} className="btn-primary btn-sm">New booking</Link>
        )}
      </div>

      {/* Active bookings */}
      {active.length > 0 && (
        <div className="scrollbar-none flex gap-3 overflow-x-auto border-b border-line bg-surface/50 p-3">
          {active.map((b) => <BookingCard key={b.id} b={b} role={me.role} onDone={poll} />)}
        </div>
      )}

      {/* Messages */}
      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm py-10 text-center text-sm text-muted">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-flame" />
            Say hello! Share event details, ask about set lists and agree on a price — everything stays in one place.
          </div>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDay = !prev || prev.created_at.slice(0, 10) !== m.created_at.slice(0, 10);
          return (
            <div key={m.id}>
              {showDay && <p className="my-4 text-center text-[11px] font-medium uppercase tracking-wider text-dim">{fmtDate(m.created_at.slice(0, 10), { weekday: "long", day: "numeric", month: "short" })}</p>}
              {m.kind === "text" ? (
                <Bubble mine={m.sender_user_id === me.userId} body={m.body} time={m.created_at} />
              ) : (
                <SystemLine m={m} booking={m.booking_id ? bookingById.get(m.booking_id) : undefined} />
              )}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex items-end gap-2 border-t border-line p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={`Message ${other.name}…`}
          className="input max-h-40 min-h-[46px] flex-1 resize-none rounded-2xl"
          aria-label="Message"
        />
        <button className="btn-primary h-[46px] w-[46px] shrink-0 p-0" disabled={sending || !text.trim()} aria-label="Send">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function Bubble({ mine, body, time }: { mine: boolean; body: string; time: string }) {
  const t = new Date(time.replace(" ", "T") + "Z").toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", mine ? "rounded-br-md bg-flame text-ink" : "rounded-bl-md bg-surface-3 text-fg")}>
        <p className="whitespace-pre-line break-words">{body}</p>
        <p className={cn("mt-1 text-right text-[10px]", mine ? "text-ink/60" : "text-dim")}>{t}</p>
      </div>
    </div>
  );
}

function SystemLine({ m, booking }: { m: Message; booking?: Booking }) {
  return (
    <div className="flex justify-center">
      <div className={cn("flex max-w-[90%] items-center gap-2 rounded-full border px-4 py-1.5 text-xs", m.kind === "booking" ? "border-violet/30 bg-violet/10 text-violet-2" : "border-line bg-white/[0.03] text-muted")}>
        {m.kind === "booking" ? <CalendarDays className="h-3.5 w-3.5 shrink-0" /> : <Sparkles className="h-3.5 w-3.5 shrink-0" />}
        <span>{m.body}</span>
        {booking && <span className="hidden text-dim sm:inline">· #{booking.id}</span>}
      </div>
    </div>
  );
}

export function BookingCard({ b, role, onDone }: { b: Booking; role: "musician" | "business"; onDone?: () => void }) {
  const [counter, setCounter] = useState(false);
  const [price, setPrice] = useState(String(b.price));
  const [pending, start] = useTransition();
  const router = useRouter();
  const myTurn = b.last_action_by !== role;
  const open = b.status === "pending" || b.status === "countered";
  const past = b.event_date <= new Date().toISOString().slice(0, 10);

  const act = (action: string, extra?: Record<string, string>) => {
    const fd = new FormData();
    fd.set("booking_id", String(b.id));
    fd.set("action", action);
    Object.entries(extra ?? {}).forEach(([k, v]) => fd.set(k, v));
    start(async () => {
      await bookingAction(fd);
      setCounter(false);
      if (onDone) onDone();
      else router.refresh();
    });
  };

  return (
    <div className={cn("w-[300px] shrink-0 rounded-2xl border bg-surface p-4", b.status === "confirmed" ? "border-lime/30" : "border-violet/30")}>
      <div className="flex items-center justify-between">
        <StatusPill status={b.status} />
        <span className="display text-xl font-bold">{euro(b.price)}</span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-muted">
        <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-flame" /> {fmtDate(b.event_date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-flame" /> {b.start_time}{b.end_time ? `–${b.end_time}` : ""} · {b.event_type}</p>
        <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-flame" /> <span className="truncate">{b.venue}</span></p>
      </div>
      {open && !myTurn && <p className="mt-3 text-[11px] text-dim">Waiting for {role === "musician" ? "the venue" : "the musician"} to respond…</p>}
      {counter ? (
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Euro className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className="input py-1.5 pl-7 text-sm" aria-label="Counter-offer price" />
          </div>
          <button disabled={pending} onClick={() => act("counter", { price })} className="btn-violet btn-sm">Send</button>
          <button onClick={() => setCounter(false)} className="btn-quiet btn-sm" aria-label="Cancel"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {open && myTurn && (
            <>
              <button disabled={pending} onClick={() => act("accept")} className="btn btn-sm bg-lime text-ink hover:bg-lime/90"><Check className="h-3.5 w-3.5" /> Accept</button>
              <button disabled={pending} onClick={() => setCounter(true)} className="btn-ghost btn-sm"><Repeat2 className="h-3.5 w-3.5" /> Counter</button>
              <button disabled={pending} onClick={() => act("decline")} className="btn-quiet btn-sm text-rose"><X className="h-3.5 w-3.5" /> Decline</button>
            </>
          )}
          {open && !myTurn && (
            <button disabled={pending} onClick={() => act("cancel")} className="btn-quiet btn-sm"><Ban className="h-3.5 w-3.5" /> Withdraw</button>
          )}
          {b.status === "confirmed" && role === "business" && past && (
            <button disabled={pending} onClick={() => act("complete")} className="btn btn-sm bg-sky-400 text-ink"><Flag className="h-3.5 w-3.5" /> Mark completed</button>
          )}
          {b.status === "confirmed" && !past && (
            <button disabled={pending} onClick={() => confirm("Cancel this confirmed booking?") && act("cancel")} className="btn-quiet btn-sm text-muted"><Ban className="h-3.5 w-3.5" /> Cancel booking</button>
          )}
        </div>
      )}
    </div>
  );
}
