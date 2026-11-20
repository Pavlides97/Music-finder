"use client";

import { useActionState } from "react";
import { applyToGigAction } from "@/app/actions";
import { FormMessage, SubmitButton } from "./ui/SubmitButton";
import { useI18n } from "@/lib/i18n/client";

export function ApplyForm({ gigId, suggested, again }: { gigId: number; suggested: number | null; again?: boolean }) {
  const [state, action] = useActionState(applyToGigAction, undefined);
  const { t } = useI18n();
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="gig_id" value={gigId} />
      <label className="block">
        <span className="label">{t.gig.quote}</span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">€</span>
          <input name="quote" type="number" min={0} defaultValue={suggested ?? undefined} className="input pl-8" />
        </div>
      </label>
      <label className="block">
        <span className="label">{t.gig.messageToOrganiser}</span>
        <textarea
          name="message"
          rows={4}
          required
          className="input"
          placeholder={t.gig.messagePh}
        />
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-lg w-full" pendingText={t.booking.sending}>{again ? t.gig.update : t.gig.applyNow}</SubmitButton>
    </form>
  );
}
