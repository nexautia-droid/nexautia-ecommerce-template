import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["es", "ca"].map((lang) => ({
    url: `https://tienda.nexautia.com/${lang}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: lang === "es" ? 1 : 0.9,
    alternates: { languages: { es: "https://tienda.nexautia.com/es", ca: "https://tienda.nexautia.com/ca" } },
  }));
}
