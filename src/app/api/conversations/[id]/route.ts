import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { loadThread } from "@/lib/conversation";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const after = Number(new URL(req.url).searchParams.get("after")) || 0;
  const data = loadThread(Number((await params).id), user, after);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ messages: data.messages, bookings: data.bookings });
}
