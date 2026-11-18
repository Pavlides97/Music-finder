/* Realistic (fictional) sample data for the Cyprus music scene.
 * Dates are generated relative to "today" so the demo always looks current. */
import type { Database } from "./db";
import { hashPassword } from "./password";
import { addDays, isoDate } from "./utils";

const J = JSON.stringify;
const day = (n: number) => isoDate(addDays(new Date(), n));
const ts = (n: number, hour = 12) => {
  const d = addDays(new Date(), n);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString().replace("T", " ").slice(0, 19);
};
const track = (title: string, n: number, duration: string) => ({
  title,
  url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`,
  duration,
});

type M = {
  email: string;
  name: string;
  tagline: string;
  bio: string;
  experience: string;
  years: number;
  type: string;
  location: string;
  genres: string[];
  events: string[];
  performances: string[];
  languages: string[];
  members: number;
  price: number;
  hourly: number | null;
  avatar: string;
  cover: string;
  photos: string[];
  tracks: ReturnType<typeof track>[];
  featured?: boolean;
  verified?: boolean;
  response: number;
  instagram?: string;
};

const MUSICIANS: M[] = [
  {
    email: "eleni@demo.soundcy.app",
    name: "Eleni Charalambous",
    tagline: "Velvet jazz vocals for evenings that linger",
    bio: "Limassol-born jazz vocalist blending Great American Songbook standards with Greek-language reinterpretations. Eleni studied at the Berklee Valencia campus and returned to Cyprus to build a following across the island's hotel lounges and wine bars.\n\nExpect warm, intimate sets with piano or full trio, and a repertoire that moves effortlessly from Ella Fitzgerald to Manos Hadjidakis.",
    experience: "Resident vocalist at two 5-star Limassol hotels (2019–2024). Performed at Cyprus Jazz Week, the Rialto Theatre and over 120 weddings and corporate events.",
    years: 9,
    type: "Singer",
    location: "Limassol",
    genres: ["Jazz", "Lounge", "Greek", "Soul & Funk"],
    events: ["Weddings", "Restaurants", "Hotels & resorts", "Corporate events"],
    performances: ["Solo with backing tracks", "Duo with piano", "Jazz trio (vocals, piano, double bass)", "Wedding ceremony & cocktail hour"],
    languages: ["English", "Greek", "French"],
    members: 1,
    price: 350,
    hourly: 150,
    avatar: "photo-1494790108377-be9c29b29330",
    cover: "photo-1415201364774-f6f0bb35f28f",
    photos: ["photo-1511671782779-c97d3d27a1d4", "photo-1514320291840-2e0a9bf2a9ae", "photo-1520523839897-bd0b52f945a0", "photo-1459749411175-04bf5292ceea"],
    tracks: [track("Fly Me to the Moon (live at the marina)", 1, "4:12"), track("Ta Paidia tou Peiraia — jazz version", 2, "3:48"), track("At Last", 3, "4:35")],
    featured: true,
    verified: true,
    response: 2,
    instagram: "eleni.sings.jazz",
  },
  {
    email: "saltlake@demo.soundcy.app",
    name: "The Salt Lake Collective",
    tagline: "Larnaca's six-piece funk & soul party band",
    bio: "Named after Larnaca's famous flamingo lake, The Salt Lake Collective is a six-piece band with horns that turns every room into a dance floor. Funk, soul, disco and modern pop — arranged live, never on autopilot.",
    experience: "300+ shows since 2017. Regulars at Larnaca's Finikoudes summer series, corporate galas for major Cyprus banks and destination weddings across the island.",
    years: 8,
    type: "Band",
    location: "Larnaca",
    genres: ["Soul & Funk", "Pop", "R&B", "Rock"],
    events: ["Weddings", "Corporate events", "Festivals", "Private parties"],
    performances: ["3 x 45-minute live sets", "Ceremony acoustic duo + evening band", "DJ set between live sets", "Full PA & lighting included"],
    languages: ["English", "Greek"],
    members: 6,
    price: 1800,
    hourly: null,
    avatar: "photo-1525201548942-d8732f6617a0",
    cover: "photo-1501386761578-eac5c94b800a",
    photos: ["photo-1514525253161-7a46d19cd819", "photo-1540039155733-5bb30b53aa14", "photo-1516450360452-9312f5e86fc7", "photo-1493225457124-a3eb161ffa5f"],
    tracks: [track("September (live medley)", 4, "5:20"), track("Uptown Funk — horns edit", 5, "4:31")],
    featured: true,
    verified: true,
    response: 6,
  },
  {
    email: "kyma@demo.soundcy.app",
    name: "DJ Kyma",
    tagline: "Sunset-to-sunrise house from Ayia Napa",
    bio: "Kyma means 'wave' in Greek — and that's exactly how Kyma's sets move. Melodic house and afro house for beach clubs at golden hour, building to peak-time energy after dark.",
    experience: "Summer residencies at three Ayia Napa beach clubs. Support slots for international headliners at island festivals. Mixes featured on Cyprus radio.",
    years: 7,
    type: "DJ",
    location: "Ayia Napa",
    genres: ["House", "Electronic", "Lounge"],
    events: ["Nightlife", "Festivals", "Private parties", "Hotels & resorts"],
    performances: ["Sunset lounge set (3h)", "Peak-time club set (2h)", "Yacht & villa parties", "Own Pioneer CDJ setup available"],
    languages: ["English", "Greek"],
    members: 1,
    price: 400,
    hourly: 120,
    avatar: "photo-1574391884720-bbc3740c59d1",
    cover: "photo-1470225620780-dba8ba36b745",
    photos: ["photo-1429962714451-bb934ecdc4ec", "photo-1492684223066-81342ee5ff30", "photo-1506157786151-b8491531f063"],
    tracks: [track("Golden Hour at Nissi — mix excerpt", 6, "6:02"), track("Afro Kyma — live recording", 7, "5:44")],
    featured: true,
    verified: true,
    response: 1,
    instagram: "djkyma",
  },
  {
    email: "akt@demo.soundcy.app",
    name: "Andreas Kyriakou Trio",
    tagline: "Modern jazz trio rooted in the Mediterranean",
    bio: "Pianist Andreas Kyriakou leads a tight Nicosia trio that reinterprets jazz standards through Cypriot and Middle-Eastern modes. Equally at home in concert halls and candle-lit restaurants.",
    experience: "Two original albums. Performances at the Nicosia Municipal Theatre and the Pafos Aphrodite Festival fringe. Weekly residency in old-town Nicosia.",
    years: 12,
    type: "Band",
    location: "Nicosia",
    genres: ["Jazz", "Classical", "Lounge"],
    events: ["Restaurants", "Corporate events", "Hotels & resorts", "Festivals"],
    performances: ["Background dinner jazz (2–3h)", "Concert performance of originals", "Trio or quartet with vocalist"],
    languages: ["English", "Greek"],
    members: 3,
    price: 650,
    hourly: 250,
    avatar: "photo-1500648767791-00dcc994a43e",
    cover: "photo-1520523839897-bd0b52f945a0",
    photos: ["photo-1415201364774-f6f0bb35f28f", "photo-1507838153414-b4b713384a76", "photo-1511192336575-5a79af67a629"],
    tracks: [track("Kalamatianos in 7/8 (trio)", 8, "6:15"), track("Autumn Leaves", 9, "5:03")],
    featured: true,
    verified: true,
    response: 12,
  },
  {
    email: "lefkara@demo.soundcy.app",
    name: "Lefkara Strings",
    tagline: "Elegant string quartet for ceremonies & receptions",
    bio: "Four classically trained musicians performing everything from Vivaldi and Pachelbel to string arrangements of Coldplay and Greek love songs. The most requested ceremony ensemble for Cyprus destination weddings.",
    experience: "450+ weddings, including ceremonies at Agia Napa Monastery, Kouklia and private villas in Paphos. Members perform with leading Cyprus orchestras.",
    years: 10,
    type: "Instrumentalist",
    location: "Larnaca",
    genres: ["Classical", "Pop", "Greek"],
    events: ["Weddings", "Corporate events", "Christenings", "Hotels & resorts"],
    performances: ["Ceremony (up to 45 min)", "Cocktail reception (90 min)", "Duo, trio or full quartet", "Custom song arrangements"],
    languages: ["English", "Greek", "Russian"],
    members: 4,
    price: 550,
    hourly: null,
    avatar: "photo-1465847899084-d164df4dedc6",
    cover: "photo-1519167758481-83f550bb49b3",
    photos: ["photo-1511795409834-ef04bbd61622", "photo-1464366400600-7168b8af9bc3", "photo-1465847899084-d164df4dedc6"],
    tracks: [track("Canon in D — ceremony entrance", 10, "4:40"), track("A Thousand Years (strings)", 11, "4:22")],
    featured: true,
    verified: true,
    response: 4,
  },
  {
    email: "paradosi@demo.soundcy.app",
    name: "Paradosi Duo",
    tagline: "Traditional Cypriot violi & laouto",
    bio: "Marios on violi, Stelios on laouto — two musicians from the Paphos villages keeping Cyprus's musical tradition alive. Tsiattista, sousta, the bride's dressing song and every dance your grandmother knows.",
    experience: "Performed at village panigyria across Paphos district for 15 years. Featured at the Cyprus Wine Festival in Limassol and on CyBC cultural programmes.",
    years: 15,
    type: "Duo",
    location: "Paphos",
    genres: ["Traditional Cypriot", "Greek", "Folk"],
    events: ["Weddings", "Christenings", "Festivals", "Restaurants", "Hotels & resorts"],
    performances: ["Traditional wedding customs (dressing of the groom/bride)", "Taverna nights", "Cultural shows for hotel guests", "Expandable to 5-piece with singers"],
    languages: ["Greek", "English"],
    members: 2,
    price: 300,
    hourly: 120,
    avatar: "photo-1506794778202-cad84cf45f1d",
    cover: "photo-1460723237483-7a6dc9d0b212",
    photos: ["photo-1510915361894-db8b60106cb1", "photo-1514320291840-2e0a9bf2a9ae"],
    tracks: [track("Sousta Pafitiki", 12, "3:55"), track("Ta Rialia", 13, "4:10")],
    featured: true,
    verified: true,
    response: 8,
  },
  {
    email: "nefeli@demo.soundcy.app",
    name: "Nefeli Ioannou",
    tagline: "Acoustic singer-songwriter · loop pedal · good vibes",
    bio: "Guitar, voice and a loop pedal. Nefeli builds layered acoustic covers of today's hits plus her own bilingual originals. Perfect for brunches, beach bars and laid-back dinners.",
    experience: "Weekly slots at Nicosia cafés and Limassol marina restaurants. 40k monthly listeners on streaming platforms.",
    years: 5,
    type: "Solo artist",
    location: "Nicosia",
    genres: ["Acoustic", "Pop", "Folk"],
    events: ["Restaurants", "Private parties", "Weddings", "Nightlife"],
    performances: ["2 x 1h acoustic sets", "Brunch background set", "Ceremony song requests"],
    languages: ["English", "Greek"],
    members: 1,
    price: 200,
    hourly: 90,
    avatar: "photo-1534528741775-53994a69daeb",
    cover: "photo-1510915361894-db8b60106cb1",
    photos: ["photo-1460723237483-7a6dc9d0b212", "photo-1511671782779-c97d3d27a1d4"],
    tracks: [track("Thalassa (original)", 14, "3:30"), track("Dreams — loop cover", 15, "4:01")],
    featured: true,
    response: 3,
    instagram: "nefeli.music",
  },
  {
    email: "aphrodite@demo.soundcy.app",
    name: "Aphrodite's Rock",
    tagline: "Paphos's loudest classic & modern rock covers",
    bio: "Four friends, two guitars and forty years of rock history. From Led Zeppelin to Arctic Monkeys, Aphrodite's Rock brings stadium energy to bars, festivals and anyone brave enough to book them for a wedding.",
    experience: "Headlined Paphos Beer Festival. Regular Friday nights at Kato Paphos bars. Opened for touring Greek rock bands.",
    years: 6,
    type: "Band",
    location: "Paphos",
    genres: ["Rock", "Blues", "Pop"],
    events: ["Nightlife", "Festivals", "Private parties", "Corporate events"],
    performances: ["2 x 1h sets", "Full PA available", "Unplugged duo option"],
    languages: ["English", "Greek"],
    members: 4,
    price: 700,
    hourly: null,
    avatar: "photo-1539571696357-5a69c17a67c6",
    cover: "photo-1459749411175-04bf5292ceea",
    photos: ["photo-1501386761578-eac5c94b800a", "photo-1524368535928-5b5e00ddc76b", "photo-1487180144351-b8472da7d491"],
    tracks: [track("Whole Lotta Love (live)", 16, "5:12"), track("Do I Wanna Know?", 1, "4:25")],
    response: 10,
  },
  {
    email: "ritmo@demo.soundcy.app",
    name: "Ritmo Chipre",
    tagline: "Latin heat — salsa, bachata & bossa nova",
    bio: "A five-piece Latin band led by Cuban-Cypriot percussionist Rafael Hadjimichael. Salsa nights, bossa nova dinners and bachata workshops that get even the shyest guests dancing.",
    experience: "Monthly salsa nights in Limassol since 2018. Corporate summer parties, hotel gala dinners and the Limassol Carnival.",
    years: 8,
    type: "Band",
    location: "Limassol",
    genres: ["Latin", "Jazz", "Pop"],
    events: ["Nightlife", "Corporate events", "Hotels & resorts", "Private parties", "Weddings"],
    performances: ["Salsa dance night (3 x 45min)", "Bossa nova dinner trio", "Dance teacher add-on"],
    languages: ["English", "Spanish", "Greek"],
    members: 5,
    price: 900,
    hourly: null,
    avatar: "photo-1507003211169-0a1dd7228f2d",
    cover: "photo-1504609813442-a8924e83f76e",
    photos: ["photo-1516450360452-9312f5e86fc7", "photo-1429962714451-bb934ecdc4ec"],
    tracks: [track("Quimbara (live)", 2, "5:05"), track("Garota de Ipanema", 3, "4:15")],
    featured: true,
    verified: true,
    response: 5,
  },
  {
    email: "solenne@demo.soundcy.app",
    name: "DJ Solenne",
    tagline: "Deep house & disco for golden-hour terraces",
    bio: "Protaras-based selector specialising in deep house, nu-disco and organic grooves. Solenne reads a room like few others — from hotel pool afternoons to rooftop after-parties.",
    experience: "Resident at two Protaras hotel pool bars. Wedding after-party specialist. Vinyl & digital.",
    years: 4,
    type: "DJ",
    location: "Protaras",
    genres: ["House", "Electronic", "Soul & Funk"],
    events: ["Hotels & resorts", "Weddings", "Nightlife", "Private parties"],
    performances: ["Pool party (4h)", "Wedding after-party", "Vinyl-only set on request"],
    languages: ["English", "Greek", "French"],
    members: 1,
    price: 300,
    hourly: 100,
    avatar: "photo-1544005313-94ddf0286df2",
    cover: "photo-1492684223066-81342ee5ff30",
    photos: ["photo-1470225620780-dba8ba36b745", "photo-1574391884720-bbc3740c59d1"],
    tracks: [track("Pool Deck Sessions Vol. 3", 4, "7:30")],
    response: 3,
  },
  {
    email: "christos@demo.soundcy.app",
    name: "Christos Papadopoulos",
    tagline: "Concert pianist for refined occasions",
    bio: "Royal College of Music graduate offering classical repertoire, cinematic arrangements and tasteful background piano for lobbies, galas and ceremonies.",
    experience: "Soloist with Cyprus chamber ensembles. Hotel lobby residencies in Nicosia and Limassol. Corporate galas for embassies and shipping firms.",
    years: 14,
    type: "Instrumentalist",
    location: "Nicosia",
    genres: ["Classical", "Jazz", "Pop"],
    events: ["Corporate events", "Hotels & resorts", "Weddings", "Private parties"],
    performances: ["Background piano (2–4h)", "Ceremony & first dance", "Recital programme"],
    languages: ["English", "Greek", "German"],
    members: 1,
    price: 300,
    hourly: 110,
    avatar: "photo-1472099645785-5658abf4ff4e",
    cover: "photo-1507838153414-b4b713384a76",
    photos: ["photo-1520523839897-bd0b52f945a0"],
    tracks: [track("Clair de Lune", 5, "5:10"), track("Cinema Paradiso Suite", 6, "4:48")],
    verified: true,
    response: 24,
  },
  {
    email: "kefi@demo.soundcy.app",
    name: "Kefi Ensemble",
    tagline: "Live bouzouki & laiko — the glendi starts here",
    bio: "Bouzouki, baglamas, keyboards, drums and two powerhouse vocalists. Kefi Ensemble brings the authentic Greek nightlife experience — plate-smashing optional — to weddings, tavernas and hotel Greek nights.",
    experience: "Resident band at Limassol bouzoukia (2015–2022). Over 600 weddings and christenings across Cyprus and Greece.",
    years: 11,
    type: "Band",
    location: "Limassol",
    genres: ["Greek", "Traditional Cypriot", "Pop"],
    events: ["Weddings", "Christenings", "Restaurants", "Hotels & resorts", "Nightlife"],
    performances: ["Wedding reception (4–5h)", "Greek night for hotels", "Bouzouki duo for tavernas"],
    languages: ["Greek", "English"],
    members: 6,
    price: 1400,
    hourly: null,
    avatar: "photo-1519892300165-cb5542fb47c7",
    cover: "photo-1514320291840-2e0a9bf2a9ae",
    photos: ["photo-1516450360452-9312f5e86fc7", "photo-1540039155733-5bb30b53aa14"],
    tracks: [track("Zeibekiko medley", 7, "6:20"), track("Laiko party mix (live)", 8, "8:02")],
    featured: true,
    verified: true,
    response: 6,
  },
  {
    email: "yiannis@demo.soundcy.app",
    name: "Yiannis Sax",
    tagline: "Lounge saxophone over DJ sets & dinner",
    bio: "Live sax on top of house beats or smooth solo jazz for dinner — Yiannis is the add-on that makes events unforgettable.",
    experience: "Performs alongside DJs at Ayia Napa and Limassol clubs. Corporate launches for automotive and real-estate brands.",
    years: 6,
    type: "Instrumentalist",
    location: "Ayia Napa",
    genres: ["Lounge", "House", "Jazz", "Soul & Funk"],
    events: ["Nightlife", "Corporate events", "Weddings", "Hotels & resorts"],
    performances: ["Sax with DJ (2 x 45min)", "Dinner jazz with backing tracks", "Wedding entrance & cocktail"],
    languages: ["English", "Greek"],
    members: 1,
    price: 250,
    hourly: 120,
    avatar: "photo-1511192336575-5a79af67a629",
    cover: "photo-1458560871784-56d23406c091",
    photos: ["photo-1429962714451-bb934ecdc4ec"],
    tracks: [track("Sunset Sax over Deep House", 9, "5:30")],
    response: 4,
  },
  {
    email: "mesogeios@demo.soundcy.app",
    name: "Mesogeios Chamber Orchestra",
    tagline: "Twenty musicians. One unforgettable moment.",
    bio: "A flexible chamber orchestra of 8 to 24 players, available for galas, festivals, film-music concerts and large ceremonies.",
    experience: "Annual summer concerts at ancient theatres in Cyprus. Gala performances for EU presidency events and international conferences.",
    years: 9,
    type: "Orchestra",
    location: "Nicosia",
    genres: ["Classical"],
    events: ["Festivals", "Corporate events", "Weddings"],
    performances: ["Gala concert (60–90min)", "Film music programme", "Ceremony with choir"],
    languages: ["English", "Greek"],
    members: 20,
    price: 3500,
    hourly: null,
    avatar: "photo-1465847899084-d164df4dedc6",
    cover: "photo-1507838153414-b4b713384a76",
    photos: ["photo-1520523839897-bd0b52f945a0"],
    tracks: [track("Hadjidakis Suite (excerpt)", 10, "7:45")],
    verified: true,
    response: 48,
  },
  {
    email: "maria@demo.soundcy.app",
    name: "Maria Georgiou",
    tagline: "Wedding singer · Greek & English hits",
    bio: "From the church aisle to the last dance, Maria covers every moment of your big day with a voice that's been called 'goosebumps on demand'.",
    experience: "Finalist on a Greek TV talent show. 250+ weddings. Performs with her own 4-piece band or with backing tracks.",
    years: 8,
    type: "Singer",
    location: "Larnaca",
    genres: ["Pop", "Greek", "Soul & Funk"],
    events: ["Weddings", "Christenings", "Private parties", "Corporate events"],
    performances: ["Church ceremony", "Reception with band", "Solo with backing tracks"],
    languages: ["Greek", "English"],
    members: 1,
    price: 450,
    hourly: 160,
    avatar: "photo-1531746020798-e6953c6e8e04",
    cover: "photo-1511795409834-ef04bbd61622",
    photos: ["photo-1511671782779-c97d3d27a1d4", "photo-1464366400600-7168b8af9bc3"],
    tracks: [track("Perfect (ceremony version)", 11, "4:20"), track("S' agapo — live", 12, "3:50")],
    verified: true,
    response: 2,
  },
  {
    email: "troodos@demo.soundcy.app",
    name: "Troodos Echoes",
    tagline: "Mountain folk & acoustic Americana",
    bio: "Fiddle, mandolin and close harmonies from the Troodos mountains. Perfect for winery events, agrotourism retreats and rustic weddings.",
    experience: "Regulars at Troodos and Pitsilia wine festivals. Played the Kyperounta and Omodos village festivals.",
    years: 5,
    type: "Duo",
    location: "Troodos",
    genres: ["Folk", "Acoustic", "Traditional Cypriot", "Blues"],
    events: ["Restaurants", "Weddings", "Festivals", "Private parties"],
    performances: ["Winery afternoon (3h)", "Rustic wedding ceremony", "Campfire set"],
    languages: ["English", "Greek"],
    members: 2,
    price: 280,
    hourly: 100,
    avatar: "photo-1517841905240-472988babdf9",
    cover: "photo-1460723237483-7a6dc9d0b212",
    photos: ["photo-1510915361894-db8b60106cb1"],
    tracks: [track("Wine Road Reel", 13, "3:25")],
    response: 12,
  },
];

type B = {
  email: string;
  name: string;
  category: string;
  location: string;
  address: string;
  description: string;
  wanted: string[];
  bmin: number;
  bmax: number;
  capacity: number;
  logo: string;
  cover: string;
  phone: string;
  website: string;
  verified?: boolean;
};

const BUSINESSES: B[] = [
  {
    email: "oldport@demo.soundcy.app",
    name: "The Old Port Bistro",
    category: "Restaurant",
    location: "Limassol",
    address: "Limassol Old Port, Limassol 3042",
    description: "Seafood bistro on the Limassol Old Port waterfront with a terrace for 120 guests. We host live music Thursday to Sunday — jazz and acoustic for dinner, bossa and soul for late-night drinks.",
    wanted: ["Jazz", "Acoustic", "Latin", "Lounge"],
    bmin: 200,
    bmax: 600,
    capacity: 120,
    logo: "photo-1517248135467-4c7edcad34c4",
    cover: "photo-1517248135467-4c7edcad34c4",
    phone: "+357 25 000 101",
    website: "oldportbistro.example.cy",
    verified: true,
  },
  {
    email: "azure@demo.soundcy.app",
    name: "Azure Bay Resort & Spa",
    category: "Hotel & Resort",
    location: "Paphos",
    address: "Poseidonos Avenue, Kato Paphos 8042",
    description: "5-star seafront resort with 280 rooms, three restaurants and a sunset pool bar. We programme nightly entertainment for guests and host 60+ destination weddings per season.",
    wanted: ["Traditional Cypriot", "Greek", "Jazz", "Classical", "House"],
    bmin: 300,
    bmax: 2500,
    capacity: 450,
    logo: "photo-1566073771259-6a8506099945",
    cover: "photo-1566073771259-6a8506099945",
    phone: "+357 26 000 202",
    website: "azurebay.example.cy",
    verified: true,
  },
  {
    email: "kymata@demo.soundcy.app",
    name: "Kymata Beach Club",
    category: "Beach Bar",
    location: "Ayia Napa",
    address: "Nissi Avenue, Ayia Napa 5343",
    description: "Ayia Napa's sunset beach club. Daybeds, cocktails and a DJ booth facing the sea. Looking for DJs and live acts who understand golden-hour energy.",
    wanted: ["House", "Electronic", "Lounge", "Latin"],
    bmin: 250,
    bmax: 1200,
    capacity: 600,
    logo: "photo-1514933651103-005eec06c04b",
    cover: "photo-1506157786151-b8491531f063",
    phone: "+357 23 000 303",
    website: "kymata.example.cy",
    verified: true,
  },
  {
    email: "yitonia@demo.soundcy.app",
    name: "Yitonia Meze House",
    category: "Restaurant",
    location: "Nicosia",
    address: "Old Town, Nicosia 1011",
    description: "Family-run meze taverna in a restored 1920s house inside the Venetian walls. Live traditional and Greek music every Friday and Saturday night.",
    wanted: ["Traditional Cypriot", "Greek", "Folk"],
    bmin: 150,
    bmax: 450,
    capacity: 90,
    logo: "photo-1414235077428-338989a2e8c0",
    cover: "photo-1414235077428-338989a2e8c0",
    phone: "+357 22 000 404",
    website: "yitonia.example.cy",
  },
  {
    email: "velvet@demo.soundcy.app",
    name: "Velvet Room",
    category: "Bar & Lounge",
    location: "Nicosia",
    address: "Makariou Avenue, Nicosia 1065",
    description: "Speakeasy-style cocktail bar with a baby grand piano. Jazz Wednesdays, soul Fridays and a monthly singer-songwriter night.",
    wanted: ["Jazz", "Soul & Funk", "Blues", "Acoustic"],
    bmin: 200,
    bmax: 500,
    capacity: 70,
    logo: "photo-1470337458703-46ad1756a187",
    cover: "photo-1470337458703-46ad1756a187",
    phone: "+357 22 000 505",
    website: "velvetroom.example.cy",
  },
  {
    email: "everafter@demo.soundcy.app",
    name: "Ever After Weddings Cyprus",
    category: "Wedding Planner",
    location: "Paphos",
    address: "Paphos & island-wide",
    description: "Destination wedding planners organising 90+ weddings a year for couples from the UK, Israel, Scandinavia and Lebanon. We need reliable ceremony musicians, bands and DJs across the island.",
    wanted: ["Classical", "Pop", "Soul & Funk", "Greek", "House"],
    bmin: 400,
    bmax: 3000,
    capacity: 0,
    logo: "photo-1511795409834-ef04bbd61622",
    cover: "photo-1519167758481-83f550bb49b3",
    phone: "+357 99 000 606",
    website: "everafter.example.cy",
    verified: true,
  },
  {
    email: "islandpulse@demo.soundcy.app",
    name: "Island Pulse Events",
    category: "Event Organizer",
    location: "Limassol",
    address: "Limassol & island-wide",
    description: "Corporate event agency producing product launches, conferences and summer parties for tech, shipping and finance companies in Limassol.",
    wanted: ["Pop", "Soul & Funk", "House", "Jazz", "Latin"],
    bmin: 500,
    bmax: 5000,
    capacity: 0,
    logo: "photo-1492684223066-81342ee5ff30",
    cover: "photo-1540039155733-5bb30b53aa14",
    phone: "+357 25 000 707",
    website: "islandpulse.example.cy",
    verified: true,
  },
  {
    email: "saltfest@demo.soundcy.app",
    name: "Salt & Sound Festival",
    category: "Festival",
    location: "Larnaca",
    address: "Larnaca seafront",
    description: "Two-day spring music festival by the Larnaca Salt Lake celebrating Cypriot talent across three stages: Main, Electronic and Roots.",
    wanted: ["Rock", "Electronic", "Traditional Cypriot", "Pop", "House"],
    bmin: 400,
    bmax: 4000,
    capacity: 5000,
    logo: "photo-1533174072545-7a4b6ad7a6c3",
    cover: "photo-1533174072545-7a4b6ad7a6c3",
    phone: "+357 24 000 808",
    website: "saltandsound.example.cy",
  },
];

type G = {
  biz: string;
  title: string;
  in: number;
  start: string;
  end: string;
  loc: string;
  venue?: string;
  genres: string[];
  type: string;
  event: string;
  min: number;
  max: number;
  desc: string;
  deadlineIn: number;
  urgent?: boolean;
};

const GIGS: G[] = [
  { biz: "oldport@demo.soundcy.app", title: "Friday Night Jazz on the Terrace", in: 9, start: "20:30", end: "23:30", loc: "Limassol", genres: ["Jazz", "Lounge"], type: "Singer", event: "Restaurants", min: 250, max: 400, desc: "Looking for a jazz vocalist (with or without accompanist) for a 3-hour dinner set on our waterfront terrace. Background volume, standards and some Greek favourites welcome. PA system provided.", deadlineIn: 4 },
  { biz: "oldport@demo.soundcy.app", title: "Sunday Bossa Brunch Residency", in: 18, start: "12:00", end: "15:00", loc: "Limassol", genres: ["Latin", "Acoustic", "Jazz"], type: "Duo", event: "Restaurants", min: 200, max: 350, desc: "Weekly Sunday brunch residency from December through March. Bossa nova, acoustic soul, light Latin. Duo preferred. Food & drinks included for musicians.", deadlineIn: 10 },
  { biz: "azure@demo.soundcy.app", title: "Cypriot Night — Live Traditional Duo", in: 12, start: "19:30", end: "22:30", loc: "Paphos", venue: "Azure Bay — Olive Tree Terrace", genres: ["Traditional Cypriot", "Greek"], type: "Duo", event: "Hotels & resorts", min: 300, max: 500, desc: "Our weekly Cypriot Night buffet for 250 guests. We need a traditional duo or trio (violi, laouto, voice) who can also lead a short dance demonstration with our animation team.", deadlineIn: 6 },
  { biz: "azure@demo.soundcy.app", title: "New Year's Eve Gala — Headline Band", in: 43, start: "21:00", end: "02:00", loc: "Paphos", venue: "Azure Bay — Grand Ballroom", genres: ["Pop", "Soul & Funk", "Greek"], type: "Band", event: "Hotels & resorts", min: 2000, max: 3500, desc: "Black-tie NYE gala for 400 guests. Seeking a polished 5–8 piece band covering international pop/soul and a Greek party set after midnight. Countdown coordination with our AV team.", deadlineIn: 14, urgent: true },
  { biz: "kymata@demo.soundcy.app", title: "Winter Sunset Sessions — Resident DJ", in: 6, start: "16:00", end: "20:00", loc: "Ayia Napa", genres: ["House", "Electronic"], type: "DJ", event: "Nightlife", min: 250, max: 400, desc: "Weekend sunset DJ for our winter season (open Fri–Sun). Melodic/afro house, warm crowd-pleasing selections. Pioneer CDJ-3000 + DJM-900 in booth.", deadlineIn: 3, urgent: true },
  { biz: "kymata@demo.soundcy.app", title: "Sax + DJ Christmas Party", in: 35, start: "21:00", end: "01:00", loc: "Ayia Napa", genres: ["House", "Lounge"], type: "Instrumentalist", event: "Nightlife", min: 300, max: 500, desc: "Live saxophone or violin to play over our resident DJ for a Christmas party. 2–3 x 30 min sets.", deadlineIn: 15 },
  { biz: "yitonia@demo.soundcy.app", title: "Saturday Taverna Nights", in: 10, start: "21:00", end: "00:30", loc: "Nicosia", genres: ["Greek", "Traditional Cypriot"], type: "Band", event: "Restaurants", min: 250, max: 450, desc: "Bouzouki duo or small Greek band for our Saturday meze nights. Lively laiko and rebetiko, a few Cypriot songs for the regulars.", deadlineIn: 5 },
  { biz: "velvet@demo.soundcy.app", title: "Jazz Wednesdays — Piano Trio", in: 7, start: "21:00", end: "23:30", loc: "Nicosia", genres: ["Jazz", "Blues"], type: "Band", event: "Nightlife", min: 300, max: 500, desc: "Piano trio for our Jazz Wednesday series on the baby grand. Two sets. Bonus for trios that bring original material.", deadlineIn: 3 },
  { biz: "everafter@demo.soundcy.app", title: "Destination Wedding — Ceremony Strings", in: 54, start: "16:30", end: "18:30", loc: "Paphos", venue: "Clifftop venue near Peyia", genres: ["Classical", "Pop"], type: "Instrumentalist", event: "Weddings", min: 500, max: 800, desc: "UK couple, 120 guests, clifftop ceremony at sunset. String quartet or trio for ceremony + cocktail hour. Couple has custom song requests (Coldplay, Ed Sheeran).", deadlineIn: 20 },
  { biz: "everafter@demo.soundcy.app", title: "Wedding Reception Band — Greek & International", in: 96, start: "20:00", end: "01:00", loc: "Limassol", genres: ["Greek", "Pop", "Soul & Funk"], type: "Band", event: "Weddings", min: 1500, max: 2500, desc: "Cypriot-British couple, 250 guests. Reception band able to switch between Greek party sets (with traditional dances) and international dance-floor hits. DJ between sets a plus.", deadlineIn: 40 },
  { biz: "islandpulse@demo.soundcy.app", title: "Tech Company Year-End Party", in: 28, start: "20:00", end: "00:00", loc: "Limassol", genres: ["Pop", "Soul & Funk", "House"], type: "Band", event: "Corporate events", min: 1500, max: 3000, desc: "Year-end celebration for 350 employees at a Limassol seafront venue. Energetic party band + DJ. Must handle a short awards segment with MC.", deadlineIn: 9 },
  { biz: "islandpulse@demo.soundcy.app", title: "Product Launch — Lounge Pianist", in: 21, start: "18:30", end: "21:00", loc: "Nicosia", genres: ["Jazz", "Classical", "Lounge"], type: "Instrumentalist", event: "Corporate events", min: 300, max: 500, desc: "Elegant background piano for a luxury automotive launch evening. Venue has a digital stage piano; bring your own if preferred.", deadlineIn: 8 },
  { biz: "saltfest@demo.soundcy.app", title: "Salt & Sound Festival — Roots Stage Artists", in: 150, start: "17:00", end: "23:00", loc: "Larnaca", genres: ["Traditional Cypriot", "Folk", "Acoustic"], type: "Band", event: "Festivals", min: 400, max: 1200, desc: "Open call for Cypriot roots, folk and acoustic acts for our Roots Stage. 40–60 minute slots. Showcase-friendly, professional sound and backline provided.", deadlineIn: 60 },
  { biz: "saltfest@demo.soundcy.app", title: "Salt & Sound Festival — Electronic Stage DJs", in: 151, start: "20:00", end: "04:00", loc: "Larnaca", genres: ["House", "Electronic"], type: "DJ", event: "Festivals", min: 500, max: 1500, desc: "Seeking Cyprus-based DJs for warm-up and peak-time slots on the Electronic Stage. Send your best recent mix.", deadlineIn: 60 },
];

const REVIEW_POOL: [number, string, string][] = [
  [5, "Absolutely incredible. Our guests haven't stopped talking about it — professional, punctual and the energy was perfect from the first song.", "Weddings"],
  [5, "Booked through SoundCY for our terrace night. Read the room perfectly and adjusted volume as the dinner crowd changed. Already rebooked.", "Restaurants"],
  [5, "Flawless communication from first message to the final set. Arrived early, sound-checked quietly and delivered.", "Corporate events"],
  [4, "Great performance and lovely people. Started ten minutes late due to parking, but more than made up for it.", "Private parties"],
  [5, "The highlight of our season. Hotel guests were dancing on the terrace — we've booked them for every Cypriot night.", "Hotels & resorts"],
  [5, "Exactly what we wanted. Took our song requests seriously and even learned one specially for us.", "Weddings"],
  [4, "Solid, professional set. Would love a slightly longer second set next time but we'll definitely book again.", "Nightlife"],
];
const REVIEWERS = ["Andreas & Sophie", "Katerina M.", "Michael P.", "Hotel events team", "Christina & James", "Panayiotis L.", "Elena K.", "Restaurant manager", "Georgia T.", "Nikos & Anna"];

export function seed(conn: Database) {
  const pw = hashPassword("demo1234");
  conn.exec("BEGIN");
  try {
    const insUser = conn.prepare("INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)");
    const insM = conn.prepare(`INSERT INTO musicians (user_id, slug, name, tagline, bio, experience, years_active, performer_type, location, genres, event_types, performances, languages, members, price_from, hourly_rate, avatar, cover, photos, tracks, videos, public_email, instagram, featured, verified, response_hours, phone)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const mIds: Record<string, number> = {};
    MUSICIANS.forEach((m, i) => {
      const u = insUser.run(m.email, pw, "musician", m.name);
      const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const r = insM.run(
        Number(u.lastInsertRowid), slug, m.name, m.tagline, m.bio, m.experience, m.years, m.type, m.location,
        J(m.genres), J(m.events), J(m.performances), J(m.languages), m.members, m.price, m.hourly, m.avatar, m.cover,
        J(m.photos), J(m.tracks), "[]", m.email.replace("@demo.soundcy.app", "@bookings.example.cy"), m.instagram ?? null,
        m.featured ? 1 : 0, m.verified ? 1 : 0, m.response, `+357 99 ${String(100000 + i * 7919).slice(-6)}`,
      );
      mIds[m.email] = Number(r.lastInsertRowid);
    });

    const insB = conn.prepare(`INSERT INTO businesses (user_id, slug, name, category, location, address, description, music_wanted, budget_min, budget_max, capacity, logo, cover, phone, public_email, website, verified)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const bIds: Record<string, number> = {};
    const bUser: Record<string, number> = {};
    BUSINESSES.forEach((b) => {
      const u = insUser.run(b.email, pw, "business", b.name);
      bUser[b.email] = Number(u.lastInsertRowid);
      const slug = b.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const r = insB.run(
        Number(u.lastInsertRowid), slug, b.name, b.category, b.location, b.address, b.description, J(b.wanted), b.bmin, b.bmax,
        b.capacity || null, b.logo, b.cover, b.phone, b.email.replace("@demo.soundcy.app", "@hello.example.cy"), b.website, b.verified ? 1 : 0,
      );
      bIds[b.email] = Number(r.lastInsertRowid);
    });
    const mUser: Record<string, number> = {};
    for (const row of conn.prepare("SELECT id, email FROM users WHERE role='musician'").all()) mUser[row.email as string] = row.id as number;

    const insG = conn.prepare(`INSERT INTO gigs (business_id, title, event_date, start_time, end_time, location, venue, genres, performer_type, event_type, budget_min, budget_max, description, deadline, urgent, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const gIds: number[] = [];
    GIGS.forEach((g, i) => {
      const r = insG.run(bIds[g.biz], g.title, day(g.in), g.start, g.end, g.loc, g.venue ?? BUSINESSES.find((b) => b.email === g.biz)!.name, J(g.genres), g.type, g.event, g.min, g.max, g.desc, day(g.deadlineIn), g.urgent ? 1 : 0, ts(-(i % 6) - 1));
      gIds.push(Number(r.lastInsertRowid));
    });

    // Reviews
    const insR = conn.prepare("INSERT INTO reviews (musician_id, business_id, author_name, rating, body, event_type, created_at) VALUES (?,?,?,?,?,?,?)");
    MUSICIANS.forEach((m, i) => {
      const n = 2 + (i % 4);
      for (let k = 0; k < n; k++) {
        const [rating, body, ev] = REVIEW_POOL[(i + k * 3) % REVIEW_POOL.length];
        const biz = k === 0 ? BUSINESSES[(i + 1) % BUSINESSES.length] : null;
        insR.run(mIds[m.email], biz ? bIds[biz.email] : null, biz ? biz.name : REVIEWERS[(i + k) % REVIEWERS.length], rating, body, ev, ts(-(10 + k * 23 + i)));
      }
    });

    // Unavailable dates
    const insU = conn.prepare("INSERT OR IGNORE INTO unavailable_dates (musician_id, date) VALUES (?,?)");
    MUSICIANS.forEach((m, i) => {
      [3, 8, 14, 15, 22, 29, 30].forEach((d) => {
        if ((d + i) % 3 === 0) insU.run(mIds[m.email], day(d + (i % 5)));
      });
    });

    // Applications
    const insA = conn.prepare("INSERT INTO applications (gig_id, musician_id, message, quote, status, created_at) VALUES (?,?,?,?,?,?)");
    const apply = (gi: number, email: string, quote: number, status: string, msg: string, d: number) => insA.run(gIds[gi], mIds[email], msg, quote, status, ts(-d));
    apply(0, "eleni@demo.soundcy.app", 350, "shortlisted", "Hi! I'd love to perform at the Old Port. I can come as a duo with my pianist for this price, PA from your side works perfectly.", 2);
    apply(0, "maria@demo.soundcy.app", 380, "pending", "Hello, I perform jazz and Greek standards with backing tracks or a guitarist. Available on this date.", 1);
    apply(1, "nefeli@demo.soundcy.app", 250, "pending", "Sunday brunch is my favourite slot! I can do acoustic soul + bossa with my loop setup.", 1);
    apply(4, "kyma@demo.soundcy.app", 380, "accepted", "Happy to return for the winter season — I know the booth well.", 3);
    apply(4, "solenne@demo.soundcy.app", 320, "pending", "Deep house & nu-disco for sunset — would love to be considered.", 2);
    apply(7, "akt@demo.soundcy.app", 450, "shortlisted", "We'd be thrilled to play the baby grand. Two sets mixing standards and our originals.", 2);
    apply(2, "paradosi@demo.soundcy.app", 420, "pending", "We've led dance demos for hotel guests many times — happy to coordinate with your animation team.", 1);
    apply(10, "saltlake@demo.soundcy.app", 2600, "pending", "We've done several corporate year-end parties in Limassol including awards segments. Band + DJ between sets.", 2);
    apply(8, "lefkara@demo.soundcy.app", 650, "pending", "We can arrange the couple's requests for quartet. Ceremony + cocktail hour included.", 3);
    apply(3, "eleni@demo.soundcy.app", 2200, "pending", "I can front a 6-piece band for your NYE gala with an international + Greek programme.", 1);

    // Bookings
    const insBk = conn.prepare(`INSERT INTO bookings (musician_id, business_id, gig_id, event_date, start_time, end_time, event_type, venue, price, notes, status, last_action_by, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const book = (m: string, b: string, gig: number | null, d: number, st: string, en: string, ev: string, venue: string, price: number, notes: string, status: string, by: string, created: number) =>
      Number(insBk.run(mIds[m], bIds[b], gig, day(d), st, en, ev, venue, price, notes, status, by, ts(-created), ts(-created + 1)).lastInsertRowid);

    const E = "eleni@demo.soundcy.app";
    const OP = "oldport@demo.soundcy.app";
    const bk1 = book(E, OP, null, 16, "20:30", "23:30", "Restaurants", "The Old Port Bistro — Terrace", 380, "Jazz duo for our anniversary dinner evening. 3 hours, 2 breaks.", "confirmed", "musician", 6);
    const bk2 = book(E, "azure@demo.soundcy.app", null, 25, "19:00", "22:00", "Hotels & resorts", "Azure Bay — Lobby Lounge", 450, "Christmas week lounge set for hotel guests.", "pending", "business", 1);
    const bk3 = book(E, "islandpulse@demo.soundcy.app", null, 31, "19:00", "21:30", "Corporate events", "Limassol Marina — Event Hall", 550, "Cocktail reception for a shipping company. Black-tie.", "countered", "musician", 3);
    book(E, "velvet@demo.soundcy.app", null, -12, "21:00", "23:30", "Nightlife", "Velvet Room", 320, "Soul Friday.", "completed", "business", 25);
    const bk5 = book("akt@demo.soundcy.app", OP, null, 23, "20:00", "23:00", "Restaurants", "The Old Port Bistro — Terrace", 600, "Trio for our wine-pairing dinner.", "pending", "business", 1);
    book("nefeli@demo.soundcy.app", OP, null, 4, "12:00", "15:00", "Restaurants", "The Old Port Bistro", 240, "Sunday brunch acoustic set.", "confirmed", "musician", 8);
    book("ritmo@demo.soundcy.app", OP, null, -20, "21:00", "00:00", "Restaurants", "The Old Port Bistro", 850, "Latin night.", "completed", "business", 40);
    book("kyma@demo.soundcy.app", "kymata@demo.soundcy.app", gIds[4], 6, "16:00", "20:00", "Nightlife", "Kymata Beach Club", 380, "Winter sunset sessions — weekend 1.", "confirmed", "business", 2);

    // Conversations & messages
    const insC = conn.prepare("INSERT INTO conversations (musician_id, business_id, updated_at) VALUES (?,?,?)");
    const insMsg = conn.prepare("INSERT INTO messages (conversation_id, sender_user_id, body, kind, booking_id, created_at, read_at) VALUES (?,?,?,?,?,?,?)");
    const convo = (m: string, b: string, msgs: [("m" | "b" | "s"), string, number, number?, ("booking" | "system" | "text")?][]) => {
      const last = msgs[msgs.length - 1][2];
      const cid = Number(insC.run(mIds[m], bIds[b], ts(last)).lastInsertRowid);
      msgs.forEach(([who, body, when, bkId, kind], idx) => {
        const sender = who === "m" ? mUser[m] : who === "b" ? bUser[b] : null;
        const isLast = idx === msgs.length - 1;
        insMsg.run(cid, sender, body, kind ?? (bkId ? "booking" : "text"), bkId ?? null, ts(when, 10 + idx), isLast ? null : ts(when, 11 + idx));
      });
    };
    convo(E, OP, [
      ["b", "Hi Eleni! We loved your set at the marina last month. Would you be free for our anniversary dinner evening?", -7],
      ["m", "Thank you so much! Yes, I'm free that night. Duo with piano would suit your terrace best.", -7],
      ["b", "Sent you a booking request with the details.", -6, bk1, "text"],
      ["s", "Booking request sent: Jazz duo · €350", -6, bk1, "booking"],
      ["m", "I've proposed €380 to cover the pianist's travel from Nicosia — hope that works.", -6],
      ["b", "Totally fair. Confirmed! Parking is available behind the bistro for loading.", -5],
      ["s", "Booking confirmed at €380 🎉", -5, bk1, "booking"],
      ["m", "Perfect, see you on the night. I'll send my set list a week before.", -5],
    ]);
    convo(E, "azure@demo.soundcy.app", [
      ["b", "Hello Eleni, we're programming our Christmas week lounge evenings. Interested?", -1],
      ["s", "Booking request: Hotels & resorts · €450", -1, bk2, "booking"],
    ]);
    convo(E, "islandpulse@demo.soundcy.app", [
      ["b", "Hi! Corporate cocktail reception for one of our shipping clients. Budget is €450.", -4],
      ["s", "Booking request: Corporate events · €450", -4, bk3, "booking"],
      ["m", "Thanks! For a black-tie event I'd recommend bringing my pianist — I've countered at €550 for the duo.", -3],
      ["s", "Counter-offer: €550", -3, bk3, "booking"],
    ]);
    convo("akt@demo.soundcy.app", OP, [
      ["b", "Andreas, we're planning a wine-pairing dinner and think the trio would be perfect.", -1],
      ["s", "Booking request: Restaurants · €600", -1, bk5, "booking"],
    ]);
    convo("nefeli@demo.soundcy.app", OP, [
      ["b", "Hi Nefeli, could you do a brunch set this Sunday?", -9],
      ["m", "Yes! Booked it in. See you then ☀️", -8],
    ]);

    conn.prepare("INSERT INTO saved_musicians (business_id, musician_id) VALUES (?,?)").run(bIds[OP], mIds["ritmo@demo.soundcy.app"]);
    conn.prepare("INSERT INTO saved_musicians (business_id, musician_id) VALUES (?,?)").run(bIds[OP], mIds["nefeli@demo.soundcy.app"]);
    conn.prepare("INSERT INTO saved_musicians (business_id, musician_id) VALUES (?,?)").run(bIds[OP], mIds["akt@demo.soundcy.app"]);

    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}
