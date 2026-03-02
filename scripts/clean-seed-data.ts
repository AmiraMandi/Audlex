/**
 * Limpia TODOS los datos de prueba de la primera organización.
 * Uso: npx tsx scripts/clean-seed-data.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import {
  aiSystems,
  riskAssessments,
  documents,
  complianceItems,
  alerts,
  auditLog,
  organizations,
  users,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function cleanSeedData() {
  console.log("🧹 Limpiando datos de prueba...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL no está definida");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const [org] = await db.select().from(organizations).limit(1);
    if (!org) {
      console.error("❌ No se encontró organización.");
      process.exit(1);
    }

    console.log(`🏢 Organización: ${org.name} (${org.id})\n`);

    // Borrar en orden por dependencias (FK)
    const deleted = {
      alerts: 0,
      auditLog: 0,
      complianceItems: 0,
      documents: 0,
      riskAssessments: 0,
      aiSystems: 0,
    };

    // 1. Alerts
    const delAlerts = await db.delete(alerts).where(eq(alerts.organizationId, org.id)).returning();
    deleted.alerts = delAlerts.length;
    console.log(`  🔔 ${deleted.alerts} alertas eliminadas`);

    // 2. Audit log
    const delLog = await db.delete(auditLog).where(eq(auditLog.organizationId, org.id)).returning();
    deleted.auditLog = delLog.length;
    console.log(`  📋 ${deleted.auditLog} registros de auditoría eliminados`);

    // 3. Compliance items
    const delItems = await db.delete(complianceItems).where(eq(complianceItems.organizationId, org.id)).returning();
    deleted.complianceItems = delItems.length;
    console.log(`  ✅ ${deleted.complianceItems} requisitos de compliance eliminados`);

    // 4. Documents
    try {
      const delDocs = await db.delete(documents).where(eq(documents.organizationId, org.id)).returning();
      deleted.documents = delDocs.length;
    } catch { /* table may not exist */ }
    console.log(`  📄 ${deleted.documents} documentos eliminados`);

    // 5. Risk assessments
    try {
      const delAssessments = await db.delete(riskAssessments).where(eq(riskAssessments.organizationId, org.id)).returning();
      deleted.riskAssessments = delAssessments.length;
    } catch { /* table may not exist */ }
    console.log(`  ⚖️  ${deleted.riskAssessments} evaluaciones de riesgo eliminadas`);

    // 6. AI Systems
    try {
      const delSystems = await db.delete(aiSystems).where(eq(aiSystems.organizationId, org.id)).returning();
      deleted.aiSystems = delSystems.length;
    } catch { /* table may not exist */ }
    console.log(`  🤖 ${deleted.aiSystems} sistemas de IA eliminados`);

    // Reset onboarding
    await db
      .update(organizations)
      .set({ onboardingCompleted: false })
      .where(eq(organizations.id, org.id));
    console.log(`\n  🔄 Onboarding reseteado`);

    console.log("\n✅ ¡Datos de prueba eliminados! Dashboard limpio.");
    console.log("   Tu cuenta y organización siguen intactas.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanSeedData();
