"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  FileCheck,
  Clock,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  Lock,
  Server,
  ShieldCheck,
  Eye,
  ChevronDown,
  Mail,
  Factory,
  Landmark,
  Heart,
  ShoppingCart,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PricingButton } from "@/components/marketing/pricing-button";
import { PricingToggle } from "@/components/marketing/pricing-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { t } from "@/lib/i18n/translations";
import { useLocale } from "@/hooks/use-locale";
import type { Locale } from "@/lib/i18n/translations";

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const { locale } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
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
            <a href="#funcionalidades" className="hover:text-brand-500 transition-colors">{i("nav.features")}</a>
            <a href="#precios" className="hover:text-brand-500 transition-colors">{i("nav.pricing")}</a>
            <a href="#faq" className="hover:text-brand-500 transition-colors">{i("nav.faq")}</a>
            <a href="#consultoras" className="hover:text-brand-500 transition-colors">{i("nav.consultoras")}</a>
            <Link href="/sobre-nosotros" className="hover:text-brand-500 transition-colors">{i("nav.about")}</Link>
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
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-secondary px-4 py-4 space-y-3">
            <a href="#funcionalidades" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.features")}</a>
            <a href="#precios" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.pricing")}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.faq")}</a>
            <a href="#consultoras" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.consultoras")}</a>
            <Link href="/sobre-nosotros" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.about")}</Link>
            <div className="pt-2 border-t border-border space-y-2">
              <Link href="/login" className="block text-sm text-text-secondary hover:text-text transition py-2">{i("nav.login")}</Link>
              <Link href="/registro" className="block w-full text-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition">{i("nav.cta")}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background with enhanced effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
        
        {/* Floating orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[128px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-32">
          <div className="flex justify-center mb-8">
            <div className="group inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:border-orange-500/50 transition-all">
              <Clock className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              <span dangerouslySetInnerHTML={{
                __html: i("hero.badge", { days }).replace(
                  String(days),
                  `<strong>${days}</strong>`
                ),
              }} />
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-center text-5xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl leading-[1.1]">
            {i("hero.title1")}
            <br />
            <span className="gradient-text inline-block mt-2">{i("hero.title2")}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xl text-text-secondary leading-relaxed">
            {i("hero.subtitle")}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="btn-premium group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white"
            >
              {i("hero.cta")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#funcionalidades"
              className="group flex items-center gap-2 rounded-xl border border-border/50 bg-surface/80 backdrop-blur-sm px-8 py-4 text-base font-medium text-text-secondary hover:text-text hover:border-brand-500/30 hover:bg-surface transition-all duration-300"
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

          <p className="mt-8 text-center text-sm text-text-muted">
            {i("hero.proof")}
          </p>
        </div>
      </section>

      {/* Problem statement */}
      <section className="border-y border-border bg-surface-secondary py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-modern group flex flex-col items-center text-center p-8 hover:scale-[1.02]">
              <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 p-4 mb-5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-bold text-text mb-2 text-lg">{i("problem.fines.title")}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{i("problem.fines.desc")}</p>
            </div>
            <div className="card-modern group flex flex-col items-center text-center p-8 hover:scale-[1.02]">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 p-4 mb-5 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="font-bold text-text mb-2 text-lg">{i("problem.deadline.title", { days })}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{i("problem.deadline.desc")}</p>
            </div>
            <div className="card-modern group flex flex-col items-center text-center p-8 hover:scale-[1.02]">
              <div className="rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20 p-4 mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7 text-brand-500" />
              </div>
              <h3 className="font-bold text-text mb-2 text-lg">{i("problem.affected.title")}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{i("problem.affected.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {i("features.badge")}
            </div>
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              {i("features.title")}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {i("features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: BarChart3, step: "01", titleKey: "features.step1.title", descKey: "features.step1.desc" },
              { icon: Shield, step: "02", titleKey: "features.step2.title", descKey: "features.step2.desc" },
              { icon: FileCheck, step: "03", titleKey: "features.step3.title", descKey: "features.step3.desc" },
              { icon: Zap, step: "04", titleKey: "features.step4.title", descKey: "features.step4.desc" },
            ].map((feature) => (
              <div
                key={feature.step}
                className="card-modern group relative p-8 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
                
                <div className="relative flex items-start gap-5">
                  <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 border border-brand-500/20 p-4 group-hover:scale-110 group-hover:border-brand-500/40 transition-all duration-300">
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

      {/* Security & Trust */}
      <section className="py-24 border-y border-border bg-surface-secondary relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px]" />
        </div>
        <div className="absolute inset-0 dot-pattern opacity-40" />
        
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 mb-6 shadow-lg shadow-green-500/10">
              <ShieldCheck className="h-4 w-4" />
              {i("security.badge")}
            </div>
            <h2 className="text-4xl font-bold text-text sm:text-5xl mb-4">
              {i("security.title")}
            </h2>
            <p className="mt-4 text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {i("security.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Lock, 
                titleKey: "security.encryption.title", 
                descKey: "security.encryption.desc",
                gradient: "from-green-500/10 via-green-500/5 to-transparent",
                iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
                iconColor: "text-green-500",
                borderColor: "border-green-500/20"
              },
              { 
                icon: Server, 
                titleKey: "security.servers.title", 
                descKey: "security.servers.desc",
                gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
                iconBg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-500",
                borderColor: "border-blue-500/20"
              },
              { 
                icon: ShieldCheck, 
                titleKey: "security.gdpr.title", 
                descKey: "security.gdpr.desc",
                gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
                iconBg: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-500",
                borderColor: "border-purple-500/20"
              },
              { 
                icon: Eye, 
                titleKey: "security.audit.title", 
                descKey: "security.audit.desc",
                gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
                iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
                iconColor: "text-amber-500",
                borderColor: "border-amber-500/20"
              },
            ].map((item) => (
              <div
                key={item.titleKey}
                className={`group relative p-8 rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.gradient} backdrop-blur-sm hover:scale-[1.02] transition-all duration-500 overflow-hidden`}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} blur-xl`} />
                </div>
                
                <div className="relative">
                  <div className={`inline-flex rounded-2xl ${item.iconBg} border ${item.borderColor} p-4 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-text text-lg mb-3 group-hover:text-brand-500 transition-colors">
                    {i(item.titleKey)}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {i(item.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 bg-surface-secondary">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              {i("pricing.title")}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {i("pricing.subtitle")}
            </p>
          </div>

          <PricingToggle isAnnual={isAnnual} onChange={setIsAnnual} locale={locale} />

          <div className="grid md:grid-cols-4 gap-6 pt-4">
            {[
              {
                name: i("pricing.free.name"),
                monthlyPrice: 0,
                annualPrice: 0,
                description: i("pricing.free.desc"),
                features: locale === "es"
                  ? ["1 sistema de IA", "Clasificación de riesgo", "Informe básico"]
                  : ["1 AI system", "Risk classification", "Basic report"],
                cta: i("nav.cta"),
                popular: false,
                planKey: null,
              },
              {
                name: i("pricing.starter.name"),
                monthlyPrice: 69,
                annualPrice: 660, // 69 * 12 * 0.8 = ahorro 20%
                description: i("pricing.starter.desc"),
                features: locale === "es"
                  ? ["5 sistemas de IA", "Documentación completa", "Checklist interactivo", "Exportación PDF", "2 usuarios"]
                  : ["5 AI systems", "Full documentation", "Interactive checklist", "PDF export", "2 users"],
                cta: locale === "es" ? "Empezar" : "Start",
                popular: false,
                planKey: "starter" as const,
              },
              {
                name: i("pricing.business.name"),
                monthlyPrice: 199,
                annualPrice: 1910, // 199 * 12 * 0.8 = ahorro 20%
                description: i("pricing.business.desc"),
                features: locale === "es"
                  ? ["25 sistemas de IA", "Todo de Starter", "5 usuarios", "Alertas y monitorización", "Dashboard completo", "Audit log", "Exportación DOCX"]
                  : ["25 AI systems", "Everything in Starter", "5 users", "Alerts & monitoring", "Full dashboard", "Audit log", "DOCX export"],
                cta: locale === "es" ? "Empezar" : "Start",
                popular: true,
                planKey: "business" as const,
              },
              {
                name: i("pricing.enterprise.name"),
                monthlyPrice: 499,
                annualPrice: 4790, // 499 * 12 * 0.8 = ahorro 20%
                description: i("pricing.enterprise.desc"),
                features: locale === "es"
                  ? ["Sistemas ilimitados", "Todo de Business", "Usuarios ilimitados", "API access", "Soporte prioritario", "SSO (próximamente)"]
                  : ["Unlimited systems", "Everything in Business", "Unlimited users", "API access", "Priority support", "SSO (coming soon)"],
                cta: locale === "es" ? "Empezar" : "Start",
                popular: false,
                planKey: "enterprise" as const,
              },
            ].map((plan) => {
              const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const pricePerMonth = isAnnual && plan.annualPrice > 0 ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
              const savings = isAnnual && plan.monthlyPrice > 0 ? plan.monthlyPrice * 12 - plan.annualPrice : 0;
              
              return (
              <div
                key={plan.name}
                className={`group relative rounded-2xl p-8 flex flex-col transition-all duration-500 overflow-visible ${
                  plan.popular
                    ? "border-brand-500/50 bg-gradient-to-br from-brand-500/5 via-surface to-surface shadow-xl shadow-brand-500/10 border border-border/50"
                    : "border border-border/50 bg-gradient-to-b from-surface to-surface-secondary/50 hover:border-brand-500/30 hover:scale-[1.02] hover:shadow-lg"
                }`}
                style={{
                  boxShadow: plan.popular 
                    ? '0 8px 40px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
                    : '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-xl shadow-brand-500/50 border border-brand-400/20">
                      <Sparkles className="h-3.5 w-3.5" />
                      {i("pricing.popular")}
                    </span>
                  </div>
                )}
                
                {/* Card header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text mb-1">{plan.name}</h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold text-text tracking-tight">€{pricePerMonth}</span>
                    <span className="text-lg text-text-muted font-medium">{locale === "es" ? "/mes" : "/mo"}</span>
                  </div>
                  {isAnnual && displayPrice > 0 && savings > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {locale === "es" ? `Ahorra €${savings} al año` : `Save €${savings} per year`}
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text-secondary group-hover:text-text transition-colors">
                      <div className="mt-0.5 rounded-full bg-green-500/10 p-0.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                {plan.planKey ? (
                  <PricingButton
                    plan={plan.planKey}
                    label={plan.cta}
                    variant={plan.popular ? "primary" : "secondary"}
                    isAnnual={isAnnual}
                  />
                ) : (
                  <Link
                    href="/registro"
                    className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-[1.02]"
                        : "border border-border/50 text-text-secondary hover:text-text hover:border-brand-500/40 hover:bg-brand-500/5"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consultoras */}
      <section id="consultoras" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-sm mb-6">
                  <Users className="h-4 w-4" />
                  {i("consultoras.badge")}
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {i("consultoras.title")}
                </h2>
                <p className="text-brand-100 leading-relaxed mb-6">
                  {i("consultoras.desc")}
                </p>
                <ul className="space-y-2 mb-8">
                  {(locale === "es"
                    ? [
                        "Panel multi-cliente",
                        "Informes con tu marca",
                        "Desde €349/mes + €25/cliente",
                        "Sin conocimiento técnico necesario",
                      ]
                    : [
                        "Multi-client dashboard",
                        "Reports with your brand",
                        "From €349/mo + €25/client",
                        "No technical knowledge required",
                      ]
                  ).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-brand-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registro?plan=consultora"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition shadow-lg"
                >
                  {i("consultoras.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 w-full max-w-sm">
                  <p className="text-brand-200 text-sm mb-4">
                    {locale === "es" ? "Panel de consultora" : "Consultant panel"}
                  </p>
                  <div className="space-y-3">
                    {["ACME Corp", "Panadería López", "Tech Solutions SL"].map(
                      (client, i) => (
                        <div
                          key={client}
                          className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"
                        >
                          <span className="text-sm">{client}</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              i === 0
                                ? "bg-green-400/20 text-green-300"
                                : i === 1
                                ? "bg-yellow-400/20 text-yellow-300"
                                : "bg-red-400/20 text-red-300"
                            }`}
                          >
                            {i === 0 ? "87%" : i === 1 ? "45%" : "12%"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Segmentation */}
      <section className="py-24 border-t border-border relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-purple-500/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mb-6 shadow-lg shadow-brand-500/10">
              <Building2 className="h-4 w-4" />
              {i("industry.badge")}
            </div>
            <h2 className="text-4xl font-bold text-text sm:text-5xl mb-4">
              {i("industry.title")}
            </h2>
            <p className="mt-4 text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {i("industry.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Landmark,
                name: locale === "es" ? "Banca y Finanzas" : "Banking & Finance",
                systems: locale === "es" ? "Scoring crediticio, detección de fraude, KYC automatizado" : "Credit scoring, fraud detection, automated KYC",
                risk: locale === "es" ? "Alto riesgo" : "High risk",
                riskLevel: "high"
              },
              {
                icon: Heart,
                name: locale === "es" ? "Salud" : "Healthcare",
                systems: locale === "es" ? "Diagnóstico asistido, triaje, análisis de imágenes" : "Assisted diagnosis, triage, image analysis",
                risk: locale === "es" ? "Alto riesgo" : "High risk",
                riskLevel: "high"
              },
              {
                icon: Briefcase,
                name: locale === "es" ? "RRHH y Empleo" : "HR & Employment",
                systems: locale === "es" ? "Filtrado de CVs, evaluación de candidatos, analítica de rendimiento" : "CV screening, candidate evaluation, performance analytics",
                risk: locale === "es" ? "Alto riesgo" : "High risk",
                riskLevel: "high"
              },
              {
                icon: ShoppingCart,
                name: locale === "es" ? "Retail y E-commerce" : "Retail & E-commerce",
                systems: locale === "es" ? "Recomendaciones, pricing dinámico, chatbots" : "Recommendations, dynamic pricing, chatbots",
                risk: locale === "es" ? "Riesgo limitado" : "Limited risk",
                riskLevel: "limited"
              },
              {
                icon: Factory,
                name: locale === "es" ? "Manufactura" : "Manufacturing",
                systems: locale === "es" ? "Control de calidad, mantenimiento predictivo, robots" : "Quality control, predictive maintenance, robots",
                risk: locale === "es" ? "Riesgo variable" : "Variable risk",
                riskLevel: "variable"
              },
              {
                icon: GraduationCap,
                name: locale === "es" ? "Educación" : "Education",
                systems: locale === "es" ? "Evaluación automatizada, detección de plagio, tutores IA" : "Automated assessment, plagiarism detection, AI tutors",
                risk: locale === "es" ? "Alto riesgo" : "High risk",
                riskLevel: "high"
              },
            ].map((industry) => {
              const styles = industry.riskLevel === "high" 
                ? {
                    gradient: "from-brand-500/15 via-brand-600/5 to-transparent",
                    iconBg: "from-brand-500 to-brand-700",
                    badgeBg: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                  }
                : industry.riskLevel === "limited"
                ? {
                    gradient: "from-brand-500/10 via-purple-500/5 to-transparent",
                    iconBg: "from-brand-400 to-purple-600",
                    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  }
                : {
                    gradient: "from-brand-500/12 via-purple-600/5 to-transparent",
                    iconBg: "from-brand-500 to-purple-700",
                    badgeBg: "bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400"
                  };
              
              return (
              <div
                key={industry.name}
                className={`group relative p-8 rounded-2xl border border-border/50 bg-gradient-to-br ${styles.gradient} backdrop-blur-sm hover:border-brand-500/30 hover:scale-[1.02] transition-all duration-500 overflow-hidden`}
              >
                {/* Animated gradient on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} blur-xl`} />
                </div>
                
                <div className="relative">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${styles.iconBg} p-4 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <industry.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-text text-xl mb-3 group-hover:text-brand-500 transition-colors">
                    {industry.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {industry.systems}
                  </p>
                  
                  {/* Risk badge */}
                  <div className="flex items-center justify-start">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${styles.badgeBg}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {industry.risk}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-border">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {i("faq.badge")}
            </div>
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              {i("faq.title")}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {i("faq.subtitle")}
            </p>
          </div>

          <FaqAccordion locale={locale} i={i} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-surface-secondary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-text sm:text-4xl">
            {i("cta.title1", { days })}
            <br />
            <span className="gradient-text">{i("cta.title2")}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            {i("cta.subtitle")}
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/40 transition-all duration-300"
          >
            {i("cta.button")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Newsletter */}
          <div className="mb-12 rounded-2xl border border-border bg-surface-secondary p-6 sm:p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-5 w-5 text-brand-500" />
                  <h3 className="text-lg font-bold text-text">{i("newsletter.title")}</h3>
                </div>
                <p className="text-sm text-text-secondary">{i("newsletter.subtitle")}</p>
              </div>
              <div>
                <form className="flex flex-col sm:flex-row gap-2" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get("email") as string;
                  if (!email) return;
                  try {
                    const res = await fetch("/api/newsletter", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    if (res.ok) {
                      (e.target as HTMLFormElement).reset();
                      alert(locale === "en" ? "Successfully subscribed!" : "¡Suscrito correctamente!");
                    } else {
                      alert(locale === "en" ? "Error subscribing" : "Error al suscribir");
                    }
                  } catch {
                    alert(locale === "en" ? "Error subscribing" : "Error al suscribir");
                  }
                }}>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={i("newsletter.placeholder")}
                    className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 whitespace-nowrap"
                  >
                    {i("newsletter.button")}
                  </button>
                </form>
                <p className="mt-2 text-xs text-text-muted">{i("newsletter.privacy")}</p>
              </div>
            </div>
          </div>

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
              <Link href="/trust" className="hover:text-text transition">Trust Center</Link>
              <Link href="/sobre-nosotros" className="hover:text-text transition">{i("nav.about")}</Link>
              <a href="/legal/privacidad" className="hover:text-text transition">{i("footer.privacy")}</a>
              <a href="/legal/terminos" className="hover:text-text transition">{i("footer.terms")}</a>
              <a href="/legal/cookies" className="hover:text-text transition">{i("footer.cookies")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// FAQ Accordion sub-component
function FaqAccordion({ locale, i }: { locale: Locale; i: (key: string) => string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: i("faq.q1"), a: i("faq.a1") },
    { q: i("faq.q2"), a: i("faq.a2") },
    { q: i("faq.q3"), a: i("faq.a3") },
    { q: i("faq.q4"), a: i("faq.a4") },
    { q: i("faq.q5"), a: i("faq.a5") },
    { q: i("faq.q6"), a: i("faq.a6") },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-surface-secondary overflow-hidden transition-all duration-300 hover:border-brand-500/20"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-medium text-text text-sm pr-4">{faq.q}</span>
            <ChevronDown
              className={`h-5 w-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}