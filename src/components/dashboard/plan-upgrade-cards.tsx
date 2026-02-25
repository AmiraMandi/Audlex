"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanKey = "starter" | "business" | "enterprise" | "consultora";

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
  onUpgrade?: () => void;
}

export function PlanUpgradeCards({ onUpgrade }: PlanUpgradeCardsProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleUpgrade = async (planKey: PlanKey) => {
    setLoading(planKey);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, locale: "es", isAnnual }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al crear sesión de pago");
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
        onUpgrade?.();
      } else {
        toast.error("No se pudo crear la sesión de pago");
        setLoading(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar el pago");
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
      {PLANS.map((plan) => (
        <div
          key={plan.key}
          className={`relative rounded-xl border p-5 flex flex-col transition-all ${
            plan.popular
              ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/20"
              : "border-border bg-surface-secondary"
          }`}
        >
          {plan.popular && (
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
          <Button
            size="sm"
            variant={plan.popular ? "default" : "outline"}
            loading={loading === plan.key}
            onClick={() => handleUpgrade(plan.key)}
            className="w-full"
          >
            {loading === plan.key ? "Procesando..." : "Seleccionar"}
          </Button>
        </div>
      ))}
      </div>
    </div>
  );
}
