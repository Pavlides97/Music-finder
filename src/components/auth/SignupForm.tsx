"use client";

import { useActionState, useState } from "react";
import { Building2, Check, Mic2 } from "lucide-react";
import { signupAction } from "@/app/actions";
import { BUSINESS_CATEGORIES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { useI18n } from "@/lib/i18n/client";

export function SignupForm({ initialRole }: { initialRole: "musician" | "business" }) {
  const [role, setRole] = useState(initialRole);
  const [genres, setGenres] = useState<string[]>([]);
  const [state, action] = useActionState(signupAction, undefined);
  const isM = role === "musician";
  const { t, L } = useI18n();

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-3">
        {([
          ["musician", Mic2, t.auth.imMusician, t.auth.imMusicianSub],
          ["business", Building2, t.auth.imBooking, t.auth.imBookingSub],
        ] as const).map(([r, Icon, title, s]) => (
          <button
            type="button"
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "relative rounded-2xl border p-4 text-left transition",
              role === r ? (r === "musician" ? "border-violet bg-violet/10" : "border-flame bg-flame/10") : "border-line bg-surface hover:border-line-strong",
            )}
            aria-pressed={role === r}
          >
            <Icon className={cn("h-6 w-6", r === "musician" ? "text-violet-2" : "text-flame")} />
            <p className="mt-3 text-sm font-bold">{title}</p>
            <p className="text-xs text-muted">{s}</p>
            {role === r && <Check className="absolute right-3 top-3 h-4 w-4" />}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="label">{isM ? t.auth.artistName : t.auth.businessName}</span>
        <input name="name" required className="input" placeholder={isM ? t.auth.artistPh : t.auth.businessPh} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">{isM ? t.auth.iAm : t.auth.category}</span>
          {isM ? (
            <select name="performer_type" className="input">{PERFORMER_TYPES.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          ) : (
            <select name="category" className="input">{BUSINESS_CATEGORIES.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          )}
        </label>
        <label className="block">
          <span className="label">{t.common.location}</span>
          <select name="location" className="input">{LOCATIONS.map((l) => <option key={l} value={l}>{L(l)}</option>)}</select>
        </label>
      </div>

      {isM && (
        <fieldset>
          <legend className="label">{t.auth.yourGenres} <span className="normal-case tracking-normal text-dim">{t.auth.pickFew}</span></legend>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => {
              const on = genres.includes(g);
              return (
                <label key={g} className={cn("chip cursor-pointer select-none px-3 py-1.5 text-sm", on && "border-violet/50 bg-violet/15 text-fg")}>
                  <input type="checkbox" name="genres" value={g} className="sr-only" checked={on} onChange={() => setGenres(on ? genres.filter((x) => x !== g) : [...genres, g])} />
                  {L(g)}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className="block">
        <span className="label">{t.auth.email}</span>
        <input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
      </label>
      <label className="block">
        <span className="label">{t.auth.password}</span>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input" placeholder={t.auth.pwPh} />
      </label>
      <FormMessage state={state} />
      <SubmitButton className={cn("btn-lg w-full", isM && "!bg-[#7c3aed] !text-white hover:!bg-[#6d28d9]")} pendingText={t.auth.creating}>
        {isM ? t.auth.createArtist : t.auth.createVenue}
      </SubmitButton>
      <p className="text-center text-[11px] text-dim">{t.auth.terms}</p>
    </form>
  );
}
