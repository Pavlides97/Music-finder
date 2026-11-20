"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareText, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { describeEventAction } from "@/app/match/actions";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const MAX = 400;

/** Free-text event description → Claude → structured filters → the normal matcher. */
export function DescribeEvent({ available }: { available: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const goToWizard = () => document.getElementById("quick-questions")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError(t.ai.empty);
      ref.current?.focus();
      return;
    }
    setError(null);
    start(async () => {
      const res = await describeEventAction(value).catch(() => ({ ok: false as const, code: "failed" as const }));
      if (!res.ok) {
        const msg = {
          nokey: t.ai.noKey,
          rate: t.ai.rate,
          failed: t.ai.failed,
          tooLong: t.ai.tooLong(MAX),
          empty: t.ai.empty,
          nothing: t.ai.nothing,
        }[res.code];
        setError(msg);
        return;
      }
      const q = res.query;
      const p = new URLSearchParams();
      if (q.event) p.set("event", q.event);
      if (q.city) p.set("city", q.city);
      if (q.genres.length) p.set("genres", q.genres.join(","));
      if (q.budget) p.set("budget", String(q.budget));
      if (q.date) p.set("date", q.date);
      if (q.type) p.set("type", q.type);
      p.set("ai", "1");
      p.set("go", "1");
      router.push(`/match?${p.toString()}`, { scroll: true });
    });
  };

  return (
    <section aria-labelledby="describe-title" className="glass mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-ink shadow-[0_12px_30px_-12px_rgb(255_122_26/0.7)]">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="describe-title" className="display text-2xl font-bold sm:text-3xl">{t.ai.title}</h2>
          <p className="mt-1 text-sm text-muted">{t.ai.hint}</p>
        </div>
      </div>

      {available ? (
        <form onSubmit={submit} className="mt-5" noValidate>
          <label htmlFor="describe" className="sr-only">{t.ai.label}</label>
          <div className="relative">
            <textarea
              id="describe"
              ref={ref}
              rows={3}
              maxLength={MAX}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
              }}
              placeholder={t.ai.placeholder}
              aria-describedby="describe-count describe-privacy"
              aria-invalid={Boolean(error) || undefined}
              className="input min-h-28 resize-y pb-7"
              disabled={pending}
            />
            <span id="describe-count" className={cn("pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums", text.length > MAX - 40 ? "text-amber-300" : "text-dim")}>
              {t.ai.chars(text.length, MAX)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[t.ai.ex1, t.ai.ex2, t.ai.ex3].map((ex) => (
              <button key={ex} type="button" onClick={() => { setText(ex); setError(null); ref.current?.focus(); }} className="chip min-h-9 max-w-full px-3 text-left text-xs hover:border-flame/50 hover:text-fg" disabled={pending}>
                <span className="truncate">“{ex}”</span>
              </button>
            ))}
          </div>
          {error && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              <span>
                {error}{" "}
                <button type="button" onClick={goToWizard} className="font-semibold text-fg underline underline-offset-2">{t.ai.or}</button>
              </span>
            </div>
          )}
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="describe-privacy" className="flex items-center gap-1.5 text-[11px] text-dim">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-lime" aria-hidden /> {t.ai.privacy}
            </p>
            <button type="submit" className="btn-primary shrink-0" disabled={pending} aria-busy={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {pending ? t.ai.working : t.ai.submit}
            </button>
          </div>
          <p className="sr-only" aria-live="polite">{pending ? t.ai.working : ""}</p>
        </form>
      ) : (
        <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-white/[0.03] p-3 text-sm text-muted">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
          <span>
            {t.ai.noKey}{" "}
            <button type="button" onClick={goToWizard} className="font-semibold text-fg underline underline-offset-2">{t.ai.or}</button>
          </span>
        </p>
      )}
    </section>
  );
}
