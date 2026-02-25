"use client";

import Link from "next/link";
import {
  Shield,
  Lock,
  Server,
  ShieldCheck,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Footer } from "@/components/marketing/footer";
import { PublicNav } from "@/components/marketing/public-nav";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

export function TrustPageContent() {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => tp(locale, key, r);

  const securityMeasures = [
    { icon: Lock, titleKey: "trust.enc.title", descKey: "trust.enc.desc" },
    { icon: Server, titleKey: "trust.infra.title", descKey: "trust.infra.desc" },
    { icon: ShieldCheck, titleKey: "trust.gdpr.title", descKey: "trust.gdpr.desc" },
    { icon: Eye, titleKey: "trust.auditlog.title", descKey: "trust.auditlog.desc" },
  ];

  const complianceFrameworks = [
    { name: "EU AI Act", descKey: "trust.fw.euaiact.desc", statusKey: "trust.fw.euaiact.status", statusType: "green" },
    { name: "RGPD", descKey: "trust.fw.rgpd.desc", statusKey: "trust.fw.rgpd.status", statusType: "green" },
    { name: "ISO 27001", descKey: "trust.fw.iso.desc", statusKey: "trust.fw.iso.status", statusType: "yellow" },
    { name: "SOC 2", descKey: "trust.fw.soc2.desc", statusKey: "trust.fw.soc2.status", statusType: "blue" },
  ];

  const dataProcessing = [
    { dataKey: "trust.dp.user.data", purposeKey: "trust.dp.user.purpose", retentionKey: "trust.dp.user.retention", legal: "Art. 6.1.b RGPD" },
    { dataKey: "trust.dp.ai.data", purposeKey: "trust.dp.ai.purpose", retentionKey: "trust.dp.ai.retention", legal: "Art. 6.1.b RGPD" },
    { dataKey: "trust.dp.docs.data", purposeKey: "trust.dp.docs.purpose", retentionKey: "trust.dp.docs.retention", legal: "Art. 6.1.c RGPD" },
    { dataKey: "trust.dp.logs.data", purposeKey: "trust.dp.logs.purpose", retentionKey: "trust.dp.logs.retention", legal: "Art. 6.1.f RGPD" },
    { dataKey: "trust.dp.payment.data", purposeKey: "trust.dp.payment.purpose", retentionKey: "trust.dp.payment.retention", legal: "Art. 6.1.b RGPD" },
  ];

  const subProcessors = [
    { name: "Supabase (Postgres)", location: "EU (eu-west-1)", purposeKey: "trust.sp.supabase" },
    { name: "Vercel", location: "EU (fra1)", purposeKey: "trust.sp.vercel" },
    { name: "Stripe", location: "EU / US", purposeKey: "trust.sp.stripe" },
    { name: "Resend", location: "US", purposeKey: "trust.sp.resend" },
  ];

  const statusColors: Record<string, string> = {
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <div className="min-h-screen bg-surface">
      <PublicNav variant="default" />

      {/* Hero */}
      <section className="py-16 border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            {i("trust.badge")}
          </div>
          <h1 className="text-4xl font-bold text-text sm:text-5xl">
            {i("trust.hero.title", { accent: "" })}
            <span className="text-brand-500">{i("trust.hero.accent")}</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            {i("trust.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Security measures */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-text mb-8">
            {i("trust.security.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {securityMeasures.map((item) => (
              <div
                key={item.titleKey}
                className="rounded-xl border border-border bg-surface-secondary p-6 hover:border-green-500/20 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5">
                    <item.icon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text">{i(item.titleKey)}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                        {i("trust.active")}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{i(item.descKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance frameworks */}
      <section className="py-16 border-t border-border bg-surface-secondary">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-text mb-8">
            {i("trust.compliance.title")}
          </h2>
          <div className="space-y-3">
            {complianceFrameworks.map((fw) => (
              <div
                key={fw.name}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5 text-brand-500" />
                  <div>
                    <h3 className="font-semibold text-text">{fw.name}</h3>
                    <p className="text-sm text-text-muted">{i(fw.descKey)}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    statusColors[fw.statusType]
                  }`}
                >
                  {i(fw.statusKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data processing */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-text mb-2">
            {i("trust.dataProcessing.title")}
          </h2>
          <p className="text-text-secondary mb-8">
            {i("trust.dataProcessing.subtitle")}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-text">
                    {i("trust.table.data")}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text">
                    {i("trust.table.purpose")}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text">
                    {i("trust.table.retention")}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text">
                    {i("trust.table.legal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataProcessing.map((row) => (
                  <tr
                    key={row.dataKey}
                    className="border-b border-border hover:bg-surface-secondary transition"
                  >
                    <td className="py-3 px-4 font-medium text-text">
                      {i(row.dataKey)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {i(row.purposeKey)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {i(row.retentionKey)}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {row.legal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sub-processors */}
      <section className="py-16 border-t border-border bg-surface-secondary">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-text mb-8">
            {i("trust.subProcessors.title")}
          </h2>
          <div className="space-y-3">
            {subProcessors.map((sp) => (
              <div
                key={sp.name}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <h3 className="font-medium text-text">{sp.name}</h3>
                  <p className="text-sm text-text-muted">{i(sp.purposeKey)}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {sp.location}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-text mb-4">
            {i("trust.contact.title")}
          </h2>
          <p className="text-text-secondary mb-6">
            {i("trust.contact.subtitle")}
          </p>
          <a
            href="mailto:security@audlex.com"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
          >
            {i("trust.contact.button")}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
