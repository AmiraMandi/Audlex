/**
 * Shared application types derived from DB schema and server action return shapes.
 * Import these in client components instead of using `any`.
 */
import type {
  AiSystem,
  RiskAssessment,
  Document as DbDocument,
  ComplianceItem,
  Organization,
  Alert,
  User,
} from "@/lib/db/schema";

// Re-export schema types for convenience
export type { AiSystem, RiskAssessment, ComplianceItem, Organization, Alert, User };
export type { Obligation } from "@/lib/db/schema";

// Alias to avoid conflict with global Document
export type AppDocument = DbDocument;

// ============================================================
// AI SYSTEMS
// ============================================================

/** AiSystem extended with latest risk assessment data */
export interface AiSystemWithRisk extends AiSystem {
  riskLevel: string | null;
  isProhibited: boolean;
}

// ============================================================
// DASHBOARD
// ============================================================

/** Return type of getDashboardStats() */
export interface DashboardStats {
  totalSystems: number;
  classifiedSystems: number;
  totalDocuments: number;
  complianceScore: number;
  completedItems: number;
  totalItems: number;
  unreadAlerts: number;
}

/** Return type of getRecentActivity() */
export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: Date;
  userName: string | null;
}

// ============================================================
// TEAM
// ============================================================

/** Subset of User returned by getTeamMembers() */
export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// ============================================================
// AUDIT LOG
// ============================================================

/** Full audit log entry for the audit-log page (from getAuditLog) */
export interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: unknown;
  createdAt: Date;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
}

// ============================================================
// COMPLIANCE STATUS ENUM (for client-side usage)
// ============================================================

export type ComplianceStatus = "pending" | "in_progress" | "completed" | "not_applicable";

export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal";

export type DocumentStatus = "draft" | "review" | "approved" | "expired";

export type AlertSeverity = "info" | "warning" | "critical";

export type PlanType = "free" | "starter" | "business" | "enterprise" | "consultora";

// ============================================================
// CONSULTORA
// ============================================================

export interface ConsultoraClient {
  id: string;
  consultoraOrgId: string;
  clientOrgId: string;
  createdAt: Date;
  clientOrg?: {
    name: string;
    size: string;
    plan: string;
  };
}

export interface ClientDashboardStats {
  systems: number;
  documents: number;
  assessments: number;
}
