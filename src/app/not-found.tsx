import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <ShieldCheck className="h-8 w-8 text-brand-500" />
        </div>
        <h1 className="text-6xl font-bold text-brand-500 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-text mb-2">
          Página no encontrada / Page not found
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          La página que buscas no existe o ha sido movida.
          <br />
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
          >
            Inicio / Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-tertiary transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
