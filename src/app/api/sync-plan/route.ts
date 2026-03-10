import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import type { PlanType } from "@/types";

export const dynamic = "force-dynamic";

function getPlanMapping(): Record<string, { plan: PlanType; maxSystems: number; maxUsers: number }> {
  const mapping: Record<string, { plan: PlanType; maxSystems: number; maxUsers: number }> = {};
  
  // Only add entries where env var is actually set
  const vars: [string | undefined, PlanType, number, number][] = [
    [process.env.STRIPE_PRICE_STARTER, "starter", 5, 2],
    [process.env.STRIPE_PRICE_BUSINESS, "business", 25, 5],
    [process.env.STRIPE_PRICE_ENTERPRISE, "enterprise", -1, -1],
    [process.env.STRIPE_PRICE_CONSULTORA, "consultora", -1, -1],
    [process.env.STRIPE_PRICE_STARTER_ANNUAL, "starter", 5, 2],
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL, "business", 25, 5],
    [process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL, "enterprise", -1, -1],
    [process.env.STRIPE_PRICE_CONSULTORA_ANNUAL, "consultora", -1, -1],
  ];

  for (const [priceId, plan, maxSystems, maxUsers] of vars) {
    if (priceId && priceId.startsWith("price_")) {
      mapping[priceId] = { plan, maxSystems, maxUsers };
    }
  }

  return mapping;
}

/**
 * POST /api/sync-plan
 * Queries Stripe directly for the customer's active subscription
 * and updates the organization's plan in the database.
 * If no stripeCustomerId exists, searches by email.
 * This is a robust fallback for when webhooks fail.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[sync-plan] Not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("[sync-plan] User:", user.email, "authId:", user.id);

    const dbUser = await db.query.users.findFirst({
      where: eq(users.authProviderId, user.id),
      with: { organization: true },
    });

    if (!dbUser?.organization) {
      console.log("[sync-plan] No organization found for user");
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }

    const org = dbUser.organization;
    console.log("[sync-plan] Org:", org.id, "currentPlan:", org.plan, "stripeCustomerId:", org.stripeCustomerId);

    let stripeCustomerId = org.stripeCustomerId;

    // Verify stored customer exists in Stripe (could be from test mode)
    if (stripeCustomerId) {
      try {
        await getStripe().customers.retrieve(stripeCustomerId);
        console.log("[sync-plan] Verified existing Stripe customer:", stripeCustomerId);
      } catch {
        console.log("[sync-plan] Stored customer not found in Stripe (test/live mismatch?), clearing:", stripeCustomerId);
        stripeCustomerId = null;
      }
    }

    // If no valid stripeCustomerId, search Stripe by email
    if (!stripeCustomerId) {
      console.log("[sync-plan] No stripeCustomerId, searching by email:", user.email);
      const customers = await getStripe().customers.list({
        email: user.email || undefined,
        limit: 5,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        console.log("[sync-plan] Found Stripe customer by email:", stripeCustomerId);
        
        // Store it so we don't have to search again
        await db
          .update(organizations)
          .set({ stripeCustomerId, updatedAt: new Date() })
          .where(eq(organizations.id, org.id));
      } else {
        console.log("[sync-plan] No Stripe customer found for email:", user.email);
        return NextResponse.json({ synced: false, reason: "No Stripe customer found for this email" });
      }
    }

    // Query Stripe for active subscriptions for this customer
    console.log("[sync-plan] Querying subscriptions for customer:", stripeCustomerId);
    const subscriptions = await getStripe().subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 5,
    });

    console.log("[sync-plan] Active subscriptions found:", subscriptions.data.length);

    if (subscriptions.data.length === 0) {
      // Also check trialing
      const trialingSubs = await getStripe().subscriptions.list({
        customer: stripeCustomerId,
        status: "trialing",
        limit: 5,
      });
      
      console.log("[sync-plan] Trialing subscriptions found:", trialingSubs.data.length);

      if (trialingSubs.data.length === 0) {
        // Last resort: check recent checkout sessions
        console.log("[sync-plan] Checking recent checkout sessions...");
        const sessions = await getStripe().checkout.sessions.list({
          customer: stripeCustomerId,
          limit: 5,
        });
        
        for (const session of sessions.data) {
          if (session.subscription && session.payment_status === "paid") {
            const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
            if (sub.status === "active" || sub.status === "trialing") {
              subscriptions.data = [sub];
              console.log("[sync-plan] Found subscription via checkout session:", sub.id, "status:", sub.status);
              break;
            }
          }
        }

        if (subscriptions.data.length === 0) {
          return NextResponse.json({ synced: false, plan: "free", reason: "No active subscription found in Stripe" });
        }
      } else {
        subscriptions.data = trialingSubs.data;
      }
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    const planMapping = getPlanMapping();
    const planInfo = priceId ? planMapping[priceId] : null;

    console.log("[sync-plan] Subscription:", subscription.id, "status:", subscription.status, "priceId:", priceId);
    console.log("[sync-plan] Plan mapping keys:", Object.keys(planMapping));
    console.log("[sync-plan] Matched planInfo:", planInfo);

    if (!planInfo) {
      // Log detailed info for debugging (server-side only)
      console.error("[sync-plan] PRICE ID NOT IN MAPPING!");
      console.error("[sync-plan] priceId from Stripe:", priceId);
      console.error("[sync-plan] Available price IDs in mapping:", JSON.stringify(Object.keys(planMapping)));

      return NextResponse.json({ 
        synced: false, 
        reason: "Plan sync failed. The subscription price does not match any configured plan. Contact support.",
      });
    }

    // Update organization with the correct plan
    const [updated] = await db
      .update(organizations)
      .set({
        plan: planInfo.plan,
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        maxAiSystems: planInfo.maxSystems,
        maxUsers: planInfo.maxUsers,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, org.id))
      .returning({ id: organizations.id, plan: organizations.plan });

    console.log("[sync-plan] SUCCESS! Updated org:", updated);

    return NextResponse.json({ 
      synced: true, 
      plan: planInfo.plan, 
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[sync-plan] FATAL Error:", errMsg, error);
    return NextResponse.json({ error: "Plan sync failed. Please try again or contact support." }, { status: 500 });
  }
}
