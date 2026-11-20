import type { Metadata } from "next";
import Link from "next/link";
import { VenueCard } from "@/components/cards";
import { listBusinesses } from "@/lib/data";
import { BUSINESS_CATEGORIES, LOCATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dir.venuesMeta, description: t.dir.venuesText };
}
export const dynamic = "force-dynamic";

export default async function VenuesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { t, L } = await getI18n();
  const venues = listBusinesses({ category: sp.category, location: sp.location, looking: sp.looking === "1" });
  const href = (k: string, val?: string) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, x]) => x) as [string, string][]);
    if (val) p.set(k, val);
    else p.delete(k);
    return `/venues${p.size ? "?" + p : ""}`;
  };
  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">{t.dir.venuesEyebrow}</p>
      <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">{t.dir.venuesTitle}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.dir.venuesText}</p>

      <div className="mt-8 space-y-3">
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <Link href={href("looking", sp.looking === "1" ? undefined : "1")} aria-current={sp.looking === "1" ? "true" : undefined} className={cn("chip shrink-0 px-3.5 py-2 text-sm", sp.looking === "1" ? "border-lime/50 bg-lime/10 text-lime" : "")}>
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> {t.pf.lookingOnly}
          </Link>
          <Link href={href("category")} className={cn("chip shrink-0 px-3.5 py-2 text-sm", !sp.category && "border-flame/40 bg-flame/10 text-flame")}>{t.dir.allTypes}</Link>
          {BUSINESS_CATEGORIES.map((c) => (
            <Link key={c} href={href("category", c)} className={cn("chip shrink-0 px-3.5 py-2 text-sm", sp.category === c && "border-flame/40 bg-flame/10 text-flame")}>{L(c)}</Link>
          ))}
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <Link href={href("location")} className={cn("chip shrink-0 px-3.5 py-2 text-sm", !sp.location && "border-violet/40 bg-violet/10 text-violet-2")}>{t.dir.allLocations}</Link>
          {LOCATIONS.map((l) => (
            <Link key={l} href={href("location", l)} className={cn("chip shrink-0 px-3.5 py-2 text-sm", sp.location === l && "border-violet/40 bg-violet/10 text-violet-2")}>{L(l)}</Link>
          ))}
        </div>
      </div>

      <h2 className="sr-only">{t.dir.venuesTitle}</h2>
      {venues.length ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {venues.map((b) => <VenueCard key={b.id} b={b} />)}
        </div>
      ) : (
        <p className="card mt-8 p-10 text-center text-muted">{t.dir.noVenues} <Link href="/venues" className="text-flame">{t.dir.seeAllVenues}</Link></p>
      )}
    </div>
  );
}
