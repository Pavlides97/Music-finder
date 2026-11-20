import Link from "next/link";
import { Logo } from "./Logo";
import { LOCATIONS } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";

export async function Footer() {
  const { t, L } = await getI18n();
  return (
    <footer className="mt-24 border-t border-line bg-ink">
      <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{t.footer.about}</p>
          <p className="text-xs text-dim">{t.footer.madeIn}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.forBusinesses}</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-fg" href="/musicians">{t.footer.browseMusicians}</Link></li>
            <li><Link className="hover:text-fg" href="/match">{t.nav.match}</Link></li>
            <li><Link className="hover:text-fg" href="/dashboard/gigs/new">{t.footer.postGig}</Link></li>
            <li><Link className="hover:text-fg" href="/signup?role=business">{t.footer.createVenue}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.forMusicians}</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-fg" href="/gigs">{t.common.findGigs}</Link></li>
            <li><Link className="hover:text-fg" href="/venues">{t.footer.exploreVenues}</Link></li>
            <li><Link className="hover:text-fg" href="/signup?role=musician">{t.footer.createArtist}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.musiciansIn}</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted">
            {LOCATIONS.slice(0, 6).map((l) => (
              <li key={l}><Link className="hover:text-fg" href={`/musicians?location=${encodeURIComponent(l)}`}>{L(l)}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-dim sm:flex-row">
          <p>© {new Date().getFullYear()} SoundCY. {t.footer.sample}</p>
          <p>{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
