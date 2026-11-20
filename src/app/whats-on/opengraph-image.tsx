import { ogCard, OG_SIZE } from "@/lib/og";
import { whatsOn } from "@/lib/data";

export const alt = "What's on — live music in Cyprus | SoundCY";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function Image() {
  const tonight = whatsOn({ days: 0 }).length;
  const week = whatsOn({ days: 7 }).length;
  return ogCard({
    eyebrow: "What's on",
    title: "Live music in Cyprus tonight.",
    subtitle: tonight
      ? `${tonight} confirmed live show${tonight === 1 ? "" : "s"} tonight · ${week} this week`
      : "Confirmed live shows from venues across Cyprus — tonight, tomorrow and this weekend.",
    chips: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Ayia Napa"],
  });
}
