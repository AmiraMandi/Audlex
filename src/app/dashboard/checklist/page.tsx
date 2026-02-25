"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Shield,
  Filter,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Paperclip,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, RiskBadge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState, Alert } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { ChecklistCharts } from "@/components/dashboard/checklist-charts";
import {
  getAiSystems,
  getComplianceItems,
  generateComplianceItems,
  updateComplianceItemStatus,
} from "@/app/actions";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { AiSystem, ComplianceItem, ComplianceStatus } from "@/types";

const statusIcons: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  in_progress: RefreshCw,
  completed: CheckCircle2,
  not_applicable: MinusCircle,
};

export default function ChecklistPage() {
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);
  const statusLabel = (status: string) => i(`chk.status.${status}`);

  useEffect(() => {
    async function load() {
      try {
        const [sys, allItems] = await Promise.all([getAiSystems(), getComplianceItems()]);
        setSystems(sys);
        setItems(allItems);
        if (sys.length > 0 && !selectedSystem) {
          setSelectedSystem(sys[0].id);
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentItems = useMemo(() => {
    let filtered = selectedSystem
      ? items.filter((item) => item.aiSystemId === selectedSystem)
      : items;
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }
    return filtered;
  }, [items, selectedSystem, filterStatus]);

  const stats = useMemo(() => {
    const systemItems = selectedSystem
      ? items.filter((item) => item.aiSystemId === selectedSystem)
      : items;
    const total = systemItems.length;
    const completed = systemItems.filter(
      (item) => item.status === "completed" || item.status === "not_applicable"
    ).length;
    const inProgress = systemItems.filter((item) => item.status === "in_progress").length;
    const pending = systemItems.filter((item) => item.status === "pending").length;
    return { total, completed, inProgress, pending, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [items, selectedSystem]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ComplianceItem[]> = {};
    currentItems.forEach((item) => {
      const cat = item.category || "general";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [currentItems]);

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  async function handleGenerateItems(systemId: string) {
    setGeneratingFor(systemId);
    try {
      const count = await generateComplianceItems(systemId);
      toast.success(i("chk.generated", { count }));
      const allItems = await getComplianceItems();
      setItems(allItems);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i("chk.generateError");
      toast.error(message);
    } finally {
      setGeneratingFor(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateComplianceItemStatus(id, newStatus as ComplianceStatus);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: newStatus as ComplianceStatus, completedAt: newStatus === "completed" ? new Date() : null }
            : item
        )
      );
    } catch {
      toast.error(i("chk.updateError"));
    }
  }

  async function handleEvidenceUpload(itemId: string, file: File) {
    setUploadingFor(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", itemId);

      const res = await fetch("/api/evidence", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(i("chk.evidenceAttached"));
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, evidenceUrl: data.url, notes: `${locale === "en" ? "Evidence attached" : "Evidencia adjunta"}: ${file.name}` }
            : item
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i("chk.evidenceError");
      toast.error(message);
    } finally {
      setUploadingFor(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const categoryLabel = (cat: string) => {
    const key = `chk.cat.${cat}`;
    const result = i(key);
    return result !== key ? result : cat;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("chk.title")}</h1>
        <p className="text-text-secondary mt-1">
          {i("chk.subtitle")}
        </p>
      </div>

      {/* System selector & stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <label className="text-sm font-medium text-text whitespace-nowrap">
                  {i("chk.system")}
                </label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="flex-1 h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm"
                >
                  <option value="">{i("chk.allSystems")}</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {selectedSystem && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={generatingFor === selectedSystem}
                    onClick={() => handleGenerateItems(selectedSystem)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {currentItems.length > 0 ? i("chk.regenerate") : i("chk.generateBtn")} {i("chk.requirements")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-text">{stats.percentage}%</p>
            <ProgressBar
              value={stats.percentage}
              className="mt-2"
              color={stats.percentage >= 75 ? "green" : stats.percentage >= 40 ? "amber" : "red"}
            />
            <p className="text-xs text-text-muted mt-2">
              {stats.completed}/{stats.total} {i("chk.completed")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-text-muted" />
        <div className="flex gap-1">
          {[
            { value: "all", label: i("chk.filterAll") },
            { value: "pending", label: i("chk.filterPending") },
            { value: "in_progress", label: i("chk.filterInProgress") },
            { value: "completed", label: i("chk.filterCompleted") },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filterStatus === f.value
                  ? "bg-brand-500 text-white"
                  : "bg-surface-tertiary text-text-secondary hover:bg-border"
              }`}
            >
              {f.label}
              {f.value === "pending" && stats.pending > 0 && (
                <span className="ml-1 bg-surface-secondary/20 rounded-full px-1">{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Charts */}
      {currentItems.length > 0 && <ChecklistCharts items={currentItems} />}

      {/* Checklist */}
      {currentItems.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={i("chk.noRequirements")}
          description={i("chk.noReqDesc")}
        >
          {selectedSystem && (
            <Button
              loading={generatingFor === selectedSystem}
              onClick={() => handleGenerateItems(selectedSystem)}
            >
              <Plus className="h-4 w-4" />
              {i("chk.generateRequirements")}
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByCategory).map(([category, categoryItems]) => {
            const isExpanded = expandedCategories.has(category) || expandedCategories.size === 0;
            const catCompleted = categoryItems.filter(
              (item) => item.status === "completed" || item.status === "not_applicable"
            ).length;

            return (
              <Card key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-tertiary transition"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-text-muted" />
                    )}
                    <h3 className="text-sm font-semibold text-text">
                      {categoryLabel(category)}
                    </h3>
                    <Badge variant={catCompleted === categoryItems.length ? "success" : "default"}>
                      {catCompleted}/{categoryItems.length}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={catCompleted}
                    max={categoryItems.length}
                    className="w-32"
                    size="sm"
                    color={catCompleted === categoryItems.length ? "green" : "brand"}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {categoryItems.map((item) => {
                      const Icon = statusIcons[item.status] || Clock;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 px-6 py-3 hover:bg-surface-tertiary transition"
                        >
                          <div className="pt-0.5">
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  item.id,
                                  item.status === "completed" ? "pending" : "completed"
                                )
                              }
                              className="transition"
                            >
                              {item.status === "completed" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : item.status === "in_progress" ? (
                                <RefreshCw className="h-5 w-5 text-blue-500" />
                              ) : item.status === "not_applicable" ? (
                                <MinusCircle className="h-5 w-5 text-text-muted" />
                              ) : (
                                <Square className="h-5 w-5 text-text-muted hover:text-brand-400" />
                              )}
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                item.status === "completed"
                                  ? "text-text-muted line-through"
                                  : "text-text"
                              }`}
                            >
                              {item.requirement}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="brand">{item.article}</Badge>
                              {item.dueDate && (
                                <span className="text-xs text-text-muted flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(item.dueDate).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                                </span>
                              )}
                              {item.evidenceUrl ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-500/10 rounded-full px-2 py-0.5">
                                  <FileText className="h-3 w-3" />
                                  {i("chk.evidenceBadge")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Evidence upload */}
                            <label
                              className={`cursor-pointer p-1.5 rounded-lg border border-border hover:bg-surface-tertiary transition ${
                                uploadingFor === item.id ? "opacity-50 pointer-events-none" : ""
                              }`}
                              title={item.evidenceUrl ? i("chk.replaceEvidence") : i("chk.attachEvidence")}
                            >
                              {uploadingFor === item.id ? (
                                <RefreshCw className="h-3.5 w-3.5 text-text-muted animate-spin" />
                              ) : (
                                <Paperclip className="h-3.5 w-3.5 text-text-muted" />
                              )}
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleEvidenceUpload(item.id, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className="text-xs border border-border rounded px-2 py-1 bg-surface-secondary"
                            >
                              <option value="pending">{i("chk.status.pending")}</option>
                              <option value="in_progress">{i("chk.status.in_progress")}</option>
                              <option value="completed">{i("chk.status.completed")}</option>
                              <option value="not_applicable">{i("chk.status.not_applicable")}</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
