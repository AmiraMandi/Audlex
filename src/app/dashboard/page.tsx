import { getDashboardStats, getDashboardCharts, getRecentActivity } from "@/app/actions";
import { DashboardContent } from "./dashboard-content";
import type { ActivityLogEntry } from "@/types";

export const metadata = {
  title: "Dashboard",
};

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  let data = {
    totalSystems: 0,
    classifiedSystems: 0,
    complianceScore: 0,
    totalDocuments: 0,
    completedItems: 0,
    totalItems: 0,
    unreadAlerts: 0,
  };
  let charts: {
    riskDistribution: Array<{ name: string; value: number }>;
    systemsByCategory: Array<{ name: string; value: number }>;
    documentsByStatus: Array<{ name: string; value: number }>;
    complianceCategories: Array<{ category: string; total: number; completed: number; percentage: number }>;
  } = {
    riskDistribution: [],
    systemsByCategory: [],
    documentsByStatus: [],
    complianceCategories: [],
  };
  let recentActivity: ActivityLogEntry[] = [];

  try {
    const results = await Promise.all([
      getDashboardStats(),
      getDashboardCharts(),
      getRecentActivity(5),
    ]);
    data = results[0];
    charts = results[1];
    recentActivity = results[2];
  } catch {
    // user not authenticated or no org — will show empty state
  }

  const days = daysUntil();

  return <DashboardContent data={data} days={days} recentActivity={recentActivity} charts={charts} />;
}
