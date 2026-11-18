"use client";

import { useActionState } from "react";
import { createGigAction } from "@/app/actions";
import { EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { isoDate, addDays } from "@/lib/utils";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { ChipGroup } from "./ChipGroup";

export function GigForm({ defaults }: { defaults: { location: string; venue: string; budgetMin?: number | null; budgetMax?: number | null; genres: string[] } }) {
  const [state, action] = useActionState(createGigAction, undefined);
  const today = isoDate(new Date());
  return (
    <form action={action} className="space-y-6">
      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">1 · The event</h2>
        <label className="block">
          <span className="label">Gig title</span>
          <input name="title" required className="input" placeholder="e.g. Friday Night Jazz on the Terrace" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="label">Date</span>
            <input name="event_date" type="date" required min={today} defaultValue={isoDate(addDays(new Date(), 14))} className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">Start time</span>
            <input name="start_time" type="time" required defaultValue="20:00" className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">End time</span>
            <input name="end_time" type="time" defaultValue="23:00" className="input [color-scheme:dark]" />
          </label>
          <label className="block">
            <span className="label">Location</span>
            <select name="location" defaultValue={defaults.location} className="input">{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Venue</span>
            <input name="venue" defaultValue={defaults.venue} className="input" />
          </label>
        </div>
        <label className="block">
          <span className="label">Event type</span>
          <select name="event_type" className="input">{EVENT_TYPES.map((e) => <option key={e}>{e}</option>)}</select>
        </label>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">2 · The music</h2>
        <label className="block">
          <span className="label">Performer needed</span>
          <select name="performer_type" defaultValue="Band" className="input">{PERFORMER_TYPES.map((e) => <option key={e}>{e}</option>)}</select>
        </label>
        <ChipGroup name="genres" label="Genres" options={GENRES} defaultValue={defaults.genres.slice(0, 2)} />
        <label className="block">
          <span className="label">Description</span>
          <textarea name="description" rows={5} className="input" placeholder="Atmosphere, audience size, set lengths, equipment provided, dress code, meals/parking…" />
        </label>
      </section>

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-bold">3 · Budget & deadline</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="label">Budget from (€)</span>
            <input name="budget_min" type="number" min={0} defaultValue={defaults.budgetMin ?? ""} className="input" />
          </label>
          <label className="block">
            <span className="label">Budget up to (€)</span>
            <input name="budget_max" type="number" min={0} defaultValue={defaults.budgetMax ?? ""} className="input" />
          </label>
          <label className="block">
            <span className="label">Apply by</span>
            <input name="deadline" type="date" required min={today} defaultValue={isoDate(addDays(new Date(), 7))} className="input [color-scheme:dark]" />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="urgent" className="h-4 w-4 accent-[#ff7a1a]" /> Mark as urgent (highlighted in search)
        </label>
      </section>

      <FormMessage state={state} />
      <SubmitButton className="btn-lg w-full sm:w-auto" pendingText="Publishing…">Publish gig</SubmitButton>
    </form>
  );
}
