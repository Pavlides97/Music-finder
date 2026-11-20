import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listBusinesses, searchGigs, searchMusicians } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" = "weekly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/musicians", 0.9, "daily"),
    page("/match", 0.8),
    page("/gigs", 0.9, "daily"),
    page("/venues", 0.7),
    ...searchMusicians({}, 1000).map((m) => page(`/musicians/${m.slug}`, 0.8)),
    ...listBusinesses().map((b) => page(`/venues/${b.slug}`, 0.6)),
    ...searchGigs({}, 1000).map((g) => page(`/gigs/${g.id}`, 0.6, "daily")),
  ];
}
