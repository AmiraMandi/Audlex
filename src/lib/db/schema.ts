import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  date,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const orgSizeEnum = pgEnum("org_size", [
  "micro",    // < 10 empleados
  "small",    // 10-49
  "medium",   // 50-249
  "large",    // 250+
]);

export const planEnum = pgEnum("plan", [
  "free",
  "starter",
  "business",
  "enterprise",
  "consultora",
]);

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const aiSystemStatusEnum = pgEnum("ai_system_status", [
  "active",
  "planned",
  "retired",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "unacceptable", // Prohibido (Art. 5)
  "high",         // Alto riesgo (Anexo III)
  "limited",      // Riesgo limitado (Art. 50)
  "minimal",      // Riesgo mínimo
]);

export const documentTypeEnum = pgEnum("document_type", [
  "risk_management",           // Sistema Gestión Riesgos (Art. 9)
  "technical_file",            // Ficha Técnica (Art. 11 + Anexo IV)
  "impact_assessment",         // Evaluación Impacto Derechos Fund. (Art. 27)
  "data_governance",           // Plan Gobernanza Datos (Art. 10)
  "human_oversight",           // Protocolo Supervisión Humana (Art. 14)
  "post_market_monitoring",    // Plan Monitorización (Art. 72)
  "activity_logging",          // Registro Actividades (Art. 12)
  "conformity_declaration",    // Declaración Conformidad UE (Art. 47)
  "instructions_for_use",      // Instrucciones de Uso (Art. 13)
  "transparency_notice",       // Aviso Transparencia (Art. 50)
  "content_labeling_policy",   // Política Etiquetado IA
  "ai_usage_policy",           // Política Uso IA Organización
  "ai_inventory",              // Inventario Sistemas IA (Art. 4)
]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "review",
  "approved",
  "expired",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "pending",
  "in_progress",
  "completed",
  "not_applicable",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "deadline",
  "regulation_update",
  "compliance_gap",
  "document_expiry",
  "system_review",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

// ============================================================
// TABLES
// ============================================================

// --- Organizaciones (multi-tenant) ---
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  cifNif: text("cif_nif"),
  sector: text("sector"),                    // Código CNAE o sector general
  sectorDescription: text("sector_description"),
  size: orgSizeEnum("size").notNull().default("micro"),
  country: text("country").notNull().default("ES"),
  website: text("website"),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  maxAiSystems: integer("max_ai_systems").notNull().default(1), // Límite según plan
  maxUsers: integer("max_users").notNull().default(1),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Usuarios ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("member"),
  authProviderId: text("auth_provider_id").notNull().unique(), // Supabase Auth UID
  avatarUrl: text("avatar_url"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_users_org_id").on(t.organizationId),
  index("idx_users_auth_provider").on(t.authProviderId),
]);

// --- Sistemas de IA inventariados ---
export const aiSystems = pgTable("ai_systems", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),                         // "Chatbot Atención al Cliente"
  description: text("description"),
  provider: text("provider"),                            // "OpenAI", "Interno", "Salesforce"
  providerModel: text("provider_model"),                 // "GPT-4", "Claude", "Custom"
  category: text("category").notNull(),                  // chatbot, scoring, analytics, rrhh, biometria...
  purpose: text("purpose").notNull(),                    // Para qué se usa
  dataTypes: jsonb("data_types").$type<string[]>(),      // Tipos de datos que procesa
  dataVolume: text("data_volume"),                       // Volumen estimado
  affectedPersons: jsonb("affected_persons").$type<string[]>(), // empleados, clientes, ciudadanos...
  numberOfAffected: text("number_of_affected"),          // Estimación de personas afectadas
  sectorUse: text("sector_use"),                         // Sector donde se usa
  isAutonomousDecision: boolean("is_autonomous_decision").default(false), // ¿Toma decisiones autónomas?
  hasHumanOversight: boolean("has_human_oversight").default(true),
  deploymentDate: date("deployment_date"),
  status: aiSystemStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_ai_systems_org_id").on(t.organizationId),
  index("idx_ai_systems_category").on(t.category),
  index("idx_ai_systems_status").on(t.status),
]);

// --- Evaluaciones de riesgo ---
export const riskAssessments = pgTable("risk_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  aiSystemId: uuid("ai_system_id").references(() => aiSystems.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  isProhibited: boolean("is_prohibited").notNull().default(false),
  prohibitionReason: text("prohibition_reason"),          // Si es prohibido, por qué
  applicableArticles: jsonb("applicable_articles").$type<string[]>(), // ["Art. 6", "Anexo III.4"]
  obligations: jsonb("obligations").$type<Obligation[]>(), // Lista de obligaciones
  assessmentData: jsonb("assessment_data"),                // Respuestas completas del cuestionario
  assessmentScore: integer("assessment_score"),             // Puntuación numérica 0-100
  recommendations: jsonb("recommendations").$type<string[]>(),
  assessedBy: uuid("assessed_by").references(() => users.id),
  version: integer("version").notNull().default(1),
  assessedAt: timestamp("assessed_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_risk_assessments_system_id").on(t.aiSystemId),
  index("idx_risk_assessments_org_id").on(t.organizationId),
]);

// --- Documentos generados ---
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  aiSystemId: uuid("ai_system_id").references(() => aiSystems.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  type: documentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: jsonb("content"),                              // Contenido estructurado
  fileUrl: text("file_url"),                              // URL en Supabase Storage
  fileFormat: text("file_format").default("pdf"),
  status: documentStatusEnum("status").notNull().default("draft"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  version: integer("version").notNull().default(1),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_documents_org_id").on(t.organizationId),
  index("idx_documents_system_id").on(t.aiSystemId),
  index("idx_documents_type").on(t.type),
  index("idx_documents_status").on(t.status),
]);

// --- Items del checklist de compliance ---
export const complianceItems = pgTable("compliance_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  aiSystemId: uuid("ai_system_id").references(() => aiSystems.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  article: text("article").notNull(),                     // "Art. 9" o "Art. 14.1"
  requirement: text("requirement").notNull(),              // Descripción del requisito
  category: text("category"),                              // Categoría agrupadora
  status: complianceStatusEnum("status").notNull().default("pending"),
  evidenceUrl: text("evidence_url"),
  evidenceDocumentId: uuid("evidence_document_id").references(() => documents.id),
  notes: text("notes"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  completedBy: uuid("completed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_compliance_items_org_id").on(t.organizationId),
  index("idx_compliance_items_system_id").on(t.aiSystemId),
  index("idx_compliance_items_status").on(t.status),
]);

// --- Alertas ---
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  type: alertTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_alerts_org_id").on(t.organizationId),
  index("idx_alerts_is_read").on(t.isRead),
  index("idx_alerts_created_at").on(t.createdAt),
]);

// --- Audit Log (inmutable) ---
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb("changes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("idx_audit_log_org_id").on(t.organizationId),
  index("idx_audit_log_created_at").on(t.createdAt),
  index("idx_audit_log_user_id").on(t.userId),
]);

// --- White-label config (consultoras) ---
export const whitelabelConfig = pgTable("whitelabel_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull().unique(),
  brandName: text("brand_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#2563EB"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#1E40AF"),
  customDomain: text("custom_domain"),
  emailFrom: text("email_from"),
  footerText: text("footer_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Clientes de consultora ---
export const consultoraClients = pgTable("consultora_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultoraOrgId: uuid("consultora_org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  clientOrgId: uuid("client_org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("idx_consultora_clients_unique").on(t.consultoraOrgId, t.clientOrgId),
  index("idx_consultora_clients_consultora").on(t.consultoraOrgId),
]);

// ============================================================
// RELATIONS
// ============================================================

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users: many(users),
  aiSystems: many(aiSystems),
  documents: many(documents),
  complianceItems: many(complianceItems),
  alerts: many(alerts),
  auditLog: many(auditLog),
  whitelabelConfig: one(whitelabelConfig),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const aiSystemsRelations = relations(aiSystems, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [aiSystems.organizationId],
    references: [organizations.id],
  }),
  riskAssessments: many(riskAssessments),
  documents: many(documents),
  complianceItems: many(complianceItems),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  aiSystem: one(aiSystems, {
    fields: [riskAssessments.aiSystemId],
    references: [aiSystems.id],
  }),
  organization: one(organizations, {
    fields: [riskAssessments.organizationId],
    references: [organizations.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  aiSystem: one(aiSystems, {
    fields: [documents.aiSystemId],
    references: [aiSystems.id],
  }),
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================
// TYPES
// ============================================================

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AiSystem = typeof aiSystems.$inferSelect;
export type NewAiSystem = typeof aiSystems.$inferInsert;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type NewRiskAssessment = typeof riskAssessments.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type ComplianceItem = typeof complianceItems.$inferSelect;
export type Alert = typeof alerts.$inferSelect;

export interface Obligation {
  article: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  priority: "critical" | "high" | "medium" | "low";
}
