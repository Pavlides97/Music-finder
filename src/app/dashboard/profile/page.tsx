import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, PartyPopper } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { PageHead } from "@/components/dashboard/ui";
import { BusinessProfileForm, MusicianProfileForm } from "@/components/dashboard/ProfileForms";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.dash.editProfileMeta, robots: { index: false } };
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const v = await requireViewer("/dashboard/profile");
  const { welcome } = await searchParams;
  const { t } = await getI18n();
  const href = v.role === "musician" ? `/musicians/${v.musician.slug}` : `/venues/${v.business.slug}`;
  return (
    <div>
      {welcome && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-lime/25 bg-lime/[0.06] p-4 text-sm">
          <PartyPopper className="h-5 w-5 shrink-0 text-lime" />
          <p>
            <strong>{t.dash.welcomeTitle}</strong> {v.role === "musician" ? t.dash.welcomeM : t.dash.welcomeB}
          </p>
        </div>
      )}
      <PageHead
        title={v.role === "musician" ? t.dash.artistProfile : t.dash.venueProfile}
        subtitle={t.dash.profileSub}
        action={<Link href={href} className="btn-ghost"><ExternalLink className="h-4 w-4" /> {t.dash.viewPublic}</Link>}
      />
      {v.role === "musician" ? <MusicianProfileForm m={v.musician} /> : <BusinessProfileForm b={v.business} />}
    </div>
  );
}
