"use client";

import Link from "next/link";
import { Plus, Cpu, ChevronRight, AlertTriangle, Pencil } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import { RiskBadge, StatusBadge } from "@/components/ui/badge";
import { DeleteSystemButton } from "@/components/dashboard/delete-system-button";
import { InventoryCharts } from "@/components/dashboard/inventory-charts";

const commonSystems = [
  {
    nameKey: "inv.cs.chatbot",
    examplesEs: "Intercom, Drift, ChatGPT integrado, Tidio",
    examplesEn: "Intercom, Drift, ChatGPT integrated, Tidio",
    category: "chatbot",
    riskHint: "limited",
  },
  {
    nameKey: "inv.cs.crm",
    examplesEs: "HubSpot, Salesforce Einstein, Pipedrive",
    examplesEn: "HubSpot, Salesforce Einstein, Pipedrive",
    category: "scoring_profiling",
    riskHint: "limited",
  },
  {
    nameKey: "inv.cs.cv",
    examplesEs: "LinkedIn Recruiter, Factorial, Workable",
    examplesEn: "LinkedIn Recruiter, Factorial, Workable",
    category: "scoring_profiling",
    riskHint: "high",
  },
  {
    nameKey: "inv.cs.content",
    examplesEs: "ChatGPT, Claude, Jasper, Copilot",
    examplesEn: "ChatGPT, Claude, Jasper, Copilot",
    category: "content_generation",
    riskHint: "limited",
  },
  {
    nameKey: "inv.cs.analytics",
    examplesEs: "Google Analytics 4, Mixpanel, predictivos internos",
    examplesEn: "Google Analytics 4, Mixpanel, internal predictive models",
    category: "predictive_analytics",
    riskHint: "minimal",
  },
  {
    nameKey: "inv.cs.translation",
    examplesEs: "DeepL, Google Translate integrado",
    examplesEn: "DeepL, Google Translate integrated",
    category: "content_generation",
    riskHint: "minimal",
  },
  {
    nameKey: "inv.cs.biometric",
    examplesEs: "Control de acceso, fichaje biométrico",
    examplesEn: "Access control, biometric attendance",
    category: "biometric",
    riskHint: "high",
  },
  {
    nameKey: "inv.cs.credit",
    examplesEs: "Modelos internos, APIs de scoring",
    examplesEn: "Internal models, scoring APIs",
    category: "scoring_profiling",
    riskHint: "high",
  },
  {
    nameKey: "inv.cs.email",
    examplesEs: "Mailchimp, ActiveCampaign, Brevo",
    examplesEn: "Mailchimp, ActiveCampaign, Brevo",
    category: "recommendation",
    riskHint: "minimal",
  },
  {
    nameKey: "inv.cs.rpa",
    examplesEs: "UiPath, Zapier con IA, Make",
    examplesEn: "UiPath, Zapier with AI, Make",
    category: "automation",
    riskHint: "minimal",
  },
];

const riskColors = {
  high: "bg-orange-100 text-orange-700 border-orange-200",
  limited: "bg-yellow-100 text-yellow-700 border-yellow-200",
  minimal: "bg-green-100 text-green-700 border-green-200",
};

import type { AiSystemWithRisk } from "@/types";

export function InventoryContent({ systems }: { systems: AiSystemWithRisk[] }) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const riskLabels: Record<string, string> = {
    high: i("inv.riskHigh"),
    limited: i("inv.riskLimited"),
    minimal: i("inv.riskMinimal"),
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{i("inv.title")}</h1>
          <p className="text-text-secondary mt-1">
            {i("inv.subtitle")}
          </p>
        </div>
        <Link
          href="/dashboard/inventario/nuevo"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          {i("inv.addSystem")}
        </Link>
      </div>

      {systems.length === 0 ? (
        <div className="space-y-8">
          {/* Empty state with guided detection */}
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-brand-100 p-2">
                <Cpu className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h2 className="font-semibold text-text mb-1">
                  {i("inv.notSure")}
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  {i("inv.notSureDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Common systems grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonSystems.map((system) => (
              <Link
                key={system.nameKey}
                href={`/dashboard/inventario/nuevo?category=${system.category}&name=${encodeURIComponent(i(system.nameKey))}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface-secondary p-4 hover:border-brand-200 hover:shadow-sm transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">{i(system.nameKey)}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[system.riskHint as keyof typeof riskColors]}`}
                    >
                      {riskLabels[system.riskHint as keyof typeof riskLabels]}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{locale === "en" ? system.examplesEn : system.examplesEs}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand-500 transition" />
              </Link>
            ))}
          </div>

          {/* Tip */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {i("inv.hrTip")}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {i("inv.hrTipDesc")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts */}
          <InventoryCharts systems={systems} />
          
          {/* Systems table */}
          <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{i("inv.system")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary hidden sm:table-cell">{i("inv.category")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary hidden md:table-cell">{i("inv.provider")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{i("inv.risk")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{i("inv.status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {systems.map((system) => (
                <tr key={system.id} className="hover:bg-surface-tertiary transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{system.name}</p>
                    <p className="text-xs text-text-muted">{system.purpose}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs hidden sm:table-cell">{system.category}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs hidden md:table-cell">{system.provider || "—"}</td>
                  <td className="px-4 py-3">
                    {system.riskLevel ? (
                      <RiskBadge level={system.riskLevel} />
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary">
                        {i("inv.unclassified")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={system.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/inventario/${system.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        {locale === "en" ? "View" : "Ver"}
                      </Link>
                      <Link
                        href={`/dashboard/inventario/${system.id}/editar`}
                        className="text-xs font-medium text-text-muted hover:text-text"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/clasificador?system=${system.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        {i("inv.classifyAction")}
                      </Link>
                      <DeleteSystemButton systemId={system.id} systemName={system.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
