"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Sparkles, User, X } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { Photo } from "../ui/Photo";
import { LangSwitch } from "./LangSwitch";

function useLinks() {
  const { t } = useI18n();
  return [
    { href: "/musicians", label: t.common.findMusicians },
    { href: "/match", label: t.nav.match, highlight: true },
    { href: "/whats-on", label: t.wo.nav },
    { href: "/gigs", label: t.common.findGigs },
    { href: "/venues", label: t.common.venues },
  ];
}

export function NavLinks() {
  const path = usePathname();
  const links = useLinks();
  const { t } = useI18n();
  return (
    <nav className="hidden items-center gap-1 xl:flex" aria-label={t.common.mainNav}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={path.startsWith(l.href) ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition",
            path.startsWith(l.href) ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
          )}
        >
          {l.highlight && <Sparkles className="h-3.5 w-3.5 text-flame" />}
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const links = useLinks();
  const { t } = useI18n();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <>
      <button className="btn-quiet xl:hidden" onClick={() => setOpen(true)} aria-label={t.common.openMenu} aria-expanded={open}>
        <Menu className="h-5 w-5" />
      </button>
      {open &&
        createPortal(
        // Portal: the header's backdrop-filter would otherwise trap this fixed overlay inside it.
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/[0.97] backdrop-blur-xl xl:hidden" role="dialog" aria-modal="true">
          <div className="container-x flex h-16 items-center justify-between">
            <LangSwitch />
            <button className="btn-quiet" onClick={() => setOpen(false)} aria-label={t.common.closeMenu}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container-x flex flex-col gap-1 pt-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="display flex items-center gap-3 border-b border-line py-4 text-3xl font-bold text-fg">
                {l.label} {l.highlight && <Sparkles className="h-6 w-6 text-flame" />}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="display border-b border-line py-4 text-3xl font-bold text-fg">{t.common.dashboard}</Link>
                <Link href="/messages" className="display border-b border-line py-4 text-3xl font-bold text-fg">{t.common.messages}</Link>
              </>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Link href="/login" className="btn-ghost btn-lg">{t.common.logIn}</Link>
                <Link href="/signup" className="btn-primary btn-lg">{t.common.joinFree}</Link>
              </div>
            )}
          </nav>
        </div>,
          document.body,
        )}
    </>
  );
}

export function UserMenu({ name, role, avatar, profileHref }: { name: string; role: string; avatar: string | null; profileHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 hover:bg-white/[0.05]" aria-expanded={open} aria-label={name}>
        <Photo src={avatar} alt={name} w={80} className="h-7 w-7 rounded-full" />
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="glass absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl bg-surface-2/95 p-1.5">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted">{role === "musician" ? t.common.musicianAccount : t.common.venueAccount}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><LayoutDashboard className="h-4 w-4" /> {t.common.dashboard}</Link>
          <Link href={profileHref} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><User className="h-4 w-4" /> {t.common.viewPublicProfile}</Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose hover:bg-white/[0.06]"><LogOut className="h-4 w-4" /> {t.common.logOut}</button>
          </form>
        </div>
      )}
    </div>
  );
}
