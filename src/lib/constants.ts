export const SITE_NAME = "SoundCY";

export const LOCATIONS = [
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Ayia Napa",
  "Protaras",
  "Paralimni",
  "Polis Chrysochous",
  "Troodos",
  "Kyrenia",
  "Island-wide",
] as const;

export const GENRES = [
  "Laiko",
  "Pop",
  "Entexno",
  "Rock",
  "Retro",
  "Rebetiko",
  "Palio Laiko",
  "Paradosiako",
  "Jazz",
  "Greek",
  "Traditional Cypriot",
  "Electronic",
  "House",
  "Classical",
  "Acoustic",
  "Latin",
  "Soul & Funk",
  "Blues",
  "Lounge",
  "R&B",
  "Folk",
  "Hip-Hop",
] as const;

export const PERFORMER_TYPES = [
  "Solo artist",
  "Singer",
  "Band",
  "DJ",
  "Instrumentalist",
  "Duo",
  "Orchestra",
] as const;

export const EVENT_TYPES = [
  "Weddings",
  "Restaurants",
  "Corporate events",
  "Private parties",
  "Festivals",
  "Nightlife",
  "Hotels & resorts",
  "Christenings",
] as const;

/** Event types that are private by nature — "Show on What's on" starts unticked for these. */
export const PRIVATE_EVENT_TYPES = ["Weddings", "Private parties", "Christenings"] as const;
export const isPrivateEvent = (t: string) => (PRIVATE_EVENT_TYPES as readonly string[]).includes(t);

/** Types of venue / business. */
export const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Bar",
  "Hotel",
  "Café",
  "Nightclub",
  "Beach Bar",
  "Event Space",
  "Wedding Planner",
  "Event Organizer",
  "Festival",
  "Other",
] as const;

export const COUNTRIES = ["Cyprus", "Greece", "United Kingdom", "Other"] as const;

export const BUDGET_STEPS = [150, 250, 400, 600, 900, 1500, 3000];

export const CATEGORY_TILES: { genre: string; blurb: string; hue: number }[] = [
  { genre: "Laiko", blurb: "Bouzouki nights & live laiko", hue: 24 },
  { genre: "Entexno", blurb: "Poetic Greek song", hue: 330 },
  { genre: "Pop", blurb: "Greek & international hits", hue: 290 },
  { genre: "Retro", blurb: "Timeless 70s–90s favourites", hue: 40 },
  { genre: "Rock", blurb: "Full-band energy", hue: 355 },
  { genre: "Palio Laiko", blurb: "Classic laiko of the golden era", hue: 15 },
  { genre: "Rebetiko", blurb: "Taverna blues of the city", hue: 260 },
  { genre: "Paradosiako", blurb: "Traditional Cypriot & Greek", hue: 160 },
];

/** Approximate city-centre coordinates [lat, lon], used for distance matching and the map. */
export const CITY_COORDS: Record<string, [number, number]> = {
  Nicosia: [35.1856, 33.3823],
  Limassol: [34.7071, 33.0226],
  Larnaca: [34.9229, 33.6233],
  Paphos: [34.7754, 32.4245],
  "Ayia Napa": [34.9823, 34.001],
  Protaras: [35.0125, 34.0583],
  Paralimni: [35.0379, 33.9822],
  "Polis Chrysochous": [35.0367, 32.4251],
  Troodos: [34.9396, 32.864],
  Kyrenia: [35.3417, 33.3192],
};
