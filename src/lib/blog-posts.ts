/**
 * Shared blog post metadata — used by sitemap.ts, blog-content.tsx, and blog [slug] page.
 * Add new posts here and they will automatically appear in the sitemap.
 */
export interface BlogPostMeta {
  slug: string;
  titleKey: string;
  excerptKey: string;
  categoryKey: string;
  readTime: string;
  lastModified: string; // ISO date
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "que-es-eu-ai-act-guia-completa",
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    categoryKey: "blog.post1.category",
    readTime: "12 min",
    lastModified: "2025-06-15",
  },
  {
    slug: "sistemas-ia-alto-riesgo-como-identificarlos",
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    categoryKey: "blog.post2.category",
    readTime: "8 min",
    lastModified: "2025-06-08",
  },
  {
    slug: "multas-ai-act-como-evitarlas",
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    categoryKey: "blog.post3.category",
    readTime: "10 min",
    lastModified: "2025-05-28",
  },
];
