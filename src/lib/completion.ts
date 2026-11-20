/**
 * Profile completeness — shared by the live form indicator (client) and the dashboard (server).
 * Each item maps to one field of the simplified artist / venue profile.
 */

export type ArtistDraft = {
  name?: string;
  avatar?: string | null;
  location?: string;
  bio?: string;
  performer_type?: string;
  genres?: string[];
  videos?: string[];
  photos?: string[];
  phone?: string | null;
  public_email?: string | null;
};

export type VenueDraft = {
  name?: string;
  logo?: string | null;
  location?: string;
  address?: string | null;
  description?: string;
  category?: string;
  music_wanted?: string[];
  artist_types?: string[];
  photos?: string[];
  phone?: string | null;
  public_email?: string | null;
};

export type CompletionItem = { key: string; done: boolean };

const has = (s?: string | null, min = 1) => !!s && s.trim().length >= min;

export function artistCompletion(a: ArtistDraft): CompletionItem[] {
  return [
    { key: "name", done: has(a.name, 2) },
    { key: "photo", done: has(a.avatar) },
    { key: "location", done: has(a.location) },
    { key: "bio", done: has(a.bio, 40) },
    { key: "type", done: has(a.performer_type) },
    { key: "genres", done: (a.genres?.length ?? 0) > 0 },
    { key: "links", done: (a.videos?.length ?? 0) > 0 },
    { key: "photos", done: (a.photos?.length ?? 0) > 0 },
    { key: "contact", done: has(a.phone, 6) || has(a.public_email, 5) },
  ];
}

export function venueCompletion(v: VenueDraft): CompletionItem[] {
  return [
    { key: "name", done: has(v.name, 2) },
    { key: "logo", done: has(v.logo) },
    { key: "location", done: has(v.location) && has(v.address, 3) },
    { key: "description", done: has(v.description, 40) },
    { key: "type", done: has(v.category) },
    { key: "genres", done: (v.music_wanted?.length ?? 0) > 0 },
    { key: "artistTypes", done: (v.artist_types?.length ?? 0) > 0 },
    { key: "photos", done: (v.photos?.length ?? 0) > 0 },
    { key: "contact", done: has(v.phone, 6) || has(v.public_email, 5) },
  ];
}

export const percent = (items: CompletionItem[]) => Math.round((items.filter((i) => i.done).length / items.length) * 100);
