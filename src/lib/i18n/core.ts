/**
 * Tiny, dependency-free i18n.
 * Dictionaries are written as [English, Greek] pairs so both languages stay in sync;
 * `pick` turns them into one dictionary per language with full type safety.
 */
export type Lang = "en" | "el";
export const LANGS: Lang[] = ["en", "el"];
export const LANG_COOKIE = "lang";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (...a: any[]) => string;
type Pair = readonly [string, string] | readonly [Fn, Fn];
type Tree = { readonly [k: string]: Pair | Tree };
export type Picked<T> = { [K in keyof T]: T[K] extends readonly [infer A, unknown] ? (A extends string ? string : A) : Picked<T[K]> };

export function pick<T extends Tree>(tree: T, i: 0 | 1): Picked<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(tree)) out[k] = Array.isArray(v) ? v[i] : pick(v as Tree, i);
  return out as Picked<T>;
}

/* ---------- Labels for stored values (DB keeps English values) ---------- */
const VALUE_EL: Record<string, string> = {
  // genres
  Laiko: "Λαϊκό",
  Pop: "Ποπ",
  Entexno: "Έντεχνο",
  Rock: "Ροκ",
  Retro: "Ρετρό",
  Rebetiko: "Ρεμπέτικο",
  "Palio Laiko": "Παλιό Λαϊκό",
  Paradosiako: "Παραδοσιακό",
  Jazz: "Τζαζ",
  Greek: "Ελληνικό",
  "Traditional Cypriot": "Κυπριακό παραδοσιακό",
  Electronic: "Ηλεκτρονική",
  House: "House",
  Classical: "Κλασική",
  Acoustic: "Ακουστική",
  Latin: "Λάτιν",
  "Soul & Funk": "Soul & Funk",
  Blues: "Μπλουζ",
  Lounge: "Lounge",
  "R&B": "R&B",
  Folk: "Φολκ",
  "Hip-Hop": "Hip-Hop",
  // locations
  Nicosia: "Λευκωσία",
  Limassol: "Λεμεσός",
  Larnaca: "Λάρνακα",
  Paphos: "Πάφος",
  "Ayia Napa": "Αγία Νάπα",
  Protaras: "Πρωταράς",
  Paralimni: "Παραλίμνι",
  "Polis Chrysochous": "Πόλις Χρυσοχούς",
  Troodos: "Τρόοδος",
  Kyrenia: "Κερύνεια",
  "Island-wide": "Παγκύπρια",
  // performer types
  "Solo artist": "Σόλο καλλιτέχνης",
  Singer: "Τραγουδιστής/τρια",
  Band: "Συγκρότημα",
  DJ: "DJ",
  Instrumentalist: "Οργανοπαίκτης",
  Duo: "Ντουέτο",
  Orchestra: "Ορχήστρα",
  // event types
  Weddings: "Γάμοι",
  Restaurants: "Εστιατόρια",
  "Corporate events": "Εταιρικές εκδηλώσεις",
  "Private parties": "Ιδιωτικά πάρτι",
  Festivals: "Φεστιβάλ",
  Nightlife: "Νυχτερινή διασκέδαση",
  "Hotels & resorts": "Ξενοδοχεία & θέρετρα",
  Christenings: "Βαφτίσια",
  // business categories
  Restaurant: "Εστιατόριο",
  "Hotel & Resort": "Ξενοδοχείο & θέρετρο",
  "Bar & Lounge": "Μπαρ & lounge",
  Club: "Κλαμπ",
  "Beach Bar": "Beach bar",
  "Wedding Planner": "Διοργανωτής γάμων",
  "Event Organizer": "Διοργανωτής εκδηλώσεων",
  Festival: "Φεστιβάλ",
  "Private Organizer": "Ιδιώτης διοργανωτής",
  // musician roles & performances (seed data)
  "Vocalist & guitarist": "Φωνή & κιθάρα",
  Vocalist: "Φωνή",
  "Vocalist, bouzouki & laouto": "Φωνή, μπουζούκι & λαούτο",
  "Vocals & guitar": "Φωνή & κιθάρα",
  Vocals: "Φωνή",
  Bouzouki: "Μπουζούκι",
  Laouto: "Λαούτο",
  // languages
  English: "Αγγλικά",
  Greek_lang: "Ελληνικά",
};

export function valueLabel(lang: Lang, v: string) {
  return lang === "el" ? (VALUE_EL[v] ?? v) : v;
}

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** English stored values whose Greek label matches a free-text query (accent-insensitive). */
export function englishValuesFor(q: string): string[] {
  const folded = fold(q);
  if (folded.length < 2) return [];
  // Greek nouns inflect (γάμος / γάμοι): compare on a stem for longer words.
  const needle = folded.length > 4 ? folded.slice(0, -2) : folded;
  return Object.entries(VALUE_EL)
    .filter(([, el]) => fold(el).includes(needle))
    .map(([en]) => en);
}

export function locale(lang: Lang) {
  return lang === "el" ? "el-GR" : "en-GB";
}

export function formatDate(lang: Lang, iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString(locale(lang), opts);
}

export function formatEuro(lang: Lang, n: number | null | undefined) {
  if (n == null) return "—";
  return "€" + Math.round(n).toLocaleString(lang === "el" ? "el-GR" : "en-GB");
}

export function normalizeLang(v: string | undefined | null): Lang | null {
  return v === "el" || v === "en" ? v : null;
}
