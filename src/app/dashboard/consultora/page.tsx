"use client";

import { useState, useEffect } from "react";
import {
  Building2, Plus, Trash2, Users, FileText, Cpu,
  ChevronRight, ArrowLeft, Shield, CheckCircle2, AlertTriangle,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/feedback";
import {
  getConsultoraClients, addConsultoraClient, removeConsultoraClient,
  getClientDetail, getWhitelabelConfig, saveWhitelabelConfig,
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

type Tab = "clients" | "branding";

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
    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedClient(null); setClientDetail(null); }}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("Volver a clientes", "Back to clients")}
        </button>

        {/* Header */}
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

        {/* Systems */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("Sistemas de IA", "AI Systems")}</CardTitle></CardHeader>
          <CardContent>
            {clientDetail.systems.length === 0 ? (
              <p className="text-sm text-text-muted">{t("Sin sistemas registrados", "No systems registered")}</p>
            ) : (
              <div className="divide-y divide-border">
                {clientDetail.systems.map(s => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">{s.name}</p>
                      <p className="text-xs text-text-muted">{s.category} · {s.purpose?.slice(0, 60)}</p>
                    </div>
                    {s.riskLevel && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${riskColors[s.riskLevel] || "bg-gray-400"}`}>
                        {riskLabels[locale]?.[s.riskLevel] || s.riskLevel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("Documentos", "Documents")}</CardTitle></CardHeader>
          <CardContent>
            {clientDetail.documents.length === 0 ? (
              <p className="text-sm text-text-muted">{t("Sin documentos generados", "No documents generated")}</p>
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
              <Input
                label={t("URL del logo", "Logo URL")}
                value={branding.logoUrl}
                onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://tu-empresa.com/logo.png"
              />
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
    </div>
  );
}
