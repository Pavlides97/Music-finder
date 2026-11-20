import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { PageHead } from "@/components/dashboard/ui";
import { GigForm } from "@/components/dashboard/GigForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.postGig, robots: { index: false } };
}

export default async function NewGigPage() {
  const v = await requireViewer("/dashboard/gigs/new");
  if (v.role !== "business") redirect("/gigs");
  const b = v.business;
  const { t } = await getI18n();
  return (
    <div className="max-w-3xl">
      <PageHead title={t.dash.postGig} subtitle={t.dash.newGigSub} />
      <GigForm defaults={{ location: b.location, venue: b.name, budgetMin: b.budget_min, budgetMax: b.budget_max, genres: b.music_wanted }} />
    </div>
  );
}
