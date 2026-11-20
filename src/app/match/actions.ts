"use server";

import { headers } from "next/headers";
import { getUser } from "@/lib/auth";
import { describeEvent, type DescribeResult } from "@/lib/eventAI";

/** "Describe your event" → match filters. The user's text never goes anywhere else. */
export async function describeEventAction(text: string): Promise<DescribeResult> {
  const user = await getUser();
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "anon";
  return describeEvent(typeof text === "string" ? text.slice(0, 2000) : "", user ? `u:${user.id}` : `ip:${ip}`);
}
