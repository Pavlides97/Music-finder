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

export const CATEGORY_TILES: { genre: string; label: string; blurb: string; image: string }[] = [
  { genre: "Laiko", label: "Laiko", blurb: "Bouzouki nights & live laiko", image: "photo-1514320291840-2e0a9bf2a9ae" },
  { genre: "Traditional Cypriot", label: "Traditional Cypriot", blurb: "Violi, laouto & village songs", image: "photo-1460723237483-7a6dc9d0b212" },
  { genre: "Jazz", label: "Jazz", blurb: "Trios, vocalists & lounge sets", image: "photo-1415201364774-f6f0bb35f28f" },
  { genre: "House", label: "House & Electronic", blurb: "Sunset DJs & club headliners", image: "photo-1470225620780-dba8ba36b745" },
  { genre: "Classical", label: "Classical", blurb: "Quartets for ceremonies", image: "photo-1465847899084-d164df4dedc6" },
  { genre: "Rock", label: "Rock & Covers", blurb: "Full-band energy", image: "photo-1501386761578-eac5c94b800a" },
  { genre: "Latin", label: "Latin", blurb: "Salsa, bachata & bossa", image: "photo-1504609813442-a8924e83f76e" },
  { genre: "Acoustic", label: "Acoustic", blurb: "Intimate dinners & beach bars", image: "photo-1510915361894-db8b60106cb1" },
];
