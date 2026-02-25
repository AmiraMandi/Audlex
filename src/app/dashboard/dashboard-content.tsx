"use client";

import Link from "next/link";
import {
  Cpu,
  Shield,
  ShieldCheck,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { DashboardStats, ActivityLogEntry } from "@/types";
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
} from "recharts";

interface ChartData {
  riskDistribution: { name: string; value: number }[];
  systemsByCategory: { name: string; value: number }[];
  documentsByStatus: { name: string; value: number }[];
  complianceCategories: { category: string; total: number; completed: number; percentage: number }[];
}

// Helper functions
function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    unacceptable: "#DC2626", // deeper red
    high: "#EA580C",         // deeper orange
    limited: "#D97706",      // deeper amber
    minimal: "#059669",      // deeper green
  };
  return colors[risk] || "#6B7280";
}

function translateRisk(risk: string, locale: string): string {
  const translations: Record<string, Record<string, string>> = {
    unacceptable: { es: "Prohibido", en: "Unacceptable" },
    high: { es: "Alto", en: "High" },
    limited: { es: "Limitado", en: "Limited" },
    minimal: { es: "Mínimo", en: "Minimal" },
  };
  return translations[risk]?.[locale] || risk;
}

function getDocStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "#9CA3AF",     // gray
    review: "#D97706",    // deeper amber
    approved: "#059669",  // deeper green
    expired: "#DC2626",   // deeper red
  };
  return colors[status] || "#6B7280";
}

function translateDocStatus(status: string, locale: string): string {
  const translations: Record<string, Record<string, string>> = {
    draft: { es: "Borrador", en: "Draft" },
    review: { es: "Revisión", en: "Review" },
    approved: { es: "Aprobado", en: "Approved" },
    expired: { es: "Expirado", en: "Expired" },
  };
  return translations[status]?.[locale] || status;
}

export function DashboardContent({
  data,
  days,
  recentActivity = [],
  charts,
}: {
  data: DashboardStats;
  days: number;
  recentActivity?: ActivityLogEntry[];
  charts: ChartData;
}) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) =>
    td(locale, key, r);

  const isEmpty = data.totalSystems === 0;

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">
            {i("dash.welcome")}
          </h1>
          <p className="text-text-secondary mb-2">
            {locale === "es" ? (
              <>
                Quedan{" "}
                <strong className="text-orange-600">{days} días</strong> hasta la
                fecha límite del EU AI Act.
              </>
            ) : (
              <>
                <strong className="text-orange-600">{days} days</strong> left
                until the EU AI Act deadline.
              </>
            )}
          </p>
          <p className="text-text-secondary mb-8">{i("dash.getStarted")}</p>
          <Link
            href="/dashboard/inventario"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition"
          >
            <Plus className="h-4 w-4" />
            {i("dash.addFirst")}
          </Link>
          <p className="mt-4 text-xs text-text-muted">{i("dash.takesLess")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("dash.title")}</h1>
        <p className="text-text-secondary mt-1">{i("dash.subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title={i("dash.systems")}
          value={data.totalSystems.toString()}
          subtitle={`${data.classifiedSystems} ${i("dash.classified")}`}
          icon={Cpu}
          color="blue"
        />
        <KPICard
          title={i("dash.complianceScore")}
          value={`${data.complianceScore}%`}
          subtitle={i("dash.complianceOf")}
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title={i("dash.documents")}
          value={data.totalDocuments.toString()}
          subtitle={i("dash.generated")}
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          href="/dashboard/inventario"
          title={i("dash.addSystem")}
          description={i("dash.addSystemDesc")}
          icon={Plus}
        />
        <QuickAction
          href="/dashboard/clasificador"
          title={i("dash.classify")}
          description={i("dash.classifyDesc")}
          icon={Shield}
        />
        <QuickAction
          href="/dashboard/documentacion"
          title={i("dash.generateDocs")}
          description={i("dash.generateDocsDesc")}
          icon={FileText}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        {charts.riskDistribution.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-text-muted mb-6 flex items-center gap-2 tracking-wide uppercase">
              <AlertTriangle className="h-4 w-4 text-text-muted" />
              {locale === "es" ? "Distribución de Riesgos" : "Risk Distribution"}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${translateRisk(name, locale)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={95}
                  innerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {charts.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value} ${locale === "es" ? "sistemas" : "systems"}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '13px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Systems by Category */}
        {charts.systemsByCategory.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-text-muted mb-6 flex items-center gap-2 tracking-wide uppercase">
              <Cpu className="h-4 w-4 text-text-muted" />
              {locale === "es" ? "Sistemas por Categoría" : "Systems by Category"}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.systemsByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '13px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6B7280" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={600}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Documents by Status */}
        {charts.documentsByStatus.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-text-muted mb-6 flex items-center gap-2 tracking-wide uppercase">
              <FileText className="h-4 w-4 text-text-muted" />
              {locale === "es" ? "Documentos por Estado" : "Documents by Status"}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.documentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${translateDocStatus(name, locale)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={95}
                  innerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                  animationBegin={0}
                  animationDuration={600}
                >
                  {charts.documentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDocStatusColor(entry.name)} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value} ${locale === "es" ? "documentos" : "documents"}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '13px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Compliance Progress */}
        {charts.complianceCategories.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-text-muted mb-6 flex items-center gap-2 tracking-wide uppercase">
              <TrendingUp className="h-4 w-4 text-text-muted" />
              {locale === "es" ? "Progreso de Compliance" : "Compliance Progress"}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.complianceCategories}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '13px'
                  }}
                />
                <Bar 
                  dataKey="completed" 
                  fill="#10B981" 
                  name={locale === "es" ? "Completados" : "Completed"} 
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={600}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="total" 
                  fill="#E5E7EB" 
                  name={locale === "es" ? "Total" : "Total"} 
                  radius={[4, 4, 0, 0]}
                  animationBegin={50}
                  animationDuration={600}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-secondary p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-text">{i("dash.recentActivity")}</h2>
            </div>
            <Link
              href="/dashboard/configuracion"
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              {i("dash.viewAll")}
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const actionKey = `log.action.${item.action}`;
              const label = td(locale, actionKey) !== actionKey ? td(locale, actionKey) : item.action;
              const timeAgo = getTimeAgo(item.createdAt, locale);
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span className="text-text truncate">{label}</span>
                    {item.userName && (
                      <span className="text-text-muted text-xs">— {item.userName}</span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0 ml-2">{timeAgo}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{title}</span>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-1">{subtitle}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface-secondary p-5 hover:border-brand-200 hover:shadow-md hover:shadow-brand-50 transition-all"
    >
      <div className="rounded-lg bg-brand-50 p-2.5 group-hover:bg-brand-100 transition">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-500 transition" />
    </Link>
  );
}

function getTimeAgo(dateStr: string | Date, locale: string): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return locale === "en" ? "now" : "ahora";
  if (diffMin < 60) return locale === "en" ? `${diffMin}m ago` : `hace ${diffMin}m`;
  if (diffHr < 24) return locale === "en" ? `${diffHr}h ago` : `hace ${diffHr}h`;
  return locale === "en" ? `${diffDay}d ago` : `hace ${diffDay}d`;
}
