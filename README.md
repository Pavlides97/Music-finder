# SoundCY — Where Cyprus Finds Its Sound

A two-sided music booking marketplace for Cyprus. Restaurants, hotels, bars, clubs, wedding planners, event organisers and festivals find and book musicians. Singers, bands, DJs and instrumentalists get discovered, apply to gigs and manage bookings.

Available in **Greek, English and Russian**, and it works on desktops, laptops, iPads and phones.

> Musician profiles are real artists listed with their approval. Venues, gigs and the demo venue login are fictional sample data.

## Highlights

- **Interactive 3D design:** a WebGL "sound sphere" on the homepage, cards that tilt in 3D, and a 3D map of Cyprus with city pins.
- **"Match me" smart matcher** (`/match`): four quick questions (occasion, city, sound, date and budget) return musicians ranked with a match percentage and plain-language reasons. The scoring is transparent: genres 40%, distance between Cyprus cities 25%, budget 20%, event type 10%, reviews 5%. Musicians busy on the chosen date go to the end.
- **Three languages:** the ΕΛ / EN / RU switch is in the header. Visitors get their browser's language automatically. Dates, prices, genres and cities are all localised. Automatic chat messages, such as "Booking confirmed", are shown in each reader's own language. Search understands Greek and Russian words ("λαϊκό", "Лимассол", "γάμος").
- **Quick sign-up:** under a minute (role, name, type, city, email and password), then one simple profile form.
  - *Artists:* name, photo, country and city, short bio, type of artist, genres, YouTube/music links, extra photos, contact (email or phone), and available for bookings (yes/no).
  - *Venues:* name, logo or photo, country, city and address, short description, venue type, preferred genres, artist types wanted, venue photos, contact, and looking for musicians (yes/no).
  - A live **profile-completion meter** shows what's missing; tapping an item jumps to it. Profiles can be edited at any time.
- **Direct contact:** messaging in both directions, plus Call, WhatsApp and Email buttons for signed-in users.
- **Booking and messaging:** venues send booking requests, either side can accept, decline or counter-offer, and the chat updates live.
- **Gig marketplace:** venues post gigs, musicians apply, and venues shortlist and hire in one click.
- **Dashboards** for musicians (profile, bookings, applications, availability calendar) and venues (profile, posted gigs, applicants, bookings, saved musicians).
- **Ready to launch:**
  - sitemap, robots file and Google structured data (musicians and gig job postings)
  - share-preview images for WhatsApp and Facebook
  - installable on a phone's home screen
  - accessibility-checked with axe-core, with no violations

## Run it locally

You need **Node.js 22.13 or later**.

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is created automatically in `data/soundcy.db`. Demo venue login: the **The Old Port Bistro** button on `/login` (password `demo1234`).

```bash
npm run db:reset   # start again with fresh sample data (restart the server afterwards)
npm run build && npm start
```

## Put it online (step by step)

The site stores its database and uploaded photos on disk, so it needs a host with a **persistent disk**.

### Option A: Railway
1. In Railway: **New Project → Deploy from GitHub repo → Music-finder**. Railway builds it with the included `Dockerfile` (`railway.json`).
2. **Add a volume:** open the service → **Settings → Volumes → Add volume**, mount path **`/app/data`**. Without it, the database and uploaded photos are wiped on every redeploy.
3. **Public address:** **Settings → Networking → Generate Domain**.
4. **Variables:** add `SITE_URL` = that address (e.g. `https://music-finder-production.up.railway.app`).
5. Every push to `main` redeploys automatically.

### Option B: Render
1. Create an account at [render.com](https://render.com) and connect your GitHub account.
2. Click **New → Blueprint** and choose this repository. Render reads `render.yaml` and sets up the app plus a 1 GB disk for the data.
3. When asked for `SITE_URL`, enter the address Render gives you (e.g. `https://soundcy.onrender.com`), or your own domain later.
4. Click **Apply**. The first deploy takes a few minutes. After that, every push to `main` redeploys automatically.

Persistent disks require a paid Render instance, from about $7 a month.

### Option C: Fly.io or your own server
Use the included `Dockerfile`. Mount a persistent volume at `/app/data` and set `SITE_URL` to your public address.

### Your own domain
Buy a domain (e.g. `soundcy.com` or `soundcy.com.cy`) and add it in your host's dashboard under **Custom domains**. Then update `SITE_URL`.

### Getting found on Google
After going live, add the site to [Google Search Console](https://search.google.com/search-console) and submit `https://YOUR-DOMAIN/sitemap.xml`.

## Architecture

```
src/
  app/                 Next.js 15 App Router pages (server components)
    actions.ts         All mutations as server actions (validated, auth-checked)
    match/             Smart matcher
    api/               Chat polling, image upload/serve
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/          UI (cards, 3D scene, map, filters, profile, chat, dashboard)
  lib/
    db.ts              SQLite connection, schema + migrations (node:sqlite)
    data.ts            Read queries (repository layer)
    match.ts           Matching/scoring engine
    i18n/              Dictionaries: sections/* (English+Greek pairs), ru/* (Russian, type-checked)
    seed*.ts           Musician roster + sample venues/gigs (EN/EL/RU)
    cyprus-map.ts      Island outline generated by scripts/gen-cyprus-map.mjs
```

- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, three.js and lucide icons.
- **Translations:** Greek is stored next to English in `src/lib/i18n/sections/*`. Russian lives in `src/lib/i18n/ru/*` and is checked against English at build time, so a missing translation fails the build.
- **Data:** all SQL is behind plain functions, so moving to Postgres later only means changing `db.ts` and the queries, not the pages.

## Next steps

- Photos, bios and audio for each musician.
- Musicians claiming their profile with their own login.
- Payments and deposits (Stripe or JCC).
- Email and SMS notifications.
- An admin panel for verification.
