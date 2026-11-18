"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Photo } from "../ui/Photo";

const LINKS = [
  { href: "/musicians", label: "Find Musicians" },
  { href: "/gigs", label: "Find Gigs" },
  { href: "/venues", label: "Venues" },
  { href: "/#how-it-works", label: "How it works" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-full px-3.5 py-2 text-sm font-medium transition",
            path.startsWith(l.href) && l.href !== "/#how-it-works" ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <>
      <button className="btn-quiet lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-xl lg:hidden">
          <div className="container-x flex h-16 items-center justify-end">
            <button className="btn-quiet" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container-x flex flex-col gap-1 pt-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="display border-b border-line py-4 text-3xl font-bold text-fg">
                {l.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="display border-b border-line py-4 text-3xl font-bold text-fg">Dashboard</Link>
                <Link href="/messages" className="display border-b border-line py-4 text-3xl font-bold text-fg">Messages</Link>
              </>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <Link href="/login" className="btn-ghost btn-lg">Log in</Link>
                <Link href="/signup" className="btn-primary btn-lg">Join free</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export function UserMenu({ name, role, avatar, profileHref }: { name: string; role: string; avatar: string | null; profileHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 hover:bg-white/[0.05]" aria-expanded={open}>
        <Photo src={avatar} alt={name} w={80} className="h-7 w-7 rounded-full" />
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line-strong bg-surface-2 p-1.5 shadow-2xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs capitalize text-muted">{role === "musician" ? "Musician account" : "Venue / organiser account"}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
          <Link href={profileHref} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><User className="h-4 w-4" /> View public profile</Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose hover:bg-white/[0.06]"><LogOut className="h-4 w-4" /> Log out</button>
          </form>
        </div>
      )}
    </div>
  );
}
