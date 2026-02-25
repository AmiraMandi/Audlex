import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, users, complianceItems, aiSystems, alerts } from "@/lib/db/schema";
import { eq, and, lte, not, inArray } from "drizzle-orm";

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron)
// It checks for upcoming deadlines and sends reminder emails + creates alerts

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find compliance items with upcoming due dates that are not completed
    const upcomingItems = await db
      .select({
        item: complianceItems,
        system: aiSystems,
      })
      .from(complianceItems)
      .innerJoin(aiSystems, eq(aiSystems.id, complianceItems.aiSystemId))
      .where(
        and(
          lte(complianceItems.dueDate, thirtyDaysFromNow.toISOString().split("T")[0]),
          not(eq(complianceItems.status, "completed")),
          not(eq(complianceItems.status, "not_applicable"))
        )
      );

    if (upcomingItems.length === 0) {
      return NextResponse.json({ message: "No upcoming deadlines", alerts: 0, emails: 0 });
    }

    // Group by organization
    const byOrg = new Map<string, { items: typeof upcomingItems; urgent: boolean }>();
    for (const entry of upcomingItems) {
      const orgId = entry.item.organizationId;
      if (!byOrg.has(orgId)) {
        byOrg.set(orgId, { items: [], urgent: false });
      }
      const org = byOrg.get(orgId)!;
      org.items.push(entry);

      // Check if any item is within 7 days
      if (entry.item.dueDate && new Date(entry.item.dueDate) <= sevenDaysFromNow) {
        org.urgent = true;
      }
    }

    let alertsCreated = 0;
    let emailsSent = 0;

    for (const [orgId, { items, urgent }] of byOrg) {
      // Create alert for each organization with upcoming deadlines
      const severity = urgent ? "critical" : "warning";
      const pendingCount = items.length;

      await db.insert(alerts).values({
        organizationId: orgId,
        type: "deadline",
        title: urgent
          ? `⚠️ ${pendingCount} requisitos vencen en < 7 días / ${pendingCount} requirements due in < 7 days`
          : `${pendingCount} requisitos vencen en 30 días / ${pendingCount} requirements due in 30 days`,
        message: urgent
          ? `Tienes ${pendingCount} requisitos pendientes con fecha límite próxima. / You have ${pendingCount} pending requirements with upcoming deadlines.`
          : `Tienes ${pendingCount} requisitos pendientes en los próximos 30 días. / You have ${pendingCount} pending requirements in the next 30 days.`,
        severity,
        actionUrl: "/dashboard/checklist",
      });
      alertsCreated++;

      // Send email to org owner/admins
      const orgUsers = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.organizationId, orgId),
            inArray(users.role, ["owner", "admin"])
          )
        );

      try {
        const { sendDeadlineReminderEmail } = await import("@/lib/email");
        const daysToDeadline = Math.ceil(
          (new Date("2026-08-02").getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        for (const user of orgUsers) {
          await sendDeadlineReminderEmail({
            to: user.email,
            name: user.name,
            daysRemaining: daysToDeadline,
            pendingSystemsCount: [...new Set(items.map((i) => i.system.id))].length,
            pendingDocumentsCount: pendingCount,
          });
          emailsSent++;
        }
      } catch (err) {
        console.error("Failed to send deadline reminder:", err);
      }
    }

    return NextResponse.json({
      message: "Cron completed",
      organizations: byOrg.size,
      alerts: alertsCreated,
      emails: emailsSent,
    });
  } catch (error: unknown) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
