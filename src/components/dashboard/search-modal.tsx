"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Cpu, FileText } from "lucide-react";
import Link from "next/link";
import { globalSearch } from "@/app/actions";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ systems: { id: string; name: string; category: string }[]; documents: { id: string; title: string; type: string }[] }>({
    systems: [],
    documents: [],
  });
  const [searching, setSearching] = useState(false);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) =>
    td(locale, key, r);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults({ systems: [], documents: [] });
        return;
      }
      setSearching(true);
      try {
        const r = await globalSearch(q);
        setResults(r);
      } catch {
        setResults({ systems: [], documents: [] });
      } finally {
        setSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const hasResults = results.systems.length > 0 || results.documents.length > 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-sm text-text-muted hover:border-brand-200 transition w-48 lg:w-64"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left truncate">{i("search.placeholder")}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-surface-tertiary px-1.5 py-0.5 text-xs text-text-muted">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-surface-secondary border border-border shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={i("search.placeholder")}
                className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 hover:bg-surface-tertiary rounded">
                  <X className="h-4 w-4 text-text-muted" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {searching && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
                </div>
              )}

              {!searching && query.length >= 2 && !hasResults && (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  {i("search.noResults", { q: query })}
                </div>
              )}

              {!searching && results.systems.length > 0 && (
                <div className="px-2 py-2">
                  <p className="px-2 py-1 text-xs font-medium text-text-muted uppercase">
                    {i("search.systems")}
                  </p>
                  {results.systems.map((s) => (
                    <Link
                      key={s.id}
                      href={`/dashboard/inventario/${s.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-tertiary transition"
                    >
                      <Cpu className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{s.name}</p>
                        <p className="text-xs text-text-muted">{s.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!searching && results.documents.length > 0 && (
                <div className="px-2 py-2">
                  <p className="px-2 py-1 text-xs font-medium text-text-muted uppercase">
                    {i("search.documents")}
                  </p>
                  {results.documents.map((d) => (
                    <Link
                      key={d.id}
                      href="/dashboard/documentacion"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-tertiary transition"
                    >
                      <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{d.title}</p>
                        <p className="text-xs text-text-muted">{d.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!searching && query.length < 2 && (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  {i("search.placeholder")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
