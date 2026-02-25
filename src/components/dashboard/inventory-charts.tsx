/**
 * ============================================================
 * Audlex — Inventory Charts Component
 * ============================================================
 * 
 * Advanced visualizations for AI systems inventory:
 * - Risk distribution pie chart
 * - Systems added over time (timeline)
 * - Category breakdown bar chart
 * - Status distribution
 */

"use client";

import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AiSystemWithRisk } from "@/types";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

interface InventoryChartsProps {
  systems: AiSystemWithRisk[];
}

const RISK_COLORS = {
  unacceptable: "#DC2626",
  high: "#EA580C",
  limited: "#D97706",
  minimal: "#059669",
};

const CATEGORY_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#059669",
  "#0891B2",
];

export function InventoryCharts({ systems }: InventoryChartsProps) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  // Risk distribution data
  const riskDistribution = [
    {
      name: i("inv.riskProhibited"),
      value: systems.filter((s) => s.riskLevel === "unacceptable").length,
      color: RISK_COLORS.unacceptable,
    },
    {
      name: i("inv.riskHigh"),
      value: systems.filter((s) => s.riskLevel === "high").length,
      color: RISK_COLORS.high,
    },
    {
      name: i("inv.riskLimited"),
      value: systems.filter((s) => s.riskLevel === "limited").length,
      color: RISK_COLORS.limited,
    },
    {
      name: i("inv.riskMinimal"),
      value: systems.filter((s) => s.riskLevel === "minimal").length,
      color: RISK_COLORS.minimal,
    },
  ].filter((item) => item.value > 0);

  // Timeline data (systems added over time)
  const timelineData = systems
    .reduce((acc: { month: string; count: number }[], system) => {
      const date = new Date(system.createdAt);
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

  // Category breakdown
  const categoryData = systems.reduce((acc: Record<string, number>, system) => {
    acc[system.category] = (acc[system.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([category, count], index) => ({
    category: i(`inv.cat.${category}`),
    count,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  // Status distribution
  const statusData = [
    {
      name: i("inv.statusActive"),
      value: systems.filter((s) => s.status === "active").length,
      color: "#059669",
    },
    {
      name: i("inv.statusDev"),
      value: systems.filter((s) => s.status === "planned").length,
      color: "#3B82F6",
    },
    {
      name: i("inv.statusRetired"),
      value: systems.filter((s) => s.status === "retired").length,
      color: "#6B7280",
    },
  ].filter((item) => item.value > 0);

  if (systems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Risk Distribution */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{i("inv.chartRiskDist")}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={riskDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {riskDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Systems Added Timeline */}
      {timelineData.length > 1 && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{i("inv.chartTimeline")}</h3>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{i("inv.chartCategory")}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryChartData}>
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: "#6B7280" }}
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
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{i("inv.chartStatus")}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
