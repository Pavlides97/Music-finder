"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
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

/** Tell the surrounding form a hidden value changed (drives the live completion meter). */
function useNotify(ref: React.RefObject<HTMLElement | null>, dep: unknown) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [dep, ref]);
}

/** Single photo: large tap target, opens the camera roll / camera on phones. */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  round,
  id,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  round?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  useNotify(hidden, value);

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
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div id={id} className="scroll-mt-28">
      <span className="label">{label}</span>
      <input ref={hidden} type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-label={value ? t.pf.changePhoto : t.pf.choosePhoto}
          className={cn(
            "group relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden border-2 border-dashed border-line-strong bg-surface-2 transition hover:border-flame/60",
            round ? "rounded-full" : "rounded-2xl",
          )}
        >
          {value ? <Photo src={value} alt={label} w={400} label="" className="absolute inset-0" /> : <Camera className="h-7 w-7 text-dim group-hover:text-flame" />}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-ink/60">
              <Loader2 className="h-6 w-6 animate-spin" />
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="btn-ghost btn-sm min-h-9" disabled={busy}>
              <ImagePlus className="h-4 w-4" /> {value ? t.pf.changePhoto : t.pf.choosePhoto}
            </button>
            {value && (
              <button type="button" onClick={() => setValue("")} className="btn-quiet btn-sm min-h-9" aria-label={t.dash.remove(label)}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted">{hint ?? t.dash.uploadHint}</p>
          {err && <p className="text-xs text-rose">{err === "upload" ? t.dash.uploadFailed : err}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

/** Several photos: tap or drag & drop, up to 12. */
export function GalleryField({ name, label, hint, defaultValue, id }: { name: string; label: string; hint?: string; defaultValue: string[]; id?: string }) {
  const [items, setItems] = useState(defaultValue);
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const hidden = useRef<HTMLTextAreaElement>(null);
  useNotify(hidden, items.join("|"));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 12 - items.length)) urls.push(await upload(f));
      setItems((x) => [...x, ...urls]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div id={id} className="scroll-mt-28">
      <span className="label">
        {label} <span className="normal-case tracking-normal text-dim">({t.pf.optional})</span>
      </span>
      {hint && <p className="-mt-1 mb-2 text-xs text-muted">{hint}</p>}
      <textarea ref={hidden} name={name} value={items.join("\n")} readOnly hidden />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={cn("grid grid-cols-3 gap-2 rounded-2xl p-1 transition sm:grid-cols-4 lg:grid-cols-6", drag && "bg-flame/10 ring-2 ring-flame/50")}
      >
        {items.map((p, i) => (
          <div key={p + i} className="group relative aspect-square overflow-hidden rounded-xl">
            <Photo src={p} alt={t.dash.photoN(i + 1)} w={300} label="" className="h-full w-full" />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-fg sm:opacity-0 sm:transition sm:group-hover:opacity-100"
              aria-label={t.dash.removePhoto}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length < 12 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-label={t.dash.addPhotos}
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line-strong text-dim transition hover:border-flame/60 hover:text-flame"
          >
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-rose">{err === "upload" ? t.dash.uploadFailed : err}</p>}
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
