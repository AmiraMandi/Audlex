"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/feedback";
import { createAiSystem, updateAiSystem, type CreateSystemInput } from "@/app/actions";
import { ArrowLeft, ArrowRight, Save, Cpu } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

// Client-side Zod validation schema — locale-aware factories
type Locale = "es" | "en";
function buildStep1Schema(l: Locale) {
  const en = l === "en";
  return z.object({
    name: z.string().min(1, en ? "Name is required" : "El nombre es obligatorio").max(200, en ? "Max 200 characters" : "Máximo 200 caracteres"),
    category: z.string().min(1, en ? "Category is required" : "La categoría es obligatoria"),
    purpose: z.string().min(1, en ? "Purpose is required" : "El propósito es obligatorio").min(10, en ? "Describe the purpose with at least 10 characters" : "Describe el propósito con al menos 10 caracteres"),
    description: z.string().optional(),
  });
}

const step2Schema = z.object({
  dataTypes: z.array(z.string()).optional(),
  affectedPersons: z.array(z.string()).optional(),
  numberOfAffected: z.string().optional(),
});

function buildFullSchema(l: Locale) {
  const en = l === "en";
  return z.object({
    name: z.string().min(1, en ? "Name is required" : "El nombre es obligatorio").max(200, en ? "Max 200 characters" : "Máximo 200 caracteres"),
    category: z.string().min(1, en ? "Category is required" : "La categoría es obligatoria"),
    purpose: z.string().min(1, en ? "Purpose is required" : "El propósito es obligatorio").min(10, en ? "Describe the purpose with at least 10 characters" : "Describe el propósito con al menos 10 caracteres"),
    description: z.string().optional(),
    provider: z.string().optional(),
    providerModel: z.string().optional(),
    dataTypes: z.array(z.string()).optional(),
    affectedPersons: z.array(z.string()).optional(),
    numberOfAffected: z.string().optional(),
    isAutonomousDecision: z.boolean().optional(),
    hasHumanOversight: z.boolean().optional(),
    status: z.enum(["active", "planned", "retired"]).optional(),
    notes: z.string().optional(),
  });
}

const CATEGORY_VALUES = [
  "chatbot", "content_generation", "decision_support", "autonomous_decision",
  "biometric", "scoring_profiling", "monitoring", "recommendation",
  "predictive_analytics", "automation", "other",
];

const DATA_TYPE_VALUES = [
  "personal_data", "sensitive_data", "biometric_data", "financial_data",
  "behavioral_data", "location_data", "public_data", "anonymized_data",
];

const AFFECTED_PERSON_VALUES = [
  "employees", "customers", "citizens", "minors",
  "students", "patients", "job_applicants",
];

const STATUS_VALUES = ["active", "planned", "retired"];

interface AiSystemFormProps {
  initialData?: Partial<CreateSystemInput>;
  initialCategory?: string;
  initialName?: string;
  editId?: string; // If set, form is in edit mode
}

export function AiSystemForm({ initialData, initialCategory, initialName, editId }: AiSystemFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const i = (key: string, r?: Record<string, string | number>) => td(locale, key, r);

  const categories = CATEGORY_VALUES.map((v) => ({ value: v, label: i(`form.cat.${v}`) }));
  const dataTypeOptions = DATA_TYPE_VALUES.map((v) => ({ value: v, label: i(`form.data.${v}`) }));
  const affectedPersonOptions = AFFECTED_PERSON_VALUES.map((v) => ({ value: v, label: i(`form.person.${v}`) }));
  const statusOptions = STATUS_VALUES.map((v) => ({ value: v, label: i(`form.status.${v}`) }));

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateSystemInput>({
    name: initialName || initialData?.name || "",
    description: initialData?.description || "",
    provider: initialData?.provider || "",
    providerModel: initialData?.providerModel || "",
    category: initialCategory || initialData?.category || "",
    purpose: initialData?.purpose || "",
    dataTypes: initialData?.dataTypes || [],
    affectedPersons: initialData?.affectedPersons || [],
    numberOfAffected: initialData?.numberOfAffected || "",
    isAutonomousDecision: initialData?.isAutonomousDecision || false,
    hasHumanOversight: initialData?.hasHumanOversight ?? true,
    status: initialData?.status || "active",
    notes: initialData?.notes || "",
  });

  function update<K extends keyof CreateSystemInput>(field: K, value: CreateSystemInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayItem(field: "dataTypes" | "affectedPersons", value: string) {
    const arr = (form[field] as string[]) || [];
    const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    update(field, updated);
  }

  function validateStep(stepNum: number): boolean {
    try {
      if (stepNum === 1) {
        buildStep1Schema(locale as Locale).parse({ name: form.name, category: form.category, purpose: form.purpose, description: form.description });
      } else if (stepNum === 2) {
        step2Schema.parse({ dataTypes: form.dataTypes, affectedPersons: form.affectedPersons, numberOfAffected: form.numberOfAffected });
      }
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[String(e.path[0])] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  }

  function goNext() {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    // Full validation
    const result = buildFullSchema(locale as Locale).safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) errors[String(e.path[0])] = e.message;
      });
      setFieldErrors(errors);
      setError(i("form.validationError"));
      setLoading(false);
      return;
    }

    try {
      if (editId) {
        await updateAiSystem(editId, form);
        router.push(`/dashboard/inventario/${editId}`);
      } else {
        await createAiSystem(form);
        router.push("/dashboard/inventario");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : i("form.saveError"));
    } finally {
      setLoading(false);
    }
  }

  const canGoNext =
    step === 1
      ? form.name && form.category && form.purpose
      : step === 2
      ? true
      : true;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: i("form.step1") },
          { n: 2, label: i("form.step2") },
          { n: 3, label: i("form.step3") },
        ].map((s, idx) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                step >= s.n
                  ? "bg-brand-500 text-white"
                  : "bg-surface-tertiary text-text-muted"
              }`}
            >
              {s.n}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                step >= s.n ? "text-text font-medium" : "text-text-muted"
              }`}
            >
              {s.label}
            </span>
            {idx < 2 && <div className="flex-1 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="space-y-5">
          <Input
            id="name"
            label={i("form.nameLabel")}
            placeholder={i("form.namePlaceholder")}
            value={form.name}
            onChange={(e) => { update("name", e.target.value); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
            required
            error={fieldErrors.name}
          />
          <Select
            id="category"
            label={i("form.categoryLabel")}
            options={categories}
            value={form.category}
            onChange={(e) => { update("category", e.target.value); setFieldErrors((prev) => ({ ...prev, category: "" })); }}
            placeholder={i("form.categoryPlaceholder")}
            required
            error={fieldErrors.category}
          />
          <Textarea
            id="purpose"
            label={i("form.purposeLabel")}
            placeholder={i("form.purposePlaceholder")}
            value={form.purpose}
            onChange={(e) => { update("purpose", e.target.value); setFieldErrors((prev) => ({ ...prev, purpose: "" })); }}
            required
            error={fieldErrors.purpose}
          />
          <Textarea
            id="description"
            label={i("form.descLabel")}
            placeholder={i("form.descPlaceholder")}
            value={form.description || ""}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
      )}

      {/* Step 2: Data & Scope */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              {i("form.dataLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dataTypeOptions.map((opt) => {
                const selected = (form.dataTypes || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleArrayItem("dataTypes", opt.value)}
                    className={`text-left rounded-lg border p-3 text-sm transition ${
                      selected
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-border hover:bg-surface-tertiary text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-3">
              {i("form.personLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {affectedPersonOptions.map((opt) => {
                const selected = (form.affectedPersons || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleArrayItem("affectedPersons", opt.value)}
                    className={`text-left rounded-lg border p-3 text-sm transition ${
                      selected
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-border hover:bg-surface-tertiary text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            id="numberOfAffected"
            label={i("form.affectedCount")}
            placeholder={i("form.affectedPlaceholder")}
            value={form.numberOfAffected || ""}
            onChange={(e) => update("numberOfAffected", e.target.value)}
          />
        </div>
      )}

      {/* Step 3: Technical details */}
      {step === 3 && (
        <div className="space-y-5">
          <Input
            id="provider"
            label={i("form.providerLabel")}
            placeholder={i("form.providerPlaceholder")}
            value={form.provider || ""}
            onChange={(e) => update("provider", e.target.value)}
          />
          <Input
            id="providerModel"
            label={i("form.modelLabel")}
            placeholder={i("form.modelPlaceholder")}
            value={form.providerModel || ""}
            onChange={(e) => update("providerModel", e.target.value)}
          />
          <Select
            id="status"
            label={i("form.statusLabel")}
            options={statusOptions}
            value={form.status || "active"}
            onChange={(e) => update("status", e.target.value as CreateSystemInput["status"])}
          />

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-text">{i("form.autonomous")}</p>
                <p className="text-xs text-text-muted">{i("form.autonomousDesc")}</p>
              </div>
              <button
                type="button"
                onClick={() => update("isAutonomousDecision", !form.isAutonomousDecision)}
                className={`relative h-6 w-11 rounded-full transition ${
                  form.isAutonomousDecision ? "bg-brand-500" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface-secondary shadow transition-transform ${
                    form.isAutonomousDecision ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-text">{i("form.oversight")}</p>
                <p className="text-xs text-text-muted">{i("form.oversightDesc")}</p>
              </div>
              <button
                type="button"
                onClick={() => update("hasHumanOversight", !form.hasHumanOversight)}
                className={`relative h-6 w-11 rounded-full transition ${
                  form.hasHumanOversight ? "bg-brand-500" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface-secondary shadow transition-transform ${
                    form.hasHumanOversight ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <Textarea
            id="notes"
            label={i("form.notesLabel")}
            placeholder={i("form.notesPlaceholder")}
            value={form.notes || ""}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" />
            {i("form.prev")}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            {i("form.cancel")}
          </Button>
        )}

        {step < 3 ? (
          <Button onClick={goNext} disabled={!canGoNext}>
            {i("form.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            <Save className="h-4 w-4" />
            {i("form.save")}
          </Button>
        )}
      </div>
    </div>
  );
}
