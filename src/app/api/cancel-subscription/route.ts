import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) {
  return locale === "en" ? en : es;
}

/**
 * EU-compliant subscription cancellation.
 *
 * Directiva 2011/83/UE — Derecho de desistimiento:
 *   • Within 14 calendar days of the first payment, the consumer can cancel
 *     and receive a FULL refund (minus value of any service already consumed
 *     if the consumer explicitly requested early performance).
 *   • After 14 days, cancellation takes effect at the end of the current
 *     billing period. No refund (the user keeps access until period end).
 *
 * For annual plans after 14 days:
 *   • Cancellation at the end of the current annual period (no partial refund).
 *   • The user keeps full access until the period ends.
 *
 * Body: { immediate?: boolean }
 *   • immediate=true  → cancel now + refund (only within 14-day window)
 *   • immediate=false  → cancel at period end (default)
 */
export async function POST(request: Request) {
  const locale =
    new URL(request.url).searchParams.get("locale") === "en" ? "en" : "es";

  try {
    const body = await request.json().catch(() => ({}));
    const requestImmediate = body.immediate === true;

    // --- Auth ---
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: msg(locale, "No autenticado", "Not authenticated") },
        { status: 401 }
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.authProviderId, user.id),
      with: { organization: true },
    });

    const org = dbUser?.organization;

    if (!org?.stripeSubscriptionId) {
      return NextResponse.json(
        {
          error: msg(
            locale,
            "No tienes una suscripción activa",
            "No active subscription"
          ),
        },
        { status: 400 }
      );
    }

    // --- Retrieve subscription from Stripe ---
    const subscription = await getStripe().subscriptions.retrieve(
      org.stripeSubscriptionId
    );

    if (
      subscription.status !== "active" &&
      subscription.status !== "trialing"
    ) {
      return NextResponse.json(
        {
          error: msg(
            locale,
            "La suscripción no está activa",
            "Subscription is not active"
          ),
        },
        { status: 400 }
      );
    }

    // --- Calculate if within 14-day withdrawal window ---
    const subscriptionStartDate = new Date(
      subscription.start_date * 1000
    );
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now.getTime() - subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const withinWithdrawalPeriod = daysSinceStart <= 14;

    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    const isAnnual = interval === "year";

    console.log("[Cancel] Subscription:", {
      id: subscription.id,
      status: subscription.status,
      startDate: subscriptionStartDate.toISOString(),
      daysSinceStart,
      withinWithdrawalPeriod,
      isAnnual,
      requestImmediate,
    });

    if (requestImmediate && withinWithdrawalPeriod) {
      // ============================================
      // CASE 1: Within 14-day withdrawal — full refund
      // ============================================

      // Cancel the subscription immediately
      const cancelled = await getStripe().subscriptions.cancel(
        subscription.id,
        {
          // invoice_now: false — don't generate a final invoice
          prorate: false,
        }
      );

      console.log("[Cancel] Immediate cancellation:", cancelled.id, cancelled.status);

      // Issue full refund on the latest paid invoice
      const latestInvoiceId = subscription.latest_invoice as string | null;
      let refundId: string | null = null;

      if (latestInvoiceId) {
        try {
          const invoice = await getStripe().invoices.retrieve(latestInvoiceId);
          const chargeId = invoice.charge as string | null;

          if (chargeId) {
            const refund = await getStripe().refunds.create({
              charge: chargeId,
              reason: "requested_by_customer",
            });
            refundId = refund.id;
            console.log("[Cancel] Refund created:", refundId, "amount:", refund.amount);
          }
        } catch (refundErr) {
          console.error("[Cancel] Refund failed:", refundErr);
          // Continue — cancellation already happened, refund can be done manually
        }
      }

      // Update DB
      await db
        .update(organizations)
        .set({
          plan: "free",
          maxAiSystems: 1,
          maxUsers: 1,
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, org.id));

      return NextResponse.json({
        cancelled: true,
        immediate: true,
        refunded: !!refundId,
        refundId,
        message: msg(
          locale,
          "Suscripción cancelada y reembolsada. Tu plan ha vuelto a ser Free.",
          "Subscription cancelled and refunded. Your plan has been reverted to Free."
        ),
      });
    } else {
      // ============================================
      // CASE 2: After 14 days (or user chose not immediate)
      //         — Cancel at end of billing period
      // ============================================

      const updated = await getStripe().subscriptions.update(
        subscription.id,
        {
          cancel_at_period_end: true,
        }
      );

      const periodEnd = new Date(
        updated.current_period_end * 1000
      );

      console.log("[Cancel] Cancel at period end:", updated.id, "period_end:", periodEnd.toISOString());

      return NextResponse.json({
        cancelled: true,
        immediate: false,
        cancelAt: periodEnd.toISOString(),
        withinWithdrawalPeriod,
        message: withinWithdrawalPeriod
          ? msg(
              locale,
              `Suscripción cancelada. Mantienes acceso hasta ${periodEnd.toLocaleDateString("es-ES")}. Tienes derecho a un reembolso completo si cancelas con efecto inmediato (dentro del periodo de 14 días).`,
              `Subscription cancelled. You keep access until ${periodEnd.toLocaleDateString("en-GB")}. You are entitled to a full refund if you cancel immediately (within the 14-day period).`
            )
          : msg(
              locale,
              `Suscripción cancelada. Mantienes acceso hasta ${periodEnd.toLocaleDateString("es-ES")}. No se realizará ningún cobro adicional.`,
              `Subscription cancelled. You keep access until ${periodEnd.toLocaleDateString("en-GB")}. No further charges will be made.`
            ),
      });
    }
  } catch (error: unknown) {
    console.error("[Cancel] Error:", error);
    return NextResponse.json(
      {
        error: msg(
          locale,
          "Error al cancelar la suscripción. Inténtalo de nuevo o contacta soporte.",
          "Error cancelling subscription. Please try again or contact support."
        ),
      },
      { status: 500 }
    );
  }
}
