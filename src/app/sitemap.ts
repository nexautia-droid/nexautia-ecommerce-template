import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["es", "ca"].map((lang) => ({
    url: `${publicSiteUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: lang === "es" ? 1 : 0.9,
    alternates: { languages: { es: `${publicSiteUrl}/es`, ca: `${publicSiteUrl}/ca` } },
  }));
}

