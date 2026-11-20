import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.auth.signupMeta };
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { role } = await searchParams;
  const { t } = await getI18n();
  return (
    <AuthShell image="photo-1470225620780-dba8ba36b745" quote={t.auth.signupQuote} alt={t.auth.imageAlt}>
      <h1 className="display text-4xl font-extrabold">{t.auth.join}</h1>
      <p className="mt-2 text-muted">{t.auth.joinText}</p>
      <div className="mt-8">
        <SignupForm initialRole={role === "business" ? "business" : "musician"} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {t.auth.haveAccount} <Link href="/login" className="font-semibold text-flame hover:underline">{t.common.logIn}</Link>
      </p>
    </AuthShell>
  );
}
