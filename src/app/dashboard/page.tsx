import { getDashboardStats, getDashboardCharts, getRecentActivity } from "@/app/actions";
import { DashboardContent } from "./dashboard-content";
import type { ActivityLogEntry } from "@/types";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Dashboard",
};

function daysUntil() {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  // Redirect to onboarding if not completed
  let shouldRedirectToOnboarding = false;
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
          .select({ onboardingCompleted: organizations.onboardingCompleted })
          .from(organizations)
          .where(eq(organizations.id, dbUser.organizationId))
          .limit(1);

        if (org && !org.onboardingCompleted) {
          shouldRedirectToOnboarding = true;
        }
      }
    }
  } catch {
    // User not authenticated — layout will handle redirect
  }

  if (shouldRedirectToOnboarding) {
    redirect("/dashboard/onboarding");
  }

  // Consultora plan → redirect to consultora panel
  try {
    const supabase2 = await createSupabaseServer();
    const { data: { user: authUser2 } } = await supabase2.auth.getUser();
    if (authUser2) {
      const [dbUser2] = await db
        .select({ organizationId: users.organizationId })
        .from(users)
        .where(eq(users.authProviderId, authUser2.id))
        .limit(1);
      if (dbUser2) {
        const [org2] = await db
          .select({ plan: organizations.plan })
          .from(organizations)
          .where(eq(organizations.id, dbUser2.organizationId))
          .limit(1);
        if (org2?.plan === "consultora") {
          redirect("/dashboard/consultora");
        }
      }
    }
  } catch (e: unknown) {
    // redirect() throws a special error — rethrow it
    if (e && typeof e === "object" && "digest" in e) throw e;
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
