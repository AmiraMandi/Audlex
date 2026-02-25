"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createSupabaseBrowser();
  const { locale } = useLocale();
  const i = (key: string, replacements?: Record<string, string | number>) => tp(locale, key, replacements);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-tertiary px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <span className="text-xl font-bold text-text">
              aud<span className="text-brand-500">lex</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-text-muted">{i("auth.reset.subtitle")}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-text mb-2">
                {i("auth.reset.sent.title")}
              </h2>
              <p className="text-sm text-text-secondary mb-6"
                 dangerouslySetInnerHTML={{ __html: i("auth.reset.sent.text", { email }) }}
              />
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {i("auth.reset.backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-secondary mb-6">
                {i("auth.reset.instructions")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                    {i("auth.login.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
                    placeholder="tu@empresa.com"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {i("auth.reset.submit")}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-text-muted">
          <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            {i("auth.reset.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
