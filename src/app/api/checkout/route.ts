import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey, getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import type { PlanType } from "@/types";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: Request) {
  let locale = "es";
  try {
    const { plan, locale: reqLocale, isAnnual, changePlan } = (await request.json()) as { 
      plan: PlanKey; 
      locale?: string;
      isAnnual?: boolean;
      changePlan?: boolean;
    };
    locale = reqLocale === "en" ? "en" : "es";

    console.log("[Checkout] Request:", { plan, isAnnual, locale, changePlan });

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: msg(locale, "Plan inválido", "Invalid plan") }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: msg(locale, "No autenticado", "Not authenticated") }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await db.query.users.findFirst({
      where: eq(users.authProviderId, user.id),
      with: { organization: true },
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: msg(locale, "Sin organización", "No organisation found") }, { status: 400 });
    }

    const org = dbUser.organization;
    console.log("[Checkout] Org:", { id: org.id, plan: org.plan, stripeCustomerId: org.stripeCustomerId, stripeSubscriptionId: org.stripeSubscriptionId });

    const planInfo = PLANS[plan];
    const priceId = isAnnual ? planInfo.priceIdAnnual : planInfo.priceIdMonthly;
    
    console.log("[Checkout] priceId:", priceId, "isAnnual:", isAnnual);

    if (!priceId || priceId === "undefined") {
      return NextResponse.json({ 
        error: msg(locale, `Precio no configurado para el plan ${plan}${isAnnual ? " anual" : ""}. Contacta soporte.`, `Price not configured for ${plan}${isAnnual ? " annual" : ""} plan. Contact support.`) 
      }, { status: 500 });
    }

    // If user already has an active subscription, update it (upgrade/downgrade)
    if (org.stripeSubscriptionId && changePlan) {
      try {
        const existingSub = await getStripe().subscriptions.retrieve(org.stripeSubscriptionId);
        
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          console.log("[Checkout] Updating existing subscription:", existingSub.id, "to priceId:", priceId);
          
          // Update the subscription to the new price
          const updatedSub = await getStripe().subscriptions.update(existingSub.id, {
            items: [{
              id: existingSub.items.data[0].id,
              price: priceId,
            }],
            proration_behavior: "create_prorations", // Charge/credit the difference
          });

          console.log("[Checkout] Subscription updated:", updatedSub.id, "status:", updatedSub.status);

          // Plan limits mapping
          const planLimits: Record<string, { maxSystems: number; maxUsers: number }> = {
            starter: { maxSystems: 5, maxUsers: 2 },
            business: { maxSystems: 25, maxUsers: 5 },
            enterprise: { maxSystems: -1, maxUsers: -1 },
            consultora: { maxSystems: -1, maxUsers: -1 },
          };

          const limits = planLimits[plan] || { maxSystems: 1, maxUsers: 1 };

          // Update org in DB immediately
          await db
            .update(organizations)
            .set({
              plan: plan as PlanType,
              maxAiSystems: limits.maxSystems,
              maxUsers: limits.maxUsers,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, org.id));

          console.log("[Checkout] DB updated to plan:", plan);

          const planName = PLANS[plan].name;
          return NextResponse.json({ 
            changed: true, 
            plan,
            message: msg(locale, `¡Plan cambiado a ${planName}! Los cambios se aplican inmediatamente.`, `Plan changed to ${planName}! Changes apply immediately.`),
          });
        }
      } catch (subError) {
        console.log("[Checkout] Subscription update failed, falling through to new checkout:", subError instanceof Error ? subError.message : subError);
        // Fall through to create a new checkout session
      }
    }

    // For new subscriptions (no existing sub or changePlan=false)
    if (org.stripeSubscriptionId && !changePlan) {
      try {
        const existingSub = await getStripe().subscriptions.retrieve(org.stripeSubscriptionId);
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          return NextResponse.json(
            { error: msg(locale, "Ya tienes una suscripción activa. Usa 'Cambiar plan' para modificarla.", "You already have an active subscription. Use 'Change plan' to modify it.") },
            { status: 400 }
          );
        }
      } catch {
        // Subscription doesn't exist anymore, OK to create new
      }
    }

    const origin = new URL(request.url).origin;

    // Ensure we have a valid Stripe customer ID to avoid duplicates
    let customerId = org.stripeCustomerId || undefined;

    // Verify the stored customer actually exists in Stripe (could be from test mode)
    if (customerId) {
      try {
        await getStripe().customers.retrieve(customerId);
        console.log("[Checkout] Verified existing Stripe customer:", customerId);
      } catch {
        console.log("[Checkout] Stored customer not found in Stripe (test/live mismatch?), will create new:", customerId);
        customerId = undefined;
      }
    }

    if (!customerId) {
      try {
        const customer = await getStripe().customers.create({
          email: user.email ?? undefined,
          name: dbUser.name || undefined,
          metadata: { organizationId: org.id },
        });
        customerId = customer.id;
        await db
          .update(organizations)
          .set({
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, org.id));
        console.log("[Checkout] Created Stripe customer:", customerId);
      } catch (custError) {
        console.error("[Checkout] Failed to create customer, falling back to customer_email:", custError);
        customerId = undefined;
      }
    }

    console.log("[Checkout] Creating session with customerId:", customerId);

    const session = await createCheckoutSession({
      priceId,
      customerId,
      organizationId: org.id,
      customerEmail: user.email,
      successUrl: `${origin}/dashboard/configuracion?checkout=success`,
      cancelUrl: `${origin}/dashboard/configuracion?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Checkout] FATAL error:", errorMessage, error);
    return NextResponse.json(
      { error: msg(locale, "Error al crear sesión de pago. Inténtalo de nuevo o contacta soporte.", "Error creating checkout session. Please try again or contact support.") },
      { status: 500 }
    );
  }
}
