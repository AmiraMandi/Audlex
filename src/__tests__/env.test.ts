/**
 * Tests for environment variable validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test the schema validation logic.
// Since getEnv() caches, we test by importing the module fresh each time.

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when required env vars are missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { getEnv } = await import("@/lib/env");

    expect(() => getEnv()).toThrow("Invalid environment variables");
  });

  it("accepts valid required env vars", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key-12345");

    const { getEnv } = await import("@/lib/env");

    const env = getEnv();
    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("test-anon-key-12345");
  });

  it("provides defaults for optional vars", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const { getEnv } = await import("@/lib/env");

    const env = getEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("Audlex");
  });

  it("validates SUPABASE_URL must be a valid URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost:5432/test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const { getEnv } = await import("@/lib/env");

    expect(() => getEnv()).toThrow("Invalid environment variables");
  });
});
