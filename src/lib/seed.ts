/* Seed data: real musician profiles (added with the owner's approval) plus
 * fictional sample venues and gigs. Dates are relative to "today". */
import { randomBytes } from "node:crypto";
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

/**
 * Musician profiles. Only facts provided by the platform owner are filled in;
 * everything else (bio, photos, genres, prices, contact details) is left empty
 * for the musician to complete after claiming their profile.
 * price 0 = "Price on request".
 */
type M = { name: string; type: string; tagline: string; performances: string[] };

const SG = { type: "Singer", tagline: "Singer & guitarist", performances: ["Vocals & guitar"] };

const MUSICIANS: M[] = [
  { name: "Pavlos Pavlides", ...SG },
  { name: "Smaragda Diamantidou", type: "Singer", tagline: "Singer", performances: ["Vocals"] },
  { name: "Dimitris Panagi", ...SG },
  { name: "Andreas Ioanou", ...SG },
  { name: "Prodromos Tsolias", ...SG },
  { name: "Andreas Napoleon", ...SG },
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

export function seed(conn: Database) {
  const demoPw = hashPassword("demo1234");
  conn.exec("BEGIN");
  try {
    const insUser = conn.prepare("INSERT INTO users (email, password_hash, role, name) VALUES (?,?,?,?)");

    // Musicians: placeholder accounts with an unusable random password, so nobody can
    // log in as them until the profile is handed over to the musician.
    const insM = conn.prepare(`INSERT INTO musicians (user_id, slug, name, tagline, performer_type, location, performances, price_from, featured, verified)
      VALUES (?,?,?,?,?,?,?,0,1,0)`);
    MUSICIANS.forEach((m) => {
      const slug = m.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const u = insUser.run(`${slug}@unclaimed.soundcy.app`, hashPassword(randomBytes(24).toString("hex")), "musician", m.name);
      insM.run(Number(u.lastInsertRowid), slug, m.name, m.tagline, m.type, "Island-wide", J(m.performances));
    });

    // Fictional sample venues & gigs (demo business logins use password demo1234).
    const insB = conn.prepare(`INSERT INTO businesses (user_id, slug, name, category, location, address, description, music_wanted, budget_min, budget_max, capacity, logo, cover, phone, public_email, website, verified)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const bIds: Record<string, number> = {};
    BUSINESSES.forEach((b) => {
      const u = insUser.run(b.email, demoPw, "business", b.name);
      const slug = b.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const r = insB.run(
        Number(u.lastInsertRowid), slug, b.name, b.category, b.location, b.address, b.description, J(b.wanted), b.bmin, b.bmax,
        b.capacity || null, b.logo, b.cover, b.phone, b.email.replace("@demo.soundcy.app", "@hello.example.cy"), b.website, b.verified ? 1 : 0,
      );
      bIds[b.email] = Number(r.lastInsertRowid);
    });

    const insG = conn.prepare(`INSERT INTO gigs (business_id, title, event_date, start_time, end_time, location, venue, genres, performer_type, event_type, budget_min, budget_max, description, deadline, urgent, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    GIGS.forEach((g, i) => {
      insG.run(bIds[g.biz], g.title, day(g.in), g.start, g.end, g.loc, g.venue ?? BUSINESSES.find((b) => b.email === g.biz)!.name, J(g.genres), g.type, g.event, g.min, g.max, g.desc, day(g.deadlineIn), g.urgent ? 1 : 0, ts(-(i % 6) - 1));
    });

    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}
