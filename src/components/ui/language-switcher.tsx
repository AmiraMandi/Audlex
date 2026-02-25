"use client";

import { useRef, useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { type Locale, localeNames, locales } from "@/lib/i18n/translations";
import { useLocale } from "@/hooks/use-locale";

export function LanguageSwitcher({
  onChange,
}: {
  onChange?: (locale: Locale) => void;
} = {}) {
  const { locale: current, setLocale: setCtxLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(locale: Locale) {
    setCtxLocale(locale);          // updates context + localStorage + dispatches event
    setOpen(false);
    onChange?.(locale);            // backward-compat callback
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg p-2 text-text-muted hover:text-text hover:bg-surface-tertiary transition"
        title="Cambiar idioma / Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{current}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-border bg-surface shadow-lg py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => select(locale)}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                current === locale
                  ? "bg-brand-500/10 text-brand-500 font-medium"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text"
              }`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
