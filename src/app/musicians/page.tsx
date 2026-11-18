import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { MusicianCard } from "@/components/cards";
import { FilterBar, type FilterDef } from "@/components/search/FilterBar";
import { searchMusicians } from "@/lib/data";
import { BUDGET_STEPS, EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { isoDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Find Musicians in Cyprus" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function MusiciansPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const results = searchMusicians({
    q: sp.q,
    location: sp.location,
    genre: sp.genre,
    type: sp.type,
    event: sp.event,
    budget: sp.budget ? Number(sp.budget) : undefined,
    date: sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined,
    sort: sp.sort,
  });

  const filters: FilterDef[] = [
    { name: "location", label: "Location", type: "select", options: LOCATIONS, placeholder: "All of Cyprus" },
    { name: "genre", label: "Genre", type: "select", options: GENRES, placeholder: "Any genre" },
    { name: "type", label: "Performer", type: "select", options: PERFORMER_TYPES, placeholder: "Any type" },
    { name: "event", label: "Event type", type: "select", options: EVENT_TYPES, placeholder: "Any event" },
    { name: "budget", label: "Budget", type: "select", options: BUDGET_STEPS.map((b) => ({ value: String(b), label: `Up to €${b.toLocaleString()}` })), placeholder: "Any budget" },
    { name: "date", label: "Available on", type: "date", min: isoDate(new Date()) },
  ];

  const heading = [sp.genre, sp.type ? sp.type + "s" : "musicians", sp.location ? `in ${sp.location}` : "in Cyprus"].filter(Boolean).join(" ");

  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">Musician directory</p>
      <h1 className="display mt-2 text-4xl font-extrabold capitalize sm:text-5xl">{heading}</h1>
      <p className="mt-3 max-w-2xl text-muted">Singers, bands, DJs and instrumentalists ready to perform. Filter by what matters, listen to samples and send a booking request in minutes.</p>

      <div className="mt-8">
        <Suspense>
          <FilterBar
            filters={filters}
            total={results.length}
            noun="musician"
            searchPlaceholder="Search by name, style or keyword — e.g. “bouzouki”, “sax”, “wedding”"
            sorts={[
              { value: "", label: "Recommended" },
              { value: "rating", label: "Top rated" },
              { value: "price_asc", label: "Price: low to high" },
              { value: "price_desc", label: "Price: high to low" },
              { value: "new", label: "Newest" },
            ]}
          />
        </Suspense>
      </div>

      {results.length ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((m, i) => (
            <MusicianCard key={m.id} m={m} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-dim" />
          <h2 className="display text-2xl font-bold">No musicians match those filters</h2>
          <p className="max-w-md text-muted">Try widening your budget, picking a different date or searching all of Cyprus. Or post a gig and let musicians come to you.</p>
          <div className="mt-2 flex gap-3">
            <Link href="/musicians" className="btn-ghost">Reset filters</Link>
            <Link href="/dashboard/gigs/new" className="btn-primary">Post a gig</Link>
          </div>
        </div>
      )}
    </div>
  );
}
