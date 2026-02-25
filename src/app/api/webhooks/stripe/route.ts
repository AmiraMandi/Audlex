import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { organizations, alerts } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";

import type { PlanType } from "@/types";

function getPlanMapping(): Record<string, { plan: PlanType; maxSystems: number; maxUsers: number }> {
  return {
    // Monthly plans
    [process.env.STRIPE_PRICE_STARTER || ""]: { plan: "starter", maxSystems: 5, maxUsers: 2 },
    [process.env.STRIPE_PRICE_BUSINESS || ""]: { plan: "business", maxSystems: 25, maxUsers: 5 },
    [process.env.STRIPE_PRICE_ENTERPRISE || ""]: { plan: "enterprise", maxSystems: -1, maxUsers: -1 },
    [process.env.STRIPE_PRICE_CONSULTORA || ""]: { plan: "consultora", maxSystems: -1, maxUsers: -1 },
    
    // Annual plans (same limits, just different billing)
    [process.env.STRIPE_PRICE_STARTER_ANNUAL || ""]: { plan: "starter", maxSystems: 5, maxUsers: 2 },
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL || ""]: { plan: "business", maxSystems: 25, maxUsers: 5 },
    [process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || ""]: { plan: "enterprise", maxSystems: -1, maxUsers: -1 },
    [process.env.STRIPE_PRICE_CONSULTORA_ANNUAL || ""]: { plan: "consultora", maxSystems: -1, maxUsers: -1 },
  };
}

// Simple in-memory idempotency (for serverless, use a DB table in production at scale)
const processedEvents = new Set<string>();
const MAX_PROCESSED = 1000;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // Idempotency: skip already-processed events
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, skipped: true });
  }
  processedEvents.add(event.id);
  // Cap the set size to prevent memory leaks
  if (processedEvents.size > MAX_PROCESSED) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const orgId = session.metadata?.organizationId;

        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const planInfo = priceId ? getPlanMapping()[priceId] : null;

          if (planInfo && orgId) {
            // Use orgId from metadata to avoid race condition with stripeCustomerId
            await db
              .update(organizations)
              .set({
                plan: planInfo.plan,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                maxAiSystems: planInfo.maxSystems,
                maxUsers: planInfo.maxUsers,
                updatedAt: new Date(),
              })
              .where(
                or(
                  eq(organizations.id, orgId),
                  eq(organizations.stripeCustomerId, customerId)
                )
              );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const planInfo = priceId ? getPlanMapping()[priceId] : null;

        if (planInfo) {
          await db
            .update(organizations)
            .set({
              plan: planInfo.plan,
              maxAiSystems: planInfo.maxSystems,
              maxUsers: planInfo.maxUsers,
              updatedAt: new Date(),
            })
            .where(eq(organizations.stripeSubscriptionId, subscription.id));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await db
          .update(organizations)
          .set({
            plan: "free",
            maxAiSystems: 1,
            maxUsers: 1,
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(organizations.stripeSubscriptionId, subscription.id));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const attemptCount = invoice.attempt_count || 0;

        // Find the org
        const [org] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.stripeCustomerId, customerId))
          .limit(1);

        if (org) {
          // Create an alert for the org
          await db.insert(alerts).values({
            organizationId: org.id,
            type: "compliance_gap",
            title: `Payment failed (attempt ${attemptCount}) / Pago fallido (intento ${attemptCount})`,
            message: "Your subscription payment has failed. Please update your payment method to avoid service interruption. / Tu pago de suscripción ha fallado. Actualiza tu método de pago para evitar la interrupción del servicio.",
            severity: attemptCount >= 3 ? "critical" : "warning",
            actionUrl: "/dashboard/configuracion?tab=plan",
          });

          // After 3 failed attempts, downgrade to free
          if (attemptCount >= 3) {
            await db
              .update(organizations)
              .set({
                plan: "free",
                maxAiSystems: 1,
                maxUsers: 1,
                updatedAt: new Date(),
              })
              .where(eq(organizations.id, org.id));
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 to prevent Stripe retries for processing errors
  }

  return NextResponse.json({ received: true });
}
