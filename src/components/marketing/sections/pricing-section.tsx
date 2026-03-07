"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PricingButton } from "@/components/marketing/pricing-button";
import { PricingToggle } from "@/components/marketing/pricing-toggle";
import type { Locale } from "@/lib/i18n/translations";

export default function PricingSection({
  locale,
  i,
}: {
  locale: Locale;
  i: (key: string, replacements?: Record<string, string | number>) => string;
}) {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: i("pricing.free.name"),
      monthlyPrice: 0,
      annualPrice: 0,
      description: i("pricing.free.desc"),
      features:
        locale === "es"
          ? ["1 sistema de IA", "Clasificación de riesgo", "Informe básico"]
          : ["1 AI system", "Risk classification", "Basic report"],
      cta: i("nav.cta"),
      popular: false,
      planKey: null,
    },
    {
      name: i("pricing.starter.name"),
      monthlyPrice: 69,
      annualPrice: 660,
      description: i("pricing.starter.desc"),
      features:
        locale === "es"
          ? [
              "5 sistemas de IA",
              "Documentación completa",
              "Checklist interactivo",
              "Exportación PDF",
              "2 usuarios",
            ]
          : [
              "5 AI systems",
              "Full documentation",
              "Interactive checklist",
              "PDF export",
              "2 users",
            ],
      cta: locale === "es" ? "Empezar" : "Start",
      popular: false,
      planKey: "starter" as const,
    },
    {
      name: i("pricing.business.name"),
      monthlyPrice: 199,
      annualPrice: 1910,
      description: i("pricing.business.desc"),
      features:
        locale === "es"
          ? [
              "25 sistemas de IA",
              "Todo de Starter",
              "5 usuarios",
              "Alertas y monitorización",
              "Dashboard completo",
              "Audit log",
              "Exportación DOCX",
            ]
          : [
              "25 AI systems",
              "Everything in Starter",
              "5 users",
              "Alerts & monitoring",
              "Full dashboard",
              "Audit log",
              "DOCX export",
            ],
      cta: locale === "es" ? "Empezar" : "Start",
      popular: true,
      planKey: "business" as const,
    },
    {
      name: i("pricing.enterprise.name"),
      monthlyPrice: 499,
      annualPrice: 4790,
      description: i("pricing.enterprise.desc"),
      features:
        locale === "es"
          ? [
              "Sistemas ilimitados",
              "Todo de Business",
              "Usuarios ilimitados",
              "API access",
              "Soporte prioritario",
              "SSO (próximamente)",
            ]
          : [
              "Unlimited systems",
              "Everything in Business",
              "Unlimited users",
              "API access",
              "Priority support",
              "SSO (coming soon)",
            ],
      cta: locale === "es" ? "Empezar" : "Start",
      popular: false,
      planKey: "enterprise" as const,
    },
  ];

  return (
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

        <PricingToggle
          isAnnual={isAnnual}
          onChange={setIsAnnual}
          locale={locale}
        />

        <div className="grid md:grid-cols-4 gap-6 pt-4">
          {plans.map((plan) => {
            const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const pricePerMonth =
              isAnnual && plan.annualPrice > 0
                ? Math.round(plan.annualPrice / 12)
                : plan.monthlyPrice;
            const savings =
              isAnnual && plan.monthlyPrice > 0
                ? plan.monthlyPrice * 12 - plan.annualPrice
                : 0;

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
                    ? "0 8px 40px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.1)"
                    : "0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)",
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

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold text-text tracking-tight">
                      €{pricePerMonth}
                    </span>
                    <span className="text-lg text-text-muted font-medium">
                      {locale === "es" ? "/mes" : "/mo"}
                    </span>
                  </div>
                  {isAnnual && displayPrice > 0 && savings > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {locale === "es"
                        ? `Ahorra €${savings} al año`
                        : `Save €${savings} per year`}
                    </div>
                  )}
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-text-secondary group-hover:text-text transition-colors"
                    >
                      <div className="mt-0.5 rounded-full bg-green-500/10 p-0.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

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
        <p className="text-center text-sm text-text-muted mt-8">
          {locale === "es"
            ? "Precios sin IVA. El impuesto aplicable se calcula en el checkout."
            : "Prices exclude VAT. Applicable tax is calculated at checkout."}
        </p>
      </div>
    </section>
  );
}
