"use client";

import {
  Activity,
  User,
  Cpu,
  FileText,
  CheckSquare,
  Shield,
  Settings,
  Bell,
  Clock,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { AuditLogRow } from "@/types";

const entityIcons: Record<string, typeof Activity> = {
  user: User,
  aiSystem: Cpu,
  document: FileText,
  compliance: CheckSquare,
  riskAssessment: Shield,
  settings: Settings,
  alert: Bell,
  org: Settings,
};

const actionColors: Record<string, string> = {
  created: "bg-green-500/10 text-green-600 border-green-500/20",
  updated: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  deleted: "bg-red-500/10 text-red-600 border-red-500/20",
  generated: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  invited: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  removed: "bg-red-500/10 text-red-600 border-red-500/20",
  role_changed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  evidence_uploaded: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

function getActionColor(action: string): string {
  const actionType = action.split(".").pop() || "";
  return actionColors[actionType] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
}

interface AuditLogContentProps {
  logs: AuditLogRow[];
}

export function AuditLogContent({ logs }: AuditLogContentProps) {
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  function getTimeDiff(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return i("log.now");
    if (diffMin < 60) return i("log.minutesAgo", { n: diffMin });
    if (diffHrs < 24) return i("log.hoursAgo", { n: diffHrs });
    if (diffDays < 7) return i("log.daysAgo", { n: diffDays });
    return d.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{i("log.title")}</h1>
          <p className="text-text-secondary mt-1">
            {i("log.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">{i("log.count", { count: logs.length })}</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-secondary p-12 text-center">
          <Activity className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">{i("log.empty")}</h2>
          <p className="text-text-secondary text-sm">
            {i("log.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => {
            const Icon = entityIcons[log.entityType] || Activity;
            const colorClass = getActionColor(log.action);

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-surface-secondary px-5 py-4 hover:border-brand-500/10 transition"
              >
                <div className={`rounded-lg p-2 border ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-text">
                      {i(`log.action.${log.action}`)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
                      {log.entityType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.userName || log.userEmail || "Sistema"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeDiff(log.createdAt)}
                    </span>
                  </div>
                  {!!log.changes && Object.keys(log.changes as Record<string, unknown>).length > 0 && (
                    <div className="mt-2 text-xs text-text-muted bg-surface rounded-lg px-3 py-2 border border-border">
                      {Object.entries(log.changes as Record<string, unknown>).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          <span>{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap hidden sm:block">
                  {new Date(log.createdAt).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
