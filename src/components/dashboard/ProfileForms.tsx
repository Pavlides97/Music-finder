"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { saveBusinessProfile, saveMusicianProfile } from "@/app/actions";
import type { Business, Musician } from "@/lib/data";
import { BUSINESS_CATEGORIES, GENRES, PERFORMER_TYPES } from "@/lib/constants";
import { artistCompletion, venueCompletion, type CompletionItem } from "@/lib/completion";
import { useI18n } from "@/lib/i18n/client";
import { FormMessage, SubmitButton } from "../ui/SubmitButton";
import { ChipGroup } from "./ChipGroup";
import { GalleryField, ImageField } from "./ImageField";
import { ChoiceChips, CompletionMeter, Field, LinksField, LocationFields, Section, YesNo } from "./FormBits";

const BIO_MAX = 1200;

function SaveBar({ state, items }: { state?: { error?: string; ok?: string }; items: CompletionItem[] }) {
  const { t } = useI18n();
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return (
    <div className="sticky bottom-3 z-10 overflow-hidden rounded-2xl border border-line-strong bg-surface-2/95 shadow-2xl backdrop-blur">
      {/* slim live progress line (the full meter scrolls away on phones) */}
      <div className="h-1 bg-white/10" aria-hidden>
        <div className={pct === 100 ? "h-full bg-lime transition-all" : "h-full bg-brand transition-all"} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <FormMessage state={state} />
        {!state?.error && !state?.ok && (
          <p className="px-2 text-sm text-muted">
            <span className="font-semibold text-fg sm:hidden">{t.pf.completeTitle(pct)}</span>
            <span className="hidden sm:inline">{t.dash.saveHint}</span>
          </p>
        )}
      </div>
      <SubmitButton className="btn-lg w-full sm:w-auto" pendingText={t.dash.saving}>
        {t.dash.saveProfile}
      </SubmitButton>
      </div>
    </div>
  );
}

/** Re-computes completion whenever any field in the form changes. */
function useLiveCompletion(compute: (fd: FormData) => CompletionItem[], initial: CompletionItem[]) {
  const form = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState(initial);
  const update = useCallback(() => {
    if (form.current) setItems(compute(new FormData(form.current)));
  }, [compute]);
  return { form, items, update };
}

const cityOf = (fd: FormData) => String(fd.get("country") === "Cyprus" ? (fd.get("city") ?? "") : (fd.get("city_text") ?? ""));
const nonEmpty = (fd: FormData, k: string) => fd.getAll(k).map(String).filter((x) => x.trim());
const photoLines = (fd: FormData) => String(fd.get("photos") ?? "").split("\n").filter(Boolean);

/* ------------------------------------------------------------------ */
/* Artist / musician                                                    */
/* ------------------------------------------------------------------ */

export function MusicianProfileForm({ m }: { m: Musician }) {
  const { t } = useI18n();
  const [state, action] = useActionState(saveMusicianProfile, undefined);
  const [bio, setBio] = useState(m.bio);
  const compute = useCallback(
    (fd: FormData) =>
      artistCompletion({
        name: String(fd.get("name") ?? ""),
        avatar: String(fd.get("avatar") ?? ""),
        location: cityOf(fd),
        bio: String(fd.get("bio") ?? ""),
        performer_type: String(fd.get("performer_type") ?? ""),
        genres: nonEmpty(fd, "genres"),
        videos: nonEmpty(fd, "links"),
        photos: photoLines(fd),
        phone: String(fd.get("phone") ?? ""),
        public_email: String(fd.get("public_email") ?? ""),
      }),
    [],
  );
  const { form, items, update } = useLiveCompletion(compute, artistCompletion(m));
  const labels = { ...t.pf.item, type: t.pf.artistType } as Record<string, string>;

  return (
    <form ref={form} action={action} onInput={update} onChange={update} className="space-y-5">
      <div className="sm:sticky sm:top-[4.5rem] sm:z-20">
        <CompletionMeter items={items} labels={labels} />
      </div>

      {/* 1–2: name + photo */}
      <Section title={t.pf.secPhoto}>
        <ImageField id="pf-photo" name="avatar" label={t.pf.photo} defaultValue={m.avatar} hint={t.pf.photoHint} round />
        <Field id="pf-name" label={t.pf.artistName} required>
          <input name="name" defaultValue={m.name} required minLength={2} maxLength={120} autoComplete="organization" className="input" />
        </Field>
      </Section>

      {/* 3–5: location, bio, type */}
      <Section title={t.pf.secAbout}>
        <ChoiceChips id="pf-type" name="performer_type" label={t.pf.artistType} options={PERFORMER_TYPES} defaultValue={m.performer_type} required />
        <LocationFields id="pf-location" country={m.country} city={m.location} />
        <Field id="pf-bio" label={t.pf.bio} counter={t.pf.chars(bio.length, BIO_MAX)}>
          <textarea name="bio" rows={5} maxLength={BIO_MAX} value={bio} onChange={(e) => setBio(e.target.value)} className="input" placeholder={t.pf.bioPh} />
        </Field>
      </Section>

      {/* 6–8: genres, links, photos */}
      <Section title={t.pf.secMusic}>
        <div id="pf-genres" className="scroll-mt-28">
          <ChipGroup name="genres" label={t.pf.genres} options={GENRES} defaultValue={m.genres} />
          <p className="mt-2 text-xs text-muted">{t.pf.genresHint}</p>
        </div>
        <LinksField id="pf-links" defaultValue={m.videos} />
        <GalleryField id="pf-photos" name="photos" label={t.pf.morePhotos} hint={t.pf.morePhotosHint} defaultValue={m.photos} />
      </Section>

      {/* 9–10: contact, availability */}
      <Section title={t.pf.secContact}>
        <div id="pf-contact" className="scroll-mt-28">
          <p className="-mt-2 mb-4 text-sm text-muted">{t.pf.contactHintArtist}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.pf.email}>
              <input name="public_email" type="email" inputMode="email" autoComplete="email" defaultValue={m.public_email ?? ""} className="input" />
            </Field>
            <Field label={t.pf.phone}>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={m.phone ?? ""} className="input" placeholder="+357 …" />
            </Field>
          </div>
        </div>
        <YesNo name="available" label={t.pf.available} defaultValue={m.available !== 0} yes={t.pf.availableYes} no={t.pf.availableNo} />
      </Section>

      <SaveBar state={state} items={items} />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Venue / business                                                     */
/* ------------------------------------------------------------------ */

export function BusinessProfileForm({ b }: { b: Business }) {
  const { t } = useI18n();
  const [state, action] = useActionState(saveBusinessProfile, undefined);
  const [desc, setDesc] = useState(b.description);
  const compute = useCallback(
    (fd: FormData) =>
      venueCompletion({
        name: String(fd.get("name") ?? ""),
        logo: String(fd.get("logo") ?? ""),
        location: cityOf(fd),
        address: String(fd.get("address") ?? ""),
        description: String(fd.get("description") ?? ""),
        category: String(fd.get("category") ?? ""),
        music_wanted: nonEmpty(fd, "music_wanted"),
        artist_types: nonEmpty(fd, "artist_types"),
        photos: photoLines(fd),
        phone: String(fd.get("phone") ?? ""),
        public_email: String(fd.get("public_email") ?? ""),
      }),
    [],
  );
  const { form, items, update } = useLiveCompletion(compute, venueCompletion(b));
  const labels = { ...t.pf.item, type: t.pf.venueType } as Record<string, string>;

  return (
    <form ref={form} action={action} onInput={update} onChange={update} className="space-y-5">
      <div className="sm:sticky sm:top-[4.5rem] sm:z-20">
        <CompletionMeter items={items} labels={labels} />
      </div>

      {/* 1–5: name, logo, location, description, type */}
      <Section title={t.pf.secVenue}>
        <ImageField id="pf-logo" name="logo" label={t.pf.logo} defaultValue={b.logo} hint={t.pf.logoHint} />
        <Field id="pf-name" label={t.pf.venueName} required>
          <input name="name" defaultValue={b.name} required minLength={2} maxLength={120} autoComplete="organization" className="input" />
        </Field>
        <ChoiceChips id="pf-type" name="category" label={t.pf.venueType} options={BUSINESS_CATEGORIES} defaultValue={b.category} required />
        <LocationFields id="pf-location" country={b.country} city={b.location} />
        <Field label={t.pf.address}>
          <input name="address" defaultValue={b.address ?? ""} autoComplete="street-address" className="input" placeholder={t.pf.addressPh} />
        </Field>
        <Field id="pf-description" label={t.pf.description} counter={t.pf.chars(desc.length, BIO_MAX)}>
          <textarea name="description" rows={5} maxLength={BIO_MAX} value={desc} onChange={(e) => setDesc(e.target.value)} className="input" placeholder={t.pf.descriptionPh} />
        </Field>
      </Section>

      {/* 6–8: genres, artist types, photos */}
      <Section title={t.pf.secWanted}>
        <div id="pf-genres" className="scroll-mt-28">
          <ChipGroup name="music_wanted" label={t.pf.genresPreferred} options={GENRES} defaultValue={b.music_wanted} />
        </div>
        <div id="pf-artistTypes" className="scroll-mt-28">
          <ChipGroup name="artist_types" label={t.pf.artistTypes} options={PERFORMER_TYPES} defaultValue={b.artist_types} tone="flame" />
        </div>
        <GalleryField id="pf-photos" name="photos" label={t.pf.venuePhotos} hint={t.pf.venuePhotosHint} defaultValue={b.photos} />
      </Section>

      {/* 9–10: contact, looking */}
      <Section title={t.pf.secContact}>
        <div id="pf-contact" className="scroll-mt-28">
          <p className="-mt-2 mb-4 text-sm text-muted">{t.pf.contactHintVenue}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.pf.email}>
              <input name="public_email" type="email" inputMode="email" autoComplete="email" defaultValue={b.public_email ?? ""} className="input" />
            </Field>
            <Field label={t.pf.phone}>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={b.phone ?? ""} className="input" placeholder="+357 …" />
            </Field>
          </div>
        </div>
        <YesNo name="looking" label={t.pf.looking} defaultValue={b.looking !== 0} yes={t.pf.lookingYes} no={t.pf.lookingNo} />
      </Section>

      <SaveBar state={state} items={items} />
    </form>
  );
}
