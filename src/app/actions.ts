"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, tx } from "@/lib/db";
import { createSession, destroySession, getViewer, requireViewer } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  addMessage,
  ensureConversation,
  getApplicationById,
  getBooking,
  getConversation,
  getGig,
  getMusicianById,
} from "@/lib/data";
import { BUSINESS_CATEGORIES, EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { euro, fmtDate, isoDate, slugify } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

/** Automatic chat message, rendered in each reader's language (see i18n sys). */
const sys = (k: string, p: Record<string, unknown> = {}) => JSON.stringify({ k, p });

export type FormState = { error?: string; ok?: string } | undefined;

const str = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const num = (fd: FormData, k: string) => {
  const v = Number(fd.get(k));
  return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
};
const list = (fd: FormData, k: string, allowed?: readonly string[]) =>
  fd
    .getAll(k)
    .map((v) => String(v).trim())
    .filter((v) => v && (!allowed || allowed.includes(v)));
const lines = (fd: FormData, k: string) =>
  str(fd, k, 4000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
const oneOf = <T extends readonly string[]>(v: string, opts: T, fallback: T[number]) => (opts.includes(v) ? v : fallback);
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s: string) => /^\d{2}:\d{2}$/.test(s);

function uniqueSlug(table: "musicians" | "businesses", base: string, excludeId?: number) {
  const root = slugify(base) || "profile";
  let slug = root;
  for (let i = 2; ; i++) {
    const row = db().prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);
    if (!row || Number(row.id) === excludeId) return slug;
    slug = `${root}-${i}`;
  }
}

/* ----------------------------- Auth ----------------------------- */

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email", 200).toLowerCase();
  const password = str(fd, "password", 200);
  const row = db().prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as { id: number; password_hash: string } | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return { error: (await getI18n()).t.errors.badLogin };
  await createSession(row.id);
  redirect(safeNext(str(fd, "next")));
}

export async function demoLoginAction(fd: FormData) {
  const email = str(fd, "email", 200).toLowerCase();
  if (!email.endsWith("@demo.soundcy.app")) return;
  const row = db().prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (!row) return;
  await createSession(Number(row.id));
  redirect(safeNext(str(fd, "next")));
}

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  const role = str(fd, "role") === "business" ? "business" : "musician";
  const name = str(fd, "name", 120);
  const email = str(fd, "email", 200).toLowerCase();
  const password = str(fd, "password", 200);
  const location = oneOf(str(fd, "location"), LOCATIONS, "Nicosia");
  const { t } = await getI18n();
  if (name.length < 2) return { error: role === "musician" ? t.errors.nameArtist : t.errors.nameBusiness };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: t.errors.email };
  if (password.length < 8) return { error: t.errors.password };
  if (db().prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return { error: t.errors.exists };

  const userId = tx(() => {
    const uid = Number(db().prepare("INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)").run(email, hashPassword(password), role, name).lastInsertRowid);
    if (role === "musician") {
      const type = oneOf(str(fd, "performer_type"), PERFORMER_TYPES, "Solo artist");
      const genres = list(fd, "genres", GENRES);
      db()
        .prepare("INSERT INTO musicians (user_id, slug, name, performer_type, location, genres, tagline, public_email) VALUES (?,?,?,?,?,?,?,?)")
        .run(uid, uniqueSlug("musicians", name), name, type, location, JSON.stringify(genres.length ? genres : ["Pop"]), "", email);
    } else {
      const category = oneOf(str(fd, "category"), BUSINESS_CATEGORIES, "Restaurant");
      db()
        .prepare("INSERT INTO businesses (user_id, slug, name, category, location, public_email) VALUES (?,?,?,?,?,?)")
        .run(uid, uniqueSlug("businesses", name), name, category, location, email);
    }
    return uid;
  });
  await createSession(userId);
  redirect("/dashboard/profile?welcome=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

/* --------------------------- Profiles --------------------------- */

export async function saveMusicianProfile(_: FormState, fd: FormData): Promise<FormState> {
  const v = await requireViewer();
  const { t } = await getI18n();
  if (v.role !== "musician") return { error: t.errors.onlyMusicians };
  const name = str(fd, "name", 120);
  if (name.length < 2) return { error: t.errors.nameRequired };
  const tracks = lines(fd, "tracks")
    .map((l) => {
      const [title, url, duration] = l.split("|").map((s) => s.trim());
      return url && /^https?:\/\//.test(url) ? { title: title || "Untitled", url, duration: duration || "" } : null;
    })
    .filter(Boolean);
  const urls = (k: string) => lines(fd, k).filter((u) => /^https?:\/\//.test(u));
  const images = (k: string) => lines(fd, k).filter((u) => /^(https?:\/\/|\/api\/uploads\/|photo-[\w-]+$)/.test(u));
  db()
    .prepare(
      `UPDATE musicians SET name=?, slug=?, tagline=?, bio=?, experience=?, years_active=?, performer_type=?, location=?, genres=?, event_types=?,
        performances=?, languages=?, members=?, price_from=?, price_to=?, hourly_rate=?, avatar=?, cover=?, photos=?, tracks=?, videos=?, phone=?, public_email=?, website=?, instagram=?
       WHERE id = ?`,
    )
    .run(
      name,
      uniqueSlug("musicians", name, v.musician.id),
      str(fd, "tagline", 140),
      str(fd, "bio", 3000),
      str(fd, "experience", 1500),
      num(fd, "years_active") ?? 0,
      oneOf(str(fd, "performer_type"), PERFORMER_TYPES, "Solo artist"),
      oneOf(str(fd, "location"), LOCATIONS, "Nicosia"),
      JSON.stringify(list(fd, "genres", GENRES)),
      JSON.stringify(list(fd, "event_types", EVENT_TYPES)),
      JSON.stringify(lines(fd, "performances")),
      JSON.stringify(str(fd, "languages", 200).split(",").map((s) => s.trim()).filter(Boolean)),
      num(fd, "members") ?? 1,
      num(fd, "price_from") ?? 0,
      num(fd, "price_to"),
      num(fd, "hourly_rate"),
      str(fd, "avatar", 500) || null,
      str(fd, "cover", 500) || null,
      JSON.stringify(images("photos")),
      JSON.stringify(tracks),
      JSON.stringify(urls("videos")),
      str(fd, "phone", 40) || null,
      str(fd, "public_email", 200) || null,
      str(fd, "website", 200) || null,
      str(fd, "instagram", 100).replace(/^@/, "") || null,
      v.musician.id,
    );
  db().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, v.user.id);
  revalidatePath("/", "layout");
  return { ok: t.errors.profileSaved };
}

export async function saveBusinessProfile(_: FormState, fd: FormData): Promise<FormState> {
  const v = await requireViewer();
  const { t } = await getI18n();
  if (v.role !== "business") return { error: t.errors.onlyBusinesses };
  const name = str(fd, "name", 120);
  if (name.length < 2) return { error: t.errors.businessNameRequired };
  db()
    .prepare(
      `UPDATE businesses SET name=?, slug=?, category=?, location=?, address=?, description=?, music_wanted=?, budget_min=?, budget_max=?, capacity=?,
        logo=?, cover=?, phone=?, public_email=?, website=? WHERE id = ?`,
    )
    .run(
      name,
      uniqueSlug("businesses", name, v.business.id),
      oneOf(str(fd, "category"), BUSINESS_CATEGORIES, "Restaurant"),
      oneOf(str(fd, "location"), LOCATIONS, "Nicosia"),
      str(fd, "address", 200) || null,
      str(fd, "description", 3000),
      JSON.stringify(list(fd, "music_wanted", GENRES)),
      num(fd, "budget_min"),
      num(fd, "budget_max"),
      num(fd, "capacity"),
      str(fd, "logo", 500) || null,
      str(fd, "cover", 500) || null,
      str(fd, "phone", 40) || null,
      str(fd, "public_email", 200) || null,
      str(fd, "website", 200) || null,
      v.business.id,
    );
  db().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, v.user.id);
  revalidatePath("/", "layout");
  return { ok: t.errors.saved };
}

/* ----------------------------- Gigs ----------------------------- */

export async function createGigAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = await requireViewer("/dashboard/gigs/new");
  const { t } = await getI18n();
  if (v.role !== "business") return { error: t.errors.onlyVenuesPost };
  const title = str(fd, "title", 140);
  const date = str(fd, "event_date");
  const deadline = str(fd, "deadline") || date;
  const start = str(fd, "start_time");
  const today = isoDate(new Date());
  if (title.length < 4) return { error: t.errors.gigTitle };
  if (!isDate(date) || date < today) return { error: t.errors.futureDate };
  if (!isDate(deadline) || deadline > date || deadline < today) return { error: t.errors.deadline };
  if (!isTime(start)) return { error: t.errors.startTime };
  const genres = list(fd, "genres", GENRES);
  if (!genres.length) return { error: t.errors.genre };
  const bmin = num(fd, "budget_min");
  const bmax = num(fd, "budget_max");
  if (bmin && bmax && bmin > bmax) return { error: t.errors.budgetOrder };
  const id = db()
    .prepare(
      `INSERT INTO gigs (business_id, title, event_date, start_time, end_time, location, venue, genres, performer_type, event_type, budget_min, budget_max, description, deadline, urgent)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      v.business.id,
      title,
      date,
      start,
      isTime(str(fd, "end_time")) ? str(fd, "end_time") : null,
      oneOf(str(fd, "location"), LOCATIONS, v.business.location as (typeof LOCATIONS)[number]),
      str(fd, "venue", 140) || v.business.name,
      JSON.stringify(genres),
      oneOf(str(fd, "performer_type"), PERFORMER_TYPES, "Band"),
      oneOf(str(fd, "event_type"), EVENT_TYPES, "Restaurants"),
      bmin,
      bmax,
      str(fd, "description", 3000),
      deadline,
      fd.get("urgent") ? 1 : 0,
    ).lastInsertRowid;
  revalidatePath("/gigs");
  redirect(`/dashboard/gigs?posted=${id}`);
}

export async function setGigStatusAction(fd: FormData) {
  const v = await requireViewer();
  const gig = getGig(Number(fd.get("gig_id")));
  if (v.role !== "business" || !gig || gig.business_id !== v.business.id) return;
  const status = oneOf(str(fd, "status"), ["open", "closed", "filled"] as const, "closed");
  db().prepare("UPDATE gigs SET status = ? WHERE id = ?").run(status, gig.id);
  revalidatePath("/dashboard/gigs");
  revalidatePath("/gigs");
}

export async function applyToGigAction(_: FormState, fd: FormData): Promise<FormState> {
  const gigId = Number(fd.get("gig_id"));
  const v = await requireViewer(`/gigs/${gigId}`);
  const { t } = await getI18n();
  if (v.role !== "musician") return { error: t.errors.onlyMusiciansApply };
  const gig = getGig(gigId);
  if (!gig || gig.status !== "open") return { error: t.errors.gigClosed };
  const message = str(fd, "message", 1500);
  if (message.length < 10) return { error: t.errors.shortNote };
  const quote = num(fd, "quote");
  db()
    .prepare(
      `INSERT INTO applications (gig_id, musician_id, message, quote, status) VALUES (?,?,?,?, 'pending')
       ON CONFLICT (gig_id, musician_id) DO UPDATE SET message = excluded.message, quote = excluded.quote, status = 'pending', created_at = datetime('now')`,
    )
    .run(gig.id, v.musician.id, message, quote);
  const cid = ensureConversation(v.musician.id, gig.business_id);
  addMessage(cid, null, sys("applied", { title: gig.title, date: gig.event_date, quote }), "system");
  addMessage(cid, v.user.id, message);
  revalidatePath(`/gigs/${gig.id}`);
  revalidatePath("/dashboard", "layout");
  return { ok: t.errors.applied };
}

export async function withdrawApplicationAction(fd: FormData) {
  const v = await requireViewer();
  const app = getApplicationById(Number(fd.get("application_id")));
  if (v.role !== "musician" || !app || app.musician_id !== v.musician.id) return;
  db().prepare("UPDATE applications SET status = 'withdrawn' WHERE id = ?").run(app.id);
  revalidatePath("/dashboard", "layout");
}

export async function setApplicationStatusAction(fd: FormData) {
  const v = await requireViewer();
  const app = getApplicationById(Number(fd.get("application_id")));
  if (v.role !== "business" || !app) return;
  const gig = getGig(app.gig_id);
  if (!gig || gig.business_id !== v.business.id) return;
  const status = oneOf(str(fd, "status"), ["shortlisted", "accepted", "declined", "pending"] as const, "pending");
  tx(() => {
    db().prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, app.id);
    const cid = ensureConversation(app.musician_id, gig.business_id);
    if (status === "accepted") {
      const price = app.quote ?? gig.budget_max ?? gig.budget_min ?? 0;
      const bookingId = Number(
        db()
          .prepare(
            `INSERT INTO bookings (musician_id, business_id, gig_id, event_date, start_time, end_time, event_type, venue, price, notes, status, last_action_by)
             VALUES (?,?,?,?,?,?,?,?,?,?, 'confirmed', 'business')`,
          )
          .run(app.musician_id, gig.business_id, gig.id, gig.event_date, gig.start_time, gig.end_time, gig.event_type, gig.venue || gig.business_name, price, gig.title)
          .lastInsertRowid,
      );
      db().prepare("UPDATE gigs SET status = 'filled' WHERE id = ?").run(gig.id);
      addMessage(cid, null, sys("hired", { title: gig.title, date: gig.event_date, price }), "booking", bookingId);
    } else if (status === "shortlisted") {
      addMessage(cid, null, sys("shortlisted", { venue: gig.business_name, title: gig.title }), "system");
    } else if (status === "declined") {
      addMessage(cid, null, sys("notSelected", { title: gig.title }), "system");
    }
  });
  revalidatePath("/dashboard", "layout");
}

/* --------------------------- Bookings --------------------------- */

export async function requestBookingAction(_: FormState, fd: FormData): Promise<FormState> {
  const musicianId = Number(fd.get("musician_id"));
  const m = getMusicianById(musicianId);
  const v = await requireViewer(m ? `/musicians/${m.slug}` : "/musicians");
  const { t, d } = await getI18n();
  if (!m) return { error: t.errors.musicianNotFound };
  if (v.role !== "business") return { error: t.errors.venuesBook };
  const date = str(fd, "event_date");
  const start = str(fd, "start_time");
  const price = num(fd, "price");
  if (!isDate(date) || date < isoDate(new Date())) return { error: t.errors.chooseFuture };
  if (!isTime(start)) return { error: t.errors.chooseStart };
  if (!price) return { error: t.errors.enterOffer };
  const busy = db()
    .prepare("SELECT 1 FROM unavailable_dates WHERE musician_id = ? AND date = ? UNION SELECT 1 FROM bookings WHERE musician_id = ? AND event_date = ? AND status = 'confirmed'")
    .get(m.id, date, m.id, date);
  if (busy) return { error: t.errors.notAvailable(m.name, d(date)) };
  const eventType = oneOf(str(fd, "event_type"), EVENT_TYPES, "Private parties");
  const notes = str(fd, "notes", 1500);
  const cid = tx(() => {
    const bookingId = Number(
      db()
        .prepare(
          `INSERT INTO bookings (musician_id, business_id, event_date, start_time, end_time, event_type, venue, price, notes, status, last_action_by)
           VALUES (?,?,?,?,?,?,?,?,?, 'pending', 'business')`,
        )
        .run(m.id, v.business.id, date, start, isTime(str(fd, "end_time")) ? str(fd, "end_time") : null, eventType, str(fd, "venue", 200) || v.business.name, price, notes)
        .lastInsertRowid,
    );
    const cid = ensureConversation(m.id, v.business.id);
    if (notes) addMessage(cid, v.user.id, notes);
    addMessage(cid, null, sys("request", { event: eventType, date, price }), "booking", bookingId);
    return cid;
  });
  revalidatePath("/dashboard", "layout");
  redirect(`/messages?c=${cid}`);
}

export async function bookingAction(fd: FormData) {
  const v = await getViewer();
  const b = getBooking(Number(fd.get("booking_id")));
  if (!v || !b) return;
  const mine = v.role === "musician" ? b.musician_id === v.profileId : b.business_id === v.profileId;
  if (!mine) return;
  const action = str(fd, "action");
  const theirTurn = b.last_action_by !== v.role;
  const open = b.status === "pending" || b.status === "countered";
  const cid = ensureConversation(b.musician_id, b.business_id);
  const set = (status: string, price = b.price) =>
    db().prepare("UPDATE bookings SET status = ?, price = ?, last_action_by = ?, updated_at = datetime('now') WHERE id = ?").run(status, price, v.role, b.id);

  tx(() => {
    if (action === "accept" && open && theirTurn) {
      set("confirmed");
      addMessage(cid, null, sys("confirmed", { price: b.price, date: b.event_date, time: b.start_time }), "booking", b.id);
    } else if (action === "decline" && open) {
      set("declined");
      addMessage(cid, null, sys("declined", { by: v.role === "musician" ? b.musician_name : b.business_name }), "booking", b.id);
    } else if (action === "counter" && open && theirTurn) {
      const price = num(fd, "price");
      if (!price) return;
      set("countered", price);
      addMessage(cid, null, sys("counter", { price, was: b.price }), "booking", b.id);
    } else if (action === "cancel" && (b.status === "confirmed" || open)) {
      set("cancelled");
      addMessage(cid, null, sys("cancelled", { date: b.event_date, by: v.role === "musician" ? b.musician_name : b.business_name }), "booking", b.id);
    } else if (action === "complete" && b.status === "confirmed" && v.role === "business" && b.event_date <= isoDate(new Date())) {
      set("completed");
      addMessage(cid, null, sys("completed"), "booking", b.id);
    }
  });
  revalidatePath("/messages");
  revalidatePath("/dashboard", "layout");
}

export async function reviewAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = await requireViewer();
  const b = getBooking(Number(fd.get("booking_id")));
  if (v.role !== "business" || !b || b.business_id !== v.business.id || b.status !== "completed") return { error: (await getI18n()).t.errors.reviewAfter };
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating")) || 5));
  const body = str(fd, "body", 1500);
  const { t } = await getI18n();
  if (body.length < 10) return { error: t.errors.reviewShort };
  db()
    .prepare("INSERT INTO reviews (musician_id, business_id, author_name, rating, body, event_type) VALUES (?,?,?,?,?,?)")
    .run(b.musician_id, b.business_id, v.business.name, rating, body, b.event_type);
  revalidatePath(`/musicians/${b.musician_slug}`);
  revalidatePath("/dashboard", "layout");
  return { ok: t.errors.reviewThanks };
}

/* --------------------------- Messaging -------------------------- */

export async function startConversationAction(fd: FormData) {
  const target = str(fd, "target");
  const v = await requireViewer(target || "/messages");
  const mId = Number(fd.get("musician_id")) || null;
  const bId = Number(fd.get("business_id")) || null;
  let cid: number | null = null;
  if (v.role === "business" && mId) cid = ensureConversation(mId, v.business.id);
  if (v.role === "musician" && bId) cid = ensureConversation(v.musician.id, bId);
  redirect(cid ? `/messages?c=${cid}` : "/messages");
}

export async function sendMessageAction(conversationId: number, body: string) {
  const v = await getViewer();
  const c = getConversation(conversationId);
  const text = body.trim().slice(0, 4000);
  if (!v || !c || !text) return { ok: false };
  if (c.musician_user_id !== v.user.id && c.business_user_id !== v.user.id) return { ok: false };
  addMessage(c.id, v.user.id, text);
  return { ok: true };
}

/* ------------------------- Availability ------------------------- */

export async function toggleAvailabilityAction(date: string) {
  const v = await getViewer();
  if (!v || v.role !== "musician" || !isDate(date)) return { ok: false };
  const d = db();
  const exists = d.prepare("SELECT 1 FROM unavailable_dates WHERE musician_id = ? AND date = ?").get(v.musician.id, date);
  if (exists) d.prepare("DELETE FROM unavailable_dates WHERE musician_id = ? AND date = ?").run(v.musician.id, date);
  else d.prepare("INSERT INTO unavailable_dates (musician_id, date) VALUES (?,?)").run(v.musician.id, date);
  revalidatePath(`/musicians/${v.musician.slug}`);
  return { ok: true, blocked: !exists };
}

/* ---------------------------- Saved ----------------------------- */

export async function toggleSaveAction(fd: FormData) {
  const mId = Number(fd.get("musician_id"));
  const m = getMusicianById(mId);
  const v = await requireViewer(m ? `/musicians/${m.slug}` : "/musicians");
  if (v.role !== "business" || !m) return;
  const d = db();
  const exists = d.prepare("SELECT 1 FROM saved_musicians WHERE business_id = ? AND musician_id = ?").get(v.business.id, m.id);
  if (exists) d.prepare("DELETE FROM saved_musicians WHERE business_id = ? AND musician_id = ?").run(v.business.id, m.id);
  else d.prepare("INSERT INTO saved_musicians (business_id, musician_id) VALUES (?,?)").run(v.business.id, m.id);
  revalidatePath(`/musicians/${m.slug}`);
  revalidatePath("/dashboard/saved");
}
