import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.audlex.com";

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
      lastModified: new Date("2025-12-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/trust`,
      lastModified: new Date("2025-12-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/demo`,
      lastModified: new Date("2026-01-15"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  // Blog posts (generated from shared config)
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Legal pages (low priority, static)
  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/legal/privacidad`,
      lastModified: new Date("2025-10-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terminos`,
      lastModified: new Date("2025-10-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: new Date("2025-10-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...blogRoutes, ...legalRoutes];
}
