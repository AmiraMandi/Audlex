import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey, getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: Request) {
  let locale = "es";
  try {
    const { plan, locale: reqLocale, isAnnual } = (await request.json()) as { 
      plan: PlanKey; 
      locale?: string;
      isAnnual?: boolean;
    };
    locale = reqLocale === "en" ? "en" : "es";

    console.log("[Checkout] Request:", { plan, isAnnual, locale });

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

    // Prevent duplicate subscriptions: check if org already has an active subscription
    if (org.stripeSubscriptionId) {
      try {
        const existingSub = await getStripe().subscriptions.retrieve(org.stripeSubscriptionId);
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          return NextResponse.json(
            { error: msg(locale, "Ya tienes una suscripción activa. Ve a 'Gestionar suscripción' para cambiar de plan.", "You already have an active subscription. Go to 'Manage subscription' to change plans.") },
            { status: 400 }
          );
        }
      } catch (subError) {
        console.log("[Checkout] Existing subscription check failed (OK, creating new):", subError instanceof Error ? subError.message : subError);
      }
    }

    const planInfo = PLANS[plan];
    const priceId = isAnnual ? planInfo.priceIdAnnual : planInfo.priceIdMonthly;
    
    console.log("[Checkout] priceId:", priceId, "isAnnual:", isAnnual);

    if (!priceId || priceId === "undefined") {
      return NextResponse.json({ 
        error: msg(locale, `Precio no configurado para el plan ${plan}${isAnnual ? " anual" : ""}. Contacta soporte.`, `Price not configured for ${plan}${isAnnual ? " annual" : ""} plan. Contact support.`) 
      }, { status: 500 });
    }

    const origin = new URL(request.url).origin;

    // Ensure we have a Stripe customer ID to avoid duplicates
    let customerId = org.stripeCustomerId || undefined;
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
        customerId = undefined; // Fall back to customer_email mode
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
      { error: msg(locale, `Error al crear sesión de pago: ${errorMessage}`, `Error creating checkout: ${errorMessage}`) },
      { status: 500 }
    );
  }
}
