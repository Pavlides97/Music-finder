"use client";

import { useActionState } from "react";
import { createGigAction } from "@/app/actions";
import { EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { isoDate, addDays } from "@/lib/utils";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { ChipGroup } from "./ChipGroup";
import { useI18n } from "@/lib/i18n/client";

export function GigForm({ defaults }: { defaults: { location: string; venue: string; budgetMin?: number | null; budgetMax?: number | null; genres: string[] } }) {
  const [state, action] = useActionState(createGigAction, undefined);
  const today = isoDate(new Date());
  const { t, L } = useI18n();
  return (
    <form action={action} className="space-y-6">
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">{t.dash.step1}</h2>
        <label className="block">
          <span className="label">{t.dash.gigTitle}</span>
          <input name="title" required className="input" placeholder={t.dash.gigTitlePh} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="label">{t.common.date}</span>
            <input name="event_date" type="date" required min={today} defaultValue={isoDate(addDays(new Date(), 14))} className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">{t.dash.startTime}</span>
            <input name="start_time" type="time" required defaultValue="20:00" className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">{t.dash.endTime}</span>
            <input name="end_time" type="time" defaultValue="23:00" className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">{t.common.location}</span>
            <select name="location" defaultValue={defaults.location} className="input">{LOCATIONS.map((l) => <option key={l} value={l}>{L(l)}</option>)}</select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label">{t.dash.venue}</span>
            <input name="venue" defaultValue={defaults.venue} className="input" />
          </label>
        </div>
        <label className="block">
          <span className="label">{t.common.eventType}</span>
          <select name="event_type" className="input">{EVENT_TYPES.map((e) => <option key={e} value={e}>{L(e)}</option>)}</select>
        </label>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">{t.dash.step2}</h2>
        <label className="block">
          <span className="label">{t.dir.performerNeeded}</span>
          <select name="performer_type" defaultValue="Band" className="input">{PERFORMER_TYPES.map((e) => <option key={e} value={e}>{L(e)}</option>)}</select>
        </label>
        <ChipGroup name="genres" label={t.common.genres} options={GENRES} defaultValue={defaults.genres.slice(0, 2)} />
        <label className="block">
          <span className="label">{t.dash.description}</span>
          <textarea name="description" rows={5} className="input" placeholder={t.dash.gigDescPh} />
        </label>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">{t.dash.step3}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="label">{t.dash.budgetFrom}</span>
            <input name="budget_min" type="number" min={0} defaultValue={defaults.budgetMin ?? ""} className="input" />
          </label>
          <label className="block">
            <span className="label">{t.dash.budgetTo}</span>
            <input name="budget_max" type="number" min={0} defaultValue={defaults.budgetMax ?? ""} className="input" />
          </label>
          <label className="block">
            <span className="label">{t.gig.applyBy}</span>
            <input name="deadline" type="date" required min={today} defaultValue={isoDate(addDays(new Date(), 7))} className="input [color-scheme:dark]" />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="urgent" className="h-4 w-4 accent-[#ff7a1a]" /> {t.dash.urgent}
        </label>
      </section>

      <FormMessage state={state} />
      <SubmitButton className="btn-lg w-full sm:w-auto" pendingText={t.dash.publishing}>{t.dash.publish}</SubmitButton>
    </form>
  );
}
