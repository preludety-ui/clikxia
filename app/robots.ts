import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://clikxia.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",  // Ne pas crawler les endpoints API
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
