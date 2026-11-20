import { ogCard, OG_SIZE } from "@/lib/og";
import { getMusicianBySlug } from "@/lib/data";

export const alt = "Musician on SoundCY";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const m = getMusicianBySlug((await params).slug);
  if (!m) return ogCard({ eyebrow: "SoundCY", title: "Musician not found", subtitle: "" });
  const price = m.price_from ? (m.price_to && m.price_to > m.price_from ? `€${m.price_from}–€${m.price_to}` : `from €${m.price_from}`) : "Price on request";
  return ogCard({
    eyebrow: `${m.tagline || m.performer_type} · ${m.location}`,
    title: m.name,
    subtitle: `Book for weddings, restaurants & events · ${price}`,
    chips: m.genres,
  });
}
