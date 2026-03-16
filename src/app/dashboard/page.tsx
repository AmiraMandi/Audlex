import { getDashboardStats, getDashboardCharts, getRecentActivity } from "@/app/actions";
import { DashboardContent } from "./dashboard-content";
import type { ActivityLogEntry } from "@/types";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ClientRedirect } from "@/components/ui/client-redirect";

export const metadata = {
  title: "Dashboard",
};

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  // Single query to check onboarding + plan
  let shouldRedirectToOnboarding = false;
  let shouldRedirectToConsultora = false;

  try {
    const supabase = await createSupabaseServer();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const [dbUser] = await db
        .select({ organizationId: users.organizationId })
        .from(users)
        .where(eq(users.authProviderId, authUser.id))
        .limit(1);

      if (dbUser) {
        const [org] = await db
          .select({
            onboardingCompleted: organizations.onboardingCompleted,
            plan: organizations.plan,
          })
          .from(organizations)
          .where(eq(organizations.id, dbUser.organizationId))
          .limit(1);

        if (org && !org.onboardingCompleted) {
          shouldRedirectToOnboarding = true;
        } else if (org?.plan === "consultora") {
          shouldRedirectToConsultora = true;
        }
      }
    }
  } catch {
    // User not authenticated — layout will handle redirect
  }

  // Client-side redirects (avoids React hydration error #310 with server redirect during streaming)
  if (shouldRedirectToOnboarding) {
    return <ClientRedirect to="/dashboard/onboarding" />;
  }
  if (shouldRedirectToConsultora) {
    return <ClientRedirect to="/dashboard/consultora" />;
  }

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
