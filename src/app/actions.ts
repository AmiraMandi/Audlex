"use server";

import { db } from "@/lib/db";
import { aiSystems, riskAssessments, organizations, users, documents, complianceItems, alerts, auditLog, consultoraClients } from "@/lib/db/schema";
import type { Obligation, AiSystem } from "@/lib/db/schema";
import { createSupabaseServer } from "@/lib/supabase/server";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { classifyRisk, type ClassificationAnswer, type Locale } from "@/lib/ai-act/classifier";
import { assertPermission, type UserRole } from "@/lib/rbac";
import {
  generateDocument,
  documentToMarkdown,
  getDocumentTemplates,
  type DocumentTemplateType,
} from "@/lib/documents/generators";

// Bilingual helper for server actions (no React context available)
function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

// ============================================================
// AUDIT LOG HELPER
// ============================================================

async function logAction(
  userId: string,
  organizationId: string,
  action: string,
  entityType: string,
  entityId?: string,
  changes?: Record<string, unknown>
) {
  try {
    await db.insert(auditLog).values({
      organizationId,
      userId,
      action,
      entityType,
      entityId: entityId || undefined,
      changes: changes || undefined,
    });
  } catch {
    // Audit log failures should never break the main flow
    console.error("Failed to write audit log");
  }
}

// ============================================================
// AUTH HELPER
// ============================================================

async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) throw new Error("No autenticado / Not authenticated");

  // Try to find existing user
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, authUser.id))
    .limit(1);

  // Auto-provision if user doesn't exist yet (e.g. OAuth signup)
  if (!user) {
    user = await provisionUser(
      authUser.id,
      authUser.email || "",
      authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
      authUser.user_metadata?.avatar_url
    );
  }

  return user;
}

// ============================================================
// USER PROVISIONING
// ============================================================

export async function provisionUser(
  authId: string,
  email: string,
  name: string,
  avatarUrl?: string,
  companyName?: string,
  sector?: string,
  size?: string
) {
  // Check if user already exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, authId))
    .limit(1);

  if (existing) return existing;

  // Create organization first
  const [org] = await db
    .insert(organizations)
    .values({
      name: companyName || `${name}'s Company`,
      sector: sector || undefined,
      size: (size as "micro" | "small" | "medium" | "large") || "micro",
      plan: "free",
      maxAiSystems: 1,
      maxUsers: 1,
    })
    .returning();

  // Create user linked to org
  const [user] = await db
    .insert(users)
    .values({
      organizationId: org.id,
      email,
      name,
      role: "owner",
      authProviderId: authId,
      avatarUrl: avatarUrl || undefined,
      lastLoginAt: new Date(),
    })
    .returning();

  // Log the action
  await logAction(user.id, org.id, "user.created", "user", user.id, { email, name });

  // Send welcome email (non-blocking)
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail({ to: email, name, locale: "es" });
  } catch {
    console.error("Failed to send welcome email");
  }

  return user;
}

// ============================================================
// AI SYSTEMS
// ============================================================

const createSystemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  provider: z.string().optional(),
  providerModel: z.string().optional(),
  category: z.string().min(1),
  purpose: z.string().min(1),
  dataTypes: z.array(z.string()).optional(),
  affectedPersons: z.array(z.string()).optional(),
  numberOfAffected: z.string().optional(),
  isAutonomousDecision: z.boolean().optional(),
  hasHumanOversight: z.boolean().optional(),
  status: z.enum(["active", "planned", "retired"]).optional(),
  notes: z.string().optional(),
});

export type CreateSystemInput = z.infer<typeof createSystemSchema>;

export async function createAiSystem(input: CreateSystemInput) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "systems.create");
  const parsed = createSystemSchema.parse(input);

  // Check plan limits
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  if (!org) throw new Error("Organisation not found / Organización no encontrada");

  const existingSystems = await db
    .select()
    .from(aiSystems)
    .where(eq(aiSystems.organizationId, org.id));

  if (org.maxAiSystems > 0 && existingSystems.length >= org.maxAiSystems) {
    throw new Error(
      `You have reached the limit of ${org.maxAiSystems} systems for your plan. / Has alcanzado el límite de ${org.maxAiSystems} sistemas para tu plan.`
    );
  }

  const [system] = await db
    .insert(aiSystems)
    .values({
      ...parsed,
      organizationId: org.id,
      createdBy: user.id,
    })
    .returning();

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");

  await logAction(user.id, user.organizationId, "ai_system.created", "aiSystem", system.id, {
    name: parsed.name,
    category: parsed.category,
  });

  return system;
}

export async function getAiSystems() {
  const user = await getCurrentUser();

  return db
    .select()
    .from(aiSystems)
    .where(eq(aiSystems.organizationId, user.organizationId))
    .orderBy(desc(aiSystems.createdAt));
}

/** Get all systems with their latest risk assessment level */
export async function getAiSystemsWithRisk() {
  const user = await getCurrentUser();

  const systems = await db
    .select()
    .from(aiSystems)
    .where(eq(aiSystems.organizationId, user.organizationId))
    .orderBy(desc(aiSystems.createdAt));

  // Get latest risk assessment per system in one query
  const assessments = await db
    .select({
      aiSystemId: riskAssessments.aiSystemId,
      riskLevel: riskAssessments.riskLevel,
      isProhibited: riskAssessments.isProhibited,
    })
    .from(riskAssessments)
    .where(eq(riskAssessments.organizationId, user.organizationId));

  // Build a map: systemId -> latest risk level
  const riskMap = new Map<string, { riskLevel: string; isProhibited: boolean }>();
  for (const a of assessments) {
    // If system already in map, keep latest (they're all valid, just pick one)
    if (!riskMap.has(a.aiSystemId)) {
      riskMap.set(a.aiSystemId, { riskLevel: a.riskLevel, isProhibited: a.isProhibited });
    }
  }

  return systems.map((s) => ({
    ...s,
    riskLevel: riskMap.get(s.id)?.riskLevel ?? null,
    isProhibited: riskMap.get(s.id)?.isProhibited ?? false,
  }));
}

export async function getAiSystem(id: string) {
  const user = await getCurrentUser();

  const [system] = await db
    .select()
    .from(aiSystems)
    .where(
      and(
        eq(aiSystems.id, id),
        eq(aiSystems.organizationId, user.organizationId)
      )
    )
    .limit(1);

  return system || null;
}

export async function updateAiSystem(id: string, input: Partial<CreateSystemInput>) {
  const user = await getCurrentUser();

  const [updated] = await db
    .update(aiSystems)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(aiSystems.id, id),
        eq(aiSystems.organizationId, user.organizationId)
      )
    )
    .returning();

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");

  return updated;
}

export async function deleteAiSystem(id: string) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "systems.delete");

  await db
    .delete(aiSystems)
    .where(
      and(
        eq(aiSystems.id, id),
        eq(aiSystems.organizationId, user.organizationId)
      )
    );

  await logAction(user.id, user.organizationId, "ai_system.deleted", "aiSystem", id);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
}

// ============================================================
// RISK ASSESSMENT
// ============================================================

export async function runClassification(
  aiSystemId: string,
  answers: ClassificationAnswer[],
  locale: Locale = "es"
) {
  const user = await getCurrentUser();

  // Verify ownership
  const [system] = await db
    .select()
    .from(aiSystems)
    .where(
      and(
        eq(aiSystems.id, aiSystemId),
        eq(aiSystems.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!system) throw new Error(locale === "en" ? "System not found" : "Sistema no encontrado");

  // Run the classifier
  const result = classifyRisk(answers, locale);

  // Get the latest version number
  const existing = await db
    .select()
    .from(riskAssessments)
    .where(eq(riskAssessments.aiSystemId, aiSystemId))
    .orderBy(desc(riskAssessments.version))
    .limit(1);

  const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

  // Save assessment
  const [assessment] = await db
    .insert(riskAssessments)
    .values({
      aiSystemId,
      organizationId: user.organizationId,
      riskLevel: result.riskLevel,
      isProhibited: result.isProhibited,
      prohibitionReason: result.prohibitionReasons.join("; "),
      applicableArticles: result.applicableArticles,
      obligations: result.obligations,
      assessmentData: answers,
      assessmentScore: result.score,
      recommendations: result.recommendations,
      assessedBy: user.id,
      version: nextVersion,
    })
    .returning();

  revalidatePath("/dashboard/clasificador");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");

  // Log
  await logAction(user.id, user.organizationId, "assessment.created", "riskAssessment", assessment.id, {
    aiSystemId,
    riskLevel: result.riskLevel,
    score: result.score,
  });

  // Send classification complete email (non-blocking)
  try {
    const { sendClassificationCompleteEmail } = await import("@/lib/email");
    await sendClassificationCompleteEmail({
      to: user.email,
      systemName: system.name,
      riskLevel: result.riskLevel,
      obligationCount: result.obligations.length,
      locale,
    });
  } catch {
    // Email failure should not block the flow
  }

  return { assessment, result };
}

export async function getLatestAssessment(aiSystemId: string) {
  const user = await getCurrentUser();

  const [assessment] = await db
    .select()
    .from(riskAssessments)
    .where(
      and(
        eq(riskAssessments.aiSystemId, aiSystemId),
        eq(riskAssessments.organizationId, user.organizationId)
      )
    )
    .orderBy(desc(riskAssessments.version))
    .limit(1);

  return assessment || null;
}

// ============================================================
// ORGANIZATION
// ============================================================

export async function getCurrentOrganization() {
  const user = await getCurrentUser();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);
  return org || null;
}

export async function updateOrganization(input: {
  name?: string;
  cifNif?: string;
  sector?: string;
  sectorDescription?: string;
  size?: "micro" | "small" | "medium" | "large";
  website?: string;
}) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "org.update");
  const [updated] = await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, user.organizationId))
    .returning();
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracion");
  return updated;
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function generateAndSaveDocument(
  type: DocumentTemplateType,
  aiSystemId?: string,
  locale: Locale = "es"
) {
  const user = await getCurrentUser();
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  if (!org) throw new Error(msg(locale, "Organización no encontrada", "Organisation not found"));

  let system = null;
  let assessment = null;
  let allSystems: AiSystem[] = [];

  if (aiSystemId) {
    const [s] = await db
      .select()
      .from(aiSystems)
      .where(
        and(eq(aiSystems.id, aiSystemId), eq(aiSystems.organizationId, org.id))
      )
      .limit(1);
    system = s || null;

    if (system) {
      const [a] = await db
        .select()
        .from(riskAssessments)
        .where(eq(riskAssessments.aiSystemId, aiSystemId))
        .orderBy(desc(riskAssessments.version))
        .limit(1);
      assessment = a || null;
    }
  }

  // For policy documents, get all systems
  if (type === "ai_usage_policy" || type === "ai_inventory") {
    allSystems = await db
      .select()
      .from(aiSystems)
      .where(eq(aiSystems.organizationId, org.id));
  }

  if (!system && type !== "ai_usage_policy" && type !== "ai_inventory") {
    throw new Error(locale === "en" ? "AI system required for this document type" : "Sistema de IA requerido para este tipo de documento");
  }

  const generated = generateDocument(
    type,
    org,
    system!,
    assessment,
    allSystems,
    locale
  );

  const template = getDocumentTemplates(locale)[type];

  // Check for existing version
  const existing = aiSystemId
    ? await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.organizationId, org.id),
            eq(documents.type, type),
            eq(documents.aiSystemId, aiSystemId)
          )
        )
        .orderBy(desc(documents.version))
        .limit(1)
    : await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.organizationId, org.id),
            eq(documents.type, type)
          )
        )
        .orderBy(desc(documents.version))
        .limit(1);

  const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

  const [doc] = await db
    .insert(documents)
    .values({
      organizationId: org.id,
      aiSystemId: aiSystemId || null,
      type,
      title: generated.title,
      content: generated as unknown as Record<string, unknown>,
      status: "draft",
      version: nextVersion,
      createdBy: user.id,
    })
    .returning();

  revalidatePath("/dashboard/documentacion");
  revalidatePath("/dashboard");

  // Log
  await logAction(user.id, user.organizationId, "document.generated", "document", doc.id, {
    type,
    title: generated.title,
    aiSystemId,
  });

  // Send document generated email (non-blocking)
  try {
    const { sendDocumentGeneratedEmail } = await import("@/lib/email");
    await sendDocumentGeneratedEmail({
      to: user.email,
      documentTitle: generated.title,
      systemName: system?.name || (locale === "en" ? "Organisation" : "Organización"),
      locale,
    });
  } catch {
    // Email failure should not block the flow
  }

  return { document: doc, generated, markdown: documentToMarkdown(generated, locale) };
}

export async function getDocuments(aiSystemId?: string) {
  const user = await getCurrentUser();

  if (aiSystemId) {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.organizationId, user.organizationId),
          eq(documents.aiSystemId, aiSystemId)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  return db
    .select()
    .from(documents)
    .where(eq(documents.organizationId, user.organizationId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocument(id: string) {
  const user = await getCurrentUser();
  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, id),
        eq(documents.organizationId, user.organizationId)
      )
    )
    .limit(1);
  return doc || null;
}

export async function updateDocumentStatus(
  id: string,
  status: "draft" | "review" | "approved" | "expired"
) {
  const user = await getCurrentUser();
  const [updated] = await db
    .update(documents)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === "approved" ? { approvedBy: user.id, approvedAt: new Date() } : {}),
    })
    .where(
      and(
        eq(documents.id, id),
        eq(documents.organizationId, user.organizationId)
      )
    )
    .returning();
  revalidatePath("/dashboard/documentacion");
  return updated;
}

export async function deleteDocument(id: string) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "documents.delete");
  await db
    .delete(documents)
    .where(
      and(
        eq(documents.id, id),
        eq(documents.organizationId, user.organizationId)
      )
    );
  await logAction(user.id, user.organizationId, "document.deleted", "document", id);
  revalidatePath("/dashboard/documentacion");
}

// ============================================================
// COMPLIANCE ITEMS
// ============================================================

export async function generateComplianceItems(aiSystemId: string) {
  const user = await getCurrentUser();

  // Get the latest assessment
  const [assessment] = await db
    .select()
    .from(riskAssessments)
    .where(
      and(
        eq(riskAssessments.aiSystemId, aiSystemId),
        eq(riskAssessments.organizationId, user.organizationId)
      )
    )
    .orderBy(desc(riskAssessments.version))
    .limit(1);

  if (!assessment) throw new Error(msg("es", "Primero debes clasificar el sistema de IA", "You must classify the AI system first"));

  // Delete existing items for this system
  await db
    .delete(complianceItems)
    .where(
      and(
        eq(complianceItems.aiSystemId, aiSystemId),
        eq(complianceItems.organizationId, user.organizationId)
      )
    );

  // Generate items from obligations
  const obligations = (assessment.obligations as Obligation[]) || [];
  const items = obligations.map((obl) => ({
    aiSystemId,
    organizationId: user.organizationId,
    article: obl.article,
    requirement: `${obl.title}: ${obl.description}`,
    category: obl.category,
    status: "pending" as const,
    dueDate: obl.deadline === "2 agosto 2026" ? "2026-08-02" : null,
  }));

  // Add universal items
  const universalItems = [
    {
      article: "Art. 4",
      requirement: "AI Literacy / Alfabetización en IA: Ensure staff operating the system have sufficient competencies / Asegurar que el personal que opera el sistema tiene competencias suficientes",
      category: "ai_literacy",
      status: "pending" as const,
      dueDate: null,
    },
    {
      article: "Art. 4",
      requirement: "Inventory registration / Registro en inventario: The system must be documented in the AI systems inventory / El sistema debe estar documentado en el inventario de sistemas de IA",
      category: "registration",
      status: "pending" as const,
      dueDate: null,
    },
  ];

  const allItems = [...items, ...universalItems].map((item) => ({
    ...item,
    aiSystemId,
    organizationId: user.organizationId,
  }));

  if (allItems.length > 0) {
    await db.insert(complianceItems).values(allItems);
  }

  revalidatePath("/dashboard/checklist");
  revalidatePath("/dashboard");

  return allItems.length;
}

export async function getComplianceItems(aiSystemId?: string) {
  const user = await getCurrentUser();

  if (aiSystemId) {
    return db
      .select()
      .from(complianceItems)
      .where(
        and(
          eq(complianceItems.organizationId, user.organizationId),
          eq(complianceItems.aiSystemId, aiSystemId)
        )
      )
      .orderBy(complianceItems.article);
  }

  return db
    .select()
    .from(complianceItems)
    .where(eq(complianceItems.organizationId, user.organizationId))
    .orderBy(complianceItems.article);
}

export async function updateComplianceItemStatus(
  id: string,
  status: "pending" | "in_progress" | "completed" | "not_applicable",
  notes?: string,
  evidenceUrl?: string
) {
  const user = await getCurrentUser();

  const [updated] = await db
    .update(complianceItems)
    .set({
      status,
      notes: notes || undefined,
      evidenceUrl: evidenceUrl || undefined,
      ...(status === "completed"
        ? { completedAt: new Date(), completedBy: user.id }
        : { completedAt: null, completedBy: null }),
    })
    .where(
      and(
        eq(complianceItems.id, id),
        eq(complianceItems.organizationId, user.organizationId)
      )
    )
    .returning();

  revalidatePath("/dashboard/checklist");
  revalidatePath("/dashboard");

  return updated;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  const [systemsResult] = await db
    .select({ count: count() })
    .from(aiSystems)
    .where(eq(aiSystems.organizationId, orgId));

  const assessmentsResult = await db
    .select({ aiSystemId: riskAssessments.aiSystemId })
    .from(riskAssessments)
    .where(eq(riskAssessments.organizationId, orgId));

  const classifiedSystemIds = new Set(assessmentsResult.map((a) => a.aiSystemId));

  const [docsResult] = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.organizationId, orgId));

  const allComplianceItems = await db
    .select()
    .from(complianceItems)
    .where(eq(complianceItems.organizationId, orgId));

  const completedItems = allComplianceItems.filter((i) => i.status === "completed" || i.status === "not_applicable");
  const complianceScore =
    allComplianceItems.length > 0
      ? Math.round((completedItems.length / allComplianceItems.length) * 100)
      : 0;

  const [alertsResult] = await db
    .select({ count: count() })
    .from(alerts)
    .where(and(eq(alerts.organizationId, orgId), eq(alerts.isRead, false)));

  return {
    totalSystems: systemsResult.count,
    classifiedSystems: classifiedSystemIds.size,
    totalDocuments: docsResult.count,
    complianceScore,
    completedItems: completedItems.length,
    totalItems: allComplianceItems.length,
    unreadAlerts: alertsResult.count,
  };
}

export async function getDashboardCharts() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;

  // 1. Risk distribution
  const riskDistribution = await db
    .select({
      riskLevel: riskAssessments.riskLevel,
      count: count(),
    })
    .from(riskAssessments)
    .where(eq(riskAssessments.organizationId, orgId))
    .groupBy(riskAssessments.riskLevel);

  // 2. Systems by category
  const systemsByCategory = await db
    .select({
      category: aiSystems.category,
      count: count(),
    })
    .from(aiSystems)
    .where(eq(aiSystems.organizationId, orgId))
    .groupBy(aiSystems.category);

  // 3. Documents by status
  const documentsByStatus = await db
    .select({
      status: documents.status,
      count: count(),
    })
    .from(documents)
    .where(eq(documents.organizationId, orgId))
    .groupBy(documents.status);

  // 4. Compliance by category
  const complianceByCategory = await db
    .select({
      category: complianceItems.category,
      status: complianceItems.status,
    })
    .from(complianceItems)
    .where(eq(complianceItems.organizationId, orgId));

  // Group compliance by category
  const complianceGrouped = complianceByCategory.reduce((acc, item) => {
    const cat = item.category || "Sin categoría";
    if (!acc[cat]) {
      acc[cat] = { total: 0, completed: 0 };
    }
    acc[cat].total++;
    if (item.status === "completed" || item.status === "not_applicable") {
      acc[cat].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const complianceCategories = Object.entries(complianceGrouped).map(([category, data]) => ({
    category,
    total: data.total,
    completed: data.completed,
    percentage: Math.round((data.completed / data.total) * 100),
  }));

  return {
    riskDistribution: riskDistribution.map((r) => ({
      name: r.riskLevel,
      value: r.count,
    })),
    systemsByCategory: systemsByCategory.map((s) => ({
      name: s.category,
      value: s.count,
    })),
    documentsByStatus: documentsByStatus.map((d) => ({
      name: d.status,
      value: d.count,
    })),
    complianceCategories,
  };
}

// ============================================================
// ALERTS
// ============================================================

export async function getAlerts() {
  const user = await getCurrentUser();
  return db
    .select()
    .from(alerts)
    .where(eq(alerts.organizationId, user.organizationId))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertRead(id: string) {
  const user = await getCurrentUser();
  await db
    .update(alerts)
    .set({ isRead: true })
    .where(
      and(
        eq(alerts.id, id),
        eq(alerts.organizationId, user.organizationId)
      )
    );
  revalidatePath("/dashboard");
}

export async function createAlert(input: {
  type: "deadline" | "regulation_update" | "compliance_gap" | "document_expiry" | "system_review";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  actionUrl?: string;
}) {
  const user = await getCurrentUser();
  const [alert] = await db
    .insert(alerts)
    .values({
      organizationId: user.organizationId,
      ...input,
    })
    .returning();
  revalidatePath("/dashboard");
  return alert;
}

// ============================================================
// ASSESSMENTS LIST
// ============================================================

export async function getAssessments() {
  const user = await getCurrentUser();
  return db
    .select()
    .from(riskAssessments)
    .where(eq(riskAssessments.organizationId, user.organizationId))
    .orderBy(desc(riskAssessments.assessedAt));
}

// ============================================================
// TEAM MANAGEMENT
// ============================================================

export async function getTeamMembers() {
  const user = await getCurrentUser();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.organizationId, user.organizationId))
    .orderBy(users.createdAt);
}

export async function inviteTeamMember(email: string, role: "admin" | "member" | "viewer") {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.invite");

  // Check plan limits
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId))
    .limit(1);

  if (!org) throw new Error("Organisation not found / Organización no encontrada");

  const existingMembers = await db
    .select()
    .from(users)
    .where(eq(users.organizationId, org.id));

  if (org.maxUsers > 0 && existingMembers.length >= org.maxUsers) {
    throw new Error(
      `You have reached the limit of ${org.maxUsers} users for your plan. / Has alcanzado el límite de ${org.maxUsers} usuarios para tu plan.`
    );
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing && existing.organizationId === user.organizationId) {
    throw new Error("This user is already a member of your organisation / Este usuario ya es miembro de tu organización");
  }

  // Send invitation email
  try {
    const { sendAlertEmail } = await import("@/lib/email");
    await sendAlertEmail({
      to: email,
      alertTitle: "Invitation to Audlex / Invitación a Audlex",
      alertMessage: `${user.name} has invited you to join ${org.name} on Audlex. Sign up at https://audlex.com/registro / ${user.name} te ha invitado a unirse a ${org.name} en Audlex. Regístrate en https://audlex.com/registro`,
      severity: "info",
      locale: "es",
    });
  } catch {
    console.error("Failed to send invitation email");
  }

  await logAction(user.id, user.organizationId, "user.invited", "user", undefined, {
    invitedEmail: email,
    role,
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true, message: `Invitation sent to ${email} / Invitación enviada a ${email}` };
}

export async function updateTeamMemberRole(memberId: string, newRole: "admin" | "member" | "viewer") {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.changeRole");

  if (memberId === user.id) {
    throw new Error("You cannot change your own role / No puedes cambiar tu propio rol");
  }

  const [member] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, memberId),
        eq(users.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!member) throw new Error("Member not found / Miembro no encontrado");
  if (member.role === "owner") throw new Error("You cannot change the owner's role / No puedes cambiar el rol del propietario");

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, memberId));

  await logAction(user.id, user.organizationId, "user.role_changed", "user", memberId, {
    oldRole: member.role,
    newRole,
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

export async function removeTeamMember(memberId: string) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.remove");

  if (memberId === user.id) {
    throw new Error("You cannot remove yourself / No puedes eliminarte a ti mismo");
  }

  const [member] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, memberId),
        eq(users.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!member) throw new Error("Member not found / Miembro no encontrado");
  if (member.role === "owner") throw new Error("You cannot remove the owner / No puedes eliminar al propietario");

  await db
    .delete(users)
    .where(eq(users.id, memberId));

  await logAction(user.id, user.organizationId, "user.removed", "user", memberId, {
    removedEmail: member.email,
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

// ============================================================
// AUDIT LOG
// ============================================================

export async function getAuditLog(limit = 100, offset = 0) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "org.read");

  const logs = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      changes: auditLog.changes,
      createdAt: auditLog.createdAt,
      userId: auditLog.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(eq(auditLog.organizationId, user.organizationId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  return logs;
}

// ============================================================
// DELETE ACCOUNT & GDPR EXPORT
// ============================================================

export async function exportUserData() {
  const user = await getCurrentUser();

  const [org] = await db.select().from(organizations).where(eq(organizations.id, user.organizationId)).limit(1);
  const systemsList = await db.select().from(aiSystems).where(eq(aiSystems.organizationId, user.organizationId));
  const assessmentsList = await db.select().from(riskAssessments).where(eq(riskAssessments.organizationId, user.organizationId));
  const docsList = await db.select().from(documents).where(eq(documents.organizationId, user.organizationId));
  const complianceList = await db.select().from(complianceItems).where(eq(complianceItems.organizationId, user.organizationId));
  const alertsList = await db.select().from(alerts).where(eq(alerts.organizationId, user.organizationId));
  const logsList = await db.select().from(auditLog).where(eq(auditLog.organizationId, user.organizationId));

  return {
    exportDate: new Date().toISOString(),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    organization: org || null,
    aiSystems: systemsList,
    riskAssessments: assessmentsList,
    documents: docsList,
    complianceItems: complianceList,
    alerts: alertsList,
    auditLog: logsList,
  };
}

export async function deleteAccount() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServer();

  // Delete org (cascades to all child records)
  await db.delete(organizations).where(eq(organizations.id, user.organizationId));

  // Sign out the user
  await supabase.auth.signOut();

  return { success: true };
}

// ============================================================
// RECENT ACTIVITY
// ============================================================

export async function getRecentActivity(limit = 5) {
  const user = await getCurrentUser();

  const logs = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(eq(auditLog.organizationId, user.organizationId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return logs;
}

// ============================================================
// USER PROFILE
// ============================================================

export async function updateProfile(data: { name: string }) {
  const user = await getCurrentUser();

  const nameSchema = z.string().min(2).max(100);
  const name = nameSchema.parse(data.name);

  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await logAction(user.id, user.organizationId, "profile_updated", "user", user.id);

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

// ============================================================
// DOCUMENT CONTENT UPDATE
// ============================================================

export async function updateDocumentContent(docId: string, content: Record<string, unknown>) {
  const user = await getCurrentUser();

  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, docId),
        eq(documents.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!doc) throw new Error("Document not found / Documento no encontrado");

  await db
    .update(documents)
    .set({ content, updatedAt: new Date() })
    .where(eq(documents.id, docId));

  await logAction(user.id, user.organizationId, "document_updated", "document", docId);

  revalidatePath("/dashboard/documentacion");
  return { success: true };
}

// ============================================================
// GLOBAL SEARCH
// ============================================================

export async function globalSearch(query: string) {
  const user = await getCurrentUser();
  const q = `%${query.toLowerCase()}%`;

  const systemResults = await db
    .select({ id: aiSystems.id, name: aiSystems.name, category: aiSystems.category })
    .from(aiSystems)
    .where(
      and(
        eq(aiSystems.organizationId, user.organizationId),
        sql`LOWER(${aiSystems.name}) LIKE ${q}`
      )
    )
    .limit(5);

  const docResults = await db
    .select({ id: documents.id, title: documents.title, type: documents.type })
    .from(documents)
    .where(
      and(
        eq(documents.organizationId, user.organizationId),
        sql`LOWER(${documents.title}) LIKE ${q}`
      )
    )
    .limit(5);

  return { systems: systemResults, documents: docResults };
}

// ============================================================
// CONSULTORA MULTI-TENANT
// ============================================================

export async function getConsultoraClients() {
  const user = await getCurrentUser();

  // Check user's org is on consultora plan
  const [org] = await db.select().from(organizations).where(eq(organizations.id, user.organizationId)).limit(1);
  if (!org || org.plan !== "consultora") {
    throw new Error("Consultora plan required / Plan Consultora requerido");
  }

  const clients = await db
    .select({
      id: consultoraClients.id,
      clientOrgId: consultoraClients.clientOrgId,
      createdAt: consultoraClients.createdAt,
      orgName: organizations.name,
      orgPlan: organizations.plan,
      orgSize: organizations.size,
    })
    .from(consultoraClients)
    .innerJoin(organizations, eq(consultoraClients.clientOrgId, organizations.id))
    .where(eq(consultoraClients.consultoraOrgId, user.organizationId));

  return clients;
}

export async function addConsultoraClient(clientEmail: string) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "org.update");

  const [org] = await db.select().from(organizations).where(eq(organizations.id, user.organizationId)).limit(1);
  if (!org || org.plan !== "consultora") {
    throw new Error("Consultora plan required / Plan Consultora requerido");
  }

  // Find the client org by user email
  const [clientUser] = await db.select().from(users).where(eq(users.email, clientEmail)).limit(1);
  if (!clientUser) throw new Error("User not found / Usuario no encontrado");

  // Check not already linked
  const existing = await db.select().from(consultoraClients).where(
    and(
      eq(consultoraClients.consultoraOrgId, user.organizationId),
      eq(consultoraClients.clientOrgId, clientUser.organizationId)
    )
  ).limit(1);

  if (existing.length > 0) throw new Error("Client already linked / Cliente ya vinculado");

  await db.insert(consultoraClients).values({
    consultoraOrgId: user.organizationId,
    clientOrgId: clientUser.organizationId,
  });

  await logAction(user.id, user.organizationId, "consultora_client_added", "organization", clientUser.organizationId);

  revalidatePath("/dashboard/consultora");
  return { success: true };
}

export async function removeConsultoraClient(linkId: string) {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "org.update");

  await db.delete(consultoraClients).where(
    and(
      eq(consultoraClients.id, linkId),
      eq(consultoraClients.consultoraOrgId, user.organizationId)
    )
  );

  await logAction(user.id, user.organizationId, "consultora_client_removed", "organization", linkId);

  revalidatePath("/dashboard/consultora");
  return { success: true };
}

export async function getClientDashboardStats(clientOrgId: string) {
  const user = await getCurrentUser();

  // Verify consultora relationship
  const [link] = await db.select().from(consultoraClients).where(
    and(
      eq(consultoraClients.consultoraOrgId, user.organizationId),
      eq(consultoraClients.clientOrgId, clientOrgId)
    )
  ).limit(1);

  if (!link) throw new Error("Unauthorized access / Acceso no autorizado");

  const [systemCount] = await db.select({ count: count() }).from(aiSystems).where(eq(aiSystems.organizationId, clientOrgId));
  const [docCount] = await db.select({ count: count() }).from(documents).where(eq(documents.organizationId, clientOrgId));
  const [assessmentCount] = await db.select({ count: count() }).from(riskAssessments).where(eq(riskAssessments.organizationId, clientOrgId));

  return {
    totalSystems: systemCount?.count || 0,
    totalDocuments: docCount?.count || 0,
    totalAssessments: assessmentCount?.count || 0,
  };
}
