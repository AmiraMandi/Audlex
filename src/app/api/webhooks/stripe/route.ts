import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { organizations, alerts } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";

import type { PlanType } from "@/types";

function getPlanMapping(): Record<string, { plan: PlanType; maxSystems: number; maxUsers: number }> {
  const mapping: Record<string, { plan: PlanType; maxSystems: number; maxUsers: number }> = {};
  
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

// Simple in-memory idempotency (for serverless, use a DB table in production at scale)
const processedEvents = new Set<string>();
const MAX_PROCESSED = 1000;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Debug: log that the webhook was hit
  console.log("[Stripe Webhook] Received request");

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    console.error("[Stripe Webhook] No stripe-signature header present");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set in environment variables");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Stripe Webhook] Signature verification FAILED:", message);
    console.error("[Stripe Webhook] Secret starts with:", webhookSecret.substring(0, 10) + "...");
    console.error("[Stripe Webhook] Sig starts with:", sig.substring(0, 20) + "...");
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log("[Stripe Webhook] Verified event:", event.type, "id:", event.id);

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

        console.log("[Stripe Webhook] checkout.session.completed:", { customerId, subscriptionId, orgId });

        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const planInfo = priceId ? getPlanMapping()[priceId] : null;

          console.log("[Stripe Webhook] priceId:", priceId, "planInfo:", planInfo);

          if (planInfo && orgId) {
            const result = await db
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
              )
              .returning({ id: organizations.id, plan: organizations.plan });

            console.log("[Stripe Webhook] Updated org:", result);
          } else {
            console.warn("[Stripe Webhook] Could not map plan. priceId:", priceId, "orgId:", orgId, "Available mappings:", Object.keys(getPlanMapping()));
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
    console.error("[Stripe Webhook] Processing error for event", event.type, ":", err);
    // Return 500 so Stripe retries this event
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }

  console.log("[Stripe Webhook] Successfully processed:", event.type);
  return NextResponse.json({ received: true });
}
