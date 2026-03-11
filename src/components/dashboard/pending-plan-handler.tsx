"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Component that checks if there's a pending plan after login/registration
 * and automatically initiates the checkout process.
 */
export function PendingPlanHandler() {
  const router = useRouter();

  useEffect(() => {
    async function processPendingPlan() {
      const pendingPlanStr = localStorage.getItem("pending_plan");
      
      if (!pendingPlanStr) return;

      // Clear the pending plan immediately to avoid loops
      localStorage.removeItem("pending_plan");

      try {
        // Parse the pending plan (could be string or JSON)
        let planData: { plan: string; isAnnual?: boolean };
        try {
          planData = JSON.parse(pendingPlanStr);
        } catch {
          // Legacy format: just a string
          planData = { plan: pendingPlanStr, isAnnual: false };
        }

        // First check if user already has this plan (e.g. set via SQL for testing)
        // If so, skip the checkout
        try {
          const orgRes = await fetch("/api/onboarding/plan");
          if (orgRes.ok) {
            const orgData = await orgRes.json();
            if (orgData.plan === planData.plan) {
              // User already has the target plan — skip checkout
              return;
            }
          }
        } catch {
          // Continue with checkout if plan check fails
        }

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            plan: planData.plan, 
            locale: "es",
            isAnnual: planData.isAnnual || false
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Error al crear sesión de pago");
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          toast.success("Redirigiendo al checkout...");
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Error processing pending plan:", error);
        toast.error("Error al procesar el pago. Intenta desde Configuración → Plan");
      }
    }

    // Wait a bit for the session to be fully established
    const timer = setTimeout(processPendingPlan, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
