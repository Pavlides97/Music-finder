import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { db } from "./db";
import { getBusinessByUser, getMusicianByUser } from "./data";

export type SessionUser = { id: number; email: string; role: "musician" | "business"; name: string };

const COOKIE = "soundcy_session";
const TTL_DAYS = 30;

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TTL_DAYS * 86400000);
  db().prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)").run(token, userId, expires.toISOString());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  jar.delete(COOKIE);
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare("SELECT u.id, u.email, u.role, u.name, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?")
    .get(token) as (SessionUser & { expires_at: string }) | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, email: row.email, role: row.role, name: row.name };
});

export async function requireUser(next = "/dashboard") {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

/** Returns the user together with their musician or business profile. */
export const getViewer = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  if (user.role === "musician") {
    const musician = getMusicianByUser(user.id);
    return musician ? { user, role: "musician" as const, musician, business: null, profileId: musician.id } : null;
  }
  const business = getBusinessByUser(user.id);
  return business ? { user, role: "business" as const, business, musician: null, profileId: business.id } : null;
});

export async function requireViewer(next = "/dashboard") {
  const v = await getViewer();
  if (!v) redirect(`/login?next=${encodeURIComponent(next)}`);
  return v;
}
