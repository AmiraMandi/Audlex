"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

interface FooterProps {
  maxWidth?: string;
}

export function Footer({ maxWidth = "max-w-6xl" }: FooterProps) {
  const { locale } = useLocale();
  const [isDark, setIsDark] = useState(false);
  const i = (key: string) => tp(locale, key);

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
    <footer className="border-t border-border py-8">
      <div className={`mx-auto ${maxWidth} px-4 sm:px-6`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-auto">
              <Image
                src={isDark ? "/logo-white.svg" : "/logo.svg"}
                alt="Audlex Logo"
                width={133}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>
          <p className="text-sm text-text-muted text-center">
            © {new Date().getFullYear()} Audlex. {i("footer.disclaimer")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-text-muted">
            <Link href="/blog" className="hover:text-text transition">{i("footer.blog")}</Link>
            <Link href="/trust" className="hover:text-text transition">{i("footer.trustCenter")}</Link>
            <Link href="/sobre-nosotros" className="hover:text-text transition">{i("footer.aboutUs")}</Link>
            <Link href="/legal/privacidad" className="hover:text-text transition">{i("footer.privacy")}</Link>
            <Link href="/legal/terminos" className="hover:text-text transition">{i("footer.terms")}</Link>
            <Link href="/legal/cookies" className="hover:text-text transition">{i("footer.cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
