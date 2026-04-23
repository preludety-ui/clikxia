import type { MetadataRoute } from "next";
import { getTop5 } from "@/lib/api";

export const revalidate = 3600; // Regenere toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://clikxia.com";
  const now = new Date();

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Pages dashboard (necessite cookie mais on peut les lister pour le crawl)
  const top5Data = await getTop5().catch(() => null);
  const stockPages: MetadataRoute.Sitemap = [];

  if (top5Data?.top5) {
    // Page dashboard principale
    stockPages.push({
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });

    // Pages de chaque stock du top 5
    for (const stock of top5Data.top5) {
      stockPages.push({
        url: `${baseUrl}/dashboard/${stock.symbol}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
      stockPages.push({
        url: `${baseUrl}/dashboard/${stock.symbol}/technical`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...stockPages];
}
