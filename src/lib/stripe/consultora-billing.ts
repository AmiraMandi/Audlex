/**
 * Consultora per-client billing — syncs the number of managed clients
 * with the Stripe subscription as a second line item (25€/client/month).
 *
 * After every add/remove of a consultora client we call `syncConsultoraClientBilling`
 * which finds (or creates) the per-client subscription item and sets its quantity
 * to the current client count.
 */

import { db } from "@/lib/db";
import { consultoraClients, organizations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getStripe } from "./index";

/** Monthly and annual per-client price IDs from env */
const CLIENT_PRICE_MONTHLY = () => process.env.STRIPE_PRICE_CONSULTORA_CLIENT || "";
const CLIENT_PRICE_ANNUAL = () => process.env.STRIPE_PRICE_CONSULTORA_CLIENT_ANNUAL || "";

/**
 * Determine which per-client price ID to use based on the existing subscription interval.
 */
function resolveClientPriceId(basePriceId: string): string | null {
  const annualPrices = [
    process.env.STRIPE_PRICE_CONSULTORA_ANNUAL,
    process.env.STRIPE_PRICE_STARTER_ANNUAL,
    process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  ].filter(Boolean);

  const isAnnual = annualPrices.includes(basePriceId);
  const priceId = isAnnual ? CLIENT_PRICE_ANNUAL() : CLIENT_PRICE_MONTHLY();

  if (!priceId || !priceId.startsWith("price_")) {
    console.warn("[Consultora Billing] Per-client price ID not configured. Skipping billing sync.");
    return null;
  }
  return priceId;
}

/**
 * Sync the per-client billing quantity with Stripe.
 * Call this after every add / remove of a consultora client.
 *
 * Safe to call even when the org has no Stripe subscription (e.g. free/manual plan).
 */
export async function syncConsultoraClientBilling(consultoraOrgId: string): Promise<{
  success: boolean;
  clientCount: number;
  error?: string;
}> {
  try {
    // 1. Count active clients
    const [result] = await db
      .select({ value: count() })
      .from(consultoraClients)
      .where(eq(consultoraClients.consultoraOrgId, consultoraOrgId));
    const clientCount = result?.value ?? 0;

    // 2. Get the org's Stripe subscription
    const [org] = await db
      .select({
        stripeSubscriptionId: organizations.stripeSubscriptionId,
        stripeCustomerId: organizations.stripeCustomerId,
      })
      .from(organizations)
      .where(eq(organizations.id, consultoraOrgId))
      .limit(1);

    if (!org?.stripeSubscriptionId) {
      console.log("[Consultora Billing] No Stripe subscription for org", consultoraOrgId, "— skipping.");
      return { success: true, clientCount };
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId, {
      expand: ["items"],
    });

    if (subscription.status !== "active" && subscription.status !== "trialing") {
      console.log("[Consultora Billing] Subscription not active:", subscription.status);
      return { success: true, clientCount };
    }

    // 3. Determine correct per-client price based on subscription interval
    const basePriceId = subscription.items.data[0]?.price.id || "";
    const clientPriceId = resolveClientPriceId(basePriceId);
    if (!clientPriceId) {
      return { success: true, clientCount }; // Price not configured — skip gracefully
    }

    // 4. Find existing per-client line item (if any)
    const allClientPriceIds = [CLIENT_PRICE_MONTHLY(), CLIENT_PRICE_ANNUAL()].filter(Boolean);
    const existingClientItem = subscription.items.data.find((item) =>
      allClientPriceIds.includes(item.price.id)
    );

    if (clientCount > 0) {
      if (existingClientItem) {
        // Update quantity
        if (existingClientItem.quantity !== clientCount) {
          await stripe.subscriptionItems.update(existingClientItem.id, {
            quantity: clientCount,
            proration_behavior: "create_prorations",
          });
          console.log(`[Consultora Billing] Updated client count to ${clientCount}`);
        }
      } else {
        // Create new per-client subscription item
        await stripe.subscriptionItems.create({
          subscription: subscription.id,
          price: clientPriceId,
          quantity: clientCount,
          proration_behavior: "create_prorations",
        });
        console.log(`[Consultora Billing] Created per-client item with quantity ${clientCount}`);
      }
    } else if (existingClientItem) {
      // No clients — remove the per-client line item
      await stripe.subscriptionItems.del(existingClientItem.id, {
        proration_behavior: "create_prorations",
      });
      console.log("[Consultora Billing] Removed per-client item (0 clients)");
    }

    return { success: true, clientCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Consultora Billing] Sync failed:", message);
    return { success: false, clientCount: 0, error: message };
  }
}

/**
 * Get the current billing summary for a consultora (for display in the UI).
 */
export async function getConsultoraBillingSummary(consultoraOrgId: string): Promise<{
  basePriceMonthly: number;
  clientPriceMonthly: number;
  clientCount: number;
  totalMonthly: number;
  isAnnual: boolean;
}> {
  const [result] = await db
    .select({ value: count() })
    .from(consultoraClients)
    .where(eq(consultoraClients.consultoraOrgId, consultoraOrgId));
  const clientCount = result?.value ?? 0;

  // Check if subscription is annual
  let isAnnual = false;
  const [org] = await db
    .select({ stripeSubscriptionId: organizations.stripeSubscriptionId })
    .from(organizations)
    .where(eq(organizations.id, consultoraOrgId))
    .limit(1);

  if (org?.stripeSubscriptionId) {
    try {
      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
      const basePriceId = sub.items.data[0]?.price.id || "";
      isAnnual = basePriceId === process.env.STRIPE_PRICE_CONSULTORA_ANNUAL;
    } catch {
      // Ignore Stripe errors for billing summary
    }
  }

  const basePriceMonthly = isAnnual ? Math.round(3350 / 12) : 349;
  const clientPriceMonthly = isAnnual ? 20 : 25;
  const totalMonthly = basePriceMonthly + clientCount * clientPriceMonthly;

  return {
    basePriceMonthly,
    clientPriceMonthly,
    clientCount,
    totalMonthly,
    isAnnual,
  };
}
