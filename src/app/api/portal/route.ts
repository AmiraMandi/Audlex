import { NextResponse } from "next/server";
import { createPortalSession } from "@/lib/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "es";
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: msg(locale, "No autenticado", "Not authenticated") }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.authProviderId, user.id),
      with: { organization: true },
    });

    if (!dbUser?.organization?.stripeCustomerId) {
      return NextResponse.json({ error: msg(locale, "Sin suscripción activa", "No active subscription") }, { status: 400 });
    }

    const origin = new URL(request.url).origin;

    const session = await createPortalSession({
      customerId: dbUser.organization.stripeCustomerId,
      returnUrl: `${origin}/dashboard/configuracion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: msg(locale, "Error al abrir portal de facturación", "Error opening billing portal") },
      { status: 500 }
    );
  }
}
