/**
 * ============================================================
 * Audlex — Checklist Progress Charts
 * ============================================================
 * 
 * Visualizations for compliance checklist progress:
 * - Completion timeline (% over time)
 * - Category breakdown (completed/pending per category)
 * - Time-to-complete average stats
 */

"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

interface ComplianceItem {
  id: string;
  status: "pending" | "in_progress" | "completed" | "not_applicable";
  category: string | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
}

interface ChecklistChartsProps {
  items: ComplianceItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  risk_management: "#DC2626",
  data_governance: "#2563EB",
  technical_documentation: "#7C3AED",
  transparency: "#059669",
  human_oversight: "#D97706",
  accuracy_robustness: "#0891B2",
  post_market_monitoring: "#DB2777",
  registration: "#EA580C",
  conformity_assessment: "#6366F1",
  ai_literacy: "#10B981",
};

export function ChecklistCharts({ items }: ChecklistChartsProps) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  // Category breakdown
  const categoryStats = items.reduce((acc: Record<string, { completed: number; pending: number; total: number }>, item) => {
    const category = item.category || "general";
    if (!acc[category]) {
      acc[category] = { completed: 0, pending: 0, total: 0 };
    }
    acc[category].total++;
    if (item.status === "completed") {
      acc[category].completed++;
    } else if (item.status !== "not_applicable") {
      acc[category].pending++;
    }
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    category: i(`ck.cat.${category}`),
    completed: stats.completed,
    pending: stats.pending,
    percentage: Math.round((stats.completed / stats.total) * 100),
    color: CATEGORY_COLORS[category] || "#6B7280",
  }));

  // Timeline data (completion over time)
  const completedItems = items
    .filter((item) => item.status === "completed" && item.completedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt!).getTime();
      const dateB = new Date(b.completedAt!).getTime();
      return dateA - dateB;
    });

  const timelineData: { week: string; completed: number; percentage: number }[] = [];
  
  if (completedItems.length > 0) {
    const startDate = new Date(completedItems[0].completedAt!);
    const endDate = new Date();
    const currentDate = new Date(startDate);
    
    let cumulativeCompleted = 0;
    
    while (currentDate <= endDate) {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const completedThisWeek = completedItems.filter((item) => {
        const itemDate = new Date(item.completedAt!);
        return itemDate >= currentDate && itemDate <= weekEnd;
      }).length;
      
      cumulativeCompleted += completedThisWeek;
      
      const weekLabel = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
      const percentage = Math.round((cumulativeCompleted / items.length) * 100);
      
      timelineData.push({
        week: weekLabel,
        completed: cumulativeCompleted,
        percentage,
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  // Average time to complete
  const completedWithTime = items.filter(
    (item) => item.status === "completed" && item.completedAt && item.createdAt
  );
  
  const avgDaysToComplete = completedWithTime.length > 0
    ? Math.round(
        completedWithTime.reduce((sum, item) => {
          const created = new Date(item.createdAt).getTime();
          const completed = new Date(item.completedAt!).getTime();
          return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / completedWithTime.length
      )
    : 0;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Completion Timeline */}
      {timelineData.length > 1 && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">{i("ck.chartTimeline")}</h3>
            <div className="text-sm text-text-muted">
              {i("ck.avgDays")}: <span className="font-semibold text-text-primary">{avgDaysToComplete}</span> {i("ck.days")}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                label={{ value: i("ck.completed"), angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#6B7280" } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                label={{ value: "%", angle: 90, position: "insideRight", style: { fontSize: 12, fill: "#6B7280" } }}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="completed"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ fill: "#2563EB", r: 3 }}
                name={i("ck.completed")}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: "#059669", r: 3 }}
                name={i("ck.percentage")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{i("ck.chartCategory")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar dataKey="completed" fill="#059669" name={i("ck.completed")} radius={[0, 4, 4, 0]} />
            <Bar dataKey="pending" fill="#D97706" name={i("ck.pending")} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("ck.totalItems")}</p>
          <p className="text-2xl font-bold text-text-primary">{items.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("ck.completionRate")}</p>
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round((items.filter((i) => i.status === "completed").length / items.length) * 100)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-text-muted mb-1">{i("ck.avgDays")}</p>
          <p className="text-2xl font-bold text-text-primary">{avgDaysToComplete} {i("ck.days")}</p>
        </div>
      </div>
    </div>
  );
}
