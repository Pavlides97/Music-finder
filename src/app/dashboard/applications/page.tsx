import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { applicationsForMusician } from "@/lib/data";
import { euro, fmtDate, timeAgo } from "@/lib/utils";
import { Empty, PageHead } from "@/components/dashboard/ui";
import { StatusPill } from "@/components/ui/StatusPill";
import { withdrawApplicationAction } from "@/app/actions";

export const metadata: Metadata = { title: "My applications" };

export default async function ApplicationsPage() {
  const v = await requireViewer("/dashboard/applications");
  if (v.role !== "musician") redirect("/dashboard/gigs");
  const apps = applicationsForMusician(v.musician.id);
  return (
    <div>
      <PageHead title="Applications" subtitle="Gigs you've applied for and where they stand." action={<Link href="/gigs" className="btn-primary">Find more gigs</Link>} />
      {apps.length ? (
        <div className="card divide-y divide-line">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/gigs/${a.gig_id}`} className="font-semibold hover:text-flame">{a.gig_title}</Link>
                <p className="text-sm text-muted">
                  <Link href={`/venues/${a.business_slug}`} className="hover:text-fg">{a.business_name}</Link> · {a.gig_location} · {fmtDate(a.gig_date)}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-dim">“{a.message}” · applied {timeAgo(a.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{euro(a.quote)}</span>
                <StatusPill status={a.status} />
                {(a.status === "pending" || a.status === "shortlisted") && (
                  <form action={withdrawApplicationAction}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <button className="btn-quiet btn-sm">Withdraw</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>You haven&apos;t applied to any gigs yet. <Link href="/gigs" className="text-flame">Browse open gigs</Link>.</Empty>
      )}
    </div>
  );
}
