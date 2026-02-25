"use client";

import Link from "next/link";
import {
  Target,
  Lightbulb,
  Scale,
  Heart,
  Shield,
  Globe2,
  Mail,
} from "lucide-react";
import { Footer } from "@/components/marketing/footer";
import { PublicNav } from "@/components/marketing/public-nav";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

export function AboutPageContent() {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);

  const values = [
    {
      icon: Scale,
      titleKey: "about.values.rigor.title",
      descKey: "about.values.rigor.desc",
    },
    {
      icon: Heart,
      titleKey: "about.values.access.title",
      descKey: "about.values.access.desc",
    },
    {
      icon: Shield,
      titleKey: "about.values.privacy.title",
      descKey: "about.values.privacy.desc",
    },
    {
      icon: Globe2,
      titleKey: "about.values.impact.title",
      descKey: "about.values.impact.desc",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="back" maxWidth="max-w-5xl" />

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-16 text-center">
          <h1 className="text-4xl font-bold text-text sm:text-5xl">
            {i("about.hero.title", { accent: "" })}
            <span className="gradient-text">{i("about.hero.accent")}</span>
            {locale === "es" ? " sea accesible para todos" : ""}
          </h1>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {i("about.hero.subtitle")}
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8 pb-16">
          <div className="rounded-2xl border border-border bg-surface-secondary p-8">
            <div className="rounded-full bg-brand-500/10 border border-brand-500/20 p-3 w-fit mb-4">
              <Target className="h-6 w-6 text-brand-500" />
            </div>
            <h2 className="text-xl font-bold text-text mb-3">
              {i("about.mission.title")}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {i("about.mission.desc")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-secondary p-8">
            <div className="rounded-full bg-purple-500/10 border border-purple-500/20 p-3 w-fit mb-4">
              <Lightbulb className="h-6 w-6 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-text mb-3">
              {i("about.vision.title")}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {i("about.vision.desc")}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="pb-16">
          <h2 className="text-2xl font-bold text-text text-center mb-10">
            {i("about.values.title")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.titleKey}
                className="text-center p-6 rounded-2xl border border-border bg-surface hover:border-brand-500/20 transition-all duration-300"
              >
                <div className="inline-flex rounded-full bg-brand-500/10 border border-brand-500/20 p-3 mb-4">
                  <value.icon className="h-5 w-5 text-brand-500" />
                </div>
                <h3 className="font-semibold text-text mb-2">
                  {i(value.titleKey)}
                </h3>
                <p className="text-sm text-text-secondary">
                  {i(value.descKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Audlex */}
        <section className="pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">{i("about.why.title")}</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-2">
                    {i("about.why.problem.title")}
                  </h3>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    {i("about.why.problem.desc")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    {i("about.why.solution.title")}
                  </h3>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    {i("about.why.solution.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="pb-20">
          <div className="text-center rounded-2xl border border-border bg-surface-secondary p-10">
            <Mail className="h-8 w-8 text-brand-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">
              {i("about.contact.title")}
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              {i("about.contact.subtitle")}
            </p>
            <a
              href="mailto:hola@audlex.com"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
            >
              hola@audlex.com
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer maxWidth="max-w-5xl" />
    </div>
  );
}
