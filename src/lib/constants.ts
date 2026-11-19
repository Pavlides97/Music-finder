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

export const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Hotel & Resort",
  "Bar & Lounge",
  "Club",
  "Beach Bar",
  "Wedding Planner",
  "Event Organizer",
  "Festival",
  "Private Organizer",
] as const;

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
