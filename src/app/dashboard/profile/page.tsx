import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, PartyPopper } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { PageHead } from "@/components/dashboard/ui";
import { BusinessProfileForm, MusicianProfileForm } from "@/components/dashboard/ProfileForms";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const v = await requireViewer("/dashboard/profile");
  const { welcome } = await searchParams;
  const href = v.role === "musician" ? `/musicians/${v.musician.slug}` : `/venues/${v.business.slug}`;
  return (
    <div>
      {welcome && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-lime/25 bg-lime/[0.06] p-4 text-sm">
          <PartyPopper className="h-5 w-5 shrink-0 text-lime" />
          <p>
            <strong>Welcome to SoundCY!</strong> Your account is ready. Add a photo and a few details below so {v.role === "musician" ? "venues can find and book you" : "musicians know who they're playing for"}.
          </p>
        </div>
      )}
      <PageHead
        title={v.role === "musician" ? "My artist profile" : "Venue profile"}
        subtitle="Everything here appears on your public page."
        action={<Link href={href} className="btn-ghost"><ExternalLink className="h-4 w-4" /> View public page</Link>}
      />
      {v.role === "musician" ? <MusicianProfileForm m={v.musician} /> : <BusinessProfileForm b={v.business} />}
    </div>
  );
}
