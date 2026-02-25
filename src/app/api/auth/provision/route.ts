import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { provisionUser } from "@/app/actions";

export const dynamic = "force-dynamic";

function getLocale(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("locale") === "en" ? "en" : "es";
}

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: Request) {
  const locale = getLocale(request);
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: msg(locale, "No autenticado", "Not authenticated") }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { companyName, sector, size } = body;

    const dbUser = await provisionUser(
      user.id,
      user.email || "",
      user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
      user.user_metadata?.avatar_url,
      companyName,
      sector,
      size
    );

    return NextResponse.json({ success: true, userId: dbUser.id });
  } catch (error: unknown) {
    console.error("Provision error:", error);
    return NextResponse.json(
      { error: msg(locale, "Error al crear usuario", "Error creating user") },
      { status: 500 }
    );
  }
}
