import { notFound, redirect } from "next/navigation";
import { getAiSystem, getDocuments, getComplianceItems } from "@/app/actions";
import { db } from "@/lib/db";
import { riskAssessments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SystemDetailContent } from "./system-detail-content";
import type { AppDocument, ComplianceItem, RiskAssessment } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let system;
  try {
    system = await getAiSystem(id);
  } catch {
    return { title: "Sistema no encontrado" };
  }
  return { title: system ? `${system.name} - Inventario IA` : "Sistema no encontrado" };
}

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let system;
  try {
    system = await getAiSystem(id);
  } catch {
    redirect("/login");
  }

  if (!system) notFound();

  // Get related data
  let documents: AppDocument[] = [];
  let complianceItems: ComplianceItem[] = [];
  let assessment: RiskAssessment | null = null;

  try {
    documents = await getDocuments(id);
  } catch {}
  try {
    complianceItems = await getComplianceItems(id);
  } catch {}
  try {
    const assessments = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.aiSystemId, id))
      .orderBy(desc(riskAssessments.assessedAt))
      .limit(1);
    assessment = assessments[0] || null;
  } catch {}

  return (
    <SystemDetailContent
      system={system}
      documents={documents}
      complianceItems={complianceItems}
      assessment={assessment}
      systemId={id}
    />
  );
}
