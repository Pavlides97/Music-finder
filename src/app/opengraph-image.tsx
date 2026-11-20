import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "SoundCY — Where Cyprus finds its sound";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Live music in Cyprus",
    title: "Where Cyprus finds its sound.",
    subtitle: "Discover musicians. Find gigs. Create unforgettable experiences.",
    chips: ["Laiko", "Entexno", "Pop", "Retro", "Rock"],
  });
}
