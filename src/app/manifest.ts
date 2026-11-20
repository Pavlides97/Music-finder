import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SoundCY — Live music in Cyprus",
    short_name: "SoundCY",
    description: "Discover musicians. Find gigs. Create unforgettable experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d15",
    theme_color: "#0b0d15",
    lang: "el",
    categories: ["music", "entertainment", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find musicians", url: "/musicians" },
      { name: "Match me", url: "/match" },
      { name: "Find gigs", url: "/gigs" },
    ],
  };
}
