import Link from "next/link";
import { LayoutDashboard, MessageCircle } from "lucide-react";
import { getViewer } from "@/lib/auth";
import { unreadCount } from "@/lib/data";
import { Logo } from "./Logo";
import { MobileMenu, NavLinks, UserMenu } from "./NavClient";
import { LangSwitch } from "./LangSwitch";
import { getI18n } from "@/lib/i18n/server";

export async function Navbar() {
  const v = await getViewer();
  const { t } = await getI18n();
  const unread = v ? unreadCount(v.user, v.profileId) : 0;
  const avatar = v ? (v.role === "musician" ? v.musician.avatar : v.business.logo) : null;
  const profileHref = v ? (v.role === "musician" ? `/musicians/${v.musician.slug}` : `/venues/${v.business.slug}`) : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-night/60 backdrop-blur-2xl backdrop-saturate-150">
      <div className="container-x flex h-16 items-center gap-6">
        <Logo />
        <NavLinks />
        <div className="ml-auto flex items-center gap-2">
          <LangSwitch className="hidden sm:inline-flex" />
          {v ? (
            <>
              <Link href="/messages" className="btn-quiet relative" aria-label={t.common.messages}>
                <MessageCircle className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-ink">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="btn-ghost btn-sm hidden sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" /> {t.common.dashboard}
              </Link>
              <UserMenu name={v.user.name} role={v.role} avatar={avatar} profileHref={profileHref} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-quiet hidden sm:inline-flex">{t.common.logIn}</Link>
              <Link href="/signup" className="btn-primary btn-sm sm:px-5 sm:py-2.5 sm:text-sm">{t.common.joinFree}</Link>
            </>
          )}
          <MobileMenu loggedIn={!!v} />
        </div>
      </div>
    </header>
  );
}
