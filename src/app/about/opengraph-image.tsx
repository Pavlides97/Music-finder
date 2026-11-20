import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "About SoundCY — live music in Cyprus deserves a better stage";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "About SoundCY",
    title: "Live music in Cyprus deserves a better stage.",
    subtitle: "Smart matching · What's on guide · Greek, English & Russian · Direct contact",
    chips: ["Artists", "Venues", "Hotels", "Weddings", "Festivals"],
  });
}
