"use client";

import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Footer } from "@/components/marketing/footer";
import { PublicNav } from "@/components/marketing/public-nav";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

interface ArticleData {
  title: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  content: { type: "p" | "h2" | "h3" | "ul" | "callout"; text: string | string[] }[];
}

export function BlogArticleContent({ article }: { article: ArticleData }) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);
  const dateLocale = locale === "en" ? "en-GB" : "es-ES";

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="blog" />

      {/* Article */}
      <article className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${article.categoryColor}`}
            >
              <Tag className="h-3 w-3" />
              {article.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </div>
            <span className="text-xs text-text-muted">
              {new Date(article.date).toLocaleDateString(dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-text sm:text-4xl leading-tight mb-8">
            {article.title}
          </h1>

          {/* Content (kept in original language — SEO content) */}
          <div className="prose-custom space-y-6">
            {article.content.map((block, idx) => {
              switch (block.type) {
                case "p":
                  return (
                    <p key={idx} className="text-text-secondary leading-relaxed">
                      {block.text as string}
                    </p>
                  );
                case "h2":
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold text-text mt-10 mb-4"
                    >
                      {block.text as string}
                    </h2>
                  );
                case "h3":
                  return (
                    <h3
                      key={idx}
                      className="text-lg font-semibold text-text mt-6 mb-2"
                    >
                      {block.text as string}
                    </h3>
                  );
                case "ul":
                  return (
                    <ul key={idx} className="space-y-2 ml-1">
                      {(block.text as string[]).map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case "callout":
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-6"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-text leading-relaxed font-medium">
                          {block.text as string}
                        </p>
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/5 to-purple-500/5 p-8 text-center">
            <h3 className="text-xl font-bold text-text mb-2">
              {i("blog.article.cta.title")}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {i("blog.article.cta.subtitle")}
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition"
            >
              {i("public.startFree")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Back */}
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-500 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              {i("blog.backToList")}
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
