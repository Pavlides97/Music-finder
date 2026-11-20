import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="SoundCY">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-[0_6px_24px_-6px_rgb(255_122_26/0.7)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="currentColor" aria-hidden>
          <rect x="3" y="9" width="2.6" height="6" rx="1.3" />
          <rect x="7.2" y="5" width="2.6" height="14" rx="1.3" />
          <rect x="11.4" y="2.5" width="2.6" height="19" rx="1.3" />
          <rect x="15.6" y="6.5" width="2.6" height="11" rx="1.3" />
          <rect x="19.8" y="10" width="2.2" height="4" rx="1.1" />
        </svg>
      </span>
      <span className="display text-xl font-extrabold tracking-tight text-fg">
        Sound<span className="text-flame">CY</span>
      </span>
    </Link>
  );
}
