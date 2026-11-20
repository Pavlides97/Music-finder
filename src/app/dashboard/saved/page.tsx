import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { savedMusicians } from "@/lib/data";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { MusicianCard } from "@/components/cards";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.savedMusicians, robots: { index: false } };
}

export default async function SavedPage() {
  const v = await requireViewer("/dashboard/saved");
  if (v.role !== "business") redirect("/dashboard");
  const saved = savedMusicians(v.business.id);
  const { t } = await getI18n();
  return (
    <div>
      <PageHead title={t.dash.savedMusicians} subtitle={t.dash.savedSub} action={<Link href="/musicians" className="btn-primary">{t.dash.findMusicians}</Link>} />
      {saved.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{saved.map((m) => <MusicianCard key={m.id} m={m} />)}</div>
      ) : (
        <Empty>{t.dash.savedEmpty}</Empty>
      )}
    </div>
  );
}
