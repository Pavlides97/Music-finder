import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { bookingsFor, unreadCount } from "@/lib/data";
import { DashNav, type NavItem } from "@/components/dashboard/DashNav";
import { Photo } from "@/components/ui/Photo";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const v = await requireViewer("/dashboard");
  const unread = unreadCount(v.user, v.profileId);
  const needsAction = bookingsFor(v.role, v.profileId).filter((b) => (b.status === "pending" || b.status === "countered") && b.last_action_by !== v.role).length;

  const items: NavItem[] =
    v.role === "musician"
      ? [
          { href: "/dashboard", label: "Overview", icon: "Home" },
          { href: "/dashboard/profile", label: "My profile", icon: "UserRound" },
          { href: "/dashboard/bookings", label: "Bookings", icon: "CalendarCheck", badge: needsAction },
          { href: "/dashboard/applications", label: "Applications", icon: "ClipboardList" },
          { href: "/dashboard/availability", label: "Availability", icon: "CalendarDays" },
          { href: "/messages", label: "Messages", icon: "MessageCircle", badge: unread },
          { href: "/gigs", label: "Find gigs", icon: "Search" },
        ]
      : [
          { href: "/dashboard", label: "Overview", icon: "Home" },
          { href: "/dashboard/profile", label: "Venue profile", icon: "UserRound" },
          { href: "/dashboard/gigs", label: "Posted gigs", icon: "Megaphone" },
          { href: "/dashboard/gigs/new", label: "Post a gig", icon: "PlusCircle" },
          { href: "/dashboard/bookings", label: "Bookings", icon: "CalendarCheck", badge: needsAction },
          { href: "/dashboard/saved", label: "Saved musicians", icon: "Bookmark" },
          { href: "/messages", label: "Messages", icon: "MessageCircle", badge: unread },
          { href: "/musicians", label: "Find musicians", icon: "Search" },
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
              Public profile <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <DashNav items={items} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
