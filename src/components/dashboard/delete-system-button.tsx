"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAiSystem } from "@/app/actions";
import { useLocale } from "@/hooks/use-locale";
import { td } from "@/lib/i18n/dashboard-translations";

export function DeleteSystemButton({ systemId, systemName }: { systemId: string; systemName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const { locale } = useLocale();
  const i = (key: string) => td(locale, key);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteAiSystem(systemId);
      router.refresh();
    } catch {
      alert(i("del.error"));
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          {loading ? "..." : i("del.confirm")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-text-muted hover:text-text"
        >
          {i("del.cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition"
      title={i("del.confirm")}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
