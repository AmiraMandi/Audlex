import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ─── Simple in-memory rate limiter ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX_API = 60; // 60 requests per minute for API routes
const RATE_LIMIT_MAX_AUTH = 10; // 10 requests per minute for auth routes

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > max;
}

// Periodically clean up old entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Security headers ─────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.resend.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ")
  );
  return response;
}

// ─── Main middleware ───────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const isAuthRoute = pathname.startsWith("/api/auth/");
    const limit = isAuthRoute ? RATE_LIMIT_MAX_AUTH : RATE_LIMIT_MAX_API;
    const key = `${ip}:${isAuthRoute ? "auth" : "api"}`;

    if (isRateLimited(key, limit)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      );
    }
  }

  // Run Supabase session update + auth checks
  const response = await updateSession(request);

  // Add security headers to all responses
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
