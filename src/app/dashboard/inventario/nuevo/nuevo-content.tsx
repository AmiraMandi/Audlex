"use client";

import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";
import { AiSystemForm } from "@/components/forms/ai-system-form";

export function NuevoContent({ initialCategory, initialName }: { initialCategory?: string; initialName?: string }) {
  const { locale } = useLocale();
  const i = (key: string) => td(locale, key);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{i("inv.registerTitle")}</h1>
        <p className="text-text-secondary mt-1">{i("inv.registerSubtitle")}</p>
      </div>
      <AiSystemForm initialCategory={initialCategory} initialName={initialName} />
    </div>
  );
}
