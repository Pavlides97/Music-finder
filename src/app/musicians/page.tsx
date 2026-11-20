import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchX, Sparkles } from "lucide-react";
import { MusicianCard } from "@/components/cards";
import { FilterBar, type FilterDef } from "@/components/search/FilterBar";
import { searchMusicians } from "@/lib/data";
import { BUDGET_STEPS, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { isoDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dir.musiciansMeta, description: t.dir.musiciansText };
}

type SP = Promise<Record<string, string | undefined>>;

export default async function MusiciansPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { t, L, lang, eur } = await getI18n();
  const results = searchMusicians({
    q: sp.q,
    location: sp.location,
    genre: sp.genre,
    type: sp.type,
    event: sp.event,
    available: sp.available === "1",
    budget: sp.budget ? Number(sp.budget) : undefined,
    date: sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined,
    sort: sp.sort,
  });

  const opts = (list: readonly string[]) => list.map((v) => ({ value: v, label: L(v) }));
  const filters: FilterDef[] = [
    { name: "location", label: t.common.location, type: "select", options: opts(LOCATIONS), placeholder: t.common.allCyprus },
    { name: "genre", label: t.common.genre, type: "select", options: opts(GENRES), placeholder: t.common.anyGenre },
    { name: "type", label: t.common.performer, type: "select", options: opts(PERFORMER_TYPES), placeholder: t.common.anyType },
    { name: "available", label: t.pf.availability, type: "select", options: [{ value: "1", label: t.pf.takingBookings }], placeholder: t.pf.any },
    { name: "budget", label: t.common.budget, type: "select", options: BUDGET_STEPS.map((b) => ({ value: String(b), label: t.dir.upTo(eur(b)) })), placeholder: t.common.anyBudget },
    { name: "date", label: t.common.availableOn, type: "date", min: isoDate(new Date()) },
  ];

  const parts = [sp.genre, sp.type, sp.location].filter(Boolean).map((v) => L(v!));
  const heading =
    lang === "en"
      ? [sp.genre, sp.type ? sp.type + "s" : "Musicians", "in", sp.location ?? "Cyprus"].filter(Boolean).join(" ")
      : parts.length
        ? t.dir.musiciansIn(parts.join(" · "))
        : t.dir.musiciansTitle;

  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">{t.dir.musiciansEyebrow}</p>
      <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">{heading}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.dir.musiciansText}</p>
      <Link href="/match" className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-flame-2 hover:text-flame">
        <Sparkles className="h-4 w-4" /> {t.dir.orTryMatch}
      </Link>

      <div className="mt-8">
        <Suspense>
          <FilterBar
            filters={filters}
            total={results.length}
            countLabel={t.dir.musicianCount(results.length)}
            searchPlaceholder={t.dir.musiciansSearch}
            sorts={[
              { value: "", label: t.dir.sortRecommended },
              { value: "rating", label: t.dir.sortRating },
              { value: "price_asc", label: t.dir.sortPriceAsc },
              { value: "price_desc", label: t.dir.sortPriceDesc },
              { value: "new", label: t.dir.sortNew },
            ]}
          />
        </Suspense>
      </div>

      <h2 className="sr-only">{results.length} {t.dir.musicianCount(results.length)}</h2>
      {results.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((m, i) => (
            <MusicianCard key={m.id} m={m} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-dim" />
          <h2 className="display text-2xl font-bold">{t.dir.noMusicians}</h2>
          <p className="max-w-md text-muted">{t.dir.noMusiciansText}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/musicians" className="btn-ghost">{t.dir.resetFilters}</Link>
            <Link href="/match" className="btn-primary"><Sparkles className="h-4 w-4" /> {t.nav.match}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
