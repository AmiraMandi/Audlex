import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://audlex.com";

/**
 * Generate robots.txt for crawler control
 * Next.js will automatically serve this at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/blog/*",
          "/sobre-nosotros",
          "/trust",
          "/legal/*",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api",
          "/api/*",
          "/auth/*",
          "/login",
          "/registro",
          "/_next",
          "/admin",
        ],
      },
      // Allow specific bots with higher crawl rate
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        crawlDelay: 0,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
