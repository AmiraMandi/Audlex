/**
 * ============================================================
 * Audlex — Documentation Generation Charts
 * ============================================================
 * 
 * Visualizations for document generation activity:
 * - Documents generated over time (timeline)
 * - Document types distribution
 * - Status flow (draft → review → approved)
 */

"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

interface Document {
  id: string;
  type: string;
  status: "draft" | "review" | "approved" | "expired";
  createdAt: string | Date;
}

interface DocumentChartsProps {
  documents: Document[];
}

const TYPE_COLORS: Record<string, string> = {
  impact_assessment: "#DC2626",
  risk_management: "#EA580C",
  technical_file: "#2563EB",
  conformity_declaration: "#7C3AED",
  human_oversight: "#059669",
  transparency_notice: "#D97706",
  data_governance: "#0891B2",
  post_market_monitoring: "#DB2777",
  ai_usage_policy: "#6366F1",
  ai_inventory: "#10B981",
};

const STATUS_COLORS = {
  draft: "#9CA3AF",
  review: "#F59E0B",
  approved: "#10B981",
  expired: "#DC2626",
};

export function DocumentCharts({ documents }: DocumentChartsProps) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  // Timeline data (documents generated over time)
  const timelineData = documents
    .reduce((acc: { month: string; count: number }[], doc) => {
      const date = new Date(doc.createdAt);
      const monthYear = `${date.toLocaleString(locale, { month: "short" })} ${date.getFullYear()}`;
      const existing = acc.find((item) => item.month === monthYear);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ month: monthYear, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // Type distribution
  const typeData = documents.reduce((acc: Record<string, number>, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeData).map(([type, count]) => ({
    type: i(`doc.type.${type}`).slice(0, 20), // Truncate long names
    count,
    color: TYPE_COLORS[type] || "#6B7280",
  }));

  // Status distribution
  const statusData = [
    {
      name: i("doc.status.draft"),
      value: documents.filter((d) => d.status === "draft").length,
      color: STATUS_COLORS.draft,
    },
    {
      name: i("doc.status.review"),
      value: documents.filter((d) => d.status === "review").length,
      color: STATUS_COLORS.review,
    },
    {
      name: i("doc.status.approved"),
      value: documents.filter((d) => d.status === "approved").length,
      color: STATUS_COLORS.approved,
    },
    {
      name: i("doc.status.expired"),
      value: documents.filter((d) => d.status === "expired").length,
      color: STATUS_COLORS.expired,
    },
  ].filter((item) => item.value > 0);

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Generation Timeline */}
      {timelineData.length > 1 && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{i("doc.chartTimeline")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ fill: "#2563EB", r: 4 }}
                activeDot={{ r: 6 }}
                name={i("doc.docsGenerated")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Type & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{i("doc.chartTypes")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeChartData}>
              <XAxis
                dataKey="type"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{i("doc.chartStatus")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("doc.totalDocs")}</p>
          <p className="text-2xl font-bold text-text-primary">{documents.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("doc.status.draft")}</p>
          <p className="text-2xl font-bold text-gray-600">
            {documents.filter((d) => d.status === "draft").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("doc.status.review")}</p>
          <p className="text-2xl font-bold text-amber-600">
            {documents.filter((d) => d.status === "review").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("doc.status.approved")}</p>
          <p className="text-2xl font-bold text-emerald-600">
            {documents.filter((d) => d.status === "approved").length}
          </p>
        </div>
      </div>
    </div>
  );
}
