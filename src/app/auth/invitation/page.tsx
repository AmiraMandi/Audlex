"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { acceptClientInvitation } from "@/app/actions";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Shield, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

function InvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const orgId = searchParams.get("org") || "";

  const [status, setStatus] = useState<"checking" | "login" | "register" | "accepting" | "success" | "error">("checking");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (!token || !orgId) {
        setStatus("error");
        setError("Enlace de invitación inválido / Invalid invitation link");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Already logged in — try accepting immediately
        setStatus("accepting");
        const result = await acceptClientInvitation(token, orgId);
        if (result.success) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setStatus("error");
          setError(result.error || "Error al aceptar invitación");
        }
      } else {
        // Not logged in — show register/login form
        setStatus("register");
      }
    }
    checkAuth();
  }, [token, orgId, supabase.auth, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/invitation?token=${token}&email=${encodeURIComponent(email)}&org=${orgId}`,
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setLoading(false);
        return;
      }

      // Check if we got a session (no email confirmation required)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("accepting");
        const result = await acceptClientInvitation(token, orgId);
        if (result.success) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setStatus("error");
          setError(result.error || "Error");
        }
      } else {
        // Email confirmation needed — inform user
        setStatus("error");
        setError("Te hemos enviado un email de confirmación. Confirma tu email y vuelve a abrir este enlace. / We sent you a confirmation email. Please confirm and reopen this link.");
      }
    } catch {
      setError("Error inesperado / Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setError(signInErr.message);
        setLoading(false);
        return;
      }

      setStatus("accepting");
      const result = await acceptClientInvitation(token, orgId);
      if (result.success) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
        setError(result.error || "Error");
      }
    } catch {
      setError("Error inesperado / Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src={isDark ? "/brand/logotipo-dark.svg" : "/brand/logotipo-light.svg"}
              alt="Audlex"
              width={140}
              height={40}
              className="mx-auto"
              priority
            />
          </Link>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm p-8">
          {/* Checking auth */}
          {status === "checking" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-text-secondary">Verificando invitación...</p>
            </div>
          )}

          {/* Accepting invitation */}
          {status === "accepting" && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-3" />
              <p className="text-text-secondary">Aceptando invitación...</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-text mb-2">¡Invitación aceptada!</h2>
              <p className="text-text-secondary">Redirigiendo al dashboard...</p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-text mb-2">Error</h2>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Link href="/login" className="text-sm text-brand-500 hover:underline">
                Ir al login
              </Link>
            </div>
          )}

          {/* Register / Login form */}
          {(status === "register" || status === "login") && (
            <>
              <div className="text-center mb-6">
                <Shield className="h-10 w-10 text-brand-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-text">Invitación a Audlex</h2>
                <p className="text-sm text-text-secondary mt-1">
                  {email && <>Para: <strong>{email}</strong></>}
                </p>
              </div>

              {/* Toggle */}
              <div className="flex gap-1 mb-6 bg-surface-secondary rounded-lg p-1">
                <button
                  onClick={() => setStatus("register")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    status === "register" ? "bg-surface text-text shadow-sm" : "text-text-muted"
                  }`}
                >
                  Crear cuenta
                </button>
                <button
                  onClick={() => setStatus("login")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    status === "login" ? "bg-surface text-text shadow-sm" : "text-text-muted"
                  }`}
                >
                  Ya tengo cuenta
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {status === "register" ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Nombre</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="flex h-10 w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Crear cuenta y aceptar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="flex h-10 w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Iniciar sesión y aceptar"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Audlex — Compliance con el EU AI Act
        </p>
      </div>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
