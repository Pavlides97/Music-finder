import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Megaphone, SearchX } from "lucide-react";
import { GigCard } from "@/components/cards";
import { FilterBar, type FilterDef } from "@/components/search/FilterBar";
import { searchGigs } from "@/lib/data";
import { EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { getViewer } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dir.gigsMeta, description: t.dir.gigsText };
}
export const dynamic = "force-dynamic";

export default async function GigsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const v = await getViewer();
  const { t, L, eur } = await getI18n();
  const opts = (list: readonly string[]) => list.map((x) => ({ value: x, label: L(x) }));
  const gigs = searchGigs({ q: sp.q, location: sp.location, genre: sp.genre, type: sp.type, event: sp.event, budget: sp.budget ? Number(sp.budget) : undefined, sort: sp.sort });
  const filters: FilterDef[] = [
    { name: "location", label: t.common.location, type: "select", options: opts(LOCATIONS), placeholder: t.common.allCyprus },
    { name: "genre", label: t.common.genre, type: "select", options: opts(GENRES), placeholder: t.common.anyGenre },
    { name: "type", label: t.dir.performerNeeded, type: "select", options: opts(PERFORMER_TYPES), placeholder: t.dir.anyPerformer },
    { name: "event", label: t.common.eventType, type: "select", options: opts(EVENT_TYPES), placeholder: t.common.anyEvent },
    { name: "budget", label: t.dir.minBudget, type: "select", options: [200, 400, 800, 1500].map((b) => ({ value: String(b), label: `${eur(b)}+` })), placeholder: t.common.anyBudget },
  ];

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{t.dir.gigsEyebrow}</p>
          <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">{t.dir.gigsTitle}</h1>
          <p className="mt-3 max-w-2xl text-muted">{t.dir.gigsText}</p>
        </div>
        {v?.role !== "musician" && (
          <Link href="/dashboard/gigs/new" className="btn-violet shrink-0">
            <Megaphone className="h-4 w-4" /> {t.dir.postGigFree}
          </Link>
        )}
      </div>
      <div className="mt-8">
        <Suspense>
          <FilterBar
            filters={filters}
            total={gigs.length}
            countLabel={t.dir.gigCount(gigs.length)}
            searchPlaceholder={t.dir.gigsSearch}
            sorts={[
              { value: "", label: t.dir.sortSoonest },
              { value: "deadline", label: t.dir.sortClosing },
              { value: "budget", label: t.dir.sortBudget },
              { value: "new", label: t.dir.sortNewest },
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
          <h2 className="display text-2xl font-bold">{t.dir.noGigs}</h2>
          <p className="max-w-md text-muted">{t.dir.noGigsText}</p>
          <Link href="/gigs" className="btn-ghost mt-2">{t.dir.resetFilters}</Link>
        </div>
      )}
    </div>
  );
}
