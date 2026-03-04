import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations, aiSystems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

// Map onboarding system keys to default names, categories, and purposes
const SYSTEM_DEFAULTS: Record<string, { name: string; category: string; purpose: string }> = {
  chatbot: {
    name: "Chatbot de atención al cliente",
    category: "chatbot",
    purpose: "Responder consultas de clientes de forma automatizada",
  },
  scoring_profiling: {
    name: "CRM con scoring predictivo",
    category: "scoring_profiling",
    purpose: "Analizar y puntuar clientes o candidatos mediante IA",
  },
  content_generation: {
    name: "Generador de contenido con IA",
    category: "content_generation",
    purpose: "Generar textos, imágenes u otro contenido mediante IA generativa",
  },
  predictive_analytics: {
    name: "Analítica predictiva",
    category: "predictive_analytics",
    purpose: "Realizar predicciones y análisis de datos con modelos de IA",
  },
  biometric: {
    name: "Sistema biométrico",
    category: "biometric",
    purpose: "Identificación o verificación mediante datos biométricos",
  },
};

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
    const { companyName, sector, size, selectedSystem } = body;

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

    // Create the AI system if one was selected during onboarding
    if (selectedSystem && SYSTEM_DEFAULTS[selectedSystem]) {
      const defaults = SYSTEM_DEFAULTS[selectedSystem];
      // Check if a system with this category already exists for the org
      const existing = await db
        .select({ id: aiSystems.id })
        .from(aiSystems)
        .where(eq(aiSystems.organizationId, dbUser.organizationId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(aiSystems).values({
          name: defaults.name,
          category: defaults.category,
          purpose: defaults.purpose,
          organizationId: dbUser.organizationId,
          createdBy: dbUser.id,
          status: "active",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: msg(locale, "Error interno", "Internal error") }, { status: 500 });
  }
}
