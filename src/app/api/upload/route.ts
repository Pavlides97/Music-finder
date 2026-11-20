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
  const lang = await getLang();
  const m = (en: string, el: string, ru: string) => (lang === "el" ? el : lang === "ru" ? ru : en);
  if (!user) return NextResponse.json({ error: m("Please log in.", "Συνδέσου πρώτα.", "Пожалуйста, войдите.") }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: m("No file.", "Δεν επιλέχθηκε αρχείο.", "Файл не выбран.") }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: m("Please upload a JPG, PNG, WEBP or GIF image.", "Ανέβασε εικόνα JPG, PNG, WEBP ή GIF.", "Загрузите изображение JPG, PNG, WEBP или GIF.") }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: m("Images must be under 5 MB.", "Οι εικόνες πρέπει να είναι κάτω από 5 MB.", "Размер изображения — не более 5 МБ.") }, { status: 400 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${user.id}-${randomBytes(8).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
