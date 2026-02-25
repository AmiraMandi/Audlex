"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Locale, defaultLocale, locales } from "@/lib/i18n/translations";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  // Listen for changes from other tabs + same-tab custom event
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "locale" && e.newValue && locales.includes(e.newValue as Locale)) {
        setLocaleState(e.newValue as Locale);
      }
    }
    function onLocaleChange(e: Event) {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail && locales.includes(detail)) {
        setLocaleState(detail);
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("locale-change", onLocaleChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("locale-change", onLocaleChange);
    };
  }, []);

  // Sync <html lang> attribute
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: l }));
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
