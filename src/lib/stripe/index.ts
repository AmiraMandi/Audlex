import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: "Starter",
    priceIdMonthly: process.env.STRIPE_PRICE_STARTER!,
    priceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
    priceMonthly: 69,
    priceAnnual: 660, // 20% discount
    maxSystems: 5,
    maxUsers: 2,
    features: [
      "Hasta 5 sistemas de IA",
      "Clasificación de riesgo automática",
      "Documentos básicos (FRIA, ficha técnica)",
      "Checklist de cumplimiento",
      "Soporte por email",
    ],
  },
  business: {
    name: "Business",
    priceIdMonthly: process.env.STRIPE_PRICE_BUSINESS!,
    priceIdAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
    priceMonthly: 199,
    priceAnnual: 1910, // 20% discount
    maxSystems: 25,
    maxUsers: 5,
    features: [
      "Hasta 25 sistemas de IA",
      "Todos los documentos de compliance",
      "Informes avanzados con gráficos",
      "Hasta 5 usuarios",
      "Alertas y notificaciones",
      "Soporte prioritario",
    ],
  },
  enterprise: {
    name: "Enterprise",
    priceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE!,
    priceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL!,
    priceMonthly: 499,
    priceAnnual: 4790, // 20% discount
    maxSystems: -1,
    maxUsers: -1,
    features: [
      "Sistemas ilimitados",
      "Usuarios ilimitados",
      "Todas las funcionalidades",
      "Marca blanca / whitelabel",
      "API de integración",
      "Account Manager dedicado",
      "SLA garantizado",
    ],
  },
  consultora: {
    name: "Consultora",
    priceIdMonthly: process.env.STRIPE_PRICE_CONSULTORA!,
    priceIdAnnual: process.env.STRIPE_PRICE_CONSULTORA_ANNUAL!,
    priceMonthly: 349,
    priceAnnual: 3350, // 20% discount
    maxSystems: -1,
    maxUsers: -1,
    features: [
      "Multi-cliente: gestiona varias organizaciones",
      "Sistemas y usuarios ilimitados",
      "Dashboard consolidado",
      "Documentación con marca del cliente",
      "Informes por cliente",
      "Onboarding guiado",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/**
 * Create a Stripe Checkout session for a given plan.
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  organizationId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId?: string;
  organizationId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(customerId ? { customer: customerId } : { customer_email: customerEmail }),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organizationId,
    },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions.
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
