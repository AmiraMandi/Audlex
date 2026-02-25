import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required / Asunto y mensaje son obligatorios" },
        { status: 400 }
      );
    }

    // In production, this would send an email via Resend to support@audlex.com
    // For now, we log it and return success
    console.log(`[SUPPORT] From: ${user.email}, Subject: ${subject}, Message: ${message}`);

    // Optionally send email if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.FROM_EMAIL || process.env.EMAIL_FROM || "Audlex <noreply@audlex.com>",
          to: "soporte@audlex.com",
          subject: `[Soporte] ${subject}`,
          text: `De: ${user.email}\n\n${message}`,
        });
      } catch (emailErr) {
        console.error("[SUPPORT] Email send failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error processing request / Error procesando solicitud" },
      { status: 500 }
    );
  }
}
