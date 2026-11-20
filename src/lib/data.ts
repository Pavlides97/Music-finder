import "server-only";
import { db } from "./db";
import { isoDate, parseList } from "./utils";
import { englishValuesFor } from "./i18n/core";

/* ---------- Types ---------- */
export type Track = { title: string; url: string; duration?: string };

export type Musician = {
  id: number;
  user_id: number;
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  experience: string;
  years_active: number;
  performer_type: string;
  location: string;
  genres: string[];
  event_types: string[];
  performances: string[];
  languages: string[];
  members: number;
  price_from: number;
  price_to: number | null;
  hourly_rate: number | null;
  avatar: string | null;
  cover: string | null;
  photos: string[];
  tracks: Track[];
  videos: string[];
  phone: string | null;
  public_email: string | null;
  website: string | null;
  instagram: string | null;
  featured: number;
  verified: number;
  response_hours: number;
  rating: number;
  review_count: number;
};

export type Business = {
  id: number;
  user_id: number;
  slug: string;
  name: string;
  category: string;
  location: string;
  address: string | null;
  description: string;
  description_el: string | null;
  description_ru: string | null;
  music_wanted: string[];
  budget_min: number | null;
  budget_max: number | null;
  capacity: number | null;
  logo: string | null;
  cover: string | null;
  phone: string | null;
  public_email: string | null;
  website: string | null;
  verified: number;
  open_gigs?: number;
};

export type Gig = {
  id: number;
  business_id: number;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  venue: string | null;
  genres: string[];
  performer_type: string;
  event_type: string;
  budget_min: number | null;
  budget_max: number | null;
  description: string;
  title_el: string | null;
  description_el: string | null;
  title_ru: string | null;
  description_ru: string | null;
  deadline: string;
  status: "open" | "closed" | "filled";
  urgent: number;
  created_at: string;
  business_name: string;
  business_slug: string;
  business_logo: string | null;
  business_category: string;
  business_verified: number;
  applicant_count: number;
};

export type Booking = {
  id: number;
  musician_id: number;
  business_id: number;
  gig_id: number | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  event_type: string;
  venue: string;
  price: number;
  notes: string;
  status: "pending" | "countered" | "confirmed" | "declined" | "cancelled" | "completed";
  last_action_by: "musician" | "business";
  created_at: string;
  updated_at: string;
  musician_name: string;
  musician_slug: string;
  musician_avatar: string | null;
  business_name: string;
  business_slug: string;
  business_logo: string | null;
  has_review?: number;
};

export type Review = {
  id: number;
  author_name: string;
  rating: number;
  body: string;
  event_type: string | null;
  created_at: string;
  business_slug: string | null;
};

/* ---------- Helpers ---------- */
const MUSICIAN_SELECT = `
  SELECT m.*, COALESCE(r.avg, 0) AS rating, COALESCE(r.cnt, 0) AS review_count
  FROM musicians m
  LEFT JOIN (SELECT musician_id, AVG(rating) avg, COUNT(*) cnt FROM reviews GROUP BY musician_id) r ON r.musician_id = m.id`;

function toMusician(row: Record<string, unknown>): Musician {
  return {
    ...(row as unknown as Musician),
    genres: parseList(row.genres),
    event_types: parseList(row.event_types),
    performances: parseList(row.performances),
    languages: parseList(row.languages),
    photos: parseList(row.photos),
    videos: parseList(row.videos),
    tracks: (() => {
      try {
        return JSON.parse(String(row.tracks || "[]")) as Track[];
      } catch {
        return [];
      }
    })(),
    rating: Math.round(Number(row.rating) * 10) / 10,
    review_count: Number(row.review_count),
  };
}

function toBusiness(row: Record<string, unknown>): Business {
  return { ...(row as unknown as Business), music_wanted: parseList(row.music_wanted) };
}

const GIG_SELECT = `
  SELECT g.*, b.name AS business_name, b.slug AS business_slug, b.logo AS business_logo, b.category AS business_category,
    b.verified AS business_verified,
    (SELECT COUNT(*) FROM applications a WHERE a.gig_id = g.id AND a.status != 'withdrawn') AS applicant_count
  FROM gigs g JOIN businesses b ON b.id = g.business_id`;

function toGig(row: Record<string, unknown>): Gig {
  return { ...(row as unknown as Gig), genres: parseList(row.genres) };
}

const BOOKING_SELECT = `
  SELECT bk.*, m.name AS musician_name, m.slug AS musician_slug, m.avatar AS musician_avatar,
    b.name AS business_name, b.slug AS business_slug, b.logo AS business_logo,
    EXISTS (SELECT 1 FROM reviews r WHERE r.musician_id = bk.musician_id AND r.business_id = bk.business_id AND r.created_at >= bk.created_at) AS has_review
  FROM bookings bk JOIN musicians m ON m.id = bk.musician_id JOIN businesses b ON b.id = bk.business_id`;

const today = () => isoDate(new Date());

/* ---------- Musicians ---------- */
export type MusicianFilters = {
  q?: string;
  location?: string;
  genre?: string;
  type?: string;
  event?: string;
  budget?: number;
  date?: string;
  sort?: string;
};

export function searchMusicians(f: MusicianFilters, limit = 60): Musician[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (f.q) {
    // Also match Greek words for genres/cities/types ("λαϊκό" → Laiko) against the English stored values.
    const terms = [f.q, ...englishValuesFor(f.q)];
    where.push("(" + terms.map(() => "m.name LIKE ? OR m.tagline LIKE ? OR m.bio LIKE ? OR m.genres LIKE ? OR m.location LIKE ? OR m.performer_type LIKE ? OR m.event_types LIKE ?").join(" OR ") + ")");
    for (const term of terms) {
      const like = `%${term}%`;
      params.push(like, like, like, like, like, like, like);
    }
  }
  if (f.location) {
    where.push("m.location = ?");
    params.push(f.location);
  }
  if (f.genre) {
    where.push("EXISTS (SELECT 1 FROM json_each(m.genres) WHERE value = ?)");
    params.push(f.genre);
  }
  if (f.type) {
    where.push("m.performer_type = ?");
    params.push(f.type);
  }
  if (f.event) {
    where.push("EXISTS (SELECT 1 FROM json_each(m.event_types) WHERE value = ?)");
    params.push(f.event);
  }
  if (f.budget) {
    where.push("m.price_from <= ?");
    params.push(f.budget);
  }
  if (f.date) {
    where.push(`NOT EXISTS (SELECT 1 FROM unavailable_dates u WHERE u.musician_id = m.id AND u.date = ?)
      AND NOT EXISTS (SELECT 1 FROM bookings bk WHERE bk.musician_id = m.id AND bk.event_date = ? AND bk.status = 'confirmed')`);
    params.push(f.date, f.date);
  }
  const order =
    f.sort === "price_asc" ? "m.price_from ASC" :
    f.sort === "price_desc" ? "m.price_from DESC" :
    f.sort === "rating" ? "rating DESC, review_count DESC" :
    f.sort === "new" ? "m.created_at DESC, m.id DESC" :
    "m.featured DESC, m.verified DESC, rating DESC, review_count DESC";
  const sql = `${MUSICIAN_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT ${limit}`;
  return db().prepare(sql).all(...params).map(toMusician);
}

export function featuredMusicians(limit = 8) {
  return db().prepare(`${MUSICIAN_SELECT} WHERE m.featured = 1 ORDER BY rating DESC, m.id LIMIT ?`).all(limit).map(toMusician);
}

export function getMusicianBySlug(slug: string) {
  const row = db().prepare(`${MUSICIAN_SELECT} WHERE m.slug = ?`).get(slug);
  return row ? toMusician(row) : null;
}

export function getMusicianById(id: number) {
  const row = db().prepare(`${MUSICIAN_SELECT} WHERE m.id = ?`).get(id);
  return row ? toMusician(row) : null;
}

export function getMusicianByUser(userId: number) {
  const row = db().prepare(`${MUSICIAN_SELECT} WHERE m.user_id = ?`).get(userId);
  return row ? toMusician(row) : null;
}

export function similarMusicians(m: Musician, limit = 4) {
  return db()
    .prepare(`${MUSICIAN_SELECT} WHERE m.id != ? AND (m.performer_type = ? OR EXISTS (SELECT 1 FROM json_each(m.genres) WHERE value = ?)) ORDER BY rating DESC LIMIT ?`)
    .all(m.id, m.performer_type, m.genres[0] ?? "", limit)
    .map(toMusician);
}

export function getReviews(musicianId: number): Review[] {
  return db()
    .prepare(`SELECT r.*, b.slug AS business_slug FROM reviews r LEFT JOIN businesses b ON b.id = r.business_id WHERE r.musician_id = ? ORDER BY r.created_at DESC`)
    .all(musicianId) as unknown as Review[];
}

export function getBusyDates(musicianId: number) {
  const blocked = db().prepare("SELECT date FROM unavailable_dates WHERE musician_id = ? AND date >= ?").all(musicianId, today()).map((r) => String(r.date));
  const booked = db()
    .prepare("SELECT event_date AS date FROM bookings WHERE musician_id = ? AND status = 'confirmed' AND event_date >= ?")
    .all(musicianId, today())
    .map((r) => String(r.date));
  return { blocked, booked };
}

export function genreCounts() {
  return db()
    .prepare("SELECT j.value AS genre, COUNT(*) AS n FROM musicians m, json_each(m.genres) j GROUP BY j.value ORDER BY n DESC")
    .all() as { genre: string; n: number }[];
}

export function platformStats() {
  const d = db();
  const n = (sql: string) => Number((d.prepare(sql).get() as { n: number }).n);
  return {
    musicians: n("SELECT COUNT(*) n FROM musicians"),
    venues: n("SELECT COUNT(*) n FROM businesses"),
    openGigs: n(`SELECT COUNT(*) n FROM gigs WHERE status='open' AND deadline >= '${today()}'`),
    bookings: n("SELECT COUNT(*) n FROM bookings WHERE status IN ('confirmed','completed')"),
  };
}

/* ---------- Businesses ---------- */
export function listBusinesses(f: { location?: string; category?: string; q?: string } = {}) {
  const where: string[] = [];
  const params: string[] = [];
  if (f.location) {
    where.push("b.location = ?");
    params.push(f.location);
  }
  if (f.category) {
    where.push("b.category = ?");
    params.push(f.category);
  }
  if (f.q) {
    where.push("(b.name LIKE ? OR b.description LIKE ?)");
    params.push(`%${f.q}%`, `%${f.q}%`);
  }
  return db()
    .prepare(
      `SELECT b.*, (SELECT COUNT(*) FROM gigs g WHERE g.business_id = b.id AND g.status='open' AND g.deadline >= '${today()}') AS open_gigs
       FROM businesses b ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY b.verified DESC, open_gigs DESC, b.name`,
    )
    .all(...params)
    .map(toBusiness);
}

export function getBusinessBySlug(slug: string) {
  const row = db().prepare("SELECT * FROM businesses WHERE slug = ?").get(slug);
  return row ? toBusiness(row) : null;
}

export function getBusinessById(id: number) {
  const row = db().prepare("SELECT * FROM businesses WHERE id = ?").get(id);
  return row ? toBusiness(row) : null;
}

export function getBusinessByUser(userId: number) {
  const row = db().prepare("SELECT * FROM businesses WHERE user_id = ?").get(userId);
  return row ? toBusiness(row) : null;
}

/* ---------- Gigs ---------- */
export type GigFilters = { q?: string; location?: string; genre?: string; type?: string; event?: string; budget?: number; sort?: string };

export function searchGigs(f: GigFilters, limit = 60): Gig[] {
  const where = ["g.status = 'open'", "g.deadline >= ?"];
  const params: (string | number)[] = [today()];
  if (f.q) {
    const terms = [f.q, ...englishValuesFor(f.q)];
    where.push("(" + terms.map(() => "g.title LIKE ? OR g.description LIKE ? OR g.title_el LIKE ? OR g.description_el LIKE ? OR g.title_ru LIKE ? OR g.description_ru LIKE ? OR b.name LIKE ? OR g.location LIKE ? OR g.genres LIKE ? OR g.event_type LIKE ?").join(" OR ") + ")");
    for (const term of terms) {
      const like = `%${term}%`;
      params.push(like, like, like, like, like, like, like, like, like, like);
    }
  }
  if (f.location) {
    where.push("g.location = ?");
    params.push(f.location);
  }
  if (f.genre) {
    where.push("EXISTS (SELECT 1 FROM json_each(g.genres) WHERE value = ?)");
    params.push(f.genre);
  }
  if (f.type) {
    where.push("g.performer_type = ?");
    params.push(f.type);
  }
  if (f.event) {
    where.push("g.event_type = ?");
    params.push(f.event);
  }
  if (f.budget) {
    where.push("COALESCE(g.budget_max, g.budget_min, 0) >= ?");
    params.push(f.budget);
  }
  const order =
    f.sort === "budget" ? "COALESCE(g.budget_max, g.budget_min) DESC" :
    f.sort === "deadline" ? "g.deadline ASC" :
    f.sort === "new" ? "g.created_at DESC" :
    "g.urgent DESC, g.event_date ASC";
  return db().prepare(`${GIG_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${limit}`).all(...params).map(toGig);
}

export function upcomingGigs(limit = 6) {
  return searchGigs({}, limit);
}

export function getGig(id: number) {
  const row = db().prepare(`${GIG_SELECT} WHERE g.id = ?`).get(id);
  return row ? toGig(row) : null;
}

export function gigsForBusiness(businessId: number, includeClosed = true) {
  return db()
    .prepare(`${GIG_SELECT} WHERE g.business_id = ? ${includeClosed ? "" : "AND g.status='open' AND g.deadline >= '" + today() + "'"} ORDER BY g.event_date ASC`)
    .all(businessId)
    .map(toGig);
}

export type Application = {
  id: number;
  gig_id: number;
  musician_id: number;
  message: string;
  quote: number | null;
  status: "pending" | "shortlisted" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  musician_name: string;
  musician_slug: string;
  musician_avatar: string | null;
  musician_type: string;
  musician_location: string;
  rating: number;
  gig_title: string;
  gig_date: string;
  gig_location: string;
  business_name: string;
  business_slug: string;
};

const APP_SELECT = `
  SELECT a.*, m.name AS musician_name, m.slug AS musician_slug, m.avatar AS musician_avatar, m.performer_type AS musician_type,
    m.location AS musician_location, COALESCE((SELECT AVG(rating) FROM reviews r WHERE r.musician_id = m.id), 0) AS rating,
    g.title AS gig_title, g.event_date AS gig_date, g.location AS gig_location, b.name AS business_name, b.slug AS business_slug
  FROM applications a JOIN musicians m ON m.id = a.musician_id JOIN gigs g ON g.id = a.gig_id JOIN businesses b ON b.id = g.business_id`;

export function applicationsForGig(gigId: number) {
  return db().prepare(`${APP_SELECT} WHERE a.gig_id = ? ORDER BY CASE a.status WHEN 'accepted' THEN 0 WHEN 'shortlisted' THEN 1 WHEN 'pending' THEN 2 ELSE 3 END, a.created_at`).all(gigId) as unknown as Application[];
}

export function applicationsForMusician(musicianId: number) {
  return db().prepare(`${APP_SELECT} WHERE a.musician_id = ? ORDER BY a.created_at DESC`).all(musicianId) as unknown as Application[];
}

export function getApplication(gigId: number, musicianId: number) {
  return db().prepare(`${APP_SELECT} WHERE a.gig_id = ? AND a.musician_id = ?`).get(gigId, musicianId) as unknown as Application | undefined;
}

export function getApplicationById(id: number) {
  return db().prepare(`${APP_SELECT} WHERE a.id = ?`).get(id) as unknown as Application | undefined;
}

/* ---------- Bookings ---------- */
export function bookingsFor(role: "musician" | "business", id: number) {
  const col = role === "musician" ? "bk.musician_id" : "bk.business_id";
  return db().prepare(`${BOOKING_SELECT} WHERE ${col} = ? ORDER BY bk.event_date ASC`).all(id) as unknown as Booking[];
}

export function getBooking(id: number) {
  return db().prepare(`${BOOKING_SELECT} WHERE bk.id = ?`).get(id) as unknown as Booking | undefined;
}

/* ---------- Messaging ---------- */
export type ConversationSummary = {
  id: number;
  musician_id: number;
  business_id: number;
  updated_at: string;
  other_name: string;
  other_avatar: string | null;
  other_slug: string;
  last_body: string | null;
  last_kind: string | null;
  unread: number;
};

export function conversationsFor(user: { id: number; role: string }, profileId: number) {
  const isM = user.role === "musician";
  return db()
    .prepare(
      `SELECT c.*, ${isM ? "b.name" : "m.name"} AS other_name, ${isM ? "b.logo" : "m.avatar"} AS other_avatar, ${isM ? "b.slug" : "m.slug"} AS other_slug,
        (SELECT body FROM messages x WHERE x.conversation_id = c.id ORDER BY x.id DESC LIMIT 1) AS last_body,
        (SELECT kind FROM messages x WHERE x.conversation_id = c.id ORDER BY x.id DESC LIMIT 1) AS last_kind,
        (SELECT COUNT(*) FROM messages x WHERE x.conversation_id = c.id AND x.read_at IS NULL AND (x.sender_user_id IS NULL OR x.sender_user_id != ?)) AS unread
       FROM conversations c JOIN musicians m ON m.id = c.musician_id JOIN businesses b ON b.id = c.business_id
       WHERE ${isM ? "c.musician_id" : "c.business_id"} = ? ORDER BY c.updated_at DESC`,
    )
    .all(user.id, profileId) as unknown as ConversationSummary[];
}

export function unreadCount(user: { id: number; role: string }, profileId: number) {
  const col = user.role === "musician" ? "c.musician_id" : "c.business_id";
  const r = db()
    .prepare(
      `SELECT COUNT(*) n FROM messages x JOIN conversations c ON c.id = x.conversation_id
       WHERE ${col} = ? AND x.read_at IS NULL AND (x.sender_user_id IS NULL OR x.sender_user_id != ?)`,
    )
    .get(profileId, user.id) as { n: number };
  return Number(r.n);
}

export function getConversation(id: number) {
  return db()
    .prepare(
      `SELECT c.*, m.name AS musician_name, m.slug AS musician_slug, m.avatar AS musician_avatar, m.user_id AS musician_user_id,
        b.name AS business_name, b.slug AS business_slug, b.logo AS business_logo, b.user_id AS business_user_id
       FROM conversations c JOIN musicians m ON m.id = c.musician_id JOIN businesses b ON b.id = c.business_id WHERE c.id = ?`,
    )
    .get(id) as
    | {
        id: number;
        musician_id: number;
        business_id: number;
        musician_name: string;
        musician_slug: string;
        musician_avatar: string | null;
        musician_user_id: number;
        business_name: string;
        business_slug: string;
        business_logo: string | null;
        business_user_id: number;
      }
    | undefined;
}

export type Message = {
  id: number;
  conversation_id: number;
  sender_user_id: number | null;
  body: string;
  kind: "text" | "booking" | "system";
  booking_id: number | null;
  created_at: string;
  read_at: string | null;
};

export function getMessages(conversationId: number, afterId = 0) {
  return db().prepare("SELECT * FROM messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC").all(conversationId, afterId) as unknown as Message[];
}

export function ensureConversation(musicianId: number, businessId: number) {
  const d = db();
  const row = d.prepare("SELECT id FROM conversations WHERE musician_id = ? AND business_id = ?").get(musicianId, businessId);
  if (row) return Number(row.id);
  return Number(d.prepare("INSERT INTO conversations (musician_id, business_id) VALUES (?,?)").run(musicianId, businessId).lastInsertRowid);
}

export function addMessage(conversationId: number, senderUserId: number | null, body: string, kind: Message["kind"] = "text", bookingId: number | null = null) {
  const d = db();
  const id = Number(
    d.prepare("INSERT INTO messages (conversation_id, sender_user_id, body, kind, booking_id) VALUES (?,?,?,?,?)").run(conversationId, senderUserId, body, kind, bookingId).lastInsertRowid,
  );
  d.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
  return id;
}

export function markRead(conversationId: number, userId: number) {
  db()
    .prepare("UPDATE messages SET read_at = datetime('now') WHERE conversation_id = ? AND read_at IS NULL AND (sender_user_id IS NULL OR sender_user_id != ?)")
    .run(conversationId, userId);
}

/* ---------- Saved ---------- */
export function savedMusicians(businessId: number) {
  return db()
    .prepare(`${MUSICIAN_SELECT} JOIN saved_musicians s ON s.musician_id = m.id WHERE s.business_id = ? ORDER BY s.created_at DESC`)
    .all(businessId)
    .map(toMusician);
}

export function isSaved(businessId: number, musicianId: number) {
  return !!db().prepare("SELECT 1 FROM saved_musicians WHERE business_id = ? AND musician_id = ?").get(businessId, musicianId);
}
