import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey, getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: Request) {
  try {
    const { plan, locale: reqLocale, isAnnual } = (await request.json()) as { 
      plan: PlanKey; 
      locale?: string;
      isAnnual?: boolean;
    };
    const locale = reqLocale === "en" ? "en" : "es";

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

    // Prevent duplicate subscriptions: check if org already has an active subscription
    if (org.stripeSubscriptionId) {
      try {
        const existingSub = await getStripe().subscriptions.retrieve(org.stripeSubscriptionId);
        if (existingSub.status === "active" || existingSub.status === "trialing") {
          return NextResponse.json(
            { error: msg(locale, "Ya tienes una suscripción activa. Ve a gestionar suscripción para cambiar de plan.", "You already have an active subscription. Go to manage subscription to change plans.") },
            { status: 400 }
          );
        }
      } catch {
        // Subscription not found or invalid — allow creating new one
      }
    }

    const planInfo = PLANS[plan];
    const priceId = isAnnual ? planInfo.priceIdAnnual : planInfo.priceIdMonthly;
    const origin = new URL(request.url).origin;

    // Ensure we have a Stripe customer ID to avoid duplicates
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email ?? undefined,
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
    }

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
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Error creating checkout session / Error al crear sesión de pago" },
      { status: 500 }
    );
  }
}
