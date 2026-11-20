/**
 * Tiny, dependency-free i18n.
 * Dictionaries are written as [English, Greek] pairs so both languages stay in sync;
 * `pick` turns them into one dictionary per language with full type safety.
 */
export type Lang = "en" | "el" | "ru";
export const LANGS: Lang[] = ["el", "en", "ru"];
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

const VALUE_RU: Record<string, string> = {
  Laiko: "Лайко",
  Pop: "Поп",
  Entexno: "Эндехно",
  Rock: "Рок",
  Retro: "Ретро",
  Rebetiko: "Ребетико",
  "Palio Laiko": "Старое лайко",
  Paradosiako: "Традиционная",
  Jazz: "Джаз",
  Greek: "Греческая",
  "Traditional Cypriot": "Кипрская традиционная",
  Electronic: "Электронная",
  House: "Хаус",
  Classical: "Классическая",
  Acoustic: "Акустика",
  Latin: "Латино",
  "Soul & Funk": "Соул и фанк",
  Blues: "Блюз",
  Lounge: "Лаунж",
  "R&B": "R&B",
  Folk: "Фолк",
  "Hip-Hop": "Хип-хоп",
  Nicosia: "Никосия",
  Limassol: "Лимассол",
  Larnaca: "Ларнака",
  Paphos: "Пафос",
  "Ayia Napa": "Айя-Напа",
  Protaras: "Протарас",
  Paralimni: "Паралимни",
  "Polis Chrysochous": "Полис-Хрисохус",
  Troodos: "Троодос",
  Kyrenia: "Кирения",
  "Island-wide": "Весь Кипр",
  "Solo artist": "Сольный исполнитель",
  Singer: "Вокалист",
  Band: "Группа",
  DJ: "DJ",
  Instrumentalist: "Инструменталист",
  Duo: "Дуэт",
  Orchestra: "Оркестр",
  Weddings: "Свадьбы",
  Restaurants: "Рестораны",
  "Corporate events": "Корпоративы",
  "Private parties": "Частные вечеринки",
  Festivals: "Фестивали",
  Nightlife: "Ночная жизнь",
  "Hotels & resorts": "Отели и курорты",
  Christenings: "Крестины",
  Restaurant: "Ресторан",
  "Hotel & Resort": "Отель и курорт",
  "Bar & Lounge": "Бар и лаунж",
  Club: "Клуб",
  "Beach Bar": "Пляжный бар",
  "Wedding Planner": "Свадебный организатор",
  "Event Organizer": "Организатор мероприятий",
  Festival: "Фестиваль",
  "Private Organizer": "Частный организатор",
  "Vocalist & guitarist": "Вокал и гитара",
  Vocalist: "Вокал",
  "Vocalist, bouzouki & laouto": "Вокал, бузуки и лауто",
  "Vocals & guitar": "Вокал и гитара",
  Vocals: "Вокал",
  Bouzouki: "Бузуки",
  Laouto: "Лауто",
  English: "Английский",
};

export function valueLabel(lang: Lang, v: string) {
  if (lang === "el") return VALUE_EL[v] ?? v;
  if (lang === "ru") return VALUE_RU[v] ?? v;
  return v;
}

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** English stored values whose Greek label matches a free-text query (accent-insensitive). */
export function englishValuesFor(q: string): string[] {
  const folded = fold(q);
  if (folded.length < 2) return [];
  // Greek nouns inflect (γάμος / γάμοι): compare on a stem for longer words.
  const needle = folded.length > 4 ? folded.slice(0, -2) : folded;
  const hits = new Set<string>();
  for (const map of [VALUE_EL, VALUE_RU]) for (const [en, label] of Object.entries(map)) if (fold(label).includes(needle)) hits.add(en);
  return [...hits];
}

export function locale(lang: Lang) {
  return lang === "el" ? "el-GR" : lang === "ru" ? "ru-RU" : "en-GB";
}

export function formatDate(lang: Lang, iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString(locale(lang), opts);
}

export function formatEuro(lang: Lang, n: number | null | undefined) {
  if (n == null) return "—";
  return "€" + Math.round(n).toLocaleString(locale(lang));
}

export function normalizeLang(v: string | undefined | null): Lang | null {
  return v === "el" || v === "en" || v === "ru" ? v : null;
}
