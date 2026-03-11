"use client";

import { useState, useEffect } from "react";
import {
  Building2, Plus, Trash2, Users, FileText, Cpu,
  ChevronRight, ArrowLeft, Shield, CheckCircle2, AlertTriangle,
  Palette, Mail, CreditCard, Send, Copy, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/feedback";
import {
  getConsultoraClients, addConsultoraClient, removeConsultoraClient,
  getClientDetail, getWhitelabelConfig, saveWhitelabelConfig,
  consultoraCreateSystem, consultoraGenerateDocument,
  getConsultoraBillingInfo, sendClientInvitation,
} from "@/app/actions";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";

interface Client {
  id: string;
  clientOrgId: string;
  createdAt: string | Date;
  orgName: string;
  orgPlan: string;
  orgSize: string;
}

interface ClientDetailData {
  org: { name: string; size: string; sector: string | null; plan: string; createdAt: Date };
  systems: { id: string; name: string; category: string; status: string; purpose: string; riskLevel: string | null; createdAt: Date }[];
  documents: { id: string; title: string; type: string; status: string; createdAt: Date }[];
  complianceScore: number;
  complianceTotal: number;
  complianceCompleted: number;
  riskSummary: { unacceptable: number; high: number; limited: number; minimal: number };
}

interface WhitelabelData {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
}

type Tab = "clients" | "branding" | "billing";

const riskColors: Record<string, string> = {
  unacceptable: "bg-red-500",
  high: "bg-orange-500",
  limited: "bg-yellow-500",
  minimal: "bg-green-500",
};

const riskLabels: Record<string, Record<string, string>> = {
  es: { unacceptable: "Inaceptable", high: "Alto", limited: "Limitado", minimal: "Mínimo" },
  en: { unacceptable: "Unacceptable", high: "High", limited: "Limited", minimal: "Minimal" },
};

const statusColors: Record<string, string> = {
  draft: "text-gray-500",
  review: "text-blue-500",
  approved: "text-green-500",
  expired: "text-red-500",
};

export default function ConsultoraPage() {
  const [tab, setTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState<{ name: string; sector: string; size: "micro" | "small" | "medium" | "large"; cifNif: string }>({ name: "", sector: "", size: "micro", cifNif: "" });
  const [adding, setAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetail, setClientDetail] = useState<ClientDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notConsultora, setNotConsultora] = useState(false);
  const [branding, setBranding] = useState<WhitelabelData>({
    brandName: "", logoUrl: "", primaryColor: "#2563EB", secondaryColor: "#1E40AF", footerText: "",
  });
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // System creation modal
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [newSystem, setNewSystem] = useState({ name: "", category: "", purpose: "", provider: "", description: "" });
  const [creatingSys, setCreatingSys] = useState(false);
  // Document generation
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  // Billing info
  const [billing, setBilling] = useState<{
    basePriceMonthly: number; clientPriceMonthly: number; clientCount: number; totalMonthly: number; isAnnual: boolean;
  } | null>(null);
  // Client invitation
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteClientOrgId, setInviteClientOrgId] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const { locale } = useLocale();
  const t = (es: string, en: string) => locale === "en" ? en : es;

  useEffect(() => {
    async function load() {
      try {
        const data = await getConsultoraClients();
        setClients(data as Client[]);
        const config = await getWhitelabelConfig();
        if (config) {
          setBranding({
            brandName: config.brandName || "",
            logoUrl: config.logoUrl || "",
            primaryColor: config.primaryColor || "#2563EB",
            secondaryColor: config.secondaryColor || "#1E40AF",
            footerText: config.footerText || "",
          });
        }
        // Load billing info
        const billingInfo = await getConsultoraBillingInfo();
        if (billingInfo) setBilling(billingInfo);
      } catch {
        setNotConsultora(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd() {
    if (!newClient.name.trim()) return;
    setAdding(true);
    try {
      const result = await addConsultoraClient(newClient);
      if (!result.success) {
        toast.error(result.error || t("Error al crear cliente", "Error creating client"));
        return;
      }
      const data = await getConsultoraClients();
      setClients(data as Client[]);
      setShowAddModal(false);
      setNewClient({ name: "", sector: "", size: "micro", cifNif: "" });
      toast.success(t("Cliente creado", "Client created"));
      // Refresh billing info
      const billingInfo = await getConsultoraBillingInfo();
      if (billingInfo) setBilling(billingInfo);
    } catch {
      toast.error(t("Error al crear cliente", "Error creating client"));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(linkId: string) {
    if (!confirm(t("¿Eliminar este cliente?", "Remove this client?"))) return;
    try {
      const result = await removeConsultoraClient(linkId);
      if (!result.success) {
        toast.error(result.error || "Error");
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== linkId));
      toast.success(t("Cliente eliminado", "Client removed"));
      // Refresh billing info
      const billingInfo = await getConsultoraBillingInfo();
      if (billingInfo) setBilling(billingInfo);
    } catch {
      toast.error("Error");
    }
  }

  async function handleViewDetail(client: Client) {
    setSelectedClient(client);
    setDetailLoading(true);
    setClientDetail(null);
    try {
      const detail = await getClientDetail(client.clientOrgId) as ClientDetailData;
      setClientDetail(detail);
    } catch {
      toast.error(t("Error al cargar datos del cliente", "Error loading client data"));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateSystem() {
    if (!selectedClient || !newSystem.name.trim() || !newSystem.category.trim() || !newSystem.purpose.trim()) return;
    setCreatingSys(true);
    try {
      const result = await consultoraCreateSystem(selectedClient.clientOrgId, newSystem);
      if (!result.success) {
        toast.error(result.error || "Error");
        return;
      }
      toast.success(t("Sistema creado", "System created"));
      setShowSystemModal(false);
      setNewSystem({ name: "", category: "", purpose: "", provider: "", description: "" });
      // Refresh detail
      const detail = await getClientDetail(selectedClient.clientOrgId) as ClientDetailData;
      setClientDetail(detail);
    } catch {
      toast.error("Error");
    } finally {
      setCreatingSys(false);
    }
  }

  async function handleGenerateDoc(type: string, systemId?: string) {
    if (!selectedClient) return;
    setGeneratingDoc(type);
    try {
      const result = await consultoraGenerateDocument(
        selectedClient.clientOrgId,
        type as Parameters<typeof consultoraGenerateDocument>[1],
        systemId,
        locale as "es" | "en"
      );
      if (!result.success) {
        toast.error(result.error || "Error");
        return;
      }
      toast.success(t("Documento generado", "Document generated"));
      // Refresh detail
      const detail = await getClientDetail(selectedClient.clientOrgId) as ClientDetailData;
      setClientDetail(detail);
    } catch {
      toast.error("Error");
    } finally {
      setGeneratingDoc(null);
    }
  }

  async function handleSaveBranding() {
    setSavingBranding(true);
    try {
      const result = await saveWhitelabelConfig(branding);
      if (result.success) {
        toast.success(t("Marca guardada", "Branding saved"));
      } else {
        toast.error(result.error || "Error");
      }
    } catch {
      toast.error("Error");
    } finally {
      setSavingBranding(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/whitelabel-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setBranding(prev => ({ ...prev, logoUrl: data.url }));
        toast.success(t("Logo subido", "Logo uploaded"));
      } else {
        toast.error(data.error || t("Error al subir el logo", "Error uploading logo"));
      }
    } catch {
      toast.error(t("Error al subir el logo", "Error uploading logo"));
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSendInvitation() {
    if (!inviteEmail.trim() || !inviteClientOrgId) return;
    setSendingInvite(true);
    try {
      const result = await sendClientInvitation({ clientOrgId: inviteClientOrgId, email: inviteEmail });
      if (result.success) {
        toast.success(t("Invitación enviada", "Invitation sent"));
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteClientOrgId("");
      } else {
        toast.error(result.error || "Error");
      }
    } catch {
      toast.error("Error");
    } finally {
      setSendingInvite(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notConsultora) {
    return (
      <EmptyState
        icon={Building2}
        title={t("Plan Consultora requerido", "Consultora plan required")}
        description={t(
          "Actualiza al plan Consultora para gestionar múltiples organizaciones cliente.",
          "Upgrade to the Consultora plan to manage multiple client organisations."
        )}
      >
        <Button onClick={() => (window.location.href = "/dashboard/configuracion")}>
          {t("Ir a configuración", "Go to settings")}
        </Button>
      </EmptyState>
    );
  }

  // ── Client Detail View ──
  if (selectedClient && !detailLoading && clientDetail) {
    const docTypes = [
      { type: "ai_usage_policy", label: t("Política de uso IA", "AI Usage Policy"), needsSystem: false },
      { type: "ai_inventory", label: t("Inventario IA", "AI Inventory"), needsSystem: false },
      { type: "impact_assessment", label: t("Evaluación de impacto", "Impact Assessment"), needsSystem: true },
      { type: "risk_management", label: t("Gestión de riesgos", "Risk Management"), needsSystem: true },
      { type: "technical_file", label: t("Expediente técnico", "Technical File"), needsSystem: true },
      { type: "conformity_declaration", label: t("Declaración de conformidad", "Conformity Declaration"), needsSystem: true },
      { type: "human_oversight", label: t("Supervisión humana", "Human Oversight"), needsSystem: true },
      { type: "transparency_notice", label: t("Aviso transparencia", "Transparency Notice"), needsSystem: true },
      { type: "data_governance", label: t("Gobernanza de datos", "Data Governance"), needsSystem: true },
      { type: "post_market_monitoring", label: t("Vigilancia post-mercado", "Post-Market Monitoring"), needsSystem: true },
    ];

    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedClient(null); setClientDetail(null); }}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Volver a clientes", "Back to clients")}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">{clientDetail.org.name}</h1>
              <p className="text-sm text-text-secondary capitalize">
                {clientDetail.org.sector || ""} · {clientDetail.org.size} · {t("Plan", "Plan")}: {clientDetail.org.plan}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setInviteClientOrgId(selectedClient.clientOrgId); setShowInviteModal(true); }}>
              <Mail className="h-4 w-4" />
              {t("Invitar usuario", "Invite user")}
            </Button>
            <Button onClick={() => setShowSystemModal(true)}>
              <Plus className="h-4 w-4" />
              {t("Añadir sistema", "Add system")}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <Cpu className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientDetail.systems.length}</p>
              <p className="text-xs text-text-muted">{t("Sistemas IA", "AI Systems")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <FileText className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientDetail.documents.length}</p>
              <p className="text-xs text-text-muted">{t("Documentos", "Documents")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientDetail.complianceScore}%</p>
              <p className="text-xs text-text-muted">Compliance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <Shield className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">
                {clientDetail.riskSummary.high + clientDetail.riskSummary.unacceptable}
              </p>
              <p className="text-xs text-text-muted">{t("Riesgo alto+", "High risk+")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        {(clientDetail.riskSummary.unacceptable + clientDetail.riskSummary.high + clientDetail.riskSummary.limited + clientDetail.riskSummary.minimal) > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("Distribución de Riesgo", "Risk Distribution")}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {(["unacceptable", "high", "limited", "minimal"] as const).map(level => {
                  const val = clientDetail.riskSummary[level];
                  if (val === 0) return null;
                  return (
                    <div key={level} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-full ${riskColors[level]}`} />
                      <span className="text-sm text-text-secondary">
                        {riskLabels[locale]?.[level] || level}: {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Systems with actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t("Sistemas de IA", "AI Systems")}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowSystemModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              {t("Nuevo", "New")}
            </Button>
          </CardHeader>
          <CardContent>
            {clientDetail.systems.length === 0 ? (
              <p className="text-sm text-text-muted">{t("Sin sistemas registrados. Añade el primer sistema de IA del cliente.", "No systems registered. Add the client's first AI system.")}</p>
            ) : (
              <div className="divide-y divide-border">
                {clientDetail.systems.map(s => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text">{s.name}</p>
                      <p className="text-xs text-text-muted truncate">{s.category} · {s.purpose?.slice(0, 60)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {s.riskLevel ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${riskColors[s.riskLevel] || "bg-gray-400"}`}>
                          {riskLabels[locale]?.[s.riskLevel] || s.riskLevel}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted italic">{t("Sin clasificar", "Unclassified")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("Generar Documentos", "Generate Documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-muted mb-3">
              {t(
                "Genera documentación de compliance del EU AI Act para este cliente.",
                "Generate EU AI Act compliance documentation for this client."
              )}
            </p>

            {/* Org-level docs (no system needed) */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t("Documentos de organización", "Organisation documents")}
              </p>
              <div className="flex flex-wrap gap-2">
                {docTypes.filter(d => !d.needsSystem).map(d => (
                  <Button
                    key={d.type}
                    size="sm"
                    variant="outline"
                    disabled={generatingDoc !== null}
                    onClick={() => handleGenerateDoc(d.type)}
                  >
                    {generatingDoc === d.type ? "..." : d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* System-level docs */}
            {clientDetail.systems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t("Documentos por sistema", "Per-system documents")}
                </p>
                {clientDetail.systems.map(sys => (
                  <div key={sys.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-text mb-2">{sys.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {docTypes.filter(d => d.needsSystem).map(d => (
                        <Button
                          key={`${sys.id}-${d.type}`}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          disabled={generatingDoc !== null}
                          onClick={() => handleGenerateDoc(d.type, sys.id)}
                        >
                          {generatingDoc === `${d.type}` ? "..." : d.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Documents */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("Documentos generados", "Generated Documents")}</CardTitle></CardHeader>
          <CardContent>
            {clientDetail.documents.length === 0 ? (
              <p className="text-sm text-text-muted">{t("Sin documentos generados aún.", "No documents generated yet.")}</p>
            ) : (
              <div className="divide-y divide-border">
                {clientDetail.documents.map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">{d.title}</p>
                      <p className="text-xs text-text-muted">{d.type}</p>
                    </div>
                    <span className={`text-xs font-medium ${statusColors[d.status] || "text-gray-500"}`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add System Modal */}
        <Modal
          open={showSystemModal}
          onClose={() => { setShowSystemModal(false); setNewSystem({ name: "", category: "", purpose: "", provider: "", description: "" }); }}
          title={t("Nuevo sistema de IA", "New AI system")}
          description={t(
            `Registrar un sistema de IA para ${clientDetail.org.name}`,
            `Register an AI system for ${clientDetail.org.name}`
          )}
          size="sm"
        >
          <div className="space-y-4">
            <Input
              label={t("Nombre del sistema", "System name")}
              value={newSystem.name}
              onChange={(e) => setNewSystem(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t("Chatbot de atención al cliente", "Customer service chatbot")}
              required
            />
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                {t("Categoría", "Category")}
              </label>
              <select
                value={newSystem.category}
                onChange={(e) => setNewSystem(prev => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">{t("Seleccionar...", "Select...")}</option>
                <option value="chatbot">Chatbot</option>
                <option value="scoring">{t("Scoring / Decisión", "Scoring / Decision")}</option>
                <option value="analytics">{t("Analítica", "Analytics")}</option>
                <option value="rrhh">{t("Recursos Humanos", "Human Resources")}</option>
                <option value="biometria">{t("Biometría", "Biometrics")}</option>
                <option value="diagnostico">{t("Diagnóstico", "Diagnostics")}</option>
                <option value="recomendacion">{t("Recomendación", "Recommendation")}</option>
                <option value="generacion_contenido">{t("Generación de contenido", "Content Generation")}</option>
                <option value="vigilancia">{t("Vigilancia", "Surveillance")}</option>
                <option value="otro">{t("Otro", "Other")}</option>
              </select>
            </div>
            <Input
              label={t("Propósito / Uso", "Purpose / Use")}
              value={newSystem.purpose}
              onChange={(e) => setNewSystem(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder={t("Automatizar respuestas a consultas frecuentes", "Automate responses to frequent queries")}
              required
            />
            <Input
              label={t("Proveedor (opcional)", "Provider (optional)")}
              value={newSystem.provider}
              onChange={(e) => setNewSystem(prev => ({ ...prev, provider: e.target.value }))}
              placeholder="OpenAI, Google, Interno..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSystemModal(false)}>
                {t("Cancelar", "Cancel")}
              </Button>
              <Button onClick={handleCreateSystem} disabled={creatingSys || !newSystem.name.trim() || !newSystem.category || !newSystem.purpose.trim()}>
                {creatingSys ? "..." : t("Crear sistema", "Create system")}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Invite User Modal */}
        <Modal
          open={showInviteModal}
          onClose={() => { setShowInviteModal(false); setInviteEmail(""); }}
          title={t("Invitar usuario", "Invite user")}
          description={t(
            `Envía una invitación para que el cliente acceda a su propio dashboard y gestione su compliance.`,
            `Send an invitation so the client can access their own dashboard and manage their compliance.`
          )}
          size="sm"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-700">
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                {t(
                  "El usuario recibirá un email con un enlace para crear su cuenta. Una vez registrado, tendrá acceso a clasificar sistemas, generar documentos y monitorizar su compliance.",
                  "The user will receive an email with a link to create their account. Once registered, they can classify systems, generate documents and monitor their compliance."
                )}
              </p>
            </div>
            <Input
              label="Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="cliente@empresa.com"
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowInviteModal(false); setInviteEmail(""); }}>
                {t("Cancelar", "Cancel")}
              </Button>
              <Button onClick={handleSendInvitation} disabled={sendingInvite || !inviteEmail.trim()}>
                <Send className="h-4 w-4" />
                {sendingInvite ? "..." : t("Enviar invitación", "Send invitation")}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Loading client detail ──
  if (selectedClient && detailLoading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedClient(null); setClientDetail(null); }}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Volver a clientes", "Back to clients")}
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // ── Main Consultora View ──
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t("Panel Consultora", "Consulting Panel")}
        </h1>
        <p className="text-text-secondary mt-1">
          {t("Gestiona tus clientes y personaliza tu marca", "Manage your clients and customize your branding")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("clients")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "clients"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-text-secondary hover:text-text"
          }`}
        >
          <Users className="h-4 w-4 inline mr-1.5" />
          {t("Clientes", "Clients")} ({clients.length})
        </button>
        <button
          onClick={() => setTab("branding")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "branding"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-text-secondary hover:text-text"
          }`}
        >
          <Palette className="h-4 w-4 inline mr-1.5" />
          {t("Marca / White-label", "Branding / White-label")}
        </button>
        <button
          onClick={() => setTab("billing")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "billing"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-text-secondary hover:text-text"
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-1.5" />
          {t("Facturación", "Billing")}
        </button>
      </div>

      {/* ── Clients Tab ── */}
      {tab === "clients" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              {t("Nuevo cliente", "New client")}
            </Button>
          </div>

          {clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("Sin clientes aún", "No clients yet")}
              description={t(
                "Crea tu primera organización cliente para empezar a gestionar su compliance.",
                "Create your first client organisation to start managing their compliance."
              )}
            >
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                {t("Nuevo cliente", "New client")}
              </Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card key={client.id} className="hover:border-brand-200 transition cursor-pointer group" onClick={() => handleViewDetail(client)}>
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-brand-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text">{client.orgName}</h3>
                          <p className="text-xs text-text-muted capitalize">{client.orgSize} · {client.orgPlan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setInviteClientOrgId(client.clientOrgId); setShowInviteModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                          title={t("Invitar usuario", "Invite user")}
                        >
                          <Mail className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(client.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                          title={t("Eliminar", "Remove")}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Branding Tab ── */}
      {tab === "branding" && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("Configuración de Marca", "Branding Configuration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label={t("Nombre de marca", "Brand name")}
                value={branding.brandName}
                onChange={(e) => setBranding(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder={t("Tu marca", "Your brand")}
              />
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  {t("Logo de marca", "Brand logo")}
                </label>
                <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                    <div className="relative h-12 w-auto rounded-lg border border-border p-1.5 bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={branding.logoUrl} alt="Logo" className="h-full w-auto object-contain" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg border border-dashed border-border flex items-center justify-center bg-surface">
                      <Upload className="h-5 w-5 text-text-muted" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-surface-tertiary transition">
                      <Upload className="h-4 w-4" />
                      {uploadingLogo ? t("Subiendo...", "Uploading...") : t("Subir logo", "Upload logo")}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="text-xs text-text-muted">PNG, JPG, SVG o WebP · {t("Máx. 2 MB", "Max 2 MB")}</p>
                  </div>
                  {branding.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setBranding(prev => ({ ...prev, logoUrl: "" }))}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-500"
                      title={t("Eliminar logo", "Remove logo")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    {t("Color primario", "Primary color")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-10 w-14 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    {t("Color secundario", "Secondary color")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="h-10 w-14 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <Input
                label={t("Texto de pie de página", "Footer text")}
                value={branding.footerText}
                onChange={(e) => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                placeholder={t("© 2025 Tu marca. Todos los derechos reservados.", "© 2025 Your brand. All rights reserved.")}
              />

              {/* Preview */}
              {branding.brandName && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {t("Previsualización", "Preview")}
                  </p>
                  <div className="flex items-center gap-3">
                    {branding.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        {branding.brandName[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-lg font-semibold" style={{ color: branding.primaryColor }}>
                      {branding.brandName}
                    </span>
                  </div>
                  {branding.footerText && (
                    <p className="text-xs text-text-muted border-t border-border pt-2">
                      {branding.footerText}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveBranding} disabled={savingBranding || !branding.brandName}>
                  {savingBranding ? "..." : t("Guardar marca", "Save branding")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {t(
                "La marca se aplicará a los documentos generados para tus clientes. El dominio personalizado estará disponible próximamente.",
                "Branding will be applied to documents generated for your clients. Custom domain will be available soon."
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Billing Tab ── */}
      {tab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-500" />
                {t("Resumen de facturación", "Billing Summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                        {t("Plan base", "Base plan")}
                      </p>
                      <p className="text-2xl font-bold text-text">
                        {billing.basePriceMonthly}€<span className="text-sm font-normal text-text-muted">/{t("mes", "mo")}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Plan Consultora {billing.isAnnual ? `(${t("anual", "annual")})` : `(${t("mensual", "monthly")})`}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                        {t("Por cliente", "Per client")}
                      </p>
                      <p className="text-2xl font-bold text-text">
                        {billing.clientPriceMonthly}€<span className="text-sm font-normal text-text-muted">/{t("mes", "mo")}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        × {billing.clientCount} {t("clientes activos", "active clients")}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-brand-50 border border-brand-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text">
                          {t("Total mensual estimado", "Estimated monthly total")}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {billing.basePriceMonthly}€ + ({billing.clientCount} × {billing.clientPriceMonthly}€)
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-brand-600">
                        {billing.totalMonthly}€
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">
                    {t(
                      "La facturación por cliente se ajusta automáticamente al añadir o eliminar clientes. Los cambios se prorratean en tu siguiente factura.",
                      "Per-client billing adjusts automatically when you add or remove clients. Changes are prorated on your next invoice."
                    )}
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">
                    {t(
                      "Información de facturación no disponible. Verifica tu suscripción en Configuración.",
                      "Billing information unavailable. Check your subscription in Settings."
                    )}
                  </p>
                  <Button variant="outline" className="mt-3" onClick={() => window.location.href = "/dashboard/configuracion?tab=plan"}>
                    {t("Ir a configuración", "Go to settings")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing model explanation */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-medium text-text mb-3">{t("Modelo de precios", "Pricing model")}</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("349€/mes — Acceso completo a la plataforma, sistemas y usuarios ilimitados", "349€/mo — Full platform access, unlimited systems and users")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("25€/mes por cada cliente gestionado activo", "25€/mo per active managed client")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("Cada cliente puede autogestionar su compliance o ser gestionado por ti", "Each client can self-manage their compliance or be managed by you")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t("Descuento del 20% en plan anual", "20% discount on yearly plan")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setNewClient({ name: "", sector: "", size: "micro", cifNif: "" }); }}
        title={t("Nuevo cliente", "New client")}
        description={t(
          "Crea una organización cliente para gestionar su compliance desde tu panel.",
          "Create a client organisation to manage their compliance from your panel."
        )}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label={t("Nombre de la empresa", "Company name")}
            value={newClient.name}
            onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t("Empresa S.L.", "Acme Corp.")}
            required
          />
          <Input
            label={t("CIF/NIF", "Tax ID")}
            value={newClient.cifNif}
            onChange={(e) => setNewClient(prev => ({ ...prev, cifNif: e.target.value }))}
            placeholder="B12345678"
          />
          <Input
            label={t("Sector", "Sector")}
            value={newClient.sector}
            onChange={(e) => setNewClient(prev => ({ ...prev, sector: e.target.value }))}
            placeholder={t("Tecnología, Banca, Salud...", "Technology, Banking, Healthcare...")}
          />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              {t("Tamaño", "Size")}
            </label>
            <select
              value={newClient.size}
              onChange={(e) => setNewClient(prev => ({ ...prev, size: e.target.value as "micro" | "small" | "medium" | "large" }))}
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="micro">{t("Micro (< 10)", "Micro (< 10)")}</option>
              <option value="small">{t("Pequeña (10-49)", "Small (10-49)")}</option>
              <option value="medium">{t("Mediana (50-249)", "Medium (50-249)")}</option>
              <option value="large">{t("Grande (250+)", "Large (250+)")}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowAddModal(false); setNewClient({ name: "", sector: "", size: "micro", cifNif: "" }); }}>
              {t("Cancelar", "Cancel")}
            </Button>
            <Button onClick={handleAdd} disabled={adding || !newClient.name.trim()}>
              {adding ? "..." : t("Crear cliente", "Create client")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Client User Modal (main view) */}
      <Modal
        open={showInviteModal && !selectedClient}
        onClose={() => { setShowInviteModal(false); setInviteEmail(""); setInviteClientOrgId(""); }}
        title={t("Invitar usuario", "Invite user")}
        description={t(
          "Envía una invitación para que el cliente acceda a su propio dashboard.",
          "Send an invitation so the client can access their own dashboard."
        )}
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              <Mail className="h-3.5 w-3.5 inline mr-1" />
              {t(
                "El usuario podrá clasificar sus sistemas IA, generar documentos obligatorios y monitorizar el compliance desde su propio dashboard.",
                "The user will be able to classify AI systems, generate mandatory documents and monitor compliance from their own dashboard."
              )}
            </p>
          </div>
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="cliente@empresa.com"
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowInviteModal(false); setInviteEmail(""); setInviteClientOrgId(""); }}>
              {t("Cancelar", "Cancel")}
            </Button>
            <Button onClick={handleSendInvitation} disabled={sendingInvite || !inviteEmail.trim()}>
              <Send className="h-4 w-4" />
              {sendingInvite ? "..." : t("Enviar invitación", "Send invitation")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
