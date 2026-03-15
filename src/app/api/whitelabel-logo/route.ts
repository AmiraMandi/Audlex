import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "whitelabel-logos";
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

/** Ensure the storage bucket exists (uses admin/service-role client) */
async function ensureBucket() {
  const admin = createSupabaseAdmin();
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    const { error } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
    if (error) console.error("[ensureBucket]", error);
  }
}

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

    // Auto-create bucket if it doesn't exist
    await ensureBucket();

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${dbUser.organizationId}/logo-${Date.now()}.${ext}`;

    // Upload using admin client (bypasses RLS)
    const admin = createSupabaseAdmin();
    const { data: uploadData, error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Logo Upload] Storage error:", uploadError);
      return NextResponse.json({ error: "Error al subir el archivo." }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("[Logo Upload] Error:", error);
    return NextResponse.json({ error: "Error al subir el logo" }, { status: 500 });
  }
}
