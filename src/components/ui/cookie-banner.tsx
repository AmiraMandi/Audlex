"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { locale } = useLocale();
  const i = (key: string) => td(locale, key);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept(level: "all" | "essential") {
    localStorage.setItem("cookie-consent", level);
    document.cookie = `cookie-consent=${level};path=/;max-age=31536000;SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface shadow-2xl shadow-black/10 dark:shadow-black/40 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 items-center justify-center">
            <Cookie className="h-5 w-5 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text mb-1">{i("cookie.title")}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {i("cookie.desc")}{" "}
              <Link href="/legal/cookies" className="text-brand-500 hover:underline">
                {i("cookie.policyLink")}
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
              <button
                onClick={() => accept("all")}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition shadow-sm"
              >
                {i("cookie.acceptAll")}
              </button>
              <button
                onClick={() => accept("essential")}
                className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:border-brand-500/30 transition"
              >
                {i("cookie.essentialOnly")}
              </button>
            </div>
          </div>
          <button
            onClick={() => accept("essential")}
            className="flex-shrink-0 text-text-muted hover:text-text transition p-1"
            aria-label={i("cookie.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
