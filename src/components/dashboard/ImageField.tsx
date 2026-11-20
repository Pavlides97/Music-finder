"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Photo } from "../ui/Photo";
import { useI18n } from "@/lib/i18n/client";

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "upload");
  return j.url;
}

export function ImageField({ name, label, defaultValue, shape = "square", hint }: { name: string; label: string; defaultValue?: string | null; shape?: "square" | "wide"; hint?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      setValue(await upload(f));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn("group relative shrink-0 overflow-hidden rounded-2xl border border-dashed border-line-strong", shape === "wide" ? "h-24 w-44" : "h-24 w-24")}
        >
          {value ? <Photo src={value} alt={label} w={400} label="" className="h-full w-full" /> : <ImagePlus className="m-auto h-6 w-6 text-dim" />}
          <span className="absolute inset-0 grid place-items-center bg-ink/60 opacity-0 transition group-hover:opacity-100">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </span>
        </button>
        <div className="space-y-2 text-xs text-muted">
          <div className="flex gap-2">
            <button type="button" onClick={() => input.current?.click()} className="btn-ghost btn-sm" disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {t.dash.upload}
            </button>
            {value && (
              <button type="button" onClick={() => setValue("")} className="btn-quiet btn-sm" aria-label={t.dash.remove(label)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p>{hint ?? t.dash.uploadHint}</p>
          {err && <p className="text-rose">{err === "upload" ? t.dash.uploadFailed : err}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

export function GalleryField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [items, setItems] = useState(defaultValue);
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 12 - items.length)) urls.push(await upload(f));
      setItems((x) => [...x, ...urls]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label">{t.dash.performancePhotos}</span>
      <textarea name={name} value={items.join("\n")} readOnly hidden />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {items.map((p, i) => (
          <div key={p + i} className="group relative aspect-square overflow-hidden rounded-xl">
            <Photo src={p} alt={t.dash.photoN(i + 1)} w={300} label="" className="h-full w-full" />
            <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-ink/80 p-1.5 opacity-0 transition group-hover:opacity-100" aria-label={t.dash.removePhoto}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {items.length < 12 && (
          <button type="button" onClick={() => input.current?.click()} aria-label={t.dash.addPhotos} className="grid aspect-square place-items-center rounded-xl border border-dashed border-line-strong text-dim hover:text-fg">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-rose">{err === "upload" ? t.dash.uploadFailed : err}</p>}
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
