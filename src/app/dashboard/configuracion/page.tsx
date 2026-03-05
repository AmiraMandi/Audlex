"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Settings, Building2, Users, CreditCard, Shield, Save, ExternalLink, UserPlus, Trash2, Crown, Download, Bell, User, Activity, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/feedback";
import { Modal } from "@/components/ui/modal";
import { getCurrentOrganization, updateOrganization, getTeamMembers, inviteTeamMember, updateTeamMemberRole, removeTeamMember, exportUserData, deleteAccount, updateProfile, getAuditLog } from "@/app/actions";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import type { Organization, TeamMember } from "@/types";
import { PlanUpgradeCards } from "@/components/dashboard/plan-upgrade-cards";

type UserRole = "admin" | "member" | "viewer";

const SECTOR_VALUES = [
  "technology", "finance", "healthcare", "education", "legal", "retail",
  "manufacturing", "energy", "transport", "public", "consulting", "hr",
  "marketing", "telecom", "other",
];

const SIZE_VALUES = ["micro", "small", "medium", "large"] as const;

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-surface-tertiary text-text-secondary" },
  starter: { label: "Starter", color: "bg-blue-100 text-blue-700" },
  business: { label: "Business", color: "bg-purple-100 text-purple-700" },
  enterprise: { label: "Enterprise", color: "bg-amber-100 text-amber-700" },
  consultora: { label: "Consultora", color: "bg-green-100 text-green-700" },
};

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("organization");
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, deadlines: true, updates: false });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cifNif: "",
    sector: "",
    sectorDescription: "",
    size: "micro" as "micro" | "small" | "medium" | "large",
    website: "",
  });

  const [syncing, setSyncing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const sectorOptions = SECTOR_VALUES.map((v) => ({ value: v, label: i(`cfg.sector.${v}`) }));
  const sizeOptions = SIZE_VALUES.map((v) => ({ value: v, label: i(`cfg.size.${v}`) }));

  // Reload org data helper
  const reloadOrg = useCallback(async () => {
    const data = await getCurrentOrganization();
    if (data) {
      setOrg(data);
      setForm({
        name: data.name || "",
        cifNif: data.cifNif || "",
        sector: data.sector || "",
        sectorDescription: data.sectorDescription || "",
        size: (data.size || "micro") as "micro" | "small" | "medium" | "large",
        website: data.website || "",
      });
    }
    return data;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [data, members] = await Promise.all([
          getCurrentOrganization(),
          getTeamMembers(),
        ]);
        if (data) {
          setOrg(data);
          setForm({
            name: data.name || "",
            cifNif: data.cifNif || "",
            sector: data.sector || "",
            sectorDescription: data.sectorDescription || "",
            size: (data.size || "micro") as "micro" | "small" | "medium" | "large",
            website: data.website || "",
          });
        }
        setTeamMembers(members || []);
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handle return from Stripe checkout
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setActiveTab("plan");
      toast.success(locale === "en" ? "Payment completed! Your plan is being activated..." : "¡Pago completado! Tu plan se está activando...");
      // Clean up URL
      router.replace("/dashboard/configuracion?tab=plan", { scroll: false });

      // Directly sync plan from Stripe (doesn't depend on webhook)
      let synced = false;
      const syncPlan = async () => {
        try {
          const res = await fetch("/api/sync-plan", { method: "POST" });
          const data = await res.json();
          if (data.synced && data.plan) {
            synced = true;
            await reloadOrg();
            toast.success(locale === "en" ? `Plan upgraded to ${planLabels[data.plan]?.label || data.plan}!` : `¡Plan actualizado a ${planLabels[data.plan]?.label || data.plan}!`);
          }
        } catch {
          // Will retry via polling
        }
      };

      // Try syncing immediately, then poll as fallback
      syncPlan();

      let attempts = 0;
      const maxAttempts = 8;
      const poll = setInterval(async () => {
        if (synced) { clearInterval(poll); return; }
        attempts++;
        try {
          // Try sync-plan API again
          const res = await fetch("/api/sync-plan", { method: "POST" });
          const syncData = await res.json();
          if (syncData.synced && syncData.plan) {
            synced = true;
            clearInterval(poll);
            await reloadOrg();
            toast.success(locale === "en" ? `Plan upgraded to ${planLabels[syncData.plan]?.label || syncData.plan}!` : `¡Plan actualizado a ${planLabels[syncData.plan]?.label || syncData.plan}!`);
          } else if (attempts >= maxAttempts) {
            clearInterval(poll);
            toast.error(locale === "en" ? "Plan update is taking longer than expected. Please refresh the page." : "La actualización del plan está tardando más de lo esperado. Actualiza la página.");
          }
        } catch {
          if (attempts >= maxAttempts) clearInterval(poll);
        }
      }, 3000);
      return () => clearInterval(poll);
    } else if (checkout === "cancelled") {
      setActiveTab("plan");
      toast.error(locale === "en" ? "Checkout was cancelled" : "El pago fue cancelado");
      router.replace("/dashboard/configuracion?tab=plan", { scroll: false });
    }
  }, [searchParams, locale, router, reloadOrg]);

  // Handle tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["organization", "team", "plan", "security", "audit"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateOrganization(form);
      setOrg(updated);
      toast.success(i("cfg.saved"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : i("cfg.saveError");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("cfg.title")}</h1>
        <p className="text-text-secondary mt-1">
          {i("cfg.subtitle")}
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "organization", label: i("cfg.tabOrg"), icon: Building2 },
          { id: "team", label: i("cfg.tabTeam"), icon: Users },
          { id: "plan", label: i("cfg.tabPlan"), icon: CreditCard },
          { id: "security", label: i("cfg.tabSecurity"), icon: Shield },
          { id: "audit", label: i("cfg.tabAudit"), icon: Activity },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab === "audit" && auditLogs.length === 0) {
            setLoadingLogs(true);
            getAuditLog(50, 0).then(setAuditLogs).catch(() => {}).finally(() => setLoadingLogs(false));
          }
        }}
      />

      {/* ORGANIZATION TAB */}
      {activeTab === "organization" && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.orgData")}</CardTitle>
              <CardDescription>
                {i("cfg.orgDataDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="name"
                label={i("cfg.orgName")}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                id="cifNif"
                label={i("cfg.cifNif")}
                placeholder="B12345678"
                value={form.cifNif}
                onChange={(e) => setForm((prev) => ({ ...prev, cifNif: e.target.value }))}
                hint={i("cfg.cifNifHelp")}
              />
              <Select
                id="sector"
                label={i("cfg.sector")}
                options={sectorOptions}
                value={form.sector}
                onChange={(e) => setForm((prev) => ({ ...prev, sector: e.target.value }))}
                placeholder={i("cfg.selectSector")}
              />
              <Input
                id="sectorDescription"
                label={i("cfg.sectorDesc")}
                placeholder={i("cfg.sectorDescPlaceholder")}
                value={form.sectorDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, sectorDescription: e.target.value }))}
              />
              <Select
                id="size"
                label={i("cfg.size")}
                options={sizeOptions}
                value={form.size}
                onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value as "micro" | "small" | "medium" | "large" }))}
              />
              <Input
                id="website"
                label="Web"
                placeholder="https://www.example.com"
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button loading={saving} onClick={handleSave}>
              <Save className="h-4 w-4" />
              {i("cfg.saveChanges")}
            </Button>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === "team" && (
        <div className="space-y-6 max-w-2xl">
          {/* Invite */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.inviteMember")}</CardTitle>
              <CardDescription>
                {i("cfg.inviteDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="invite-email"
                  placeholder="email@example.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm"
                >
                  <option value="member">{i("cfg.roleMember")}</option>
                  <option value="admin">{i("cfg.roleAdmin")}</option>
                  <option value="viewer">{i("cfg.roleViewer")}</option>
                </select>
                <Button
                  loading={inviting}
                  onClick={async () => {
                    if (!inviteEmail) return;
                    setInviting(true);
                    try {
                      const result = await inviteTeamMember(inviteEmail, inviteRole as UserRole);
                      toast.success(result.message);
                      setInviteEmail("");
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : i("cfg.saveError");
                      toast.error(message);
                    } finally {
                      setInviting(false);
                    }
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  {i("cfg.invite")}
                </Button>
              </div>
              {org?.plan === "free" && (
                <Alert variant="warning" className="mt-3">
                  {i("cfg.freePlanLimit")}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Team list */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.teamMembers")} ({teamMembers.length})</CardTitle>
              <CardDescription>
                {i("cfg.teamMembersDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                        <span className="text-sm font-medium text-brand-500">
                          {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text flex items-center gap-2">
                          {member.name}
                          {member.role === "owner" && (
                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </p>
                        <p className="text-xs text-text-muted">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === "owner" ? (
                        <Badge variant="brand">{i("cfg.owner")}</Badge>
                      ) : (
                        <>
                          <select
                            value={member.role}
                            onChange={async (e) => {
                              try {
                                await updateTeamMemberRole(member.id, e.target.value as UserRole);
                                setTeamMembers((prev) =>
                                  prev.map((m) =>
                                    m.id === member.id ? { ...m, role: e.target.value as UserRole } : m
                                  )
                                );
                                toast.success(i("cfg.saved"));
                              } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : i("cfg.saveError");
                                toast.error(message);
                              }
                            }}
                            className="text-xs border border-border rounded px-2 py-1 bg-surface-secondary"
                          >
                            <option value="admin">{i("cfg.roleAdmin")}</option>
                            <option value="member">{i("cfg.roleMember")}</option>
                            <option value="viewer">{i("cfg.roleViewer")}</option>
                          </select>
                          <button
                            onClick={async (e) => {
                              if (!confirm(i("cfg.removeConfirm", { name: member.name || "" }))) return;
                              const btn = e.currentTarget;
                              btn.disabled = true;
                              try {
                                await removeTeamMember(member.id);
                                setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
                                toast.success(i("cfg.saved"));
                              } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : i("cfg.saveError");
                                toast.error(message);
                                btn.disabled = false;
                              }
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={i("cfg.inviteMember")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PLAN TAB */}
      {activeTab === "plan" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.currentPlan")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-lg font-bold px-4 py-2 rounded-lg ${
                    planLabels[org?.plan || "free"]?.color || "bg-surface-tertiary"
                  }`}
                >
                  {planLabels[org?.plan || "free"]?.label || "Free"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-surface-tertiary p-3">
                  <p className="text-text-muted">{i("cfg.aiSystems")}</p>
                  <p className="text-lg font-bold text-text">
                    {org?.maxAiSystems === -1 ? i("cfg.unlimited") : `${org?.maxAiSystems || 1}`}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-tertiary p-3">
                  <p className="text-text-muted">{i("cfg.users")}</p>
                  <p className="text-lg font-bold text-text">
                    {org?.maxUsers === -1 ? i("cfg.unlimited") : `${org?.maxUsers || 1}`}
                  </p>
                </div>
              </div>

              {org?.plan !== "free" && org?.stripeCustomerId && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/portal", { method: "POST" });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else toast.error(i("cfg.saveError"));
                    } catch {
                      toast.error(i("cfg.saveError"));
                    }
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                  {i("cfg.manageSubscription")}
                </Button>
              )}

              {/* Manual sync button - shows when plan is free (in case sync failed) */}
              {org?.plan === "free" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  disabled={syncing}
                  onClick={async () => {
                    setSyncing(true);
                    try {
                      const res = await fetch("/api/sync-plan", { method: "POST" });
                      const data = await res.json();
                      console.log("[sync-plan] Response:", data);
                      if (data.synced && data.plan) {
                        await reloadOrg();
                        toast.success(locale === "en" 
                          ? `Plan synced: ${planLabels[data.plan]?.label || data.plan}!` 
                          : `¡Plan sincronizado: ${planLabels[data.plan]?.label || data.plan}!`);
                      } else if (data.reason) {
                        toast.error(locale === "en"
                          ? `Could not sync: ${data.reason}`
                          : `No se pudo sincronizar: ${data.reason}`);
                      } else if (data.error) {
                        toast.error(data.error);
                      }
                    } catch (err) {
                      toast.error(locale === "en" ? "Sync failed" : "Error al sincronizar");
                    } finally {
                      setSyncing(false);
                    }
                  }}
                >
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {syncing 
                    ? (locale === "en" ? "Syncing..." : "Sincronizando...") 
                    : (locale === "en" ? "Sync plan from Stripe" : "Sincronizar plan desde Stripe")}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {org?.plan === "free" ? i("cfg.upgradePlan") : (locale === "en" ? "Change plan" : "Cambiar plan")}
              </CardTitle>
              <CardDescription>
                {org?.plan === "free"
                  ? (locale === "en" ? "Select the plan that best fits your needs" : "Selecciona el plan que mejor se adapte a tus necesidades")
                  : (locale === "en" ? "Upgrade or change your current plan" : "Mejora o cambia tu plan actual")
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanUpgradeCards currentPlan={org?.plan || "free"} onUpgrade={() => reloadOrg()} />
            </CardContent>
          </Card>

          {org?.stripeCustomerId && (
            <Card>
              <CardHeader>
                <CardTitle>{i("cfg.billing")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">
                  {i("cfg.billingDesc")}
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/portal", { method: "POST" });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                      else toast.error(i("cfg.saveError"));
                    } catch {
                      toast.error(i("cfg.saveError"));
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  {i("cfg.openBilling")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* CANCEL SUBSCRIPTION */}
          {org?.plan !== "free" && org?.stripeSubscriptionId && (
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {locale === "en" ? "Cancel Subscription" : "Cancelar suscripción"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4">
                  {locale === "en"
                    ? "If you cancel, you will keep access to your current plan until the end of your billing period. Under EU consumer protection law (Directive 2011/83/EU), you have a 14-day right of withdrawal from your first payment with a full refund."
                    : "Si cancelas, mantendrás el acceso a tu plan actual hasta el final de tu periodo de facturación. Según la legislación europea de protección al consumidor (Directiva 2011/83/UE), tienes un derecho de desistimiento de 14 días desde tu primer pago con reembolso completo."}
                </p>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => setShowCancelModal(true)}
                >
                  <XCircle className="h-4 w-4" />
                  {locale === "en" ? "Cancel subscription" : "Cancelar suscripción"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* CANCEL MODAL */}
          <Modal
            open={showCancelModal}
            onClose={() => !cancelling && setShowCancelModal(false)}
            title={locale === "en" ? "Cancel your subscription" : "Cancelar tu suscripción"}
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">
                      {locale === "en" ? "What happens when you cancel:" : "Qué pasa cuando cancelas:"}
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        {locale === "en"
                          ? "You keep access until the end of your current billing period"
                          : "Mantienes acceso hasta el final de tu periodo de facturación actual"}
                      </li>
                      <li>
                        {locale === "en"
                          ? "After that, your plan reverts to Free (1 system, 1 user)"
                          : "Después de eso, tu plan vuelve a Free (1 sistema, 1 usuario)"}
                      </li>
                      <li>
                        {locale === "en"
                          ? "Your data is preserved — you can resubscribe anytime"
                          : "Tus datos se conservan — puedes volver a suscribirte cuando quieras"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{locale === "en" ? "14-day right of withdrawal (EU):" : "Derecho de desistimiento de 14 días (UE):"}</strong>{" "}
                  {locale === "en"
                    ? "If less than 14 days have passed since your first payment, you can cancel immediately with a full refund."
                    : "Si han pasado menos de 14 días desde tu primer pago, puedes cancelar de inmediato con reembolso completo."}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {/* Cancel at period end — always available */}
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 w-full"
                  disabled={cancelling}
                  onClick={async () => {
                    setCancelling(true);
                    try {
                      const res = await fetch("/api/cancel-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ immediate: false }),
                      });
                      const data = await res.json();
                      if (data.cancelled) {
                        toast.success(data.message);
                        setShowCancelModal(false);
                        await reloadOrg();
                      } else {
                        toast.error(data.error || (locale === "en" ? "Cancellation failed" : "Error al cancelar"));
                      }
                    } catch {
                      toast.error(locale === "en" ? "Cancellation failed" : "Error al cancelar");
                    } finally {
                      setCancelling(false);
                    }
                  }}
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  {locale === "en" ? "Cancel at end of billing period" : "Cancelar al final del periodo"}
                </Button>

                {/* Immediate cancel + refund — only if within 14 days */}
                <Button
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 w-full"
                  disabled={cancelling}
                  onClick={async () => {
                    if (!confirm(
                      locale === "en"
                        ? "Are you sure? This will cancel your subscription immediately and issue a refund if you are within your 14-day withdrawal period."
                        : "¿Estás seguro? Esto cancelará tu suscripción inmediatamente y te reembolsará si estás dentro del periodo de desistimiento de 14 días."
                    )) return;

                    setCancelling(true);
                    try {
                      const res = await fetch("/api/cancel-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ immediate: true }),
                      });
                      const data = await res.json();
                      if (data.cancelled) {
                        toast.success(data.message);
                        setShowCancelModal(false);
                        await reloadOrg();
                      } else {
                        toast.error(data.error || (locale === "en" ? "Cancellation failed" : "Error al cancelar"));
                      }
                    } catch {
                      toast.error(locale === "en" ? "Cancellation failed" : "Error al cancelar");
                    } finally {
                      setCancelling(false);
                    }
                  }}
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  {locale === "en" ? "Cancel immediately + refund (14-day right)" : "Cancelar ahora + reembolso (derecho 14 días)"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={cancelling}
                  onClick={() => setShowCancelModal(false)}
                >
                  {locale === "en" ? "Keep my subscription" : "Mantener mi suscripción"}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div className="space-y-6 max-w-2xl">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.profile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label={i("cfg.profileName")}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Button
                size="sm"
                disabled={savingProfile || !profileName.trim()}
                onClick={async () => {
                  setSavingProfile(true);
                  try {
                    await updateProfile({ name: profileName.trim() });
                    toast.success(i("cfg.profileUpdated"));
                  } catch {
                    toast.error(i("cfg.saveError"));
                  } finally {
                    setSavingProfile(false);
                  }
                }}
              >
                <Save className="h-4 w-4" />
                {savingProfile ? "..." : i("cfg.save")}
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.security")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{i("cfg.changePassword")}</p>
                    <p className="text-xs text-text-muted">{i("cfg.changePasswordDesc")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      btn.disabled = true;
                      btn.textContent = "...";
                      try {
                        const supabase = createSupabaseBrowser();
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user?.email) { btn.disabled = false; btn.textContent = i("cfg.change"); return; }
                        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                          redirectTo: `${window.location.origin}/api/auth/callback`,
                        });
                        if (error) toast.error(error.message);
                        else toast.success(i("cfg.passwordResetSent"));
                      } catch {
                        toast.error(i("cfg.saveError"));
                      } finally {
                        btn.disabled = false;
                        btn.textContent = i("cfg.change");
                      }
                    }}
                  >
                    {i("cfg.change")}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{i("cfg.activeSessions")}</p>
                    <p className="text-xs text-text-muted">{i("cfg.activeSessionsDesc")}</p>
                  </div>
                  <Badge variant="success">{i("cfg.activeCount")}</Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{i("cfg.activityLog")}</p>
                    <p className="text-xs text-text-muted">{i("cfg.activityLogDesc")}</p>
                  </div>
                  <Badge>{i("cfg.active")}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.notifPrefs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { key: "email" as const, label: "cfg.notifEmail", desc: "cfg.notifEmailDesc" },
                { key: "deadlines" as const, label: "cfg.notifDeadlines", desc: "cfg.notifDeadlinesDesc" },
                { key: "updates" as const, label: "cfg.notifUpdates", desc: "cfg.notifUpdatesDesc" },
              ]).map((pref) => (
                <label key={pref.key} className="flex items-center justify-between rounded-lg border border-border p-4 cursor-pointer hover:bg-surface-tertiary transition">
                  <div>
                    <p className="text-sm font-medium text-text">{i(pref.label)}</p>
                    <p className="text-xs text-text-muted">{i(pref.desc)}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs[pref.key]}
                    onChange={(e) => {
                      setNotifPrefs((prev) => ({ ...prev, [pref.key]: e.target.checked }));
                      toast.success(i("cfg.notifSaved"));
                    }}
                    className="w-5 h-5 rounded border-border text-brand-600 focus:ring-brand-500"
                  />
                </label>
              ))}
            </CardContent>
          </Card>

          {/* GDPR Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.exportData")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">{i("cfg.exportDataDesc")}</p>
              <Button
                variant="outline"
                size="sm"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  try {
                    const data = await exportUserData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `audlex-export-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(i("cfg.exportSuccess"));
                  } catch {
                    toast.error(i("cfg.saveError"));
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                <Download className="h-4 w-4" />
                {exporting ? i("cfg.exporting") : i("cfg.exportData")}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">{i("cfg.dangerZone")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">
                {i("cfg.deleteWarning")}
              </p>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
                {i("cfg.deleteAccount")}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account Modal */}
          <Modal
            open={showDeleteModal}
            onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
            title={i("cfg.deleteConfirmTitle")}
            description={i("cfg.deleteConfirmDesc")}
            size="sm"
          >
            <div className="space-y-4">
              <Input
                label={i("cfg.typeToConfirm")}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={i("cfg.deleteConfirmWord")}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}>
                  {i("cfg.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmText !== i("cfg.deleteConfirmWord") || deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await deleteAccount();
                      window.location.href = "/";
                    } catch {
                      toast.error(i("cfg.saveError"));
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? i("cfg.deleting") : i("cfg.deleteAccount")}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === "audit" && (
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{i("cfg.auditLog")}</CardTitle>
              <CardDescription>
                {i("cfg.auditLogDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>{i("cfg.noActivity")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log: any) => {
                    const date = new Date(log.createdAt);
                    const actionLabel = td(locale, `log.action.${log.action}`) !== `log.action.${log.action}` 
                      ? td(locale, `log.action.${log.action}`)
                      : log.action;
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-tertiary transition"
                      >
                        <div className="mt-0.5">
                          <Activity className="h-4 w-4 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text">{actionLabel}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-text-muted">
                              {log.userName || i("cfg.systemAction")}
                            </p>
                            <span className="text-xs text-text-muted">•</span>
                            <p className="text-xs text-text-muted">
                              {date.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {log.entityType && (
                            <Badge variant="info" className="mt-2 text-xs">
                              {log.entityType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoadingLogs(true);
                getAuditLog(auditLogs.length + 50, 0)
                  .then(setAuditLogs)
                  .catch(() => {})
                  .finally(() => setLoadingLogs(false));
              }}
              disabled={loadingLogs}
            >
              {i("cfg.loadMore")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
