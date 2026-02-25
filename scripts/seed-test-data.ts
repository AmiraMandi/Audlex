import { config } from "dotenv";
import { resolve } from "path";

// Cargar variables de entorno desde .env.local
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

async function seedTestData() {
  console.log("🌱 Iniciando seed de datos de prueba...\n");
  
  // Crear conexión directamente con la URL
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL no está definida");
    process.exit(1);
  }
  
  console.log(`📊 Conectando a la base de datos...`);
  const client = postgres(connectionString, {
    max: 1,
  });
  const db = drizzle(client, { schema });
  console.log(`✅ Conexión establecida\n`);

  try {
    // 1. Obtener la primera organización y usuario
    const [org] = await db.select().from(organizations).limit(1);
    const [user] = await db.select().from(users).limit(1);

    if (!org || !user) {
      console.error("❌ No se encontró organización o usuario. Crea una cuenta primero.");
      process.exit(1);
    }

    console.log(`✅ Usando organización: ${org.name}`);
    console.log(`✅ Usando usuario: ${user.email}\n`);

    // 2. Crear sistemas de IA de prueba
    console.log("📦 Creando sistemas de IA...");

    const systemsData = [
      {
        name: "Chatbot de Atención al Cliente",
        description: "Sistema de IA conversacional que responde consultas de clientes 24/7",
        provider: "OpenAI",
        providerModel: "GPT-4",
        category: "chatbot",
        purpose: "Automatizar respuestas a consultas frecuentes y resolver incidencias básicas",
        dataTypes: ["nombre", "email", "historial_conversaciones", "datos_pedido"],
        dataVolume: "10,000-50,000 conversaciones/mes",
        affectedPersons: ["clientes", "prospectos"],
        numberOfAffected: "~25,000 usuarios únicos/mes",
        sectorUse: "E-commerce / Retail",
        isAutonomousDecision: false,
        hasHumanOversight: true,
        deploymentDate: "2024-06-01",
        status: "active" as const,
      },
      {
        name: "Sistema de Scoring Crediticio",
        description: "Modelo de ML para evaluar riesgo crediticio de solicitantes de préstamos",
        provider: "Interno",
        providerModel: "XGBoost Custom",
        category: "scoring",
        purpose: "Predecir probabilidad de impago y aprobar/rechazar solicitudes de crédito",
        dataTypes: ["ingresos", "historial_crediticio", "empleo", "edad", "datos_bancarios"],
        dataVolume: "5,000 evaluaciones/mes",
        affectedPersons: ["solicitantes_credito"],
        numberOfAffected: "~5,000 personas/mes",
        sectorUse: "Servicios Financieros",
        isAutonomousDecision: true,
        hasHumanOversight: true,
        deploymentDate: "2023-09-15",
        status: "active" as const,
      },
      {
        name: "Filtro de CVs con IA",
        description: "Sistema que analiza y clasifica CVs para procesos de selección",
        provider: "HireVue",
        providerModel: "Proprietario",
        category: "recruitment",
        purpose: "Preseleccionar candidatos basándose en requisitos del puesto",
        dataTypes: ["cv", "experiencia_laboral", "formacion", "skills"],
        dataVolume: "1,000 CVs/mes",
        affectedPersons: ["candidatos_empleo"],
        numberOfAffected: "~1,000 personas/mes",
        sectorUse: "Recursos Humanos",
        isAutonomousDecision: false,
        hasHumanOversight: true,
        deploymentDate: "2024-01-10",
        status: "active" as const,
      },
      {
        name: "Sistema de Reconocimiento Facial",
        description: "Control de acceso biométrico en instalaciones",
        provider: "Microsoft Azure",
        providerModel: "Face API",
        category: "biometrics",
        purpose: "Verificar identidad de empleados para acceso a áreas restringidas",
        dataTypes: ["imagen_facial", "datos_biometricos", "registro_accesos"],
        dataVolume: "500 accesos/día",
        affectedPersons: ["empleados"],
        numberOfAffected: "~80 empleados",
        sectorUse: "Seguridad Corporativa",
        isAutonomousDecision: false,
        hasHumanOversight: true,
        deploymentDate: "2024-03-20",
        status: "active" as const,
      },
      {
        name: "Asistente de Análisis Médico",
        description: "Sistema que ayuda a detectar anomalías en radiografías",
        provider: "Interno",
        providerModel: "ResNet-50 Custom",
        category: "healthcare",
        purpose: "Asistir a radiólogos en la detección temprana de patologías",
        dataTypes: ["imagenes_medicas", "historico_clinico"],
        dataVolume: "200 análisis/día",
        affectedPersons: ["pacientes"],
        numberOfAffected: "~4,000 pacientes/mes",
        sectorUse: "Salud",
        isAutonomousDecision: false,
        hasHumanOversight: true,
        deploymentDate: "2024-02-01",
        status: "planned" as const,
      },
    ];

    const createdSystems = [];
    for (const systemData of systemsData) {
      const [system] = await db
        .insert(aiSystems)
        .values({
          organizationId: org.id,
          createdBy: user.id,
          ...systemData,
        })
        .returning();
      createdSystems.push(system);
      console.log(`  ✓ ${system.name}`);
    }

    // 3. Crear evaluaciones de riesgo
    console.log("\n🎯 Creando evaluaciones de riesgo...");

    const riskData = [
      {
        systemId: createdSystems[0].id, // Chatbot
        riskLevel: "minimal" as const,
        isProhibited: false,
        applicableArticles: ["Art. 50 - Transparencia"],
        assessmentScore: 35,
        recommendations: [
          "Implementar aviso claro de uso de IA",
          "Permitir escalado a humano en cualquier momento",
          "Documentar capacidades y limitaciones",
        ],
      },
      {
        systemId: createdSystems[1].id, // Scoring
        riskLevel: "high" as const,
        isProhibited: false,
        applicableArticles: ["Anexo III.5.b - Acceso a servicios esenciales", "Art. 6-15"],
        assessmentScore: 78,
        recommendations: [
          "OBLIGATORIO: Sistema de gestión de riesgos (Art. 9)",
          "OBLIGATORIO: Evaluación de impacto en derechos fundamentales (Art. 27)",
          "OBLIGATORIO: Gobernanza y calidad de datos (Art. 10)",
          "OBLIGATORIO: Supervisión humana efectiva (Art. 14)",
          "OBLIGATORIO: Logging completo de decisiones (Art. 12)",
        ],
      },
      {
        systemId: createdSystems[2].id, // CVs
        riskLevel: "high" as const,
        isProhibited: false,
        applicableArticles: ["Anexo III.4 - Empleo y RRHH", "Art. 6-15"],
        assessmentScore: 72,
        recommendations: [
          "OBLIGATORIO: Evaluación de impacto en derechos fundamentales",
          "OBLIGATORIO: Auditoría de sesgos algorítmicos",
          "Implementar explicabilidad de decisiones",
          "Documentación técnica completa",
        ],
      },
      {
        systemId: createdSystems[3].id, // Facial
        riskLevel: "high" as const,
        isProhibited: false,
        applicableArticles: ["Anexo III.1 - Identificación biométrica", "Art. 6-15"],
        assessmentScore: 85,
        recommendations: [
          "OBLIGATORIO: Evaluación conformidad por tercero (Art. 43)",
          "OBLIGATORIO: Registro en base de datos UE (Art. 71)",
          "OBLIGATORIO: Monitorización post-comercialización",
          "Consentimiento explícito informado de empleados",
          "Análisis de proporcionalidad y necesidad",
        ],
      },
      {
        systemId: createdSystems[4].id, // Médico
        riskLevel: "high" as const,
        isProhibited: false,
        applicableArticles: ["Anexo III.2 - Infraestructuras críticas (salud)", "Art. 6-15"],
        assessmentScore: 88,
        recommendations: [
          "OBLIGATORIO: Certificación como producto sanitario (MDR)",
          "OBLIGATORIO: Evaluación clínica rigurosa",
          "Sistema de gestión de riesgos médicos",
          "Validación exhaustiva con datos clínicos",
          "Supervisión médica obligatoria en toda decisión",
        ],
      },
    ];

    for (let i = 0; i < riskData.length; i++) {
      const risk = riskData[i];
      await db.insert(riskAssessments).values({
        aiSystemId: risk.systemId,
        organizationId: org.id,
        riskLevel: risk.riskLevel,
        isProhibited: risk.isProhibited,
        applicableArticles: risk.applicableArticles,
        assessmentScore: risk.assessmentScore,
        recommendations: risk.recommendations,
        assessedBy: user.id,
        obligations: [],
        version: 1,
      });
      console.log(`  ✓ Evaluación para ${createdSystems[i].name} (${risk.riskLevel})`);
    }

    // 4. Crear documentos
    console.log("\n📄 Creando documentos...");

    const documentsData = [
      {
        aiSystemId: createdSystems[1].id,
        type: "technical_file" as const,
        title: "Ficha Técnica - Sistema Scoring Crediticio",
        status: "approved" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        type: "impact_assessment" as const,
        title: "FRIA - Sistema Scoring Crediticio",
        status: "review" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        type: "risk_management" as const,
        title: "Sistema de Gestión de Riesgos - Scoring",
        status: "draft" as const,
      },
      {
        aiSystemId: createdSystems[2].id,
        type: "technical_file" as const,
        title: "Ficha Técnica - Filtro CVs IA",
        status: "approved" as const,
      },
      {
        aiSystemId: createdSystems[3].id,
        type: "impact_assessment" as const,
        title: "FRIA - Reconocimiento Facial",
        status: "draft" as const,
      },
      {
        aiSystemId: null,
        type: "ai_inventory" as const,
        title: "Inventario General de Sistemas IA",
        status: "approved" as const,
      },
      {
        aiSystemId: null,
        type: "ai_usage_policy" as const,
        title: "Política de Uso de IA Corporativa",
        status: "review" as const,
      },
    ];

    for (const docData of documentsData) {
      await db.insert(documents).values({
        aiSystemId: docData.aiSystemId,
        organizationId: org.id,
        type: docData.type,
        title: docData.title,
        status: docData.status,
        createdBy: user.id,
        fileFormat: "pdf",
        content: { sections: [] },
      });
      console.log(`  ✓ ${docData.title}`);
    }

    // 5. Crear items de compliance
    console.log("\n✅ Creando items de checklist...");

    const complianceData = [
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 9",
        requirement: "Establecer sistema de gestión de riesgos",
        category: "Gestión de Riesgos",
        status: "in_progress" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 10",
        requirement: "Implementar gobernanza de datos",
        category: "Datos",
        status: "completed" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 11",
        requirement: "Elaborar documentación técnica",
        category: "Documentación",
        status: "completed" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 12",
        requirement: "Implementar logging automático",
        category: "Trazabilidad",
        status: "in_progress" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 13",
        requirement: "Crear instrucciones de uso",
        category: "Documentación",
        status: "pending" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 14",
        requirement: "Diseñar protocolo supervisión humana",
        category: "Supervisión Humana",
        status: "in_progress" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 15",
        requirement: "Asegurar precisión, robustez y ciberseguridad",
        category: "Técnico",
        status: "pending" as const,
      },
      {
        aiSystemId: createdSystems[1].id,
        article: "Art. 27",
        requirement: "Realizar FRIA (evaluación impacto)",
        category: "Derechos Fundamentales",
        status: "in_progress" as const,
      },
      {
        aiSystemId: createdSystems[2].id,
        article: "Art. 9",
        requirement: "Establecer sistema de gestión de riesgos",
        category: "Gestión de Riesgos",
        status: "pending" as const,
      },
      {
        aiSystemId: createdSystems[2].id,
        article: "Art. 10",
        requirement: "Implementar gobernanza de datos",
        category: "Datos",
        status: "pending" as const,
      },
    ];

    for (const item of complianceData) {
      await db.insert(complianceItems).values({
        aiSystemId: item.aiSystemId,
        organizationId: org.id,
        article: item.article,
        requirement: item.requirement,
        category: item.category,
        status: item.status,
        dueDate: "2026-08-02", // AI Act deadline
      });
    }
    console.log(`  ✓ ${complianceData.length} items creados`);

    // 6. Crear alertas
    console.log("\n🔔 Creando alertas...");

    const alertsData = [
      {
        type: "deadline" as const,
        title: "Plazo próximo: FRIA Sistema Scoring",
        message: "La Evaluación de Impacto en Derechos Fundamentales debe completarse antes del 2 de agosto de 2026",
        severity: "warning" as const,
        actionUrl: "/dashboard/documentacion",
      },
      {
        type: "compliance_gap" as const,
        title: "Requisito pendiente: Art. 12 Logging",
        message: "El sistema de scoring crediticio requiere implementar capacidades de logging automático",
        severity: "critical" as const,
        actionUrl: "/dashboard/checklist",
      },
      {
        type: "system_review" as const,
        title: "Revisión anual del Sistema de CVs",
        message: "Es recomendable realizar una revisión anual del filtro de CVs para detectar sesgos",
        severity: "info" as const,
        actionUrl: "/dashboard/inventario",
      },
      {
        type: "regulation_update" as const,
        title: "Actualización normativa disponible",
        message: "La Comisión Europea ha publicado nuevas guías sobre sistemas de IA de alto riesgo",
        severity: "info" as const,
        actionUrl: "/dashboard",
      },
      {
        type: "document_expiry" as const,
        title: "Documentación próxima a expirar",
        message: "La Ficha Técnica del chatbot debe actualizarse en los próximos 30 días",
        severity: "warning" as const,
        actionUrl: "/dashboard/documentacion",
      },
    ];

    for (const alert of alertsData) {
      await db.insert(alerts).values({
        organizationId: org.id,
        ...alert,
      });
      console.log(`  ✓ ${alert.title}`);
    }

    // 7. Crear entradas de audit log
    console.log("\n📊 Creando audit log...");

    const auditLogData = [
      {
        action: "ai_system.created",
        entityType: "ai_system",
        entityId: createdSystems[0].id,
        changes: { name: createdSystems[0].name },
      },
      {
        action: "ai_system.created",
        entityType: "ai_system",
        entityId: createdSystems[1].id,
        changes: { name: createdSystems[1].name },
      },
      {
        action: "risk_assessment.completed",
        entityType: "risk_assessment",
        entityId: createdSystems[1].id,
        changes: { riskLevel: "high", score: 78 },
      },
      {
        action: "document.approved",
        entityType: "document",
        changes: { type: "technical_file", title: "Ficha Técnica - Sistema Scoring" },
      },
      {
        action: "compliance_item.updated",
        entityType: "compliance_item",
        changes: { article: "Art. 10", status: "completed" },
      },
    ];

    for (const log of auditLogData) {
      await db.insert(auditLog).values({
        organizationId: org.id,
        userId: user.id,
        ...log,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Seed Script)",
      });
    }
    console.log(`  ✓ ${auditLogData.length} eventos registrados`);

    console.log("\n✨ ¡Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`   • ${createdSystems.length} sistemas de IA`);
    console.log(`   • ${riskData.length} evaluaciones de riesgo`);
    console.log(`   • ${documentsData.length} documentos`);
    console.log(`   • ${complianceData.length} items de compliance`);
    console.log(`   • ${alertsData.length} alertas`);
    console.log(`   • ${auditLogData.length} entradas de audit log`);
    console.log("\n🚀 Ahora puedes navegar por el dashboard con datos reales!");

    // Cerrar conexión
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al crear datos de prueba:", error);
    process.exit(1);
  }
}

seedTestData();
