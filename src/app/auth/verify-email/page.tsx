"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, RefreshCw } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { locale } = useLocale();

  const supabase = createSupabaseBrowser();

  async function handleResend() {
    if (!email) return;
    setResending(true);
    try {
      await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      setResent(true);
    } catch {
      // Silently fail
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-tertiary px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-surface-secondary rounded-2xl border border-border p-8 shadow-xl">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
            <Mail className="h-7 w-7 text-brand-500" />
          </div>

          <h1 className="text-xl font-bold text-text mb-2">
            {locale === "en" ? "Verify your email" : "Verifica tu email"}
          </h1>

          <p className="text-sm text-text-secondary mb-6">
            {locale === "en"
              ? `We've sent a verification link to ${email || "your email"}. Check your inbox.`
              : `Hemos enviado un enlace de verificación a ${email || "tu email"}. Revisa tu bandeja de entrada.`}
          </p>

          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-tertiary transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
            {resent
              ? (locale === "en" ? "Email resent" : "Email reenviado")
              : (locale === "en" ? "Resend email" : "Reenviar email")}
          </button>

          <p className="text-xs text-text-muted mt-4">
            {locale === "en"
              ? "If you can't find it, check your spam folder."
              : "Si no lo encuentras, revisa la carpeta de spam."}
          </p>

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href="/auth/login"
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              {locale === "en" ? "Back to login" : "Volver al login"}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-semibold text-text">
            aud<span className="text-brand-500">lex</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-tertiary">
          <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
