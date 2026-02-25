"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Cpu,
  Shield,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
  Factory,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

const STEP_ICONS = [Building2, Cpu, CheckCircle2];

const SECTOR_VALUES = [
  "technology", "finance", "healthcare", "retail", "manufacturing",
  "education", "legal", "hr", "logistics", "other",
];

const SIZE_VALUES = ["micro", "small", "medium", "large"] as const;

const COMMON_SYSTEMS = [
  { key: "chatbot", category: "chatbot", icon: "💬", riskLevel: "limited" },
  { key: "crm", category: "scoring_profiling", icon: "📊", riskLevel: "variable" },
  { key: "hr", category: "scoring_profiling", icon: "👤", riskLevel: "high" },
  { key: "content", category: "content_generation", icon: "✍️", riskLevel: "limited" },
  { key: "analytics", category: "predictive_analytics", icon: "📈", riskLevel: "minimal" },
  { key: "biometric", category: "biometric", icon: "🔐", riskLevel: "high" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const steps = [
    { id: 1, title: i("onb.step1"), icon: Building2 },
    { id: 2, title: i("onb.step2"), icon: Cpu },
    { id: 3, title: i("onb.step3"), icon: CheckCircle2 },
  ];

  const sectors = SECTOR_VALUES.map((v) => ({ value: v, label: i(`onb.sector.${v}`) }));
  const sizes = SIZE_VALUES.map((v) => ({
    value: v,
    label: i(`onb.size.${v}`),
    desc: i(`onb.sizeDesc.${v}`),
  }));
  const commonSystems = COMMON_SYSTEMS.map((s) => ({
    ...s,
    name: i(`onb.sys.${s.key}`),
    risk: i(`onb.sysRisk.${s.key}`),
  }));

  async function handleComplete() {
    setSaving(true);
    try {
      // Update organization info
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          sector,
          size,
          selectedSystem,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      // Navigate anyway
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface-secondary px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-brand-500" />
            <span className="text-lg font-bold text-text">
              aud<span className="text-brand-500">lex</span>
            </span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-text-muted hover:text-text transition"
          >
            {i("onb.skip")}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-surface-secondary px-6 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-all ${
                    currentStep >= step.id
                      ? "bg-brand-500 text-white"
                      : "bg-surface border border-border text-text-muted"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-sm hidden sm:block ${
                  currentStep >= step.id ? "text-text font-medium" : "text-text-muted"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded ${
                    currentStep > step.id ? "bg-brand-500" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
                  <Building2 className="h-8 w-8 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-text">{i("onb.step1Title")}</h1>
                <p className="mt-2 text-text-secondary">
                  {i("onb.step1Desc")}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {i("onb.companyLabel")}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={i("onb.companyPlaceholder")}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {i("onb.sectorLabel")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sectors.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSector(s.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm text-left transition ${
                          sector === s.value
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium"
                            : "border-border text-text-secondary hover:border-brand-500/30"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {i("onb.sizeLabel")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {sizes.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSize(s.value)}
                        className={`rounded-lg border px-4 py-3 text-left transition ${
                          size === s.value
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-border hover:border-brand-500/30"
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          size === s.value ? "text-brand-600 dark:text-brand-400" : "text-text"
                        }`}>
                          {s.desc}
                        </span>
                        <span className="block text-xs text-text-muted mt-0.5">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
                >
                  {i("onb.next")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: First AI System */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
                  <Cpu className="h-8 w-8 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-text">{i("onb.step2Title")}</h1>
                <p className="mt-2 text-text-secondary">
                  {i("onb.step2Desc")}
                </p>
              </div>

              <div className="space-y-3">
                {commonSystems.map((sys) => (
                  <button
                    key={sys.key}
                    onClick={() => setSelectedSystem(selectedSystem === sys.category ? null : sys.category)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                      selectedSystem === sys.category
                        ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/30"
                        : "border-border hover:border-brand-500/30"
                    }`}
                  >
                    <span className="text-2xl">{sys.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-text">{sys.name}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        sys.riskLevel === "high"
                          ? "bg-red-500/10 text-red-500"
                          : sys.riskLevel === "limited"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : sys.riskLevel === "minimal"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {sys.risk}
                      </span>
                    </div>
                    {selectedSystem === sys.category && (
                      <CheckCircle2 className="h-5 w-5 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-text-muted">
                {i("onb.step2Note")}
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:text-text hover:border-brand-500/30 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {i("onb.prev")}
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
                >
                  {i("onb.next")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="space-y-8 text-center">
              <div>
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
                  <Sparkles className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-text">{i("onb.step3Title")}</h1>
                <p className="mt-2 text-text-secondary max-w-md mx-auto">
                  {i("onb.step3Desc")}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="rounded-xl border border-border bg-surface-secondary p-4">
                  <Cpu className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-text">{i("onb.action1")}</p>
                  <p className="text-xs text-text-muted mt-1">{i("onb.action1Desc")}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-secondary p-4">
                  <Shield className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-text">{i("onb.action2")}</p>
                  <p className="text-xs text-text-muted mt-1">{i("onb.action2Desc")}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-secondary p-4">
                  <CheckCircle2 className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-text">{i("onb.action3")}</p>
                  <p className="text-xs text-text-muted mt-1">{i("onb.action3Desc")}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {saving ? i("onb.saving") : i("onb.goToDashboard")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
