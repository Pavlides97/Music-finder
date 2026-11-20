import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, unreadCount } from "@/lib/data";
import { DashNav, type NavItem } from "@/components/dashboard/DashNav";
import { Photo } from "@/components/ui/Photo";
import { getI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const v = await requireViewer("/dashboard");
  const unread = unreadCount(v.user, v.profileId);
  const { t } = await getI18n();
  const needsAction = bookingsFor(v.role, v.profileId).filter((b) => (b.status === "pending" || b.status === "countered") && b.last_action_by !== v.role).length;

  const items: NavItem[] =
    v.role === "musician"
      ? [
          { href: "/dashboard", label: t.dash.overview, icon: "Home" },
          { href: "/dashboard/profile", label: t.dash.myProfile, icon: "UserRound" },
          { href: "/dashboard/bookings", label: t.dash.bookings, icon: "CalendarCheck", badge: needsAction },
          { href: "/dashboard/applications", label: t.dash.applications, icon: "ClipboardList" },
          { href: "/dashboard/availability", label: t.dash.availability, icon: "CalendarDays" },
          { href: "/messages", label: t.common.messages, icon: "MessageCircle", badge: unread },
          { href: "/gigs", label: t.dash.findGigs, icon: "Search" },
        ]
      : [
          { href: "/dashboard", label: t.dash.overview, icon: "Home" },
          { href: "/dashboard/profile", label: t.dash.venueProfile, icon: "UserRound" },
          { href: "/dashboard/gigs", label: t.dash.postedGigs, icon: "Megaphone" },
          { href: "/dashboard/gigs/new", label: t.dash.postGig, icon: "PlusCircle" },
          { href: "/dashboard/bookings", label: t.dash.bookings, icon: "CalendarCheck", badge: needsAction },
          { href: "/dashboard/saved", label: t.dash.savedMusicians, icon: "Bookmark" },
          { href: "/messages", label: t.common.messages, icon: "MessageCircle", badge: unread },
          { href: "/musicians", label: t.dash.findMusicians, icon: "Search" },
        ];

  const name = v.role === "musician" ? v.musician.name : v.business.name;
  const img = v.role === "musician" ? v.musician.avatar : v.business.logo;
  const href = v.role === "musician" ? `/musicians/${v.musician.slug}` : `/venues/${v.business.slug}`;

  return (
    <div className="container-x grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-5 hidden items-center gap-3 lg:flex">
          <Photo src={img} alt={name} w={120} className="h-12 w-12 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{name}</p>
            <Link href={href} className="inline-flex items-center gap-1 text-xs text-muted hover:text-flame">
              {t.common.publicProfile} <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <DashNav items={items} label={t.dash.nav} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
