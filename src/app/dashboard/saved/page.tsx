import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { savedMusicians } from "@/lib/data";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { MusicianCard } from "@/components/cards";

export const metadata: Metadata = { title: "Saved musicians" };

export default async function SavedPage() {
  const v = await requireViewer("/dashboard/saved");
  if (v.role !== "business") redirect("/dashboard");
  const saved = savedMusicians(v.business.id);
  return (
    <div>
      <PageHead title="Saved musicians" subtitle="Your shortlist for upcoming events." action={<Link href="/musicians" className="btn-primary">Search musicians</Link>} />
      {saved.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{saved.map((m) => <MusicianCard key={m.id} m={m} />)}</div>
      ) : (
        <Empty>Tap “Save” on any musician profile to build your shortlist.</Empty>
      )}
    </div>
  );
}
