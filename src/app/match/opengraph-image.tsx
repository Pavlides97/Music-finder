import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Find my musician — SoundCY smart matching";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Smart matching",
    title: "Describe your event. Meet your musician.",
    subtitle: "Write one sentence in Greek, English or Russian and get ranked matches with clear reasons.",
    chips: ["Weddings", "Restaurants", "Hotels", "Corporate", "Parties"],
  });
}
