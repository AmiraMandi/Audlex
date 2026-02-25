"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const { locale } = useLocale();
  const i = (key: string) => tp(locale, key);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(i("auth.update.errorMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(i("auth.update.errorMismatch"));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
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
          <p className="mt-2 text-sm text-text-muted">{i("auth.update.subtitle")}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-text mb-2">
                {i("auth.update.success.title")}
              </h2>
              <p className="text-sm text-text-secondary mb-2">
                {i("auth.update.success.text")}
              </p>
              <Loader2 className="h-4 w-4 animate-spin text-brand-500 mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                  {i("auth.update.newPassword")}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
                  placeholder={i("auth.update.newPasswordPlaceholder")}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                  {i("auth.update.confirmPassword")}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
                  placeholder={i("auth.update.confirmPlaceholder")}
                  required
                  minLength={6}
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
                  <Lock className="h-4 w-4" />
                )}
                {i("auth.update.submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
