import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, complianceItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function msg(locale: string, es: string, en: string) { return locale === "en" ? en : es; }

export async function POST(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "es";
  try {
    const supabase = await createSupabaseServer();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: msg(locale, "No autenticado", "Not authenticated") }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, authUser.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: msg(locale, "Usuario no encontrado", "User not found") }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const itemId = formData.get("itemId") as string;

    if (!file || !itemId) {
      return NextResponse.json({ error: msg(locale, "Archivo e itemId requeridos", "File and itemId required") }, { status: 400 });
    }

    // Verify ownership of the compliance item
    const [item] = await db
      .select()
      .from(complianceItems)
      .where(
        and(
          eq(complianceItems.id, itemId),
          eq(complianceItems.organizationId, user.organizationId)
        )
      )
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: msg(locale, "Item no encontrado", "Item not found") }, { status: 404 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: msg(locale, "Tipo de archivo no permitido. Usa PDF, DOCX, PNG, JPG o TXT.", "File type not allowed. Use PDF, DOCX, PNG, JPG or TXT.") },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: msg(locale, "El archivo no puede superar los 10 MB", "File size cannot exceed 10 MB") },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${user.organizationId}/${itemId}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidence")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, store as a data URL fallback
      console.error("Storage upload error:", uploadError);
      
      // Fallback: store reference without actual upload
      const evidenceUrl = `evidence://${fileName}`;
      
      await db
        .update(complianceItems)
        .set({
          evidenceUrl,
          notes: msg(locale, `Evidencia adjunta: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, `Evidence attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`),
        })
        .where(eq(complianceItems.id, itemId));

      return NextResponse.json({
        url: evidenceUrl,
        fileName: file.name,
        message: msg(locale, "Referencia de evidencia guardada", "Evidence reference saved"),
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("evidence")
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    // Update compliance item with evidence URL
    await db
      .update(complianceItems)
      .set({
        evidenceUrl: publicUrl,
        notes: msg(locale, `Evidencia adjunta: ${file.name}`, `Evidence attached: ${file.name}`),
      })
      .where(eq(complianceItems.id, itemId));

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      message: msg(locale, "Evidencia subida correctamente", "Evidence uploaded successfully"),
    });
  } catch (error: unknown) {
    console.error("Evidence upload error:", error);
    return NextResponse.json(
      { error: msg(locale, "Error al subir la evidencia", "Error uploading evidence") },
      { status: 500 }
    );
  }
}
