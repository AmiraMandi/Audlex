"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, Users, FileText, Cpu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/feedback";
import { getConsultoraClients, addConsultoraClient, removeConsultoraClient, getClientDashboardStats } from "@/app/actions";
import { toast } from "sonner";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

interface Client {
  id: string;
  clientOrgId: string;
  createdAt: string | Date;
  orgName: string;
  orgPlan: string;
  orgSize: string;
}

interface ClientStats {
  totalSystems: number;
  totalDocuments: number;
  totalAssessments: number;
}

export default function ConsultoraPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [notConsultora, setNotConsultora] = useState(false);
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConsultoraClients();
        setClients(data as Client[]);
      } catch {
        setNotConsultora(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd() {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      await addConsultoraClient(addEmail.trim());
      const data = await getConsultoraClients();
      setClients(data as Client[]);
      setShowAddModal(false);
      setAddEmail("");
      toast.success(locale === "en" ? "Client added" : "Cliente añadido");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (locale === "en" ? "Error adding client" : "Error al añadir cliente");
      toast.error(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(linkId: string) {
    if (!confirm(locale === "en" ? "Remove this client?" : "¿Eliminar este cliente?")) return;
    try {
      await removeConsultoraClient(linkId);
      setClients((prev) => prev.filter((c) => c.id !== linkId));
      toast.success(locale === "en" ? "Client removed" : "Cliente eliminado");
    } catch {
      toast.error(locale === "en" ? "Error" : "Error");
    }
  }

  async function handleViewStats(client: Client) {
    setSelectedClient(client);
    try {
      const stats = await getClientDashboardStats(client.clientOrgId);
      setClientStats(stats);
    } catch {
      setClientStats(null);
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
        title={locale === "en" ? "Consultora plan required" : "Plan Consultora requerido"}
        description={locale === "en"
          ? "Upgrade to the Consultora plan to manage multiple client organisations."
          : "Actualiza al plan Consultora para gestionar múltiples organizaciones cliente."}
      >
        <Button onClick={() => (window.location.href = "/dashboard/configuracion")}>
          {locale === "en" ? "Go to settings" : "Ir a configuración"}
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {locale === "en" ? "Client Management" : "Gestión de Clientes"}
          </h1>
          <p className="text-text-secondary mt-1">
            {locale === "en"
              ? "Manage and monitor your consulting clients"
              : "Gestiona y monitoriza tus clientes de consultoría"}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          {locale === "en" ? "Add client" : "Añadir cliente"}
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={locale === "en" ? "No clients yet" : "Sin clientes aún"}
          description={locale === "en"
            ? "Add your first client organisation to start managing their compliance."
            : "Añade tu primera organización cliente para empezar a gestionar su compliance."}
        >
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {locale === "en" ? "Add client" : "Añadir cliente"}
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="hover:border-brand-200 transition">
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">{client.orgName}</h3>
                      <p className="text-xs text-text-muted capitalize">{client.orgSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(client.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition"
                    title={locale === "en" ? "Remove" : "Eliminar"}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewStats(client)}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    {locale === "en" ? "View stats" : "Ver estadísticas"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setAddEmail(""); }}
        title={locale === "en" ? "Add client" : "Añadir cliente"}
        description={locale === "en"
          ? "Enter the email of a user in the client organisation."
          : "Introduce el email de un usuario de la organización cliente."}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="cliente@empresa.com"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowAddModal(false); setAddEmail(""); }}>
              {locale === "en" ? "Cancel" : "Cancelar"}
            </Button>
            <Button onClick={handleAdd} disabled={adding || !addEmail.includes("@")}>
              {adding ? "..." : (locale === "en" ? "Add" : "Añadir")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Stats Modal */}
      <Modal
        open={!!selectedClient}
        onClose={() => { setSelectedClient(null); setClientStats(null); }}
        title={selectedClient?.orgName || ""}
        description={locale === "en" ? "Client compliance overview" : "Resumen de compliance del cliente"}
        size="sm"
      >
        {clientStats ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center rounded-lg border border-border p-4">
              <Cpu className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientStats.totalSystems}</p>
              <p className="text-xs text-text-muted">{locale === "en" ? "Systems" : "Sistemas"}</p>
            </div>
            <div className="text-center rounded-lg border border-border p-4">
              <FileText className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientStats.totalDocuments}</p>
              <p className="text-xs text-text-muted">{locale === "en" ? "Documents" : "Documentos"}</p>
            </div>
            <div className="text-center rounded-lg border border-border p-4">
              <BarChart3 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-text">{clientStats.totalAssessments}</p>
              <p className="text-xs text-text-muted">{locale === "en" ? "Assessments" : "Evaluaciones"}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        )}
      </Modal>
    </div>
  );
}
