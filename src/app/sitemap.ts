import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://audlex.com";

/**
 * Generate sitemap.xml for SEO
 * Next.js will automatically serve this at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages (high priority)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/sobre-nosotros`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/trust`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Blog posts (dynamic content)
  const blogPosts: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog/que-es-eu-ai-act-guia-completa`,
      lastModified: new Date("2025-06-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/sistemas-ia-alto-riesgo-como-identificarlos`,
      lastModified: new Date("2025-06-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/multas-ai-act-como-evitarlas`,
      lastModified: new Date("2025-05-28"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Legal pages (low priority, static)
  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/legal/privacidad`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terminos`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...blogPosts, ...legalRoutes];
}
