"use client";

import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import { AiSystemForm } from "@/components/forms/ai-system-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { AiSystem } from "@/types";

export function EditSystemContent({ system }: { system: AiSystem }) {
  const { locale } = useLocale();
  const i = (key: string) => td(locale, key);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/inventario/${system.id}`}
          className="p-2 rounded-lg hover:bg-surface-tertiary transition"
        >
          <ArrowLeft className="h-4 w-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">
            {locale === "en" ? "Edit System" : "Editar Sistema"}
          </h1>
          <p className="text-text-secondary mt-1">{system.name}</p>
        </div>
      </div>
      <AiSystemForm
        editId={system.id}
        initialData={{
          name: system.name,
          description: system.description || "",
          provider: system.provider || "",
          providerModel: system.providerModel || "",
          category: system.category,
          purpose: system.purpose,
          dataTypes: system.dataTypes || [],
          affectedPersons: system.affectedPersons || [],
          numberOfAffected: system.numberOfAffected || "",
          isAutonomousDecision: system.isAutonomousDecision || false,
          hasHumanOversight: system.hasHumanOversight ?? true,
          status: system.status || "active",
          notes: system.notes || "",
        }}
      />
    </div>
  );
}
