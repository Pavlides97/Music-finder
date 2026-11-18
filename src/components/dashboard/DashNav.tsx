"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Home,
  Megaphone,
  MessageCircle,
  PlusCircle,
  Search,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { Home, UserRound, CalendarCheck, ClipboardList, CalendarDays, MessageCircle, Megaphone, PlusCircle, Bookmark, Search };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

export function DashNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Dashboard">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        const active = it.href === "/dashboard" ? path === "/dashboard" : path === it.href || (path.startsWith(it.href + "/") && it.href !== "/dashboard/gigs");
        const exactGigs = it.href === "/dashboard/gigs" && path === "/dashboard/gigs";
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active || exactGigs ? "bg-white/[0.07] text-fg" : "text-muted hover:bg-white/[0.04] hover:text-fg",
            )}
          >
            <Icon className={cn("h-4 w-4", (active || exactGigs) && "text-flame")} />
            {it.label}
            {it.badge ? <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1.5 text-[10px] font-bold text-ink">{it.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
