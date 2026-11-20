import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { demoLoginAction } from "@/app/actions";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.loginMeta, robots: { index: false } };
}

const DEMOS = [
  { email: "oldport@demo.soundcy.app", name: "The Old Port Bistro", icon: Building2, tone: "text-flame bg-flame/10" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/dashboard" } = await searchParams;
  if (await getUser()) redirect(next);
  const { t } = await getI18n();
  return (
    <AuthShell image="photo-1514525253161-7a46d19cd819" quote={t.auth.loginQuote} alt={t.auth.imageAlt}>
      <h1 className="display text-4xl font-extrabold">{t.auth.welcome}</h1>
      <p className="mt-2 text-muted">{t.auth.welcomeText}</p>

      <div className="mt-8 rounded-2xl border border-lime/20 bg-lime/[0.04] p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lime"><Sparkles className="h-3.5 w-3.5" /> {t.auth.demo}</p>
        <div className="grid gap-2">
          {DEMOS.map((d) => (
            <form key={d.email} action={demoLoginAction}>
              <input type="hidden" name="email" value={d.email} />
              <input type="hidden" name="next" value={next} />
              <button className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-line-strong hover:bg-surface-2">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${d.tone}`}><d.icon className="h-5 w-5" /></span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{d.name}</span>
                  <span className="block text-xs text-muted">{t.auth.demoSub}</span>
                </span>
                <span className="text-xs font-semibold text-flame">{t.auth.enter}</span>
              </button>
            </form>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-dim">{t.auth.demoPw} <code className="text-muted">demo1234</code>.</p>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-dim"><span className="h-px flex-1 bg-line" /> {t.auth.orEmail} <span className="h-px flex-1 bg-line" /></div>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm text-muted">
        {t.auth.newHere} <Link href="/signup" className="font-semibold text-flame hover:underline">{t.auth.createFree}</Link>
      </p>
    </AuthShell>
  );
}
