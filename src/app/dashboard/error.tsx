"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-text mb-2">
          Algo salió mal / Something went wrong
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
          <br />
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar / Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-tertiary transition"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
