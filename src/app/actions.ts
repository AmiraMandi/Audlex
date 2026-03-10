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
// ALERT HELPER (fire-and-forget, never blocks)
// ============================================================

async function fireAlert(
  organizationId: string,
  input: {
    type: "deadline" | "regulation_update" | "compliance_gap" | "document_expiry" | "system_review";
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    actionUrl?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }
) {
  try {
    await db.insert(alerts).values({ organizationId, ...input });
  } catch {
    console.error("Failed to create alert");
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
  // Check if user already exists by authProviderId
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, authId))
    .limit(1);

  if (existing) return existing;

  // Check if user exists with same email but different auth provider
  // (e.g. re-registration after account deletion)
  const [existingByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingByEmail) {
    // Update the existing user's authProviderId to the new one
    const [updated] = await db
      .update(users)
      .set({
        authProviderId: authId,
        name,
        avatarUrl: avatarUrl || existingByEmail.avatarUrl,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingByEmail.id))
      .returning();
    return updated;
  }

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
    // Detect locale from headers (default to "es")
    const { headers } = await import("next/headers");
    const headerStore = await headers();
    const acceptLang = headerStore.get("accept-language") || "";
    const locale = acceptLang.toLowerCase().startsWith("en") ? "en" : "es";
    await sendWelcomeEmail({ to: email, name, locale });
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

export async function createAiSystem(input: CreateSystemInput): Promise<{ success: true; data: AiSystem } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "systems.create");
    const parsed = createSystemSchema.parse(input);

    // Check plan limits
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, user.organizationId))
      .limit(1);

    if (!org) return { success: false, error: "Organisation not found / Organización no encontrada" };

    const existingSystems = await db
      .select()
      .from(aiSystems)
      .where(eq(aiSystems.organizationId, org.id));

    if (org.maxAiSystems > 0 && existingSystems.length >= org.maxAiSystems) {
      return {
        success: false,
        error: `You have reached the limit of ${org.maxAiSystems} systems for your plan. / Has alcanzado el límite de ${org.maxAiSystems} sistemas para tu plan.`,
      };
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

    // Alert: new system registered
    await fireAlert(user.organizationId, {
      type: "system_review",
      title: `Sistema registrado: ${parsed.name}`,
      message: "Nuevo sistema de IA añadido al inventario. Clasifica su riesgo para continuar con el compliance.",
      severity: "info",
      actionUrl: `/dashboard/inventario`,
      relatedEntityType: "aiSystem",
      relatedEntityId: system.id,
    });

    return { success: true, data: system as AiSystem };
  } catch (err) {
    console.error("[createAiSystem] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAiSystems() {
  try {
    const user = await getCurrentUser();
    return db
      .select()
      .from(aiSystems)
      .where(eq(aiSystems.organizationId, user.organizationId))
      .orderBy(desc(aiSystems.createdAt));
  } catch {
    return [];
  }
}

/** Get all systems with their latest risk assessment level */
export async function getAiSystemsWithRisk() {
  try {
    const user = await getCurrentUser();
    const systems = await db
      .select()
      .from(aiSystems)
      .where(eq(aiSystems.organizationId, user.organizationId))
      .orderBy(desc(aiSystems.createdAt));

    // Get latest risk assessment per system in one query (ordered by date desc)
    const assessments = await db
      .select({
        aiSystemId: riskAssessments.aiSystemId,
        riskLevel: riskAssessments.riskLevel,
        isProhibited: riskAssessments.isProhibited,
      })
      .from(riskAssessments)
      .where(eq(riskAssessments.organizationId, user.organizationId))
      .orderBy(desc(riskAssessments.assessedAt));

    // Build a map: systemId -> latest risk level
    const riskMap = new Map<string, { riskLevel: string; isProhibited: boolean }>();
    for (const a of assessments) {
      if (!riskMap.has(a.aiSystemId)) {
        riskMap.set(a.aiSystemId, { riskLevel: a.riskLevel, isProhibited: a.isProhibited });
      }
    }

    return systems.map((s) => ({
      ...s,
      riskLevel: riskMap.get(s.id)?.riskLevel ?? null,
      isProhibited: riskMap.get(s.id)?.isProhibited ?? false,
    }));
  } catch {
    return [];
  }
}

export async function getAiSystem(id: string) {
  try {
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
  } catch {
    return null;
  }
}

export async function updateAiSystem(id: string, input: Partial<CreateSystemInput>): Promise<{ success: true; data: AiSystem } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "systems.update");

    // Validate and sanitize input — only allow known fields
    const parsed = createSystemSchema.partial().parse(input);

    const [updated] = await db
      .update(aiSystems)
      .set({
        ...parsed,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiSystems.id, id),
          eq(aiSystems.organizationId, user.organizationId)
        )
      )
      .returning();

    await logAction(user.id, user.organizationId, "ai_system.updated", "aiSystem", id);

    revalidatePath("/dashboard/inventario");
    revalidatePath("/dashboard");

    return { success: true, data: updated as AiSystem };
  } catch (err) {
    console.error("[updateAiSystem] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteAiSystem(id: string) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "systems.delete");

    const systemId = z.string().uuid().parse(id);

    await db
      .delete(aiSystems)
      .where(
        and(
          eq(aiSystems.id, systemId),
          eq(aiSystems.organizationId, user.organizationId)
        )
      );

    await logAction(user.id, user.organizationId, "ai_system.deleted", "aiSystem", systemId);

    revalidatePath("/dashboard/inventario");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ============================================================
// RISK ASSESSMENT
// ============================================================

export async function runClassification(
  aiSystemId: string,
  answers: ClassificationAnswer[],
  locale: Locale = "es"
): Promise<{ success: true; assessment: typeof riskAssessments.$inferSelect; result: ReturnType<typeof classifyRisk> } | { success: false; error: string }> {
  try {
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

    if (!system) {
      return { success: false, error: locale === "en" ? "System not found" : "Sistema no encontrado" };
    }

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

  // Alert: classification result
  const riskLabels: Record<string, string> = {
    unacceptable: "⛔ PROHIBIDO",
    high: "🔴 Alto riesgo",
    limited: "🟡 Riesgo limitado",
    minimal: "🟢 Riesgo mínimo",
  };
  const isHighRisk = result.riskLevel === "high" || result.riskLevel === "unacceptable";
  await fireAlert(user.organizationId, {
    type: isHighRisk ? "compliance_gap" : "system_review",
    title: `${system.name}: ${riskLabels[result.riskLevel] || result.riskLevel}`,
    message: isHighRisk
      ? "Este sistema requiere documentación obligatoria y supervisión humana según el EU AI Act."
      : "Clasificación completada. Genera la documentación correspondiente.",
    severity: isHighRisk ? "warning" : "info",
    actionUrl: `/dashboard/inventario/${aiSystemId}`,
    relatedEntityType: "riskAssessment",
    relatedEntityId: assessment.id,
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

  return { success: true, assessment, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Classification error" };
  }
}

export async function getLatestAssessment(aiSystemId: string) {
  try {
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
  } catch {
    return null;
  }
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

const updateOrgSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  cifNif: z.string().max(50).optional(),
  sector: z.string().max(100).optional(),
  sectorDescription: z.string().max(500).optional(),
  size: z.enum(["micro", "small", "medium", "large"]).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
});

export async function updateOrganization(input: {
  name?: string;
  cifNif?: string;
  sector?: string;
  sectorDescription?: string;
  size?: "micro" | "small" | "medium" | "large";
  website?: string;
}) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "org.update");
    const parsed = updateOrgSchema.parse(input);
    const [updated] = await db
      .update(organizations)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(organizations.id, user.organizationId))
      .returning();
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/configuracion");
    return updated;
  } catch (err) {
    console.error("[updateOrganization]", err);
    return null;
  }
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function generateAndSaveDocument(
  type: DocumentTemplateType,
  aiSystemId?: string,
  locale: Locale = "es"
): Promise<{ success: true; document: typeof documents.$inferSelect; generated: ReturnType<typeof generateDocument>; markdown: string } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser();
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, user.organizationId))
      .limit(1);

    if (!org) return { success: false, error: msg(locale, "Organización no encontrada", "Organisation not found") };

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
      return { success: false, error: locale === "en" ? "AI system required for this document type" : "Sistema de IA requerido para este tipo de documento" };
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

  // Alert: document generated
  await fireAlert(user.organizationId, {
    type: "system_review",
    title: `Documento generado: ${generated.title}`,
    message: "Revisa el contenido y apruébalo cuando esté listo.",
    severity: "info",
    actionUrl: `/dashboard/documentacion`,
    relatedEntityType: "document",
    relatedEntityId: doc.id,
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

  return { success: true, document: doc, generated, markdown: documentToMarkdown(generated, locale) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error generating document" };
  }
}

export async function getDocuments(aiSystemId?: string) {
  try {
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
  } catch {
    return [];
  }
}

export async function getDocument(id: string) {
  try {
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
  } catch {
    return null;
  }
}

export async function updateDocumentStatus(
  id: string,
  status: "draft" | "review" | "approved" | "expired"
) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "documents.update");
    const validStatus = z.enum(["draft", "review", "approved", "expired"]).parse(status);
    const [updated] = await db
      .update(documents)
      .set({
        status: validStatus,
        updatedAt: new Date(),
        ...(validStatus === "approved" ? { approvedBy: user.id, approvedAt: new Date() } : {}),
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
  } catch (err) {
    console.error("[updateDocumentStatus]", err);
    return null;
  }
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

export async function generateComplianceItems(aiSystemId: string, locale: Locale = "es"): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
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

    if (!assessment) {
      return { success: false, error: msg(locale, "Primero debes clasificar el sistema de IA en el Clasificador", "You must first classify the AI system in the Classifier") };
    }

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

    return { success: true, count: allItems.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : msg(locale, "Error al generar requisitos de compliance", "Error generating compliance requirements") };
  }
}

export async function getComplianceItems(aiSystemId?: string) {
  try {
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
  } catch {
    return [];
  }
}

export async function updateComplianceItemStatus(
  id: string,
  status: "pending" | "in_progress" | "completed" | "not_applicable",
  notes?: string,
  evidenceUrl?: string
) {
  try {
    const user = await getCurrentUser();
    const validStatus = z.enum(["pending", "in_progress", "completed", "not_applicable"]).parse(status);
    const safeNotes = notes ? z.string().max(5000).parse(notes) : undefined;
    const safeUrl = evidenceUrl ? z.string().max(2000).parse(evidenceUrl) : undefined;

    const [updated] = await db
      .update(complianceItems)
      .set({
        status: validStatus,
        notes: safeNotes,
        evidenceUrl: safeUrl,
        ...(validStatus === "completed"
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
  } catch (err) {
    console.error("[updateComplianceItemStatus]", err);
    return null;
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  try {
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
  } catch {
    return { totalSystems: 0, classifiedSystems: 0, totalDocuments: 0, complianceScore: 0, completedItems: 0, totalItems: 0, unreadAlerts: 0 };
  }
}

export async function getDashboardCharts() {
  try {
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
  } catch {
    return { riskDistribution: [], systemsByCategory: [], documentsByStatus: [], complianceCategories: [] };
  }
}

// ============================================================
// ALERTS
// ============================================================

export async function getAlerts() {
  try {
    const user = await getCurrentUser();
    return db
      .select()
      .from(alerts)
      .where(eq(alerts.organizationId, user.organizationId))
      .orderBy(desc(alerts.createdAt));
  } catch {
    return [];
  }
}

export async function markAlertRead(id: string) {
  try {
    const user = await getCurrentUser();
    const alertId = z.string().uuid().parse(id);
    await db
      .update(alerts)
      .set({ isRead: true })
      .where(
        and(
          eq(alerts.id, alertId),
          eq(alerts.organizationId, user.organizationId)
        )
      );
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("[markAlertRead]", err);
  }
}

const createAlertSchema = z.object({
  type: z.enum(["deadline", "regulation_update", "compliance_gap", "document_expiry", "system_review"]),
  title: z.string().min(1).max(500),
  message: z.string().min(1).max(2000),
  severity: z.enum(["info", "warning", "critical"]),
  actionUrl: z.string().max(500).optional(),
});

export async function createAlert(input: {
  type: "deadline" | "regulation_update" | "compliance_gap" | "document_expiry" | "system_review";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  actionUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    const parsed = createAlertSchema.parse(input);
    const [alert] = await db
      .insert(alerts)
      .values({
        ...parsed,
        organizationId: user.organizationId,  // Always override — never trust client
      })
      .returning();
    revalidatePath("/dashboard");
    return alert;
  } catch (err) {
    console.error("[createAlert]", err);
    return null;
  }
}

// ============================================================
// ASSESSMENTS LIST
// ============================================================

export async function getAssessments() {
  try {
    const user = await getCurrentUser();
    return db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.organizationId, user.organizationId))
      .orderBy(desc(riskAssessments.assessedAt));
  } catch {
    return [];
  }
}

// ============================================================
// TEAM MANAGEMENT
// ============================================================

export async function getTeamMembers() {
  try {
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
  } catch {
    return [];
  }
}

export async function inviteTeamMember(email: string, role: "admin" | "member" | "viewer") {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.invite");

  const inviteSchema = z.object({
    email: z.string().email().max(255),
    role: z.enum(["admin", "member", "viewer"]),
  });
  const parsed = inviteSchema.parse({ email, role });
  email = parsed.email;
  role = parsed.role;

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
  try {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.changeRole");

  const roleSchema = z.object({
    memberId: z.string().uuid(),
    newRole: z.enum(["admin", "member", "viewer"]),
  });
  const parsed = roleSchema.parse({ memberId, newRole });

  if (parsed.memberId === user.id) {
    throw new Error("You cannot change your own role / No puedes cambiar tu propio rol");
  }

  const [member] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, parsed.memberId),
        eq(users.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!member) throw new Error("Member not found / Miembro no encontrado");
  if (member.role === "owner") throw new Error("You cannot change the owner's role / No puedes cambiar el rol del propietario");

  await db
    .update(users)
    .set({ role: parsed.newRole, updatedAt: new Date() })
    .where(eq(users.id, parsed.memberId));

  await logAction(user.id, user.organizationId, "user.role_changed", "user", parsed.memberId, {
    oldRole: member.role,
    newRole: parsed.newRole,
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function removeTeamMember(memberId: string) {
  try {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "users.remove");

  const id = z.string().uuid().parse(memberId);

  if (id === user.id) {
    throw new Error("You cannot remove yourself / No puedes eliminarte a ti mismo");
  }

  const [member] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, id),
        eq(users.organizationId, user.organizationId)
      )
    )
    .limit(1);

  if (!member) throw new Error("Member not found / Miembro no encontrado");
  if (member.role === "owner") throw new Error("You cannot remove the owner / No puedes eliminar al propietario");

  await db
    .delete(users)
    .where(eq(users.id, id));

  await logAction(user.id, user.organizationId, "user.removed", "user", id, {
    removedEmail: member.email,
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ============================================================
// AUDIT LOG
// ============================================================

export async function getAuditLog(limit = 100, offset = 0) {
  try {
    const user = await getCurrentUser();
    assertPermission(user.role as UserRole, "org.read");
    limit = Math.min(Math.max(1, limit), 500);
    offset = Math.max(0, offset);
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
  } catch {
    return [];
  }
}

// ============================================================
// DELETE ACCOUNT & GDPR EXPORT
// ============================================================

export async function exportUserData() {
  const user = await getCurrentUser();
  assertPermission(user.role as UserRole, "org.update");

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
  assertPermission(user.role as UserRole, "org.delete");
  const supabase = await createSupabaseServer();

  // Log before deletion (audit trail)
  await logAction(user.id, user.organizationId, "account.deleted", "user", user.id);

  // Delete org (cascades to all child records)
  await db.delete(organizations).where(eq(organizations.id, user.organizationId));

  // Delete user from Supabase Auth (requires service role)
  // Uses admin API to fully remove the auth record
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabaseAdmin.auth.admin.deleteUser(user.authProviderId);
  } catch (err) {
    console.error("Failed to delete Supabase Auth user:", err);
  }

  // Sign out the user
  await supabase.auth.signOut();

  return { success: true };
}

// ============================================================
// RECENT ACTIVITY
// ============================================================

export async function getRecentActivity(limit = 5) {
  try {
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
  } catch {
    return [];
  }
}

// ============================================================
// USER PROFILE
// ============================================================

export async function updateProfile(data: { name: string }) {
  try {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ============================================================
// DOCUMENT CONTENT UPDATE
// ============================================================

export async function updateDocumentContent(docId: string, content: Record<string, unknown>) {
  try {
    const user = await getCurrentUser();
    const id = z.string().uuid().parse(docId);

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

    if (!doc) throw new Error("Document not found / Documento no encontrado");

    await db
      .update(documents)
      .set({ content, updatedAt: new Date() })
      .where(eq(documents.id, id));

    await logAction(user.id, user.organizationId, "document_updated", "document", id);

    revalidatePath("/dashboard/documentacion");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ============================================================
// GLOBAL SEARCH
// ============================================================

export async function globalSearch(query: string) {
  try {
    const user = await getCurrentUser();
    const trimmed = query.trim().slice(0, 200);
    if (trimmed.length < 1) return { systems: [], documents: [] };
    const q = `%${trimmed.toLowerCase()}%`;
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
  } catch {
    return { systems: [], documents: [] };
  }
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

  clientEmail = z.string().email().max(255).parse(clientEmail);

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
