"use client";

import { useState, useEffect } from "react";
import { Settings, Building2, Users, CreditCard, Shield, Save, ExternalLink, UserPlus, Trash2, Crown, Download, Bell, User, Activity } from "lucide-react";
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

  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const sectorOptions = SECTOR_VALUES.map((v) => ({ value: v, label: i(`cfg.sector.${v}`) }));
  const sizeOptions = SIZE_VALUES.map((v) => ({ value: v, label: i(`cfg.size.${v}`) }));

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
                            onClick={async () => {
                              if (!confirm(i("cfg.removeConfirm", { name: member.name || "" }))) return;
                              try {
                                await removeTeamMember(member.id);
                                setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
                                toast.success(i("cfg.saved"));
                              } catch (err: unknown) {
                                const message = err instanceof Error ? err.message : i("cfg.saveError");
                                toast.error(message);
                              }
                            }}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition"
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
            </CardContent>
          </Card>

          {org?.plan === "free" && (
            <Card>
              <CardHeader>
                <CardTitle>{i("cfg.upgradePlan")}</CardTitle>
                <CardDescription>
                  Selecciona el plan que mejor se adapte a tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanUpgradeCards />
              </CardContent>
            </Card>
          )}

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
                    onClick={async () => {
                      const supabase = createSupabaseBrowser();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user?.email) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                        redirectTo: `${window.location.origin}/api/auth/callback`,
                      });
                      if (error) toast.error(error.message);
                      else toast.success(i("cfg.passwordResetSent"));
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
