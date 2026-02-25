import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { provisionUser } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Auto-provision user in DB if doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await provisionUser(
            user.id,
            user.email || "",
            user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
            user.user_metadata?.avatar_url
          );
        } catch (e) {
          console.error("Provision on callback failed:", e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
