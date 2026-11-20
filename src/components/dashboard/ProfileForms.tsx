"use client";

import { useActionState } from "react";
import { saveBusinessProfile, saveMusicianProfile } from "@/app/actions";
import type { Business, Musician } from "@/lib/data";
import { BUSINESS_CATEGORIES, EVENT_TYPES, GENRES, LOCATIONS, PERFORMER_TYPES } from "@/lib/constants";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { ChipGroup } from "./ChipGroup";
import { GalleryField, ImageField } from "./ImageField";
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
      <div className="flex-1">
        <FormMessage state={state} />
        {!state?.error && !state?.ok && <p className="px-2 text-sm text-muted">{t.dash.saveHint}</p>}
      </div>
      <SubmitButton className="btn-lg" pendingText={t.dash.saving}>{t.dash.saveProfile}</SubmitButton>
    </div>
  );
}

export function MusicianProfileForm({ m }: { m: Musician }) {
  const [state, action] = useActionState(saveMusicianProfile, undefined);
  const { t, L } = useI18n();
  return (
    <form action={action} className="space-y-6">
      <Card title={t.dash.photos} desc={t.dash.photosDesc}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageField name="avatar" label={t.dash.profilePhoto} defaultValue={m.avatar} />
          <ImageField name="cover" label={t.dash.coverImage} defaultValue={m.cover} shape="wide" hint={t.dash.coverHint} />
        </div>
        <GalleryField name="photos" defaultValue={m.photos} />
      </Card>

      <Card title={t.dash.basics}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.dash.artistName}><input name="name" defaultValue={m.name} required className="input" /></Field>
          <Field label={t.dash.tagline} hint={t.dash.taglineHint}><input name="tagline" defaultValue={m.tagline} maxLength={140} className="input" /></Field>
          <Field label={t.dash.performerType}>
            <select name="performer_type" defaultValue={m.performer_type} className="input">{PERFORMER_TYPES.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          </Field>
          <Field label={t.dash.basedIn}>
            <select name="location" defaultValue={m.location} className="input">{LOCATIONS.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          </Field>
          <Field label={t.dash.yearsPerforming}><input name="years_active" type="number" min={0} defaultValue={m.years_active} className="input" /></Field>
          <Field label={t.dash.members}><input name="members" type="number" min={1} defaultValue={m.members} className="input" /></Field>
        </div>
        <ChipGroup name="genres" label={t.common.genres} options={GENRES} defaultValue={m.genres} />
        <ChipGroup name="event_types" label={t.dash.eventsYouPlay} options={EVENT_TYPES} defaultValue={m.event_types} tone="flame" />
      </Card>

      <Card title={t.dash.yourStory}>
        <Field label={t.dash.biography}><textarea name="bio" rows={6} defaultValue={m.bio} className="input" placeholder={t.dash.bioPh} /></Field>
        <Field label={t.dash.experienceLabel}><textarea name="experience" rows={3} defaultValue={m.experience} className="input" placeholder={t.dash.experiencePh} /></Field>
        <Field label={t.dash.performancesLabel} hint={t.dash.performancesHint}><textarea name="performances" rows={4} defaultValue={m.performances.join("\n")} className="input" /></Field>
        <Field label={t.dash.languages} hint={t.dash.commaSeparated}><input name="languages" defaultValue={m.languages.join(", ")} className="input" /></Field>
      </Card>

      <Card title={t.dash.rates} desc={t.dash.ratesDesc}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.dash.priceFrom}><input name="price_from" type="number" min={0} defaultValue={m.price_from || ""} className="input" /></Field>
          <Field label={t.dash.priceTo}><input name="price_to" type="number" min={0} defaultValue={m.price_to ?? ""} className="input" /></Field>
          <Field label={t.dash.hourlyRate}><input name="hourly_rate" type="number" min={0} defaultValue={m.hourly_rate ?? ""} className="input" /></Field>
        </div>
      </Card>

      <Card title={t.dash.musicVideo} desc={t.dash.musicVideoDesc}>
        <Field label={t.dash.audioSamples} hint={t.dash.audioHint}>
          <textarea name="tracks" rows={3} defaultValue={m.tracks.map((t) => [t.title, t.url, t.duration].filter(Boolean).join(" | ")).join("\n")} className="input font-mono text-xs" />
        </Field>
        <Field label={t.dash.videoLinks} hint={t.dash.videoHint}>
          <textarea name="videos" rows={3} defaultValue={m.videos.join("\n")} className="input font-mono text-xs" placeholder="https://www.youtube.com/watch?v=…&#10;https://open.spotify.com/artist/…" />
        </Field>
      </Card>

      <Card title={t.dash.contactDetails} desc={t.dash.contactDescM}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.dash.phone}><input name="phone" defaultValue={m.phone ?? ""} className="input" placeholder="+357 …" /></Field>
          <Field label={t.dash.bookingEmail}><input name="public_email" type="email" defaultValue={m.public_email ?? ""} className="input" /></Field>
          <Field label={t.dash.website}><input name="website" defaultValue={m.website ?? ""} className="input" /></Field>
          <Field label="Instagram"><input name="instagram" defaultValue={m.instagram ?? ""} className="input" placeholder="@yourhandle" /></Field>
        </div>
      </Card>
      <SaveBar state={state} />
    </form>
  );
}

export function BusinessProfileForm({ b }: { b: Business }) {
  const [state, action] = useActionState(saveBusinessProfile, undefined);
  const { t, L } = useI18n();
  return (
    <form action={action} className="space-y-6">
      <Card title={t.dash.branding}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageField name="logo" label={t.dash.logo} defaultValue={b.logo} />
          <ImageField name="cover" label={t.dash.coverPhoto} defaultValue={b.cover} shape="wide" hint={t.dash.coverHintB} />
        </div>
      </Card>
      <Card title={t.dash.aboutBusiness}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.dash.businessName}><input name="name" defaultValue={b.name} required className="input" /></Field>
          <Field label={t.dash.category}>
            <select name="category" defaultValue={b.category} className="input">{BUSINESS_CATEGORIES.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          </Field>
          <Field label={t.common.location}>
            <select name="location" defaultValue={b.location} className="input">{LOCATIONS.map((p) => <option key={p} value={p}>{L(p)}</option>)}</select>
          </Field>
          <Field label={t.dash.address}><input name="address" defaultValue={b.address ?? ""} className="input" /></Field>
          <Field label={t.dash.capacity}><input name="capacity" type="number" min={0} defaultValue={b.capacity ?? ""} className="input" /></Field>
        </div>
        <Field label={t.dash.description}><textarea name="description" rows={5} defaultValue={b.description} className="input" placeholder={t.dash.businessDescPh} /></Field>
      </Card>
      <Card title={t.dash.musicLooking}>
        <ChipGroup name="music_wanted" label={t.common.genres} options={GENRES} defaultValue={b.music_wanted} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.dash.budgetPerfFrom}><input name="budget_min" type="number" min={0} defaultValue={b.budget_min ?? ""} className="input" /></Field>
          <Field label={t.dash.budgetPerfTo}><input name="budget_max" type="number" min={0} defaultValue={b.budget_max ?? ""} className="input" /></Field>
        </div>
      </Card>
      <Card title={t.dash.contactInfo} desc={t.dash.contactDescB}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t.dash.phone}><input name="phone" defaultValue={b.phone ?? ""} className="input" /></Field>
          <Field label={t.auth.email}><input name="public_email" type="email" defaultValue={b.public_email ?? ""} className="input" /></Field>
          <Field label={t.dash.website}><input name="website" defaultValue={b.website ?? ""} className="input" /></Field>
        </div>
      </Card>
      <SaveBar state={state} />
    </form>
  );
}
