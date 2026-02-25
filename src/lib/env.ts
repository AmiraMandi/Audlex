// ============================================================
// Environment Variable Validation
// Validates required env vars at build/startup time
// ============================================================

import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_BUSINESS: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE: z.string().optional(),
  STRIPE_PRICE_CONSULTORA: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Audlex"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let _env: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (_env) return _env;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .map(([key, val]) => `  ${key}: ${(val as { _errors?: string[] })?._errors?.join(", ")}`)
      .join("\n");
    console.error(`❌ Invalid environment variables:\n${missing}`);
    throw new Error(`Invalid environment variables:\n${missing}`);
  }

  _env = result.data;
  return _env;
}
