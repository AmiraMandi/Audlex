"use client";

import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { Footer } from "@/components/marketing/footer";
import { PublicNav } from "@/components/marketing/public-nav";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

interface BlogPost {
  slug: string;
  titleKey: string;
  excerptKey: string;
  date: string;
  readTime: string;
  categoryKey: string;
  categoryColor: string;
}

const posts: BlogPost[] = [
  {
    slug: "que-es-eu-ai-act-guia-completa",
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    date: "2025-06-15",
    readTime: "12 min",
    categoryKey: "blog.post1.category",
    categoryColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    slug: "sistemas-ia-alto-riesgo-como-identificarlos",
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    date: "2025-06-08",
    readTime: "8 min",
    categoryKey: "blog.post2.category",
    categoryColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  {
    slug: "multas-ai-act-como-evitarlas",
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    date: "2025-05-28",
    readTime: "10 min",
    categoryKey: "blog.post3.category",
    categoryColor: "bg-red-500/10 text-red-600 border-red-500/20",
  },
];

export function BlogPageContent() {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);

  const dateLocale = locale === "en" ? "en-GB" : "es-ES";

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="default" />

      {/* Hero */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold text-text sm:text-5xl">
            {i("blog.hero.title", { brand: "" })}
            <span className="text-brand-500">Audlex</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            {i("blog.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-border bg-surface-secondary p-8 hover:border-brand-500/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${post.categoryColor}`}
                  >
                    <Tag className="h-3 w-3" />
                    {i(post.categoryKey)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(post.date).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-text group-hover:text-brand-500 transition mb-3">
                  {i(post.titleKey)}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {i(post.excerptKey)}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 group-hover:gap-2 transition-all">
                  {i("blog.readArticle")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border bg-surface-secondary">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-text">{i("blog.cta.title")}</h2>
          <p className="mt-2 text-text-secondary">{i("blog.cta.subtitle")}</p>
          <Link
            href="/registro"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition"
          >
            {i("public.startFree")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
