/**
 * Tests for shared types to ensure type definitions compile correctly
 * and match expected shapes.
 */
import { describe, it, expect } from "vitest";
import type {
  AiSystemWithRisk,
  DashboardStats,
  ActivityLogEntry,
  TeamMember,
  AuditLogRow,
  ComplianceStatus,
  RiskLevel,
  DocumentStatus,
  PlanType,
  ConsultoraClient,
  ClientDashboardStats,
} from "@/types";

describe("types – compile-time validation", () => {
  it("DashboardStats has correct shape", () => {
    const stats: DashboardStats = {
      totalSystems: 5,
      classifiedSystems: 3,
      totalDocuments: 10,
      complianceScore: 75,
      completedItems: 15,
      totalItems: 20,
      unreadAlerts: 2,
    };
    expect(stats.totalSystems).toBe(5);
    expect(stats.complianceScore).toBe(75);
  });

  it("AiSystemWithRisk extends AiSystem", () => {
    const system: AiSystemWithRisk = {
      id: "123",
      organizationId: "org-1",
      name: "Test System",
      category: "chatbot",
      purpose: "Customer support",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      description: null,
      provider: null,
      providerModel: null,
      dataTypes: null,
      dataVolume: null,
      affectedPersons: null,
      numberOfAffected: null,
      sectorUse: null,
      isAutonomousDecision: false,
      hasHumanOversight: true,
      deploymentDate: null,
      notes: null,
      createdBy: null,
      riskLevel: "high",
      isProhibited: false,
    };
    expect(system.riskLevel).toBe("high");
    expect(system.isProhibited).toBe(false);
  });

  it("ActivityLogEntry matches expected shape", () => {
    const entry: ActivityLogEntry = {
      id: "log-1",
      action: "system.created",
      entityType: "aiSystem",
      entityId: "sys-1",
      createdAt: new Date(),
      userName: "Test User",
    };
    expect(entry.action).toBe("system.created");
  });

  it("ComplianceStatus includes all valid values", () => {
    const statuses: ComplianceStatus[] = ["pending", "in_progress", "completed", "not_applicable"];
    expect(statuses).toHaveLength(4);
  });

  it("RiskLevel includes all valid values", () => {
    const levels: RiskLevel[] = ["unacceptable", "high", "limited", "minimal"];
    expect(levels).toHaveLength(4);
  });

  it("PlanType includes all valid values", () => {
    const plans: PlanType[] = ["free", "starter", "business", "enterprise", "consultora"];
    expect(plans).toHaveLength(5);
  });

  it("TeamMember has correct shape", () => {
    const member: TeamMember = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: new Date(),
    };
    expect(member.role).toBe("admin");
  });

  it("AuditLogRow matches getAuditLog return shape", () => {
    const row: AuditLogRow = {
      id: "log-1",
      action: "document.generated",
      entityType: "document",
      entityId: "doc-1",
      changes: { type: "risk_management" },
      createdAt: new Date(),
      userId: "user-1",
      userName: "Admin",
      userEmail: "admin@test.com",
    };
    expect(row.entityType).toBe("document");
    expect(row.changes).toEqual({ type: "risk_management" });
  });

  it("ConsultoraClient has expected properties", () => {
    const client: ConsultoraClient = {
      id: "link-1",
      consultoraOrgId: "org-1",
      clientOrgId: "org-2",
      createdAt: new Date(),
    };
    expect(client.consultoraOrgId).toBe("org-1");
  });

  it("ClientDashboardStats has numeric properties", () => {
    const stats: ClientDashboardStats = {
      systems: 3,
      documents: 7,
      assessments: 2,
    };
    expect(stats.systems).toBe(3);
  });
});
