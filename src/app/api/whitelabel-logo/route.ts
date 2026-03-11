import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.authProviderId, user.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verify org is consultora
    const [org] = await db.select().from(organizations).where(eq(organizations.id, dbUser.organizationId)).limit(1);
    if (!org || org.plan !== "consultora") {
      return NextResponse.json({ error: "Plan Consultora requerido" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Usa PNG, JPG, SVG o WebP." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo no puede superar 2 MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${dbUser.organizationId}/logo-${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("whitelabel-logos")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Logo Upload] Storage error:", uploadError);
      return NextResponse.json({ error: "Error al subir el archivo. Verifica que el bucket 'whitelabel-logos' existe." }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("whitelabel-logos")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("[Logo Upload] Error:", error);
    return NextResponse.json({ error: "Error al subir el logo" }, { status: 500 });
  }
}
