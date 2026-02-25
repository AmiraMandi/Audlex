"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

/**
 * Shared nav bar for all public (non-dashboard) pages.
 *
 * Variants:
 *  - "default": Home link + "Start free" CTA       (blog, trust)
 *  - "back":    Back arrow + "Back" to homepage     (about, legal, demo)
 *  - "blog":    "← Blog" link + "Start free" CTA   (blog article)
 */
export function PublicNav({
  variant = "default",
  maxWidth = "max-w-6xl",
}: {
  variant?: "default" | "back" | "blog";
  maxWidth?: string;
}) {
  const { locale } = useLocale();
  const [isDark, setIsDark] = useState(false);
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="border-b border-border glass sticky top-0 z-50">
      <div className={`mx-auto ${maxWidth} flex items-center justify-between px-4 sm:px-6 py-4`}>
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-auto">
            <Image
              src={isDark ? "/logo-white.svg" : "/logo.svg"}
              alt="Audlex Logo"
              width={166}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {variant === "default" && (
            <>
              <Link
                href="/"
                className="hidden sm:inline text-sm text-text-secondary hover:text-text transition"
              >
                {i("public.home")}
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
              >
                {i("public.startFree")}
              </Link>
            </>
          )}

          {variant === "back" && (
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text transition"
            >
              <ArrowLeft className="h-4 w-4" />
              {i("public.back")}
            </Link>
          )}

          {variant === "blog" && (
            <>
              <Link
                href="/blog"
                className="text-sm text-text-secondary hover:text-text transition"
              >
                {i("blog.backToBlog")}
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
              >
                {i("public.startFree")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
