"use client";

import { useState } from "react";
import { CheckCircle2, ArrowUp, ArrowDown, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
  const [confirmModal, setConfirmModal] = useState<{ plan: Plan; state: "upgrade" | "downgrade" } | null>(null);

  const currentOrder = PLAN_ORDER[currentPlan] ?? 0;
  const currentPlanData = PLANS.find(p => p.key === currentPlan);

  const getButtonState = (planKey: PlanKey) => {
    if (planKey === currentPlan) return "current";
    const planOrder = PLAN_ORDER[planKey] ?? 0;
    return planOrder > currentOrder ? "upgrade" : "downgrade";
  };

  const executePlanChange = async (planKey: PlanKey) => {
    setLoading(planKey);
    setConfirmModal(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: planKey, 
          locale: "es", 
          isAnnual,
          changePlan: currentPlan !== "free",
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

  const handleChangePlan = (planKey: PlanKey) => {
    const state = getButtonState(planKey);
    if (state === "current") return;

    const targetPlan = PLANS.find(p => p.key === planKey);
    if (!targetPlan) return;

    // If user has no plan (free), go directly to checkout - no confirmation needed
    if (currentPlan === "free") {
      executePlanChange(planKey);
      return;
    }

    // Show confirmation modal for plan changes
    setConfirmModal({ plan: targetPlan, state: state as "upgrade" | "downgrade" });
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
        const showBadge = isCurrent || (!isCurrent && plan.popular);

        return (
          <div
            key={plan.key}
            className={cn(
              "relative rounded-xl border flex flex-col transition-all",
              showBadge ? "pt-8 px-5 pb-5" : "p-5",
              isCurrent
                ? "border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/30"
                : plan.popular
                  ? "border-brand-500/50 bg-brand-500/5 ring-1 ring-brand-500/20"
                  : "border-border bg-surface-secondary"
            )}
          >
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Tu plan actual
                </span>
              </div>
            )}
            {!isCurrent && plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
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
      <p className="text-center text-xs text-text-muted mt-4">
        Precios sin IVA. El impuesto aplicable se calcula en el checkout.
      </p>

      {/* Confirmation Modal */}
      {confirmModal && (
        <Modal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          title={confirmModal.state === "upgrade" ? "Confirmar mejora de plan" : "Confirmar cambio de plan"}
          size="sm"
        >
          <div className="space-y-5">
            {/* Change summary */}
            <div className="flex items-center gap-3 justify-center">
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Plan actual</p>
                <span className="inline-block rounded-lg bg-surface-tertiary px-3 py-1.5 text-sm font-semibold text-text">
                  {currentPlanData?.name || currentPlan}
                </span>
                <p className="text-xs text-text-muted mt-1">
                  {isAnnual ? currentPlanData?.priceAnnual : currentPlanData?.priceMonthly}{isAnnual ? "/año" : "/mes"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                {confirmModal.state === "upgrade" 
                  ? <ArrowUp className="h-5 w-5 text-green-500" />
                  : <ArrowDown className="h-5 w-5 text-orange-500" />
                }
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Nuevo plan</p>
                <span className="inline-block rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-600">
                  {confirmModal.plan.name}
                </span>
                <p className="text-xs text-text-muted mt-1">
                  {isAnnual ? confirmModal.plan.priceAnnual : confirmModal.plan.priceMonthly}{isAnnual ? "/año" : "/mes"}
                </p>
              </div>
            </div>

            {/* Info message */}
            <div className={cn(
              "rounded-lg p-3 text-sm",
              confirmModal.state === "upgrade"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                : "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
            )}>
              {confirmModal.state === "upgrade" ? (
                <p>Se te cobrará la diferencia proporcional por el tiempo restante de tu ciclo de facturación actual. El cambio se aplica inmediatamente.</p>
              ) : (
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Al cambiar a un plan inferior, se reducirán tus límites de sistemas de IA y usuarios. Si superas los nuevos límites, no podrás añadir nuevos recursos hasta que estés dentro del límite. El cambio se aplica inmediatamente.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant={confirmModal.state === "upgrade" ? "default" : "outline"}
                loading={loading === confirmModal.plan.key}
                onClick={() => executePlanChange(confirmModal.plan.key)}
                className={confirmModal.state === "downgrade" ? "border-orange-300 text-orange-700 hover:bg-orange-50" : ""}
              >
                {confirmModal.state === "upgrade" 
                  ? "Confirmar mejora"
                  : "Confirmar cambio"
                }
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
