"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Shield,
  Cpu,
  CheckSquare,
  TrendingUp,
  Calendar,
  AlertTriangle,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, RiskBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/feedback";
import {
  getDashboardStats,
  getAiSystems,
  getComplianceItems,
  getDocuments,
  getAssessments,
} from "@/app/actions";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { DashboardStats, AiSystem, ComplianceItem, AppDocument, RiskAssessment } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RISK_COLORS: Record<string, string> = {
  unacceptable: "#dc2626",
  high: "#ea580c",
  limited: "#eab308",
  minimal: "#16a34a",
  unclassified: "#94a3b8",
};

const COMPLIANCE_COLORS: Record<string, string> = {
  completed: "#16a34a",
  in_progress: "#2563eb",
  pending: "#eab308",
  not_applicable: "#94a3b8",
};

export default function InformesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const riskLabel = (level: string) => i(`rpt.risk.${level}`);

  useEffect(() => {
    async function load() {
      try {
        const [s, sys, items, docs, assess] = await Promise.all([
          getDashboardStats(),
          getAiSystems(),
          getComplianceItems(),
          getDocuments(),
          getAssessments(),
        ]);
        setStats(s);
        setSystems(sys);
        setComplianceItems(items);
        setDocuments(docs);
        setAssessments(assess);
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Risk distribution data
  const riskDistribution = useMemo(() => {
    if (!systems.length) return [];
    const assessed = new Map<string, string>();
    assessments.forEach((a) => {
      if (!assessed.has(a.aiSystemId)) {
        assessed.set(a.aiSystemId, a.riskLevel);
      }
    });

    const counts: Record<string, number> = {
      unacceptable: 0,
      high: 0,
      limited: 0,
      minimal: 0,
      unclassified: 0,
    };

    systems.forEach((s) => {
      const level = assessed.get(s.id) || "unclassified";
      counts[level] = (counts[level] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: riskLabel(name),
        value,
        color: RISK_COLORS[name] || "#94a3b8",
      }));
  }, [systems, assessments, locale]);

  // Compliance status data
  const complianceDistribution = useMemo(() => {
    if (!complianceItems.length) return [];
    const counts: Record<string, number> = { completed: 0, in_progress: 0, pending: 0, not_applicable: 0 };
    complianceItems.forEach((ci) => {
      counts[ci.status] = (counts[ci.status] || 0) + 1;
    });
    return [
      { name: i("rpt.comp.completed"), value: counts.completed, color: COMPLIANCE_COLORS.completed },
      { name: i("rpt.comp.inProgress"), value: counts.in_progress, color: COMPLIANCE_COLORS.in_progress },
      { name: i("rpt.comp.pending"), value: counts.pending, color: COMPLIANCE_COLORS.pending },
      { name: i("rpt.comp.notApplicable"), value: counts.not_applicable, color: COMPLIANCE_COLORS.not_applicable },
    ].filter((d) => d.value > 0);
  }, [complianceItems, locale]);

  // Documents by type
  const documentsByType = useMemo(() => {
    if (!documents.length) return [];
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    const labels: Record<string, string> = {
      impact_assessment: i("rpt.docType.fria"),
      risk_management: i("rpt.docType.risks"),
      technical_file: i("rpt.docType.files"),
      conformity_declaration: i("rpt.docType.declaration"),
      transparency_notice: i("rpt.docType.transparency"),
      human_oversight: i("rpt.docType.oversight"),
      data_governance: i("rpt.docType.governance"),
      post_market_monitoring: i("rpt.docType.monitoring"),
      ai_usage_policy: i("rpt.docType.policy"),
      ai_inventory: i("rpt.docType.inventory"),
    };
    return Object.entries(counts).map(([type, count]) => ({
      name: labels[type] || type,
      count,
    }));
  }, [documents, locale]);

  // Per-system compliance
  const systemCompliance = useMemo(() => {
    if (!systems.length || !complianceItems.length) return [];
    return systems.map((s) => {
      const sysItems = complianceItems.filter((item) => item.aiSystemId === s.id);
      const completed = sysItems.filter(
        (item) => item.status === "completed" || item.status === "not_applicable"
      ).length;
      return {
        name: s.name.length > 20 ? s.name.substring(0, 20) + "..." : s.name,
        completado: completed,
        pendiente: sysItems.length - completed,
        total: sysItems.length,
        percentage: sysItems.length > 0 ? Math.round((completed / sysItems.length) * 100) : 0,
      };
    });
  }, [systems, complianceItems]);

  function daysUntil() {
    const deadline = new Date("2026-08-02");
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function handleExportReport() {
    const report = generateTextReport();
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-compliance-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(i("rpt.exported"));
  }

  function generateTextReport(): string {
    const dateFmt = locale === "en" ? "en-GB" : "es-ES";
    let report = `# ${i("rpt.reportTitle")}\n\n`;
    report += `**${i("rpt.reportDate")}** ${new Date().toLocaleDateString(dateFmt, { day: "numeric", month: "long", year: "numeric" })}\n`;
    report += `**${i("rpt.daysLeft")}:** ${daysUntil()}\n\n`;
    report += `## ${i("rpt.reportSummary")}\n\n`;
    report += `| Metric | Value |\n|---|---|\n`;
    report += `| ${i("rpt.reportTotalSystems")} | ${stats?.totalSystems || 0} |\n`;
    report += `| ${i("rpt.reportClassified")} | ${stats?.classifiedSystems || 0} |\n`;
    report += `| ${i("rpt.reportScore")} | ${stats?.complianceScore || 0}% |\n`;
    report += `| ${i("rpt.reportDocs")} | ${stats?.totalDocuments || 0} |\n`;
    report += `| ${i("rpt.reportRequirements")} | ${stats?.completedItems || 0}/${stats?.totalItems || 0} |\n\n`;

    report += `## ${i("rpt.riskDistribution")}\n\n`;
    riskDistribution.forEach((r) => {
      report += `- **${r.name}:** ${r.value} ${i("rpt.systemCount")}\n`;
    });
    report += `\n`;

    report += `## ${i("rpt.systemCompliance")}\n\n`;
    systemCompliance.forEach((s) => {
      report += `### ${s.name}\n`;
      report += `- ${i("rpt.chart.completed")}: ${s.completado}/${s.total} (${s.percentage}%)\n\n`;
    });

    report += `---\n*${i("rpt.generatedBy")}*\n`;
    return report;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats || stats.totalSystems === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title={i("rpt.noData")}
        description={i("rpt.noDataDesc")}
      >
        <Button onClick={() => (window.location.href = "/dashboard/inventario")}>
          <Cpu className="h-4 w-4" />
          {i("rpt.goToInventory")}
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{i("rpt.title")}</h1>
          <p className="text-text-secondary mt-1">
            {i("rpt.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            {i("rpt.export")}
          </Button>
          <Button variant="outline" onClick={() => window.open("/api/reports/pdf", "_blank")}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <Cpu className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text">{stats.totalSystems}</p>
            <p className="text-xs text-text-muted">{i("rpt.systems")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Shield className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text">{stats.classifiedSystems}</p>
            <p className="text-xs text-text-muted">{i("rpt.classified")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text">{stats.complianceScore}%</p>
            <p className="text-xs text-text-muted">{i("rpt.compliance")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <FileText className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text">{stats.totalDocuments}</p>
            <p className="text-xs text-text-muted">{i("rpt.documents")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Calendar className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-text">{daysUntil()}</p>
            <p className="text-xs text-text-muted">{i("rpt.daysLeft")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{i("rpt.riskDistribution")}</CardTitle>
            <CardDescription>{i("rpt.riskDistDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-text-muted">
                {i("rpt.noClassification")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{i("rpt.complianceStatus")}</CardTitle>
            <CardDescription>{i("rpt.complianceStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {complianceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={complianceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complianceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-sm text-text-muted">
                {i("rpt.generateFirst")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-system compliance bar chart */}
      {systemCompliance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{i("rpt.systemCompliance")}</CardTitle>
            <CardDescription>{i("rpt.systemComplianceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemCompliance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                <Legend />
                <Bar dataKey="completado" stackId="a" fill="#16a34a" name={i("rpt.chart.completed")} />
                <Bar dataKey="pendiente" stackId="a" fill="var(--border)" name={i("rpt.chart.pending")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Documents by type */}
      {documentsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{i("rpt.docsByType")}</CardTitle>
            <CardDescription>{i("rpt.docsByTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={documentsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                <Bar dataKey="count" fill="#3b82f6" name={i("rpt.chart.documents")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Deadline Warning */}
      {daysUntil() < 180 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                {i("rpt.deadlineWarning", { days: daysUntil() })}
              </p>
              <p className="text-xs text-orange-700">
                {i("rpt.deadlineAdvice")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
