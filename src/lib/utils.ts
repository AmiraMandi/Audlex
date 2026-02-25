import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function daysUntilDeadline(): number {
  const deadline = new Date("2026-08-02");
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getPlanLimits(plan: string) {
  const limits: Record<string, { maxSystems: number; maxUsers: number; features: string[] }> = {
    free: {
      maxSystems: 1,
      maxUsers: 1,
      features: ["classification", "basic_report"],
    },
    starter: {
      maxSystems: 5,
      maxUsers: 2,
      features: ["classification", "basic_report", "documents", "checklist", "pdf_export"],
    },
    business: {
      maxSystems: 25,
      maxUsers: 5,
      features: ["classification", "basic_report", "documents", "checklist", "pdf_export", "alerts", "dashboard", "audit_log", "docx_export"],
    },
    enterprise: {
      maxSystems: -1, // Unlimited
      maxUsers: -1,
      features: ["classification", "basic_report", "documents", "checklist", "pdf_export", "alerts", "dashboard", "audit_log", "docx_export", "api", "priority_support"],
    },
    consultora: {
      maxSystems: -1,
      maxUsers: -1,
      features: ["classification", "basic_report", "documents", "checklist", "pdf_export", "alerts", "dashboard", "audit_log", "docx_export", "whitelabel", "multi_client"],
    },
  };
  return limits[plan] || limits.free;
}
