import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Mic2, Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { demoLoginAction } from "@/app/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

const DEMOS = [
  { email: "eleni@demo.soundcy.app", name: "Eleni Charalambous", sub: "Jazz singer · Limassol", icon: Mic2, tone: "text-violet-2 bg-violet/15" },
  { email: "oldport@demo.soundcy.app", name: "The Old Port Bistro", sub: "Restaurant · Limassol", icon: Building2, tone: "text-flame bg-flame/10" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/dashboard" } = await searchParams;
  if (await getUser()) redirect(next);
  return (
    <AuthShell image="photo-1514525253161-7a46d19cd819" quote="“We filled every Friday this winter through SoundCY.” — Limassol restaurant owner">
      <h1 className="display text-4xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to manage bookings, gigs and messages.</p>

      <div className="mt-8 rounded-2xl border border-lime/20 bg-lime/[0.04] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime"><Sparkles className="h-3.5 w-3.5" /> One-click demo accounts</p>
        <div className="grid gap-2">
          {DEMOS.map((d) => (
            <form key={d.email} action={demoLoginAction}>
              <input type="hidden" name="email" value={d.email} />
              <input type="hidden" name="next" value={next} />
              <button className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-line-strong hover:bg-surface-2">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${d.tone}`}><d.icon className="h-5 w-5" /></span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{d.name}</span>
                  <span className="block text-xs text-muted">{d.sub}</span>
                </span>
                <span className="text-xs font-semibold text-flame">Enter →</span>
              </button>
            </form>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-dim">Any demo account also works with password <code className="text-muted">demo1234</code>.</p>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-dim"><span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" /></div>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm text-muted">
        New to SoundCY? <Link href="/signup" className="font-semibold text-flame hover:underline">Create a free account</Link>
      </p>
    </AuthShell>
  );
}
