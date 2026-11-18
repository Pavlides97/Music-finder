import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Join SoundCY" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { role } = await searchParams;
  return (
    <AuthShell image="photo-1470225620780-dba8ba36b745" quote="Your next gig is already looking for you.">
      <h1 className="display text-4xl font-extrabold">Join SoundCY</h1>
      <p className="mt-2 text-muted">Create your free profile in under two minutes.</p>
      <div className="mt-8">
        <SignupForm initialRole={role === "business" ? "business" : "musician"} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="font-semibold text-flame hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
