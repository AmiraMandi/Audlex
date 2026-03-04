import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Si Supabase redirige un code de verificación de email al root "/",
  // reenviamos al callback handler para que lo procese correctamente
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  if (pathname === "/" && code) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/callback";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas protegidas — redirigir a login si no autenticado
  const protectedPaths = ["/dashboard", "/inventario", "/clasificador", "/documentacion", "/checklist", "/informes", "/configuracion"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Si ya logueado, redirigir landing/login/registro al dashboard
  const authPaths = ["/login", "/registro", "/auth/login", "/auth/registro"];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));
  const isLanding = pathname === "/";

  if ((isAuthPage || isLanding) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
