import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es";
  try {
    const supabase = await createSupabaseServer();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: msg(locale, "No autenticado", "Not authenticated") }, { status: 401 });
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, authUser.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: msg(locale, "Usuario no encontrado", "User not found") }, { status: 404 });
    }

    const body = await req.json();
    const { companyName, sector, size } = body;

    // Update organization
    if (companyName || sector || size) {
      await db
        .update(organizations)
        .set({
          ...(companyName ? { name: companyName } : {}),
          ...(sector ? { sector } : {}),
          ...(size ? { size: size as "micro" | "small" | "medium" | "large" } : {}),
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, dbUser.organizationId));
    } else {
      await db
        .update(organizations)
        .set({
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, dbUser.organizationId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: msg(locale, "Error interno", "Internal error") }, { status: 500 });
  }
}
