import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Megaphone, SearchX } from "lucide-react";
import { GigCard } from "@/components/cards";
import { FilterBar, type FilterDef } from "@/components/search/FilterBar";
import { searchGigs } from "@/lib/data";
import { EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Find Gigs in Cyprus" };
export const dynamic = "force-dynamic";

export default async function GigsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const v = await getViewer();
  const gigs = searchGigs({ q: sp.q, location: sp.location, genre: sp.genre, type: sp.type, event: sp.event, budget: sp.budget ? Number(sp.budget) : undefined, sort: sp.sort });
  const filters: FilterDef[] = [
    { name: "location", label: "Location", type: "select", options: LOCATIONS, placeholder: "All of Cyprus" },
    { name: "genre", label: "Genre", type: "select", options: GENRES, placeholder: "Any genre" },
    { name: "type", label: "Performer needed", type: "select", options: PERFORMER_TYPES, placeholder: "Any performer" },
    { name: "event", label: "Event type", type: "select", options: EVENT_TYPES, placeholder: "Any event" },
    { name: "budget", label: "Min. budget", type: "select", options: [200, 400, 800, 1500].map((b) => ({ value: String(b), label: `€${b.toLocaleString()}+` })), placeholder: "Any budget" },
  ];

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Gig marketplace</p>
          <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Open gigs across Cyprus</h1>
          <p className="mt-3 max-w-2xl text-muted">Restaurants, hotels, clubs, planners and festivals looking for live music. Apply in a minute — organisers reply directly in your inbox.</p>
        </div>
        {v?.role !== "musician" && (
          <Link href="/dashboard/gigs/new" className="btn-violet shrink-0">
            <Megaphone className="h-4 w-4" /> Post a gig — free
          </Link>
        )}
      </div>
      <div className="mt-8">
        <Suspense>
          <FilterBar
            filters={filters}
            total={gigs.length}
            noun="open gig"
            searchPlaceholder="Search gigs — e.g. “wedding”, “sunset DJ”, “Paphos hotel”"
            sorts={[
              { value: "", label: "Soonest first" },
              { value: "deadline", label: "Closing soon" },
              { value: "budget", label: "Highest budget" },
              { value: "new", label: "Newly posted" },
            ]}
          />
        </Suspense>
      </div>
      {gigs.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {gigs.map((g) => <GigCard key={g.id} g={g} />)}
        </div>
      ) : (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-dim" />
          <h2 className="display text-2xl font-bold">No open gigs match</h2>
          <p className="max-w-md text-muted">Try another location or genre. New gigs are posted every week — keep your profile up to date so venues can find you too.</p>
          <Link href="/gigs" className="btn-ghost mt-2">Reset filters</Link>
        </div>
      )}
    </div>
  );
}
