"use client";

import { useActionState } from "react";
import { saveBusinessProfile, saveMusicianProfile } from "@/app/actions";
import type { Business, Musician } from "@/lib/data";
import { BUSINESS_CATEGORIES, EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { ChipGroup } from "./ChipGroup";
import { GalleryField, ImageField } from "./ImageField";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-bold">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-dim">{hint}</span>}
    </label>
  );
}

function SaveBar({ state }: { state?: { error?: string; ok?: string } }) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
      <div className="flex-1">
        <FormMessage state={state} />
        {!state?.error && !state?.ok && <p className="px-2 text-sm text-muted">Changes are visible on your public profile as soon as you save.</p>}
      </div>
      <SubmitButton className="btn-lg" pendingText="Saving…">Save profile</SubmitButton>
    </div>
  );
}

export function MusicianProfileForm({ m }: { m: Musician }) {
  const [state, action] = useActionState(saveMusicianProfile, undefined);
  return (
    <form action={action} className="space-y-6">
      <Card title="Photos" desc="Great photos get up to 3× more booking requests.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField name="avatar" label="Profile photo" defaultValue={m.avatar} />
          <ImageField name="cover" label="Cover image" defaultValue={m.cover} shape="wide" hint="Wide landscape shot of you performing." />
        </div>
        <GalleryField name="photos" defaultValue={m.photos} />
      </Card>

      <Card title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Artist or band name"><input name="name" defaultValue={m.name} required className="input" /></Field>
          <Field label="Tagline" hint="One line that sells your sound."><input name="tagline" defaultValue={m.tagline} maxLength={140} className="input" /></Field>
          <Field label="Performer type">
            <select name="performer_type" defaultValue={m.performer_type} className="input">{PERFORMER_TYPES.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Based in">
            <select name="location" defaultValue={m.location} className="input">{LOCATIONS.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Years performing"><input name="years_active" type="number" min={0} defaultValue={m.years_active} className="input" /></Field>
          <Field label="Members"><input name="members" type="number" min={1} defaultValue={m.members} className="input" /></Field>
        </div>
        <ChipGroup name="genres" label="Genres" options={GENRES} defaultValue={m.genres} />
        <ChipGroup name="event_types" label="Events you play" options={EVENT_TYPES} defaultValue={m.event_types} tone="flame" />
      </Card>

      <Card title="Your story">
        <Field label="Biography"><textarea name="bio" rows={6} defaultValue={m.bio} className="input" placeholder="Who you are, your sound, what makes your show special…" /></Field>
        <Field label="Experience & highlights"><textarea name="experience" rows={3} defaultValue={m.experience} className="input" placeholder="Residencies, festivals, notable events…" /></Field>
        <Field label="Performances offered" hint="One per line — e.g. “3 x 45-minute sets”, “Ceremony + cocktail hour”."><textarea name="performances" rows={4} defaultValue={m.performances.join("\n")} className="input" /></Field>
        <Field label="Languages" hint="Comma separated."><input name="languages" defaultValue={m.languages.join(", ")} className="input" /></Field>
      </Card>

      <Card title="Rates" desc="Shown publicly as a starting point — you'll agree the final price per booking.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price per event — from (€)"><input name="price_from" type="number" min={0} defaultValue={m.price_from || ""} className="input" /></Field>
          <Field label="Price per event — up to (€, optional)"><input name="price_to" type="number" min={0} defaultValue={m.price_to ?? ""} className="input" /></Field>
          <Field label="Hourly rate (€, optional)"><input name="hourly_rate" type="number" min={0} defaultValue={m.hourly_rate ?? ""} className="input" /></Field>
        </div>
      </Card>

      <Card title="Music & video" desc="Let venues hear you before they book.">
        <Field label="Audio samples" hint="One per line: Title | https://link-to-audio.mp3 | 3:45">
          <textarea name="tracks" rows={3} defaultValue={m.tracks.map((t) => [t.title, t.url, t.duration].filter(Boolean).join(" | ")).join("\n")} className="input font-mono text-xs" />
        </Field>
        <Field label="YouTube & Spotify links" hint="One link per line — they'll be embedded on your profile.">
          <textarea name="videos" rows={3} defaultValue={m.videos.join("\n")} className="input font-mono text-xs" placeholder="https://www.youtube.com/watch?v=…&#10;https://open.spotify.com/artist/…" />
        </Field>
      </Card>

      <Card title="Contact details" desc="Visible to logged-in venues and organisers.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone"><input name="phone" defaultValue={m.phone ?? ""} className="input" placeholder="+357 …" /></Field>
          <Field label="Booking email"><input name="public_email" type="email" defaultValue={m.public_email ?? ""} className="input" /></Field>
          <Field label="Website"><input name="website" defaultValue={m.website ?? ""} className="input" /></Field>
          <Field label="Instagram"><input name="instagram" defaultValue={m.instagram ?? ""} className="input" placeholder="@yourhandle" /></Field>
        </div>
      </Card>
      <SaveBar state={state} />
    </form>
  );
}

export function BusinessProfileForm({ b }: { b: Business }) {
  const [state, action] = useActionState(saveBusinessProfile, undefined);
  return (
    <form action={action} className="space-y-6">
      <Card title="Branding">
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField name="logo" label="Logo" defaultValue={b.logo} />
          <ImageField name="cover" label="Cover photo" defaultValue={b.cover} shape="wide" hint="Your venue, stage or atmosphere." />
        </div>
      </Card>
      <Card title="About your business">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name"><input name="name" defaultValue={b.name} required className="input" /></Field>
          <Field label="Category">
            <select name="category" defaultValue={b.category} className="input">{BUSINESS_CATEGORIES.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Location">
            <select name="location" defaultValue={b.location} className="input">{LOCATIONS.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="Address"><input name="address" defaultValue={b.address ?? ""} className="input" /></Field>
          <Field label="Capacity (guests)"><input name="capacity" type="number" min={0} defaultValue={b.capacity ?? ""} className="input" /></Field>
        </div>
        <Field label="Description"><textarea name="description" rows={5} defaultValue={b.description} className="input" placeholder="Your venue, atmosphere, when you host live music…" /></Field>
      </Card>
      <Card title="Music you're looking for">
        <ChipGroup name="music_wanted" label="Genres" options={GENRES} defaultValue={b.music_wanted} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Budget per performance — from (€)"><input name="budget_min" type="number" min={0} defaultValue={b.budget_min ?? ""} className="input" /></Field>
          <Field label="Budget per performance — up to (€)"><input name="budget_max" type="number" min={0} defaultValue={b.budget_max ?? ""} className="input" /></Field>
        </div>
      </Card>
      <Card title="Contact information" desc="Visible to logged-in musicians.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Phone"><input name="phone" defaultValue={b.phone ?? ""} className="input" /></Field>
          <Field label="Email"><input name="public_email" type="email" defaultValue={b.public_email ?? ""} className="input" /></Field>
          <Field label="Website"><input name="website" defaultValue={b.website ?? ""} className="input" /></Field>
        </div>
      </Card>
      <SaveBar state={state} />
    </form>
  );
}
