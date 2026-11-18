import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "flame" }: { label: string; value: string | number; hint?: string; tone?: "flame" | "violet" | "lime" | "sky" }) {
  const c = { flame: "from-flame/20", violet: "from-violet/25", lime: "from-lime/15", sky: "from-sky-400/15" }[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${c} to-surface to-60% p-5`}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="display mt-2 text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-dim">{hint}</p>}
    </div>
  );
}

export function Panel({ title, href, cta, children }: { title: string; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-flame hover:underline">
            {cta ?? "View all"} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">{children}</div>;
}
