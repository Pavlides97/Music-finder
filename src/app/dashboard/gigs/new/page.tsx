import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { PageHead } from "@/components/dashboard/ui";
import { GigForm } from "@/components/dashboard/GigForm";

export const metadata: Metadata = { title: "Post a gig" };

export default async function NewGigPage() {
  const v = await requireViewer("/dashboard/gigs/new");
  if (v.role !== "business") redirect("/gigs");
  const b = v.business;
  return (
    <div className="max-w-3xl">
      <PageHead title="Post a gig" subtitle="Describe what you need — musicians across Cyprus will apply and you choose who to hire." />
      <GigForm defaults={{ location: b.location, venue: b.name, budgetMin: b.budget_min, budgetMax: b.budget_max, genres: b.music_wanted }} />
    </div>
  );
}
