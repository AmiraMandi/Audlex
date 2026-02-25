"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  Plus,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Copy,
  FileDown,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge, RiskBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { DocumentCharts } from "@/components/dashboard/document-charts";
import {
  generateAndSaveDocument,
  getDocuments,
  getAiSystems,
  deleteDocument,
  updateDocumentStatus,
  updateDocumentContent,
} from "@/app/actions";
import { getDocumentTemplates, type DocumentTemplateType, documentToMarkdown, type Locale } from "@/lib/documents/generators";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { AiSystem, AppDocument, DocumentStatus } from "@/types";
import type { GeneratedDocument } from "@/lib/documents/generators";

interface DocPreview extends AppDocument {
  generated?: GeneratedDocument;
  markdown?: string;
}

const docTypeIcons: Record<string, string> = {
  impact_assessment: "📋",
  risk_management: "🛡️",
  technical_file: "📄",
  conformity_declaration: "✅",
  human_oversight: "👁️",
  transparency_notice: "🔍",
  data_governance: "💾",
  post_market_monitoring: "📊",
  ai_usage_policy: "📝",
  ai_inventory: "🔍",
};

export default function DocumentacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSystem = searchParams.get("system");

  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [showPreview, setShowPreview] = useState<DocPreview | null>(null);
  const [editingDoc, setEditingDoc] = useState<AppDocument | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>(preSelectedSystem || "");

  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  useEffect(() => {
    async function load() {
      try {
        const [docs, sys] = await Promise.all([getDocuments(), getAiSystems()]);
        setDocuments(docs);
        setSystems(sys);
      } catch {
        // Not logged in or error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGenerate(type: DocumentTemplateType) {
    if (!selectedSystem && type !== "ai_usage_policy" && type !== "ai_inventory") {
      toast.error(i("docs.selectFirst"));
      return;
    }

    setGenerating(type);
    try {
      const result = await generateAndSaveDocument(
        type,
        type === "ai_usage_policy" || type === "ai_inventory" ? undefined : selectedSystem,
        locale as Locale
      );
      toast.success(i("docs.generated"));
      setShowPreview({ ...result.document, generated: result.generated, markdown: result.markdown });
      // Refresh document list
      const docs = await getDocuments();
      setDocuments(docs);
      setActiveTab("documents");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i("docs.generateError");
      toast.error(message);
    } finally {
      setGenerating(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(i("docs.deleteConfirm"))) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success(i("docs.deleted"));
    } catch {
      toast.error(i("docs.deleteError"));
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateDocumentStatus(id, status as DocumentStatus);
      const docs = await getDocuments();
      setDocuments(docs);
      toast.success(i("docs.statusUpdated"));
    } catch {
      toast.error(i("docs.statusError"));
    }
  }

  function handleCopyMarkdown(doc: AppDocument) {
    if (doc.content) {
      const md = documentToMarkdown(doc.content as unknown as GeneratedDocument, locale as Locale);
      navigator.clipboard.writeText(md);
      toast.success(i("docs.copied"));
    }
  }

  function handleDownloadMarkdown(doc: AppDocument) {
    if (doc.content) {
      const md = documentToMarkdown(doc.content as unknown as GeneratedDocument, locale as Locale);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, "").replace(/\s+/g, "_")}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function handleExportDocx(doc: Pick<AppDocument, "id">) {
    window.open(`/api/documents/export?id=${doc.id}&format=docx&locale=${locale}`, "_blank");
  }

  function handleExportPdf(doc: Pick<AppDocument, "id">) {
    // Opens print-ready HTML in a new tab, user can Ctrl+P to save as PDF
    const w = window.open(`/api/documents/export?id=${doc.id}&format=pdf&locale=${locale}`, "_blank");
    if (w) {
      w.addEventListener("load", () => {
        setTimeout(() => w.print(), 500);
      });
    }
  }

  function handleEditDoc(doc: AppDocument) {
    const md = doc.content ? documentToMarkdown(doc.content as unknown as GeneratedDocument, locale as Locale) : "";
    setEditContent(md);
    setEditingDoc(doc);
  }

  async function handleSaveEdit() {
    if (!editingDoc) return;
    setSavingEdit(true);
    try {
      // Store edited markdown as content
      const updatedContent = { ...(editingDoc.content as Record<string, unknown>), _editedMarkdown: editContent };
      await updateDocumentContent(editingDoc.id, updatedContent);
      const docs = await getDocuments();
      setDocuments(docs);
      setEditingDoc(null);
      toast.success(i("doc.saved"));
    } catch {
      toast.error(i("cfg.saveError"));
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const localizedTemplates = getDocumentTemplates(locale as Locale);
  const templateEntries = Object.entries(localizedTemplates) as [DocumentTemplateType, typeof localizedTemplates[DocumentTemplateType]][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("docs.title")}</h1>
        <p className="text-text-secondary mt-1">
          {i("docs.subtitle")}
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "generate", label: i("docs.tabGenerate"), icon: Plus, count: templateEntries.length },
          { id: "documents", label: i("docs.tabDocuments"), icon: FileText, count: documents.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          {/* System selector */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-text whitespace-nowrap">
                  {i("docs.selectSystem")}
                </label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="flex-1 h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm"
                >
                  <option value="">{i("docs.selectPlaceholder")}</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {systems.length === 0 && (
                <Alert variant="warning" className="mt-3">
                  {i("docs.noSystems")}{" "}
                  <a href="/dashboard/inventario/nuevo" className="font-medium underline">
                    {i("docs.registerFirst")}
                  </a>.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Document templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateEntries.map(([type, template]) => {
              const needsSystem = type !== "ai_usage_policy" && type !== "ai_inventory";
              const disabled = needsSystem && !selectedSystem;
              const existingDoc = documents.find(
                (d) => d.type === type && (needsSystem ? d.aiSystemId === selectedSystem : true)
              );

              return (
                <Card
                  key={type}
                  className={`transition ${disabled ? "opacity-50" : "hover:shadow-md hover:border-brand-200"}`}
                >
                  <CardContent className="py-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{docTypeIcons[type] || "📄"}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text">{template.title}</h3>
                        <p className="text-xs text-text-muted mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="brand">{template.articleReference}</Badge>
                          <span className="text-xs text-text-muted">{template.estimatedTime}</span>
                        </div>
                        {existingDoc && (
                          <div className="mt-2">
                            <Badge variant="success">{i("docs.alreadyGenerated", { version: existingDoc.version })}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-4"
                      variant={existingDoc ? "outline" : "default"}
                      disabled={disabled}
                      loading={generating === type}
                      onClick={() => handleGenerate(type)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {existingDoc ? i("docs.regenerate") : i("docs.generate")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && (
        <div>
          {/* Charts */}
          {documents.length > 0 && <DocumentCharts documents={documents} />}
          
          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={i("docs.noDocuments")}
              description={i("docs.noDocumentsDesc")}
            >
              <Button onClick={() => setActiveTab("generate")}>
                <Plus className="h-4 w-4" />
                {i("docs.generateDocument")}
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xl">{docTypeIcons[doc.type] || "📄"}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-text truncate">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={doc.status} />
                            <span className="text-xs text-text-muted">v{doc.version}</span>
                            <span className="text-xs text-text-muted">
                              {new Date(doc.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          className="text-xs border border-border rounded px-2 py-1 bg-surface-secondary"
                        >
                          <option value="draft">{i("docs.status.draft")}</option>
                          <option value="review">{i("docs.status.review")}</option>
                          <option value="approved">{i("docs.status.approved")}</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopyMarkdown(doc)}
                          title={i("docs.tooltipCopy")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleExportDocx(doc)}
                          title={i("docs.tooltipDocx")}
                        >
                          <FileDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleExportPdf(doc)}
                          title={i("docs.tooltipPdf")}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditDoc(doc)}
                          title={i("doc.editContent")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPreview(doc)}
                          title={i("docs.tooltipPreview")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(doc.id)}
                          title={i("docs.tooltipDelete")}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && (
        <Modal
          open={!!showPreview}
          onClose={() => setShowPreview(null)}
          title={showPreview.title || showPreview.generated?.title || ""}
          size="xl"
        >
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-text bg-surface-tertiary rounded-lg p-4 overflow-auto max-h-[60vh]">
              {showPreview.markdown ||
                (showPreview.content ? documentToMarkdown(showPreview.content as unknown as GeneratedDocument, locale as Locale) : i("docs.noContent"))}
            </pre>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                const md =
                  showPreview.markdown ||
                  (showPreview.content ? documentToMarkdown(showPreview.content as unknown as GeneratedDocument, locale as Locale) : "");
                navigator.clipboard.writeText(md);
                toast.success(i("docs.copiedBtn"));
              }}
            >
              <Copy className="h-4 w-4" />
              {i("docs.copy")}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportDocx(showPreview)}
            >
              <FileDown className="h-4 w-4" />
              DOCX
            </Button>
            <Button
              onClick={() => handleExportPdf(showPreview)}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingDoc && (
        <Modal
          open={!!editingDoc}
          onClose={() => setEditingDoc(null)}
          title={`${i("doc.editContent")} — ${editingDoc.title}`}
          size="xl"
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-[50vh] rounded-lg border border-border bg-surface-tertiary p-4 text-sm font-mono text-text resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingDoc(null)}>
              {i("cfg.cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? i("doc.saving") : i("doc.saveContent")}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
