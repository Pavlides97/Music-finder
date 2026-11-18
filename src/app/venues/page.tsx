import type { Metadata } from "next";
import Link from "next/link";
import { VenueCard } from "@/components/cards";
import { listBusinesses } from "@/lib/data";
import { BUSINESS_CATEGORIES, LOCATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Venues & Organisers" };
export const dynamic = "force-dynamic";

export default async function VenuesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const venues = listBusinesses({ category: sp.category, location: sp.location });
  const href = (k: string, val?: string) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, x]) => x) as [string, string][]);
    if (val) p.set(k, val);
    else p.delete(k);
    return `/venues${p.size ? "?" + p : ""}`;
  };
  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">Venues & organisers</p>
      <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Who&apos;s booking live music</h1>
      <p className="mt-3 max-w-2xl text-muted">Restaurants, hotels, bars, clubs, wedding planners and festivals across Cyprus. Follow their gigs, see their budgets and pitch directly.</p>

      <div className="mt-8 space-y-3">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <Link href={href("category")} className={cn("chip shrink-0 px-3.5 py-2 text-sm", !sp.category && "border-flame/40 bg-flame/10 text-flame")}>All types</Link>
          {BUSINESS_CATEGORIES.map((c) => (
            <Link key={c} href={href("category", c)} className={cn("chip shrink-0 px-3.5 py-2 text-sm", sp.category === c && "border-flame/40 bg-flame/10 text-flame")}>{c}</Link>
          ))}
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <Link href={href("location")} className={cn("chip shrink-0", !sp.location && "border-violet/40 bg-violet/10 text-violet-2")}>All locations</Link>
          {LOCATIONS.map((l) => (
            <Link key={l} href={href("location", l)} className={cn("chip shrink-0", sp.location === l && "border-violet/40 bg-violet/10 text-violet-2")}>{l}</Link>
          ))}
        </div>
      </div>

      {venues.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {venues.map((b) => <VenueCard key={b.id} b={b} />)}
        </div>
      ) : (
        <p className="card mt-8 p-10 text-center text-muted">No venues match yet. <Link href="/venues" className="text-flame">See all venues</Link></p>
      )}
    </div>
  );
}
