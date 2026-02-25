"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  Users,
  Database,
  Activity,
  Pencil,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import { RiskBadge, StatusBadge } from "@/components/ui/badge";

import type { AiSystem, AppDocument, ComplianceItem, RiskAssessment } from "@/types";

interface SystemDetailProps {
  system: AiSystem;
  documents: AppDocument[];
  complianceItems: ComplianceItem[];
  assessment: RiskAssessment | null;
  systemId: string;
}

export function SystemDetailContent({ system, documents, complianceItems, assessment, systemId }: SystemDetailProps) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const dateLocale = locale === "en" ? "en-GB" : "es-ES";

  const completedItems = complianceItems.filter((item) => item.status === "completed").length;
  const totalItems = complianceItems.length;
  const compliancePercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const riskColors: Record<string, string> = {
    unacceptable: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    limited: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    minimal: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  const riskLabels: Record<string, string> = {
    unacceptable: i("badge.risk.unacceptable"),
    high: i("badge.risk.high"),
    limited: i("badge.risk.limited"),
    minimal: i("badge.risk.minimal"),
  };

  const statusLabels: Record<string, string> = {
    active: i("badge.status.active"),
    planned: i("badge.status.planned"),
    retired: i("badge.status.retired"),
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/20",
    planned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    retired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const categoryLabel = (key: string) => {
    const translated = i(`form.cat.${key}`);
    return translated !== `form.cat.${key}` ? translated : key;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            href="/dashboard/inventario"
            className="mt-1 rounded-lg border border-border p-2 hover:bg-surface-secondary transition shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-text-muted" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-text truncate">{system.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${statusColors[system.status] || statusColors.active}`}>
                {statusLabels[system.status] || system.status}
              </span>
            </div>
            <p className="text-text-secondary text-sm sm:text-base">
              {categoryLabel(system.category)}
              {system.provider && ` · ${system.provider}`}
              {system.providerModel && ` (${system.providerModel})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/inventario/${systemId}/editar`}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-tertiary transition"
          >
            <Pencil className="h-4 w-4" />
            {locale === "en" ? "Edit" : "Editar"}
          </Link>
          <Link
            href={`/dashboard/clasificador?systemId=${systemId}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
          <Shield className="h-4 w-4" />
          {assessment ? i("inv.reclassify") : i("inv.classifyRisk")}
          </Link>
        </div>
      </div>

      {/* Risk Assessment Card */}
      {assessment && (
        <div className={`rounded-xl border p-6 ${riskColors[assessment.riskLevel] || "border-border"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${riskColors[assessment.riskLevel]}`}>
                {assessment.riskLevel === "high" || assessment.riskLevel === "unacceptable" ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <Shield className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">
                  {i("inv.classification")} {riskLabels[assessment.riskLevel] || assessment.riskLevel}
                </h2>
                <p className="text-sm text-text-secondary">
                  {i("inv.score", { score: assessment.assessmentScore || "-" })} ·{" "}
                  {i("inv.evaluatedOn", { date: new Date(assessment.assessedAt).toLocaleDateString(dateLocale) })}
                </p>
              </div>
            </div>
            {assessment.assessmentScore != null && (
              <div className="text-right">
                <div className="text-3xl font-bold text-text">{assessment.assessmentScore}</div>
                <div className="text-xs text-text-muted">{i("cls.riskScore")}</div>
              </div>
            )}
          </div>

          {assessment.applicableArticles && (assessment.applicableArticles as string[]).length > 0 && (
            <div className="mt-4 pt-4 border-t border-current/10">
              <p className="text-sm font-medium text-text mb-2">{i("inv.applicableArticles")}</p>
              <div className="flex flex-wrap gap-2">
                {(assessment.applicableArticles as string[]).map((art: string) => (
                  <span key={art} className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary">
                    {art}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Details Card */}
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-500" />
            {i("inv.systemDetails")}
          </h3>
          <dl className="space-y-3">
            {system.purpose && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.purpose")}</dt>
                <dd className="text-sm text-text mt-0.5">{system.purpose}</dd>
              </div>
            )}
            {system.description && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.description")}</dt>
                <dd className="text-sm text-text mt-0.5">{system.description}</dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.autonomousDecision")}</dt>
                <dd className="text-sm text-text mt-0.5">
                  {system.isAutonomousDecision ? i("inv.yes") : i("inv.no")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.humanOversight")}</dt>
                <dd className="text-sm text-text mt-0.5">
                  {system.hasHumanOversight ? i("inv.yes") : i("inv.no")}
                </dd>
              </div>
            </div>
            {system.deploymentDate && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.deployDate")}</dt>
                <dd className="text-sm text-text mt-0.5">
                  {new Date(system.deploymentDate).toLocaleDateString(dateLocale)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Data & People Card */}
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-brand-500" />
            {i("inv.dataSection")}
          </h3>
          <dl className="space-y-3">
            {system.dataTypes && (system.dataTypes as string[]).length > 0 && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.dataTypes")}</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">
                  {(system.dataTypes as string[]).map((dt: string) => (
                    <span key={dt} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {dt}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {system.affectedPersons && (system.affectedPersons as string[]).length > 0 && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.affectedPersons")}</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">
                  {(system.affectedPersons as string[]).map((p: string) => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {p}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {system.numberOfAffected && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.numAffected")}</dt>
                <dd className="text-sm text-text mt-0.5">{system.numberOfAffected}</dd>
              </div>
            )}
            {system.notes && (
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase">{i("inv.notes")}</dt>
                <dd className="text-sm text-text-secondary mt-0.5">{system.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Compliance Progress */}
      {totalItems > 0 && (
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              {i("inv.complianceProgress")}
            </h3>
            <Link
              href={`/dashboard/checklist?systemId=${systemId}`}
              className="text-sm text-brand-500 hover:text-brand-600 transition flex items-center gap-1"
            >
              {i("inv.viewChecklist")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${compliancePercent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-text">{compliancePercent}%</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            {completedItems} / {totalItems} {i("inv.requirementsCompleted")}
          </p>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-secondary p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-500" />
              {i("inv.documents")} ({documents.length})
            </h3>
            <Link
              href="/dashboard/documentacion"
              className="text-sm text-brand-500 hover:text-brand-600 transition flex items-center gap-1"
            >
              {i("inv.viewAll")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-text-muted" />
                  <div>
                    <span className="text-sm font-medium text-text">{doc.title}</span>
                    <span className="block text-xs text-text-muted">
                      {doc.type} · {new Date(doc.createdAt).toLocaleDateString(dateLocale)}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  doc.status === "approved"
                    ? "bg-green-500/10 text-green-600"
                    : doc.status === "review"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-gray-500/10 text-gray-500"
                }`}>
                  {doc.status === "approved" ? i("docs.status.approved") : doc.status === "review" ? i("docs.status.review") : i("docs.status.draft")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center gap-6 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {i("inv.created")} {new Date(system.createdAt).toLocaleDateString(dateLocale)}
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {i("inv.updated")} {new Date(system.updatedAt).toLocaleDateString(dateLocale)}
        </span>
      </div>
    </div>
  );
}
