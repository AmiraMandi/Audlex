"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Shield,
  AlertTriangle,
  Eye,
  Cpu,
  ChevronDown,
  ArrowRight,
  Scale,
  Clock,
  Filter,
} from "lucide-react";
import { PublicNav } from "@/components/marketing/public-nav";
import { Footer } from "@/components/marketing/footer";
import { useLocale } from "@/hooks/use-locale";
import { chapters, definitions, type RiskTag } from "@/lib/ai-act/ai-act-data";

const riskConfig: Record<RiskTag, { label: { es: string; en: string }; color: string; icon: typeof Shield }> = {
  prohibited: {
    label: { es: "Prohibido", en: "Prohibited" },
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: AlertTriangle,
  },
  high: {
    label: { es: "Alto riesgo", en: "High risk" },
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    icon: Shield,
  },
  limited: {
    label: { es: "Riesgo limitado", en: "Limited risk" },
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Eye,
  },
  minimal: {
    label: { es: "Riesgo mínimo", en: "Minimal risk" },
    color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    icon: BookOpen,
  },
  gpai: {
    label: { es: "GPAI", en: "GPAI" },
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    icon: Cpu,
  },
  general: {
    label: { es: "General", en: "General" },
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: BookOpen,
  },
};

export function AIActExplorerContent() {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RiskTag | "all">("all");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(chapters.map((c) => c.id)));
  const [showDefinitions, setShowDefinitions] = useState(false);

  const isEs = locale === "es";

  const filteredChapters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return chapters
      .map((chapter) => {
        const filteredArticles = chapter.articles.filter((article) => {
          const matchesFilter = activeFilter === "all" || article.riskTags.includes(activeFilter);
          if (!matchesFilter) return false;
          if (!q) return true;
          const searchFields = [
            article.number,
            article.title[locale],
            article.summary[locale],
          ].join(" ").toLowerCase();
          return searchFields.includes(q);
        });
        return { ...chapter, articles: filteredArticles };
      })
      .filter((chapter) => chapter.articles.length > 0);
  }, [searchQuery, activeFilter, locale]);

  const filteredDefinitions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return definitions;
    return definitions.filter((d) =>
      [d.term[locale], d.definition[locale], d.articleRef].join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery, locale]);

  const totalArticles = chapters.reduce((sum, c) => sum + c.articles.length, 0);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterButtons: { tag: RiskTag | "all"; label: { es: string; en: string } }[] = [
    { tag: "all", label: { es: "Todos", en: "All" } },
    { tag: "prohibited", label: { es: "Prohibido", en: "Prohibited" } },
    { tag: "high", label: { es: "Alto riesgo", en: "High risk" } },
    { tag: "limited", label: { es: "Limitado", en: "Limited" } },
    { tag: "gpai", label: { es: "GPAI", en: "GPAI" } },
    { tag: "general", label: { es: "General", en: "General" } },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="default" />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
              <Scale className="h-3.5 w-3.5" />
              {isEs ? "Reglamento (UE) 2024/1689" : "Regulation (EU) 2024/1689"}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl mb-4">
            EU AI Act Explorer
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-8">
            {isEs
              ? `Navega los ${totalArticles} artículos clave del Reglamento Europeo de Inteligencia Artificial. Busca por palabra clave, filtra por nivel de riesgo y consulta las ${definitions.length} definiciones fundamentales.`
              : `Browse the ${totalArticles} key articles of the European AI Regulation. Search by keyword, filter by risk level and consult the ${definitions.length} fundamental definitions.`}
          </p>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEs ? "Buscar artículos, definiciones, requisitos..." : "Search articles, definitions, requirements..."}
              className="w-full rounded-xl border border-border bg-surface pl-12 pr-4 py-3.5 text-text placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>
        </div>
      </section>

      {/* Filters + Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter className="h-4 w-4 text-text-muted mr-1" />
          {filterButtons.map((f) => (
            <button
              key={f.tag}
              onClick={() => setActiveFilter(f.tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                activeFilter === f.tag
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-border text-text-secondary hover:border-brand-500/30 hover:text-text"
              }`}
            >
              {f.label[locale]}
            </button>
          ))}
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className={`ml-auto rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
              showDefinitions
                ? "bg-brand-500 text-white border-brand-500"
                : "border-border text-text-secondary hover:border-brand-500/30"
            }`}
          >
            {isEs ? `📖 Definiciones (${definitions.length})` : `📖 Definitions (${definitions.length})`}
          </button>
        </div>

        {/* Definitions panel */}
        {showDefinitions && (
          <div className="mb-8 rounded-2xl border border-border bg-surface-secondary p-6">
            <h2 className="text-lg font-bold text-text mb-4">
              {isEs ? "Definiciones clave (Art. 3)" : "Key definitions (Art. 3)"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDefinitions.map((d) => (
                <div key={d.articleRef} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text text-sm">{d.term[locale]}</h3>
                    <span className="text-xs text-text-muted">{d.articleRef}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{d.definition[locale]}</p>
                </div>
              ))}
            </div>
            {filteredDefinitions.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">
                {isEs ? "No se encontraron definiciones." : "No definitions found."}
              </p>
            )}
          </div>
        )}

        {/* Chapters */}
        <div className="space-y-4">
          {filteredChapters.map((chapter) => (
            <div key={chapter.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-secondary transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider min-w-[60px]">
                    {chapter.id.startsWith("annex") ? chapter.number : `${isEs ? "Cap." : "Ch."} ${chapter.number}`}
                  </span>
                  <h2 className="font-semibold text-text">{chapter.title[locale]}</h2>
                  <span className="text-xs text-text-muted">({chapter.articles.length})</span>
                </div>
                <ChevronDown className={`h-5 w-5 text-text-muted transition-transform ${expandedChapters.has(chapter.id) ? "rotate-180" : ""}`} />
              </button>

              {expandedChapters.has(chapter.id) && (
                <div className="border-t border-border divide-y divide-border/50">
                  {chapter.articles.map((article) => (
                    <div key={article.number} className="px-6 py-4 hover:bg-surface-secondary/50 transition-colors">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                          {article.number}
                        </span>
                        <span className="text-sm font-semibold text-text">
                          {article.title[locale]}
                        </span>
                        <div className="flex gap-1.5 ml-auto">
                          {article.riskTags.map((tag) => {
                            const config = riskConfig[tag];
                            return (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${config.color}`}
                              >
                                {config.label[locale]}
                              </span>
                            );
                          })}
                          {article.deadline && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border border-border text-text-muted">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(article.deadline).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {article.summary[locale]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">
              {isEs
                ? "No se encontraron artículos con esos criterios."
                : "No articles found matching your criteria."}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-500/5 via-surface to-surface border border-brand-500/20 p-8 text-center">
          <h2 className="text-2xl font-bold text-text mb-2">
            {isEs
              ? "¿Quieres pasar de la lectura a la acción?"
              : "Ready to go from reading to action?"}
          </h2>
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            {isEs
              ? "Audlex clasifica tus sistemas de IA, genera toda la documentación obligatoria y monitoriza tu compliance automáticamente."
              : "Audlex classifies your AI systems, generates all mandatory documentation and monitors your compliance automatically."}
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-500/30 transition-all"
          >
            {isEs ? "Clasifica tu primer sistema gratis" : "Classify your first system free"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
