import "server-only";
import { db } from "./db";
import { searchMusicians, type Musician } from "./data";
import { CITY_COORDS } from "./constants";

export type MatchQuery = { event?: string; city?: string; genres: string[]; budget?: number; date?: string; type?: string };

export type MatchReason =
  | { k: "genres"; genres: string[] }
  | { k: "sameCity"; city: string }
  | { k: "nearCity"; city: string; km: number }
  | { k: "islandWide" }
  | { k: "inBudget" }
  | { k: "partBudget" }
  | { k: "onRequest" }
  | { k: "event"; event: string }
  | { k: "free"; date: string }
  | { k: "rated"; rating: number }
  | { k: "type"; type: string };

export type MatchResult = { m: Musician; score: number; reasons: MatchReason[]; busy: boolean; overBudget: boolean };

/** Great-circle distance in km between two Cyprus locations (null if unknown). */
export function km(a: string, b: string) {
  const A = CITY_COORDS[a];
  const B = CITY_COORDS[b];
  if (!A || !B) return null;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(B[0] - A[0]);
  const dLon = rad(B[1] - A[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(A[0])) * Math.cos(rad(B[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

/**
 * Transparent, rule-based scoring (0–100):
 * genres 35 · location 25 · budget 20 · artist type 10 · event type 5 · rating 5.
 * Musicians already booked/blocked on the chosen date are moved to the end.
 */
export function matchMusicians(q: MatchQuery, limit = 6): MatchResult[] {
  const all = searchMusicians({}, 500);
  const busySet = new Set<number>();
  if (q.date) {
    const rows = db()
      .prepare(
        `SELECT musician_id AS id FROM unavailable_dates WHERE date = ?
         UNION SELECT musician_id AS id FROM bookings WHERE event_date = ? AND status = 'confirmed'`,
      )
      .all(q.date, q.date);
    rows.forEach((r) => busySet.add(Number(r.id)));
  }

  const results = all.map((m): MatchResult => {
    const reasons: MatchReason[] = [];
    let score = 0;

    // Genres (35)
    if (q.genres.length) {
      const hit = q.genres.filter((g) => m.genres.includes(g));
      score += (hit.length / q.genres.length) * 35;
      if (hit.length) reasons.push({ k: "genres", genres: hit });
    } else score += 21;

    // Location (25)
    if (!q.city || q.city === "Island-wide") score += 20;
    else if (m.location === q.city) {
      score += 25;
      reasons.push({ k: "sameCity", city: m.location });
    } else if (m.location === "Island-wide") {
      score += 18;
      reasons.push({ k: "islandWide" });
    } else {
      const d = km(q.city, m.location);
      if (d != null) {
        score += d < 35 ? 20 : d < 70 ? 14 : d < 110 ? 8 : 4;
        if (d < 70) reasons.push({ k: "nearCity", city: m.location, km: d });
      } else score += 6;
    }

    // Budget (20)
    let overBudget = false;
    if (!q.budget) score += 14;
    else if (!m.price_from) {
      score += 10;
      reasons.push({ k: "onRequest" });
    } else if ((m.price_to ?? m.price_from) <= q.budget) {
      score += 20;
      reasons.push({ k: "inBudget" });
    } else if (m.price_from <= q.budget) {
      score += 14;
      reasons.push({ k: "partBudget" });
    } else {
      overBudget = true;
      score += Math.max(0, 8 - ((m.price_from - q.budget) / q.budget) * 16);
    }

    // Artist type (10) — e.g. band, DJ, singer
    if (!q.type) score += 7;
    else if (m.performer_type === q.type) {
      score += 10;
      reasons.push({ k: "type", type: q.type });
    } else score += 2;

    // Event type (5) — unknown counts as neutral
    if (!q.event) score += 3.5;
    else if (m.event_types.includes(q.event)) {
      score += 5;
      reasons.push({ k: "event", event: q.event });
    } else if (!m.event_types.length) score += 3;
    else score += 1;

    // Rating (5) — neutral for new profiles
    if (m.review_count) {
      score += (m.rating / 5) * 5;
      if (m.rating >= 4.5) reasons.push({ k: "rated", rating: m.rating });
    } else score += 3;

    const busy = busySet.has(m.id) || !m.available;
    if (q.date && !busy) reasons.push({ k: "free", date: q.date });
    return { m, score: Math.round(Math.min(100, score)), reasons, busy, overBudget };
  });

  return results.sort((a, b) => Number(a.busy) - Number(b.busy) || b.score - a.score || a.m.name.localeCompare(b.m.name)).slice(0, limit);
}
