"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";

type PlanKey = "starter" | "business" | "enterprise" | "consultora";

interface PricingButtonProps {
  plan: PlanKey;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
  isAnnual?: boolean;
}

export function PricingButton({ plan, label, variant = "secondary", className = "", isAnnual = false }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    }
    checkAuth();
  }, []);

  const handleClick = async () => {
    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not authenticated → save intent and redirect to registro
        localStorage.setItem("pending_plan", JSON.stringify({ plan, isAnnual }));
        router.push(`/registro?plan=${plan}`);
        return;
      }

      // Authenticated → create checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale: "es", isAnnual }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al crear sesión de pago");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No se pudo crear la sesión de pago");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar el pago");
      setLoading(false);
    }
  };

  const isPrimary = variant === "primary";

  return (
    <button
      onClick={handleClick}
      disabled={loading || isAuthenticated === null}
      className={`group w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        isPrimary
          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-[1.02]"
          : "border border-border/50 text-text-secondary hover:text-text hover:border-brand-500/40 hover:bg-brand-500/5 hover:scale-[1.01]"
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {isAuthenticated ? "Procesando..." : "Redirigiendo..."}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {label}
          {isPrimary && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
        </span>
      )}
    </button>
  );
}
