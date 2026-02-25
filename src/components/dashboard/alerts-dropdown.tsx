"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { getAlerts, markAlertRead } from "@/app/actions";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

type Alert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
};

const severityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle2,
};

const severityColors: Record<string, string> = {
  info: "text-blue-500 bg-blue-50",
  warning: "text-amber-500 bg-amber-50",
  error: "text-red-500 bg-red-50",
  success: "text-green-500 bg-green-50",
};

export function AlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return i("alerts.now");
    if (seconds < 3600) return i("alerts.minutesAgo", { n: Math.floor(seconds / 60) });
    if (seconds < 86400) return i("alerts.hoursAgo", { n: Math.floor(seconds / 3600) });
    return i("alerts.daysAgo", { n: Math.floor(seconds / 86400) });
  }

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data as Alert[]);
    } catch {
      // not authenticated
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(alertId: string) {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    const unread = alerts.filter((a) => !a.isRead);
    await Promise.all(unread.map((a) => markAlertRead(a.id)));
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadAlerts();
        }}
        className="relative rounded-lg p-2 hover:bg-surface-tertiary transition"
      >
        <Bell className="h-5 w-5 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[384px] rounded-xl border border-border bg-surface-secondary shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text">{i("alerts.title")}</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {i("alerts.markAllRead")}
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-text-muted hover:text-text" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && alerts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">{i("alerts.empty")}</p>
              </div>
            ) : (
              alerts.slice(0, 20).map((alert) => {
                const Icon = severityIcons[alert.severity] || Info;
                const colors = severityColors[alert.severity] || severityColors.info;

                return (
                  <button
                    key={alert.id}
                    onClick={() => handleMarkRead(alert.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-surface-tertiary transition ${
                      !alert.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className={`rounded-lg p-1.5 mt-0.5 ${colors}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!alert.isRead ? "font-semibold text-text" : "text-text-secondary"}`}>
                          {alert.title}
                        </p>
                        {!alert.isRead && (
                          <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                        )}
                      </div>
                      {alert.message && (
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                          {alert.message}
                        </p>
                      )}
                      <p className="text-xs text-text-muted mt-1">{timeAgo(alert.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
