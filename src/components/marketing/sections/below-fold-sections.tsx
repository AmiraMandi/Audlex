"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
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
import { useScrollReveal, revealClass } from "@/hooks/use-scroll-reveal";
import type { Locale } from "@/lib/i18n/translations";

export function SecuritySection({
  locale,
  i,
}: {
  locale: Locale;
  i: (key: string) => string;
}) {
  const [ref, visible] = useScrollReveal();
  return (
    <section ref={ref} className="py-24 border-y border-border bg-surface-secondary relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className={`text-center mb-16 ${revealClass(visible, "up")}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 mb-6">
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
              iconColor: "text-green-500",
              borderColor: "border-green-500/20",
            },
            {
              icon: Server,
              titleKey: "security.servers.title",
              descKey: "security.servers.desc",
              iconColor: "text-blue-500",
              borderColor: "border-blue-500/20",
            },
            {
              icon: ShieldCheck,
              titleKey: "security.gdpr.title",
              descKey: "security.gdpr.desc",
              iconColor: "text-purple-500",
              borderColor: "border-purple-500/20",
            },
            {
              icon: Eye,
              titleKey: "security.audit.title",
              descKey: "security.audit.desc",
              iconColor: "text-amber-500",
              borderColor: "border-amber-500/20",
            },
          ].map((item, idx) => (
            <div
              key={item.titleKey}
              className={`group relative p-8 rounded-2xl border ${item.borderColor} bg-surface transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-lg ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 120 + 300}ms` }}
            >
              <div
                className={`inline-flex rounded-2xl border ${item.borderColor} p-4 mb-6`}
              >
                <item.icon className={`h-8 w-8 ${item.iconColor}`} />
              </div>
              <h3 className="font-bold text-text text-lg mb-3">
                {i(item.titleKey)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {i(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConsultorasSection({
  locale,
  i,
}: {
  locale: Locale;
  i: (key: string) => string;
}) {
  const [ref, visible] = useScrollReveal();
  return (
    <section id="consultoras" className="py-24" ref={ref}>
      <div className={`mx-auto max-w-6xl px-6 ${revealClass(visible, "up")}`}>
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white relative overflow-hidden">
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
              <div className="rounded-xl bg-white/10 border border-white/20 p-8 w-full max-w-sm">
                <p className="text-brand-200 text-sm mb-4">
                  {locale === "es" ? "Panel de consultora" : "Consultant panel"}
                </p>
                <div className="space-y-3">
                  {["ACME Corp", "Panadería López", "Tech Solutions SL"].map(
                    (client, idx) => (
                      <div
                        key={client}
                        className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"
                      >
                        <span className="text-sm">{client}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            idx === 0
                              ? "bg-green-400/20 text-green-300"
                              : idx === 1
                              ? "bg-yellow-400/20 text-yellow-300"
                              : "bg-red-400/20 text-red-300"
                          }`}
                        >
                          {idx === 0 ? "87%" : idx === 1 ? "45%" : "12%"}
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
  );
}

export function IndustrySection({
  locale,
  i,
}: {
  locale: Locale;
  i: (key: string) => string;
}) {
  const [ref, visible] = useScrollReveal();
  const industries = [
    {
      icon: Landmark,
      name: locale === "es" ? "Banca y Finanzas" : "Banking & Finance",
      systems:
        locale === "es"
          ? "Scoring crediticio, detección de fraude, KYC automatizado"
          : "Credit scoring, fraud detection, automated KYC",
      risk: locale === "es" ? "Alto riesgo" : "High risk",
      riskLevel: "high",
    },
    {
      icon: Heart,
      name: locale === "es" ? "Salud" : "Healthcare",
      systems:
        locale === "es"
          ? "Diagnóstico asistido, triaje, análisis de imágenes"
          : "Assisted diagnosis, triage, image analysis",
      risk: locale === "es" ? "Alto riesgo" : "High risk",
      riskLevel: "high",
    },
    {
      icon: Briefcase,
      name: locale === "es" ? "RRHH y Empleo" : "HR & Employment",
      systems:
        locale === "es"
          ? "Filtrado de CVs, evaluación de candidatos, analítica de rendimiento"
          : "CV screening, candidate evaluation, performance analytics",
      risk: locale === "es" ? "Alto riesgo" : "High risk",
      riskLevel: "high",
    },
    {
      icon: ShoppingCart,
      name: locale === "es" ? "Retail y E-commerce" : "Retail & E-commerce",
      systems:
        locale === "es"
          ? "Recomendaciones, pricing dinámico, chatbots"
          : "Recommendations, dynamic pricing, chatbots",
      risk: locale === "es" ? "Riesgo limitado" : "Limited risk",
      riskLevel: "limited",
    },
    {
      icon: Factory,
      name: locale === "es" ? "Manufactura" : "Manufacturing",
      systems:
        locale === "es"
          ? "Control de calidad, mantenimiento predictivo, robots"
          : "Quality control, predictive maintenance, robots",
      risk: locale === "es" ? "Riesgo variable" : "Variable risk",
      riskLevel: "variable",
    },
    {
      icon: GraduationCap,
      name: locale === "es" ? "Educación" : "Education",
      systems:
        locale === "es"
          ? "Evaluación automatizada, detección de plagio, tutores IA"
          : "Automated assessment, plagiarism detection, AI tutors",
      risk: locale === "es" ? "Alto riesgo" : "High risk",
      riskLevel: "high",
    },
  ];

  return (
    <section ref={ref} className="py-24 border-t border-border relative overflow-hidden">
      {/* Decorative orb */}
      <div className="glow-orb absolute -top-20 -left-20 w-80 h-80 bg-brand-500/5 animate-float-slow" />
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className={`text-center mb-16 ${revealClass(visible, "up")}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mb-6">
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
          {industries.map((industry, idx) => {
            const badgeBg =
              industry.riskLevel === "high"
                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                : industry.riskLevel === "limited"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400";

            return (
              <div
                key={industry.name}
                className={`group relative p-8 rounded-2xl border border-border/50 bg-surface transition-all duration-700 ease-out hover:border-brand-500/30 hover:scale-[1.02] hover:shadow-lg ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${idx * 100 + 300}ms` }}
              >
                <div className="inline-flex rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 mb-6">
                  <industry.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="font-bold text-text text-xl mb-3">
                  {industry.name}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {industry.systems}
                </p>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${badgeBg}`}
                >
                  {industry.risk}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({
  locale,
  i,
}: {
  locale: Locale;
  i: (key: string) => string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ref, visible] = useScrollReveal();
  const faqs = [
    { q: i("faq.q1"), a: i("faq.a1") },
    { q: i("faq.q2"), a: i("faq.a2") },
    { q: i("faq.q3"), a: i("faq.a3") },
    { q: i("faq.q4"), a: i("faq.a4") },
    { q: i("faq.q5"), a: i("faq.a5") },
    { q: i("faq.q6"), a: i("faq.a6") },
  ];

  return (
    <section id="faq" className="py-24 border-t border-border" ref={ref}>
      <div className={`mx-auto max-w-3xl px-6 ${revealClass(visible, "up")}`}>
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

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface-secondary overflow-hidden transition-all duration-300 hover:border-brand-500/20"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-text text-sm pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection({
  locale,
  i,
  days,
}: {
  locale: Locale;
  i: (key: string, replacements?: Record<string, string | number>) => string;
  days: number;
}) {
  const [ref, visible] = useScrollReveal();
  return (
    <section ref={ref} className="py-24 bg-surface-secondary relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="glow-orb absolute -top-20 left-1/4 w-72 h-72 bg-brand-500/10 animate-pulse-glow" />
      <div className="glow-orb absolute -bottom-20 right-1/4 w-64 h-64 bg-purple-500/10 animate-float-reverse" />
      <div className={`relative mx-auto max-w-3xl px-6 text-center ${revealClass(visible, "scale")}`}>
        <h2 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
          {i("cta.title1", { days })}
          <br />
          <span className="gradient-text">{i("cta.title2")}</span>
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          {i("cta.subtitle")}
        </p>
        <Link
          href="/registro"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all duration-300"
        >
          {i("cta.button")}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

export function FooterSection({
  locale,
  i,
  isDark,
}: {
  locale: Locale;
  i: (key: string) => string;
  isDark: boolean;
}) {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Newsletter */}
        <div className="mb-12 rounded-2xl border border-border bg-surface-secondary p-6 sm:p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-brand-500" />
                <h3 className="text-lg font-bold text-text">
                  {i("newsletter.title")}
                </h3>
              </div>
              <p className="text-sm text-text-secondary">
                {i("newsletter.subtitle")}
              </p>
            </div>
            <div>
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={async (e) => {
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
                      alert(
                        locale === "en"
                          ? "Successfully subscribed!"
                          : "¡Suscrito correctamente!"
                      );
                    } else {
                      alert(
                        locale === "en"
                          ? "Error subscribing"
                          : "Error al suscribir"
                      );
                    }
                  } catch {
                    alert(
                      locale === "en"
                        ? "Error subscribing"
                        : "Error al suscribir"
                    );
                  }
                }}
              >
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
              <p className="mt-2 text-xs text-text-muted">
                {i("newsletter.privacy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-auto">
              <img
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
            <Link href="/blog" className="hover:text-text transition">
              {i("footer.blog")}
            </Link>
            <Link href="/trust" className="hover:text-text transition">
              Trust Center
            </Link>
            <Link href="/sobre-nosotros" className="hover:text-text transition">
              {i("nav.about")}
            </Link>
            <Link href="/ai-act-explorer" className="hover:text-text transition">
              AI Act Explorer
            </Link>
            <a href="/legal/privacidad" className="hover:text-text transition">
              {i("footer.privacy")}
            </a>
            <a href="/legal/terminos" className="hover:text-text transition">
              {i("footer.terms")}
            </a>
            <a href="/legal/cookies" className="hover:text-text transition">
              {i("footer.cookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
