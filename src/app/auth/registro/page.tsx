"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Loader2, Check } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { tp } from "@/lib/i18n/public-translations";

export default function RegistroPage() {
  const [step, setStep] = useState<"auth" | "company">("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("micro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const { locale } = useLocale();
  const i = (key: string) => tp(locale, key);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is enabled, redirect to verification screen
    // Otherwise proceed to company setup
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // No session means email confirmation is required
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      setLoading(false);
      return;
    }

    setStep("company");
    setLoading(false);
  }

  async function handleCompanySetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, sector, size }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (locale === "es" ? "Error al crear la organización" : "Error creating organisation"));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (locale === "es" ? "Error desconocido" : "Unknown error"));
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  const sectors = [
    { value: "technology", label: i("auth.sector.technology") },
    { value: "finance_insurance", label: i("auth.sector.finance_insurance") },
    { value: "healthcare", label: i("auth.sector.healthcare") },
    { value: "education", label: i("auth.sector.education") },
    { value: "employment_hr", label: i("auth.sector.employment_hr") },
    { value: "retail", label: i("auth.sector.retail") },
    { value: "manufacturing", label: i("auth.sector.manufacturing") },
    { value: "marketing", label: i("auth.sector.marketing") },
    { value: "legal", label: i("auth.sector.legal") },
    { value: "public_services", label: i("auth.sector.public_services") },
    { value: "other", label: i("auth.sector.other") },
  ];

  if (step === "company") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-tertiary px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-text">{i("auth.register.created")}</h1>
            <p className="mt-1 text-sm text-text-muted">
              {i("auth.register.companySetup")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
            <form onSubmit={handleCompanySetup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {i("auth.register.companyName")}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  placeholder="Mi Empresa SL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {i("auth.register.sector")}
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                >
                  <option value="">{i("auth.register.sectorPlaceholder")}</option>
                  {sectors.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {i("auth.register.size")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "micro", label: "< 10", sub: i("auth.register.sizeMicro") },
                    { value: "small", label: "10-49", sub: i("auth.register.sizeSmall") },
                    { value: "medium", label: "50-249", sub: i("auth.register.sizeMedium") },
                    { value: "large", label: "250+", sub: i("auth.register.sizeLarge") },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSize(option.value)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                        size === option.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border hover:bg-surface-tertiary"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <br />
                      <span className="text-xs text-text-muted">{option.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {i("auth.register.goToDashboard")}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-tertiary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="relative h-12 w-auto mx-auto">
              <Image
                src={isDark ? "/logo-white.svg" : "/logo.svg"}
                alt="Audlex Logo"
                width={200}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
          </Link>
          <p className="mt-3 text-sm text-text-muted">
            {i("auth.register.subtitle")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-sm">
          <button
            onClick={handleGoogleRegister}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {i("auth.login.google")}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">{i("auth.login.orEmail")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{i("auth.register.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{i("auth.login.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                placeholder="tu@empresa.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{i("auth.login.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                placeholder={i("auth.register.passwordPlaceholder")}
                minLength={8}
                required
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
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {i("auth.register.submit")}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-text-muted">
            {locale === "es" ? (
              <>Al registrarte aceptas nuestros{" "}
                <a href="/legal/terminos" className="underline">{i("auth.register.termsLink")}</a> y{" "}
                <a href="/legal/privacidad" className="underline">{i("auth.register.privacyLink")}</a>
              </>
            ) : (
              <>By registering you accept our{" "}
                <a href="/legal/terminos" className="underline">{i("auth.register.termsLink")}</a> and{" "}
                <a href="/legal/privacidad" className="underline">{i("auth.register.privacyLink")}</a>
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-text-muted">
          {i("auth.register.hasAccount")}{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            {i("auth.register.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
