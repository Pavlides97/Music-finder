# SoundCY — Where Cyprus Finds Its Sound

A two-sided music booking marketplace for Cyprus. Restaurants, hotels, bars, clubs, wedding planners, event organisers and festivals find and book musicians. Singers, bands, DJs, instrumentalists and orchestras get discovered, apply to gigs and manage bookings.

> Musician profiles are real artists listed with their approval. Venues, gigs and the demo venue login are fictional sample data.

## Quick start

Requires **Node.js 22.13+**, which includes the built-in `node:sqlite` module, so there are no native database dependencies.

```bash
npm install
npm run dev        # http://localhost:3000
```

On first request, the app creates the database in `data/soundcy.db` and adds the musician profiles plus sample venues and gigs. Gig dates are relative to today, so the demo always looks current.

Musician profiles start with only a name, performer type and "Price on request". Their accounts have random passwords, so nobody can log in as them until the profile is handed over to the musician.

**Demo venue account** (use the one-click button on `/login`; password `demo1234`): The Old Port Bistro, `oldport@demo.soundcy.app`. Every other sample venue also has a `@demo.soundcy.app` login.

```bash
npm run db:reset   # wipe the DB; it is re-seeded on the next start
npm run build && npm start   # production
```

## Features

- **Homepage**: hero with "Where Cyprus Finds Its Sound.", Find Musicians and Find Gigs buttons, and a search by location, genre, event type and date. Also featured artists, popular categories, upcoming gigs, how-it-works for both sides, locations and venues.
- **Musician profiles**: cover image and photo, bio, experience, genres, location, audio player, YouTube and Spotify embeds, gallery, performances offered, prices from and per hour, availability calendar, booking request form, message and save buttons, and reviews with a rating breakdown.
- **Business and venue profiles**: logo, cover, category, location, description, music wanted, budget range, capacity, open gigs and contact details.
- **Musician directory**: filters for location, genre, performer type, event type, budget and "available on" date, plus free-text search and sorting. Filters live in the URL, so a search can be shared.
- **Gig marketplace**: listings show date and time, location, genres, performer type, budget, description, deadline and applicant count. Musicians apply with a quote and a message.
- **Booking and messaging**: a booking request opens a conversation. Either side can accept, decline or counter-offer the price, and the turn passes back and forth. After confirmation the booking can be cancelled or marked complete, and once it's complete the business can leave a verified review. Chat updates every 4 seconds and shows unread counts.
- **Dashboards**
  - *Musician*: overview, a profile-completeness checklist, profile editor with image uploads, bookings, applications, availability calendar (blocked dates are left out of date searches) and matching gigs.
  - *Business*: overview, venue profile, posted gigs with an applicant pipeline (shortlist, hire, decline; hiring creates a confirmed booking), gig posting, bookings, saved musicians and recommended musicians.
- **Auth**: email and password accounts (scrypt hashing), httpOnly session cookies stored in a database table, and role-based access checks in every server action.

## Architecture

```
src/
  app/                 Next.js 15 App Router pages (server components)
    actions.ts         All mutations as server actions (validated, auth-checked)
    api/               Chat polling, image upload/serve
  components/          UI (cards, search filters, profile, chat, dashboard)
  lib/
    db.ts              SQLite connection + schema (node:sqlite)
    data.ts            All read queries (repository layer)
    seed.ts            Sample Cyprus data
    auth.ts            Sessions & viewer helpers
```

- **Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, lucide icons.
- **Data layer**: all SQL sits behind plain functions in `lib/data.ts` and `actions.ts`. Moving to Postgres (for example with Drizzle or Prisma on Neon or Supabase) means replacing `db.ts` and the queries, not the UI.
- **Uploads** are stored in `data/uploads/` and served from `/api/uploads/*`. Swap in S3 or Cloudflare R2 for production.
- **Images** in the sample data load from Unsplash. If an image fails, the page shows a branded gradient instead.

## Deploying

The MVP keeps its database and uploads on local disk, so it needs a host with a persistent volume, such as Railway, Fly.io, Render or a VPS. Set `DATABASE_PATH` to change where the database file lives. Session cookies are `Secure` in production; set `INSECURE_COOKIES=1` only if you are testing production mode over plain HTTP. For serverless hosts such as Vercel, move to Postgres and object storage first.

## Suggested next steps

Payments and deposits (Stripe or JCC), email and SMS notifications, admin verification tools, Greek-language support, WebSocket chat, and calendar export (ICS).
