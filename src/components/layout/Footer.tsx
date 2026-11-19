import Link from "next/link";
import { Logo } from "./Logo";
import { LOCATIONS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            The home of live music in Cyprus. Connecting musicians with restaurants, hotels, bars, wedding planners and festivals — from Paphos to Protaras.
          </p>
          <p className="text-xs text-dim">Made in Cyprus 🇨🇾 · Prices in EUR</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">For businesses</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-fg" href="/musicians">Browse musicians</Link></li>
            <li><Link className="hover:text-fg" href="/dashboard/gigs/new">Post a gig</Link></li>
            <li><Link className="hover:text-fg" href="/signup?role=business">Create venue profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">For musicians</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-fg" href="/gigs">Find gigs</Link></li>
            <li><Link className="hover:text-fg" href="/venues">Explore venues</Link></li>
            <li><Link className="hover:text-fg" href="/signup?role=musician">Create artist profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Musicians in</h4>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted">
            {LOCATIONS.slice(0, 6).map((l) => (
              <li key={l}><Link className="hover:text-fg" href={`/musicians?location=${encodeURIComponent(l)}`}>{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-dim sm:flex-row">
          <p>© {new Date().getFullYear()} SoundCY. Venues and gigs shown are sample data.</p>
          <p>Where Cyprus finds its sound.</p>
        </div>
      </div>
    </footer>
  );
}
