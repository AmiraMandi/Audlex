import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS, type PlanKey } from "@/lib/stripe";
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
    const planInfo = PLANS[plan];
    const priceId = isAnnual ? planInfo.priceIdAnnual : planInfo.priceIdMonthly;
    const origin = new URL(request.url).origin;

    const session = await createCheckoutSession({
      priceId,
      customerId: org.stripeCustomerId || undefined,
      organizationId: org.id,
      customerEmail: user.email,
      successUrl: `${origin}/dashboard/configuracion?checkout=success`,
      cancelUrl: `${origin}/dashboard/configuracion?checkout=cancelled`,
    });

    // Save Stripe customer ID if new customer
    if (!org.stripeCustomerId && session.customer) {
      await db
        .update(organizations)
        .set({
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, org.id));
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Error creating checkout session / Error al crear sesión de pago" },
      { status: 500 }
    );
  }
}
