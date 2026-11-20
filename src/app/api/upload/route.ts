import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getUser } from "@/lib/auth";
import { getLang } from "@/lib/i18n/server";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function POST(req: Request) {
  const user = await getUser();
  const el = (await getLang()) === "el";
  if (!user) return NextResponse.json({ error: el ? "Συνδέσου πρώτα." : "Please log in." }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: el ? "Δεν επιλέχθηκε αρχείο." : "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: el ? "Ανέβασε εικόνα JPG, PNG, WEBP ή GIF." : "Please upload a JPG, PNG, WEBP or GIF image." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: el ? "Οι εικόνες πρέπει να είναι κάτω από 5 MB." : "Images must be under 5 MB." }, { status: 400 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${user.id}-${randomBytes(8).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
