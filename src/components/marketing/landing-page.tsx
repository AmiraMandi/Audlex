"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  FileCheck,
  Clock,
  Building2,
  ArrowRight,
  AlertTriangle,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { t } from "@/lib/i18n/translations";
import { useLocale } from "@/hooks/use-locale";
import { useScrollReveal, revealClass } from "@/hooks/use-scroll-reveal";
import type { Locale } from "@/lib/i18n/translations";

// Lazy-load below-fold sections — they download AFTER the hero paints
const BelowFoldSections = lazy(() =>
  Promise.all([
    import("@/components/marketing/sections/below-fold-sections"),
    import("@/components/marketing/sections/pricing-section"),
  ]).then(([m, p]) => ({
    default: ({
      locale,
      i,
      isDark,
      days,
    }: {
      locale: Locale;
      i: (key: string, replacements?: Record<string, string | number>) => string;
      isDark: boolean;
      days: number;
    }) => (
      <>
        <m.SecuritySection locale={locale} i={i} />
        <p.default locale={locale} i={i} />
        <m.ConsultorasSection locale={locale} i={i} />
        <m.IndustrySection locale={locale} i={i} />
        <m.FaqSection locale={locale} i={i} />
        <m.CtaSection locale={locale} i={i} days={days} />
        <m.FooterSection locale={locale} i={i} isDark={isDark} />
      </>
    ),
  }))
);

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// Lightweight skeleton for lazy sections
function SectionSkeleton() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

function ProblemSection({ i, days }: { i: (key: string, r?: Record<string, string | number>) => string; days: number }) {
  const [ref, visible] = useScrollReveal();
  return (
    <section ref={ref} className="border-b border-border bg-surface-secondary py-16 relative overflow-hidden">
      <div className={`mx-auto max-w-6xl px-6 ${revealClass(visible, "up")}`}>
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          <div className="card-modern group flex flex-col items-center text-center p-8">
            <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 p-4 mb-5">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="font-bold text-text mb-2 text-lg">
              {i("problem.fines.title")}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {i("problem.fines.desc")}
            </p>
          </div>
          <div className="card-modern group flex flex-col items-center text-center p-8">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 p-4 mb-5">
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="font-bold text-text mb-2 text-lg">
              {i("problem.deadline.title", { days })}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {i("problem.deadline.desc")}
            </p>
          </div>
          <div className="card-modern group flex flex-col items-center text-center p-8">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20 p-4 mb-5">
              <Building2 className="h-7 w-7 text-brand-500" />
            </div>
            <h3 className="font-bold text-text mb-2 text-lg">
              {i("problem.affected.title")}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {i("problem.affected.desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ locale, i }: { locale: Locale; i: (key: string) => string }) {
  const [ref, visible] = useScrollReveal();
  const features = [
    { icon: BarChart3, step: "01", titleKey: "features.step1.title", descKey: "features.step1.desc" },
    { icon: Shield, step: "02", titleKey: "features.step2.title", descKey: "features.step2.desc" },
    { icon: FileCheck, step: "03", titleKey: "features.step3.title", descKey: "features.step3.desc" },
    { icon: Zap, step: "04", titleKey: "features.step4.title", descKey: "features.step4.desc" },
  ];

  return (
    <section id="funcionalidades" className="py-24 relative overflow-hidden">
      {/* Subtle decorative orb */}
      <div className="glow-orb absolute top-0 right-0 w-96 h-96 bg-purple-500/5 animate-float-slow" />
      <div ref={ref} className="mx-auto max-w-6xl px-6 relative">
        <div className={`text-center mb-16 ${revealClass(visible, "up")}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {i("features.badge")}
          </div>
          <h2 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
            {i("features.title")}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            {i("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div
              key={feature.step}
              className={`card-modern group relative p-8 overflow-hidden transition-all duration-700 ease-out ${
                visible 
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 150 + 200}ms` }}
            >
              <div className="relative flex items-start gap-5">
                <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20 p-4 group-hover:from-brand-500/20 group-hover:to-brand-600/20 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-brand-500" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      {locale === "es" ? "Paso" : "Step"} {feature.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">
                    {i(feature.titleKey)}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {i(feature.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { locale } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const days = daysUntil();

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

  const i = (key: string, replacements?: Record<string, string | number>) =>
    t(locale, key, replacements);

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="glass-premium border-b border-border/50 sticky top-0 z-50 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-auto group-hover:scale-105 transition-transform">
              <Image
                src={isDark ? "/logo-white.svg" : "/logo.svg"}
                alt="Audlex Logo"
                width={166}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <a
              href="#funcionalidades"
              className="hover:text-brand-500 transition-colors"
            >
              {i("nav.features")}
            </a>
            <a
              href="#precios"
              className="hover:text-brand-500 transition-colors"
            >
              {i("nav.pricing")}
            </a>
            <a href="#faq" className="hover:text-brand-500 transition-colors">
              {i("nav.faq")}
            </a>
            <a
              href="#consultoras"
              className="hover:text-brand-500 transition-colors"
            >
              {i("nav.consultoras")}
            </a>
            <Link
              href="/sobre-nosotros"
              className="hover:text-brand-500 transition-colors"
            >
              {i("nav.about")}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              {i("nav.login")}
            </Link>
            <Link
              href="/registro"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-500/30 transition-all hover:scale-105"
            >
              {i("nav.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-secondary px-4 py-4 space-y-3">
            <a
              href="#funcionalidades"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text transition py-2"
            >
              {i("nav.features")}
            </a>
            <a
              href="#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text transition py-2"
            >
              {i("nav.pricing")}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text transition py-2"
            >
              {i("nav.faq")}
            </a>
            <a
              href="#consultoras"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text transition py-2"
            >
              {i("nav.consultoras")}
            </a>
            <Link
              href="/sobre-nosotros"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-text-secondary hover:text-text transition py-2"
            >
              {i("nav.about")}
            </Link>
            <div className="pt-2 border-t border-border space-y-2">
              <Link
                href="/login"
                className="block text-sm text-text-secondary hover:text-text transition py-2"
              >
                {i("nav.login")}
              </Link>
              <Link
                href="/registro"
                className="block w-full text-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
              >
                {i("nav.cta")}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero — renders immediately */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Decorative floating orbs */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 hero-mesh" />
        <div className="glow-orb absolute -top-32 -left-32 w-96 h-96 bg-brand-500/20 animate-pulse-glow" />
        <div className="glow-orb absolute top-1/4 -right-24 w-72 h-72 bg-purple-500/15 animate-float-slow" />
        <div className="glow-orb absolute -bottom-20 left-1/3 w-80 h-80 bg-brand-400/10 animate-float-reverse" />

        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-32 w-full">
          <div className="flex justify-center mb-8 animate-[fade-in_0.6s_ease-out_0.2s_both]">
            <div className="group inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 transition-all hover:bg-orange-500/20 hover:scale-105">
              <Clock className="h-4 w-4" />
              <span
                dangerouslySetInnerHTML={{
                  __html: i("hero.badge", { days }).replace(
                    String(days),
                    `<strong>${days}</strong>`
                  ),
                }}
              />
            </div>
          </div>

          <h1 className="mx-auto max-w-5xl text-center text-5xl font-extrabold tracking-tight text-text sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] animate-[fade-in_0.8s_ease-out_0.3s_both]">
            {i("hero.title1")}
            <br />
            <span className="text-shimmer inline-block mt-2">
              {i("hero.title2")}
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xl text-text-secondary leading-relaxed animate-[fade-in_0.8s_ease-out_0.5s_both]">
            {i("hero.subtitle")}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fade-in_0.8s_ease-out_0.7s_both]">
            <Link
              href="/registro"
              className="btn-premium group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white"
            >
              {i("hero.cta")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#funcionalidades"
              className="group flex items-center gap-2 rounded-xl border border-border/50 bg-surface/80 px-8 py-4 text-base font-medium text-text-secondary hover:text-text hover:border-brand-500/30 hover:bg-surface transition-all duration-300"
            >
              {i("hero.secondary")}
            </a>
            <Link
              href="/demo"
              className="flex items-center gap-2 text-base font-medium text-brand-500 hover:text-brand-600 transition"
            >
              {locale === "es" ? "Probar demo" : "Try demo"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-text-muted animate-[fade-in_0.8s_ease-out_0.9s_both]">
            {i("hero.proof")}
          </p>
        </div>
      </section>

      {/* Gradient separator */}
      <div className="gradient-separator" />

      {/* Problem statement */}
      <ProblemSection i={i} days={days} />

      {/* Gradient separator */}
      <div className="gradient-separator" />

      {/* Features */}
      <FeaturesSection locale={locale} i={i} />

      {/* Gradient separator */}
      <div className="gradient-separator" />

      {/* Below-fold sections — lazy loaded in correct order */}
      <Suspense fallback={<SectionSkeleton />}>
        <BelowFoldSections
          locale={locale}
          i={i}
          isDark={isDark}
          days={days}
        />
      </Suspense>
    </div>
  );
}
