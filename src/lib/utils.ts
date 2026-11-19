import clsx, { type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export function unsplash(id: string | null | undefined, w = 800) {
  if (!id) return "";
  if (id.startsWith("http") || id.startsWith("/")) return id;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function euro(n: number | null | undefined) {
  if (n == null) return "—";
  return "€" + Math.round(n).toLocaleString("en-GB");
}

export function budgetRange(min?: number | null, max?: number | null) {
  if (min && max) return `${euro(min)} – ${euro(max)}`;
  if (max) return `Up to ${euro(max)}`;
  if (min) return `From ${euro(min)}`;
  return "Negotiable";
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Musician price: "€300 – €600", "From €300" or null when not set. */
export function priceRange(from?: number | null, to?: number | null) {
  if (from && to && to > from) return `${euro(from)} – ${euro(to)}`;
  if (from) return `From ${euro(from)}`;
  if (to) return `Up to ${euro(to)}`;
  return null;
}

export function fmtDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString("en-GB", opts);
}

export function fmtDateLong(iso: string | null | undefined) {
  return fmtDate(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(iso.slice(0, 10), { day: "numeric", month: "short" });
}

export function daysUntil(iso: string) {
  const d = new Date(iso + "T23:59:59");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v !== "string" || !v) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p.map(String) : [];
  } catch {
    return [];
  }
}
