"use client";

import { useState } from "react";
import { CheckCircle2, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanKey = "starter" | "business" | "enterprise" | "consultora";

// Plan hierarchy for upgrade/downgrade comparison
const PLAN_ORDER: Record<string, number> = {
  free: 0,
  starter: 1,
  business: 2,
  consultora: 3,
  enterprise: 4,
};

interface Plan {
  key: PlanKey;
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    priceMonthly: "€69",
    priceAnnual: "€660",
    description: "Para autónomos y microempresas",
    features: [
      "5 sistemas de IA",
      "Documentación completa",
      "Checklist interactivo",
      "Exportación PDF",
      "2 usuarios",
    ],
  },
  {
    key: "business",
    name: "Business",
    priceMonthly: "€199",
    priceAnnual: "€1,910",
    description: "Para PYMEs",
    features: [
      "25 sistemas de IA",
      "Todo de Starter",
      "5 usuarios",
      "Alertas y monitorización",
      "Dashboard completo",
      "Audit log",
    ],
    popular: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceMonthly: "€499",
    priceAnnual: "€4,790",
    description: "Para grandes empresas",
    features: [
      "Sistemas ilimitados",
      "Todo de Business",
      "Usuarios ilimitados",
      "API access",
      "Soporte prioritario",
    ],
  },
  {
    key: "consultora",
    name: "Consultora",
    priceMonthly: "€349",
    priceAnnual: "€3,350",
    description: "Para consultoras multi-cliente",
    features: [
      "Clientes ilimitados",
      "Panel multi-cliente",
      "Marca personalizada",
      "Soporte prioritario",
    ],
  },
];

interface PlanUpgradeCardsProps {
  currentPlan?: string;
  onUpgrade?: () => void;
}

export function PlanUpgradeCards({ currentPlan = "free", onUpgrade }: PlanUpgradeCardsProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const currentOrder = PLAN_ORDER[currentPlan] ?? 0;

  const getButtonState = (planKey: PlanKey) => {
    if (planKey === currentPlan) return "current";
    const planOrder = PLAN_ORDER[planKey] ?? 0;
    return planOrder > currentOrder ? "upgrade" : "downgrade";
  };

  const handleChangePlan = async (planKey: PlanKey) => {
    const state = getButtonState(planKey);
    if (state === "current") return;

    setLoading(planKey);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: planKey, 
          locale: "es", 
          isAnnual,
          changePlan: currentPlan !== "free", // Signal this is a plan change, not new subscription
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al procesar el cambio de plan");
        setLoading(null);
        return;
      }

      // If plan was changed directly (subscription update), reload
      if (data.changed) {
        toast.success(data.message || "¡Plan actualizado!");
        onUpgrade?.();
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout (for new subscriptions)
      if (data.url) {
        window.location.href = data.url;
        onUpgrade?.();
      } else {
        toast.error("No se pudo procesar el cambio");
        setLoading(null);
      }
    } catch (error) {
      console.error("Plan change error:", error);
      toast.error("Error al procesar el cambio");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-surface-tertiary p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-all",
              !isAnnual
                ? "bg-surface text-text shadow-sm"
                : "text-text-secondary hover:text-text"
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5",
              isAnnual
                ? "bg-surface text-text shadow-sm"
                : "text-text-secondary hover:text-text"
            )}
          >
            Anual
            <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {PLANS.map((plan) => {
        const state = getButtonState(plan.key);
        const isCurrent = state === "current";

        return (
          <div
            key={plan.key}
            className={cn(
              "relative rounded-xl border p-5 flex flex-col transition-all",
              isCurrent
                ? "border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/30"
                : plan.popular
                  ? "border-brand-500/50 bg-brand-500/5 ring-1 ring-brand-500/20"
                  : "border-border bg-surface-secondary"
            )}
          >
            {isCurrent && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-lg">
                  Tu plan actual
                </span>
              </div>
            )}
            {!isCurrent && plan.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-lg">
                  Más popular
                </span>
              </div>
            )}
            <div className="mb-3">
              <h3 className="font-semibold text-text text-lg">{plan.name}</h3>
              <p className="text-xs text-text-muted">{plan.description}</p>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-text">
                {isAnnual ? plan.priceAnnual : plan.priceMonthly}
              </span>
              <span className="text-sm text-text-muted ml-1">
                {isAnnual ? "/año" : "/mes"}
              </span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isCurrent ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="w-full opacity-70"
              >
                <Check className="h-4 w-4" />
                Plan actual
              </Button>
            ) : (
              <Button
                size="sm"
                variant={state === "upgrade" ? "default" : "outline"}
                loading={loading === plan.key}
                onClick={() => handleChangePlan(plan.key)}
                className="w-full"
              >
                {loading === plan.key 
                  ? "Procesando..." 
                  : state === "upgrade" 
                    ? <><ArrowUp className="h-4 w-4" /> Mejorar plan</>
                    : <><ArrowDown className="h-4 w-4" /> Cambiar plan</>
                }
              </Button>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
